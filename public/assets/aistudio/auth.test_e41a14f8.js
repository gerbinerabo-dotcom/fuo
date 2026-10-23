'use strict';

const assert = require('assert');
const Database = require('better-sqlite3');
const Core = require('./lifeskill-core.js');
const { createAuthService } = require('./auth-service.js');

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

function fixture(config) {
  const db = new Database(':memory:');
  let timestamp = 1_800_000_000_000;
  let nextCode = 123456;
  const sent = [];
  const service = createAuthService(db, Object.assign({
    authSecret: 'test-auth-secret-that-is-at-least-thirty-two-bytes',
    otpPepper: 'test-otp-pepper-that-is-at-least-thirty-two-bytes',
    now: () => timestamp,
    randomInt: () => nextCode,
    sendOtpEmail: async (message) => { sent.push(message); }
  }, config || {}));
  return {
    db,
    service,
    sent,
    setTime(value) { timestamp = value; },
    advance(value) { timestamp += value; },
    setCode(value) { nextCode = value; }
  };
}

async function request(f, email) {
  return f.service.requestCode(email || 'user@example.com', '127.0.0.1');
}

async function itGetsEmail(f, email) {
  const result = await request(f, email);
  assert.strictEqual(result.ok, true);
  return f.sent[f.sent.length - 1].code;
}

(async function run() {
  console.log('=== LifeSkill Auth Test Suite ===\n');

  await it('Rejects missing secrets and does not fake delivery without SMTP', async () => {
    const db = new Database(':memory:');
    assert.throws(() => createAuthService(db, { authSecret: 'short', otpPepper: 'short' }), /AUTH_SECRET/);
    db.close();
    const f = fixture({ sendOtpEmail: null });
    const result = await request(f);
    assert.strictEqual(result.status, 503);
    assert.strictEqual(f.db.prepare('SELECT COUNT(*) AS count FROM otp_challenges').get().count, 0);
    f.db.close();
  });

  await it('Creates no account before a correct code and verifies once', async () => {
    const f = fixture();
    const code = await itGetsEmail(f, ' User@Example.com ');
    assert.strictEqual(f.db.prepare('SELECT COUNT(*) AS count FROM users').get().count, 0);
    assert.strictEqual((await f.service.verifyCode('user@example.com', '000000')).ok, false);
    const verified = f.service.verifyCode('user@example.com', code);
    assert.strictEqual(verified.ok, true);
    assert.strictEqual(verified.created, true);
    assert.strictEqual(verified.account.email, 'user@example.com');
    assert.strictEqual(f.service.verifyCode('user@example.com', code).ok, false);
    assert.strictEqual(f.db.prepare('SELECT COUNT(*) AS count FROM users').get().count, 1);
    f.db.close();
  });

  await it('Rejects expired PINs and invalidates the previous PIN on resend', async () => {
    const f = fixture();
    const first = await itGetsEmail(f);
    f.advance(60_000);
    f.setCode(456789);
    const second = await itGetsEmail(f);
    assert.notStrictEqual(second, first);
    assert.strictEqual(f.service.verifyCode('user@example.com', first).ok, false);
    f.advance(10 * 60 * 1000);
    const expired = f.service.verifyCode('user@example.com', second);
    assert.strictEqual(expired.ok, false);
    assert.match(expired.error, /истёк/);
    f.db.close();
  });

  await it('Enforces resend cooldown and caps PIN guesses', async () => {
    const f = fixture();
    await itGetsEmail(f);
    const cooldown = await request(f);
    assert.strictEqual(cooldown.status, 429);
    assert.strictEqual(cooldown.retryAfter, 60);
    for (let i = 0; i < 5; i++) {
      const wrong = f.service.verifyCode('user@example.com', String(800000 + i));
      assert.strictEqual(wrong.ok, false);
    }
    assert.strictEqual(f.db.prepare('SELECT COUNT(*) AS count FROM otp_challenges').get().count, 0);
    f.db.close();
  });

  await it('Existing email restores its account and ignores local import', async () => {
    const f = fixture();
    const initial = Core.getInitialState();
    initial.xp = 75;
    const firstCode = await itGetsEmail(f);
    const first = f.service.verifyCode('user@example.com', firstCode, initial);
    assert.strictEqual(first.created, true);
    assert.strictEqual(first.imported, true);
    const userId = first.account.id;
    f.advance(60_000);
    f.setCode(333222);
    const nextCode = await itGetsEmail(f);
    const changedLocal = Core.getInitialState();
    changedLocal.xp = 999;
    const second = f.service.verifyCode('user@example.com', nextCode, changedLocal);
    assert.strictEqual(second.created, false);
    assert.strictEqual(second.imported, false);
    assert.strictEqual(second.account.id, userId);
    assert.strictEqual(second.account.gameState.xp, 75);
    assert.strictEqual(f.db.prepare('SELECT COUNT(*) AS count FROM users').get().count, 1);
    f.db.close();
  });

  await it('Isolates account data and revokes sessions on logout and deletion', async () => {
    const f = fixture();
    const codeA = await itGetsEmail(f, 'a@example.com');
    const accountA = f.service.verifyCode('a@example.com', codeA);
    const codeB = await itGetsEmail(f, 'b@example.com');
    const accountB = f.service.verifyCode('b@example.com', codeB);
    assert.notStrictEqual(accountA.account.id, accountB.account.id);
    const gameA = Object.assign({}, accountA.account.gameState, { xp: 42 });
    assert.strictEqual(f.service.saveAccount(accountA.sessionToken, accountA.account.profile, gameA).ok, true);
    assert.strictEqual(f.service.getSession(accountA.sessionToken).gameState.xp, 42);
    assert.strictEqual(f.service.getSession(accountB.sessionToken).gameState.xp, 0);
    f.service.logout(accountA.sessionToken);
    assert.strictEqual(f.service.getSession(accountA.sessionToken), null);
    assert.strictEqual(f.service.deleteAccount(accountB.sessionToken).ok, true);
    assert.strictEqual(f.service.getSession(accountB.sessionToken), null);
    assert.strictEqual(f.db.prepare('SELECT COUNT(*) AS count FROM users').get().count, 1);
    f.db.close();
  });

  await it('Rejects corrupt imports and unsupported photo payloads', async () => {
    const f = fixture();
    const code = await itGetsEmail(f);
    const invalid = f.service.verifyCode('user@example.com', code, { v: 99, xp: 1, coins: 1, hearts: 5, passedLessons: {} });
    assert.strictEqual(invalid.ok, false);
    assert.strictEqual(f.db.prepare('SELECT COUNT(*) AS count FROM users').get().count, 0);
    const nextCode = await itGetsEmail(f, 'photo@example.com');
    const account = f.service.verifyCode('photo@example.com', nextCode);
    assert.strictEqual(f.service.savePhoto(account.sessionToken, 'data:text/plain;base64,SGVsbG8=').ok, false);
    f.db.close();
  });

  console.log('\n=== All ' + passed + '/' + total + ' Auth Tests Passed ===');
}());

