'use strict';

const assert = require('assert');
const Database = require('better-sqlite3');
const { createApp } = require('./server.js');

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

(async function run() {
  let passed = 0;
  let total = 0;
  async function it(name, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log('  [PASS] ' + name);
    } catch (error) {
      console.error('  [FAIL] ' + name);
      console.error(error);
      process.exitCode = 1;
    }
  }

  console.log('=== LifeSkill HTTP Auth Tests ===\n');
  await it('Serves the app and verifies OTP through same-origin routes without returning the secret', async () => {
    const db = new Database(':memory:');
    const sentCodes = [];
    const env = {
      NODE_ENV: 'test',
      PORT: '0',
      APP_ORIGIN: 'http://localhost:0',
      DATABASE_PATH: ':memory:',
      AUTH_SECRET: 'integration-auth-secret-at-least-thirty-two-bytes',
      OTP_PEPPER: 'integration-otp-pepper-at-least-thirty-two-bytes'
    };
    const server = createApp({ env, db, randomInt: () => 654321, sendOtpEmail: async (message) => sentCodes.push(message.code) });
    const port = await listen(server);
    const base = 'http://127.0.0.1:' + port;
    const headers = { Origin: env.APP_ORIGIN, 'Content-Type': 'application/json' };
    try {
      const page = await fetch(base + '/');
      assert.strictEqual(page.status, 200);
      assert.match(await page.text(), /LifeSkill/);

      const blockedOrigin = await fetch(base + '/api/auth/request-code', {
        method: 'POST',
        headers: { Origin: 'https://other.example', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' })
      });
      assert.strictEqual(blockedOrigin.status, 403);
      assert.strictEqual(sentCodes.length, 0);

      const request = await fetch(base + '/api/auth/request-code', {
        method: 'POST', headers, body: JSON.stringify({ email: 'User@Example.com' })
      });
      assert.strictEqual(request.status, 200);
      const requestBody = await request.json();
      assert.strictEqual(requestBody.maskedEmail, 'u***@example.com');
      assert.strictEqual(JSON.stringify(requestBody).indexOf('654321'), -1);
      assert.deepStrictEqual(sentCodes, ['654321']);

      const verify = await fetch(base + '/api/auth/verify-code', {
        method: 'POST', headers, body: JSON.stringify({ email: 'user@example.com', code: sentCodes[0] })
      });
      assert.strictEqual(verify.status, 200);
      const cookie = verify.headers.get('set-cookie');
      assert.match(cookie, /HttpOnly/);
      assert.match(cookie, /SameSite=Strict/);
      const cookiePair = cookie.split(';')[0];
      const accountBody = await verify.json();
      assert.strictEqual(accountBody.created, true);
      assert.strictEqual(accountBody.account.email, 'user@example.com');
      assert.strictEqual(accountBody.sessionToken, undefined);

      const session = await fetch(base + '/api/session', { headers: { Cookie: cookiePair } });
      assert.strictEqual(session.status, 200);
      assert.strictEqual((await session.json()).authenticated, true);

      const logout = await fetch(base + '/api/auth/logout', { method: 'POST', headers: { Origin: env.APP_ORIGIN, Cookie: cookiePair } });
      assert.strictEqual(logout.status, 200);
      const afterLogout = await fetch(base + '/api/session', { headers: { Cookie: cookiePair } });
      assert.strictEqual((await afterLogout.json()).authenticated, false);
    } finally {
      await close(server);
      db.close();
    }
  });

  await it('Returns service unavailable when SMTP is not configured', async () => {
    const db = new Database(':memory:');
    const env = {
      NODE_ENV: 'test', PORT: '0', APP_ORIGIN: 'http://localhost:0', DATABASE_PATH: ':memory:',
      AUTH_SECRET: 'integration-auth-secret-at-least-thirty-two-bytes',
      OTP_PEPPER: 'integration-otp-pepper-at-least-thirty-two-bytes'
    };
    const server = createApp({ env, db });
    const port = await listen(server);
    try {
      const response = await fetch('http://127.0.0.1:' + port + '/api/auth/request-code', {
        method: 'POST',
        headers: { Origin: env.APP_ORIGIN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' })
      });
      assert.strictEqual(response.status, 503);
      assert.match((await response.json()).error, /не настроена/);
      assert.strictEqual(db.prepare('SELECT COUNT(*) AS count FROM otp_challenges').get().count, 0);
    } finally {
      await close(server);
      db.close();
    }
  });

  console.log('\n=== All ' + passed + '/' + total + ' HTTP Tests Passed ===');
}());

