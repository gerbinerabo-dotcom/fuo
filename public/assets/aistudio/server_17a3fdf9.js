'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');
const { createAuthService } = require('./auth-service.js');

const ROOT = __dirname;
const MAX_JSON_BYTES = 3 * 1024 * 1024;
const STATIC_FILES = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/lifeskill-core.js': ['lifeskill-core.js', 'text/javascript; charset=utf-8'],
  '/lifeskill-data.js': ['lifeskill-data.js', 'text/javascript; charset=utf-8'],
  '/lifeskill-icons.js': ['lifeskill-icons.js', 'text/javascript; charset=utf-8']
};

function json(response, status, payload, headers) {
  response.writeHead(status, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  }, headers || {}));
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let data = '';
    let bytes = 0;
    request.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_JSON_BYTES) {
        reject(Object.assign(new Error('Запрос слишком большой.'), { status: 413 }));
        request.destroy();
        return;
      }
      data += chunk.toString('utf8');
    });
    request.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(Object.assign(new Error('Некорректный JSON.'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function parseCookies(header) {
  const result = {};
  String(header || '').split(';').forEach((piece) => {
    const separator = piece.indexOf('=');
    if (separator < 0) return;
    const key = piece.slice(0, separator).trim();
    const value = piece.slice(separator + 1).trim();
    if (key) result[key] = decodeURIComponent(value);
  });
  return result;
}

function createSmtpSender(env) {
  const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
  if (required.some((name) => !env[name])) return null;
  const port = Number(env.EMAIL_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port,
    secure: String(env.EMAIL_SECURE || '').toLowerCase() === 'true',
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { minVersion: 'TLSv1.2' }
  });
  return async function sendOtpEmail(message) {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: 'Код входа в LifeSkill',
      text: 'Твой код входа: ' + message.code + '. Он действует 10 минут. Если ты не запрашивал(а) код, проигнорируй письмо.',
      html: '<div style="font-family:Arial,sans-serif;color:#1F2937"><h1>LifeSkill</h1><p>Твой одноразовый код входа:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px">' + message.code + '</p><p>Код действует 10 минут. Никому его не сообщай.</p><p>Если ты не запрашивал(а) код, проигнорируй письмо.</p></div>'
    });
  };
}

function createApp(options) {
  options = options || {};
  const env = options.env || process.env;
  const port = Number(env.PORT || 8080);
  const appOrigin = String(env.APP_ORIGIN || 'http://localhost:' + port).replace(/\/$/, '');
  const production = env.NODE_ENV === 'production';
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) throw new Error('Set AUTH_SECRET to at least 32 random characters.');
  if (!env.OTP_PEPPER || env.OTP_PEPPER.length < 32) throw new Error('Set OTP_PEPPER to at least 32 random characters.');
  if (production && appOrigin.indexOf('https://') !== 0) throw new Error('APP_ORIGIN must use HTTPS in production.');

  const databasePath = env.DATABASE_PATH || path.join(ROOT, 'data', 'lifeskill.sqlite');
  if (databasePath !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(databasePath)), { recursive: true });
  const db = options.db || new Database(databasePath);
  const service = createAuthService(db, {
    authSecret: env.AUTH_SECRET,
    otpPepper: env.OTP_PEPPER,
    sendOtpEmail: options.sendOtpEmail || createSmtpSender(env),
    now: options.now,
    randomInt: options.randomInt
  });

  function sessionToken(request) {
    return parseCookies(request.headers.cookie).lifeskill_session || '';
  }

  function setSessionCookie(token) {
    const secure = production ? '; Secure' : '';
    return 'lifeskill_session=' + encodeURIComponent(token) + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=' + (30 * 24 * 60 * 60) + secure;
  }

  function clearSessionCookie() {
    const secure = production ? '; Secure' : '';
    return 'lifeskill_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' + secure;
  }

  function originAllowed(request) {
    const origin = request.headers.origin;
    if (!origin) return !production;
    return origin.replace(/\/$/, '') === appOrigin;
  }

  function clientIp(request) {
    return env.TRUST_PROXY === 'true'
      ? String(request.headers['x-forwarded-for'] || '').split(',')[0].trim() || request.socket.remoteAddress || 'unknown'
      : request.socket.remoteAddress || 'unknown';
  }

  async function handleApi(request, response, pathname) {
    if (request.method !== 'GET' && !originAllowed(request)) {
      return json(response, 403, { error: 'Запрос отклонён.' });
    }
    if (request.method === 'GET' && pathname === '/api/session') {
      const account = service.getSession(sessionToken(request));
      return json(response, 200, { authenticated: !!account, account: account || null });
    }
    if (request.method === 'POST' && pathname === '/api/auth/request-code') {
      const body = await readJson(request);
      const result = await service.requestCode(body.email, clientIp(request));
      const status = result.status || 200;
      delete result.status;
      return json(response, status, result);
    }
    if (request.method === 'POST' && pathname === '/api/auth/verify-code') {
      const body = await readJson(request);
      const result = service.verifyCode(body.email, body.code, body.importLocalProgress === true ? body.legacyState : null);
      if (!result.ok) {
        const status = result.status || 400;
        delete result.status;
        return json(response, status, result);
      }
      const headers = { 'Set-Cookie': setSessionCookie(result.sessionToken) };
      delete result.sessionToken;
      return json(response, 200, result, headers);
    }
    if (request.method === 'POST' && pathname === '/api/auth/logout') {
      service.logout(sessionToken(request));
      return json(response, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
    }
    if (request.method === 'DELETE' && pathname === '/api/account') {
      const body = await readJson(request);
      if (body.confirm !== true) return json(response, 400, { error: 'Подтверди удаление аккаунта.' });
      const result = service.deleteAccount(sessionToken(request));
      const status = result.status || 200;
      delete result.status;
      return json(response, status, result, { 'Set-Cookie': clearSessionCookie() });
    }
    if (request.method === 'PUT' && pathname === '/api/account/state') {
      const body = await readJson(request);
      const result = service.saveAccount(sessionToken(request), body.profile, body.gameState);
      const status = result.status || 200;
      delete result.status;
      return json(response, status, result);
    }
    if (request.method === 'PUT' && pathname === '/api/account/photo') {
      const body = await readJson(request);
      const result = service.savePhoto(sessionToken(request), body.dataUrl);
      const status = result.status || 200;
      delete result.status;
      return json(response, status, result);
    }
    if (request.method === 'DELETE' && pathname === '/api/account/photo') {
      const result = service.deletePhoto(sessionToken(request));
      const status = result.status || 200;
      delete result.status;
      return json(response, status, result);
    }
    return json(response, 404, { error: 'Маршрут не найден.' });
  }

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, appOrigin);
      if (url.pathname.indexOf('/api/') === 0) return await handleApi(request, response, url.pathname);
      if (request.method !== 'GET' && request.method !== 'HEAD') return json(response, 405, { error: 'Метод не поддерживается.' });
      const file = STATIC_FILES[url.pathname];
      if (!file) return json(response, 404, { error: 'Страница не найдена.' });
      const fullPath = path.join(ROOT, file[0]);
      const contents = await fs.promises.readFile(fullPath);
      response.writeHead(200, {
        'Content-Type': file[1],
        'Cache-Control': file[0] === 'index.html' ? 'no-cache' : 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'"
      });
      response.end(request.method === 'HEAD' ? undefined : contents);
    } catch (error) {
      const status = error.status || 500;
      json(response, status, { error: status === 500 ? 'Внутренняя ошибка сервера.' : error.message });
    }
  });
  server.authService = service;
  server.database = db;
  return server;
}

if (require.main === module) {
  const server = createApp();
  const port = Number(process.env.PORT || 8080);
  server.listen(port, () => {
    console.log('LifeSkill server listening on http://localhost:' + port);
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('SMTP is not configured. Email code requests will be rejected; no code will be faked.');
    }
  });
}

module.exports = { createApp, createSmtpSender, parseCookies };

