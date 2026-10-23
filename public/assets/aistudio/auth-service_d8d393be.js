'use strict';

const crypto = require('crypto');
const Core = require('./lifeskill-core.js');

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;
const PROFILE_FIELDS = [
  'name', 'profileDescription', 'profileCardStyle', 'avatar', 'equippedItems',
  'theme', 'reducedMotion', 'soundEnabled', 'noPressure'
];

function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '';
  return email;
}

function maskEmail(email) {
  const parts = email.split('@');
  if (parts.length !== 2) return '';
  const local = parts[0];
  return (local.length < 2 ? '*' : local.charAt(0) + '***') + '@' + parts[1];
}

function stripProfileFields(state) {
  const game = Object.assign({}, state);
  PROFILE_FIELDS.forEach((field) => delete game[field]);
  return game;
}

function profileFromState(state) {
  return {
    name: state.name,
    profileDescription: state.profileDescription || '',
    profileCardStyle: state.profileCardStyle || 'standard',
    avatar: state.avatar,
    equippedItems: state.equippedItems,
    theme: Core.normalizeTheme(state.theme),
    reducedMotion: state.reducedMotion === true,
    soundEnabled: state.soundEnabled !== false,
    noPressure: state.noPressure === true
  };
}

function hmac(secret, value) {
  return crypto.createHmac('sha256', secret).update(value).digest();
}

function createAuthService(db, options) {
  options = options || {};
  if (!db) throw new TypeError('A SQLite database connection is required.');
  if (!options.authSecret || options.authSecret.length < 32) throw new Error('AUTH_SECRET must contain at least 32 characters.');
  if (!options.otpPepper || options.otpPepper.length < 32) throw new Error('OTP_PEPPER must contain at least 32 characters.');

  const now = options.now || Date.now;
  const sendOtpEmail = options.sendOtpEmail || null;
  const randomInt = options.randomInt || crypto.randomInt;

  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      profile_json TEXT NOT NULL,
      game_json TEXT NOT NULL,
      photo_data TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS otp_challenges (
      email TEXT PRIMARY KEY,
      code_hash BLOB NOT NULL,
      expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      sent_at INTEGER NOT NULL,
      ip_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auth_rate_limits (
      rate_key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      request_count INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash BLOB PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
  `);
  db.pragma('foreign_keys = ON');

  const selectChallenge = db.prepare('SELECT * FROM otp_challenges WHERE email = ?');
  const writeChallenge = db.prepare(`
    INSERT INTO otp_challenges (email, code_hash, expires_at, attempts, sent_at, ip_hash)
    VALUES (?, ?, ?, 0, ?, ?)
    ON CONFLICT(email) DO UPDATE SET code_hash = excluded.code_hash,
      expires_at = excluded.expires_at, attempts = 0, sent_at = excluded.sent_at,
      ip_hash = excluded.ip_hash
  `);
  const selectUser = db.prepare('SELECT * FROM users WHERE email = ?');
  const selectUserById = db.prepare('SELECT * FROM users WHERE id = ?');
  const writeUser = db.prepare(`
    INSERT INTO users (id, email, profile_json, game_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const writeSession = db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)');
  const deleteChallenge = db.prepare('DELETE FROM otp_challenges WHERE email = ?');

  function consumeRate(rateKey, maxCount, windowMs) {
    const timestamp = now();
    const current = db.prepare('SELECT * FROM auth_rate_limits WHERE rate_key = ?').get(rateKey);
    if (!current || timestamp - current.window_start >= windowMs) {
      db.prepare(`INSERT INTO auth_rate_limits (rate_key, window_start, request_count)
        VALUES (?, ?, 1) ON CONFLICT(rate_key) DO UPDATE SET window_start = excluded.window_start, request_count = 1`)
        .run(rateKey, timestamp);
      return { allowed: true, remaining: maxCount - 1 };
    }
    if (current.request_count >= maxCount) {
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.window_start + windowMs - timestamp) / 1000)) };
    }
    db.prepare('UPDATE auth_rate_limits SET request_count = request_count + 1 WHERE rate_key = ?').run(rateKey);
    return { allowed: true, remaining: maxCount - current.request_count - 1 };
  }

  function otpHash(email, code) {
    return hmac(options.otpPepper, email + ':' + code);
  }

  function safeProfile(profile, gameState) {
    const initial = Core.migrateSaveState(Object.assign({}, gameState, profile));
    const result = Core.applyProfileSettings(initial, {
      name: profile.name,
      description: profile.profileDescription,
      cardStyle: profile.profileCardStyle,
      avatar: profile.avatar,
      equippedItems: profile.equippedItems,
      theme: profile.theme
    });
    if (!result.success) return { error: result.error };
    initial.reducedMotion = profile.reducedMotion === true;
    initial.soundEnabled = profile.soundEnabled !== false;
    initial.noPressure = profile.noPressure === true;
    return { profile: profileFromState(initial) };
  }

  function createInitialAccount(importState) {
    if (!importState) {
      const initial = Core.getInitialState();
      return { profile: profileFromState(initial), game: stripProfileFields(initial) };
    }
    if (!Core.validateSaveState(importState) || JSON.stringify(importState).length > 2 * 1024 * 1024) {
      return { error: 'Локальное сохранение повреждено или слишком велико.' };
    }
    const migrated = Core.migrateSaveState(importState);
    return { profile: profileFromState(migrated), game: stripProfileFields(migrated) };
  }

  function createSession(userId) {
    const token = crypto.randomBytes(32).toString('base64url');
    const timestamp = now();
    writeSession.run(hmac(options.authSecret, token), userId, timestamp + SESSION_TTL_MS, timestamp);
    return token;
  }

  function publicAccount(user, photoData) {
    return {
      id: user.id,
      email: user.email,
      profile: JSON.parse(user.profile_json),
      gameState: JSON.parse(user.game_json),
      photoData: photoData || user.photo_data || null
    };
  }

  async function requestCode(rawEmail, ipAddress) {
    const email = normalizeEmail(rawEmail);
    if (!email) return { ok: false, status: 400, error: 'Укажи корректный адрес электронной почты.' };
    if (!sendOtpEmail) return { ok: false, status: 503, error: 'Отправка почты не настроена. Попробуй позже.' };

    const timestamp = now();
    const oldChallenge = selectChallenge.get(email);
    if (oldChallenge && timestamp - oldChallenge.sent_at < RESEND_DELAY_MS) {
      return { ok: false, status: 429, error: 'Повторный код можно запросить через минуту.', retryAfter: Math.ceil((RESEND_DELAY_MS - (timestamp - oldChallenge.sent_at)) / 1000) };
    }
    const ipKey = hmac(options.otpPepper, 'ip:' + String(ipAddress || 'unknown')).toString('hex');
    const ipLimit = consumeRate('ip:' + ipKey, 20, 60 * 60 * 1000);
    const emailLimit = consumeRate('email:' + email, 5, 60 * 60 * 1000);
    if (!ipLimit.allowed || !emailLimit.allowed) {
      const retryAfter = Math.max(ipLimit.retryAfter || 0, emailLimit.retryAfter || 0);
      return { ok: false, status: 429, error: 'Слишком много запросов. Попробуй позже.', retryAfter };
    }

    const code = String(randomInt(0, 1000000)).padStart(OTP_LENGTH, '0');
    const digest = otpHash(email, code);
    const challengeIp = ipKey;
    writeChallenge.run(email, digest, timestamp + OTP_TTL_MS, timestamp, challengeIp);
    try {
      await sendOtpEmail({ to: email, code: code, expiresInMinutes: 10 });
    } catch (error) {
      deleteChallenge.run(email);
      return { ok: false, status: 503, error: 'Не удалось отправить письмо. Проверь настройки почты и попробуй позже.' };
    }
    return { ok: true, maskedEmail: maskEmail(email), resendAfter: 60 };
  }

  function verifyCode(rawEmail, rawCode, legacyState) {
    const email = normalizeEmail(rawEmail);
    const code = typeof rawCode === 'string' ? rawCode : '';
    if (!email || !/^\d{6}$/.test(code)) return { ok: false, status: 400, error: 'Проверь адрес и введи шестизначный код.' };
    const challenge = selectChallenge.get(email);
    if (!challenge) return { ok: false, status: 400, error: 'Код недействителен. Запроси новый.' };
    const timestamp = now();
    if (challenge.expires_at <= timestamp) {
      deleteChallenge.run(email);
      return { ok: false, status: 400, error: 'Срок действия кода истёк. Запроси новый.' };
    }
    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      deleteChallenge.run(email);
      return { ok: false, status: 429, error: 'Лимит попыток исчерпан. Запроси новый код.' };
    }
    const candidate = otpHash(email, code);
    if (!crypto.timingSafeEqual(challenge.code_hash, candidate)) {
      const attempts = challenge.attempts + 1;
      if (attempts >= MAX_OTP_ATTEMPTS) deleteChallenge.run(email);
      else db.prepare('UPDATE otp_challenges SET attempts = ? WHERE email = ?').run(attempts, email);
      return { ok: false, status: attempts >= MAX_OTP_ATTEMPTS ? 429 : 400, error: attempts >= MAX_OTP_ATTEMPTS ? 'Лимит попыток исчерпан. Запроси новый код.' : 'Код не подошёл. Проверь цифры и попробуй ещё раз.', attemptsRemaining: Math.max(0, MAX_OTP_ATTEMPTS - attempts) };
    }

    const existingUser = selectUser.get(email);
    let user = existingUser;
    let created = false;
    let imported = false;
    const consume = db.transaction(() => {
      if (!user) {
        const accountState = createInitialAccount(legacyState || null);
        if (accountState.error) throw new Error(accountState.error);
        const id = crypto.randomUUID();
        writeUser.run(id, email, JSON.stringify(accountState.profile), JSON.stringify(accountState.game), timestamp, timestamp);
        user = selectUserById.get(id);
        created = true;
        imported = !!legacyState;
      }
      deleteChallenge.run(email);
      return createSession(user.id);
    });
    let sessionToken;
    try {
      sessionToken = consume();
    } catch (error) {
      return { ok: false, status: 400, error: error.message || 'Не удалось создать аккаунт.' };
    }
    return { ok: true, sessionToken: sessionToken, created: created, imported: imported, account: publicAccount(user) };
  }

  function getSession(sessionToken) {
    if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.length > 128) return null;
    const tokenHash = hmac(options.authSecret, sessionToken);
    const session = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?').get(tokenHash);
    if (!session) return null;
    if (session.expires_at <= now()) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
      return null;
    }
    const user = selectUserById.get(session.user_id);
    return user ? publicAccount(user) : null;
  }

  function saveAccount(sessionToken, profile, gameState) {
    const session = getSessionRow(sessionToken);
    if (!session) return { ok: false, status: 401, error: 'Сессия истекла. Войди снова.' };
    if (!profile || typeof profile !== 'object' || !gameState || typeof gameState !== 'object' || JSON.stringify(gameState).length > 2 * 1024 * 1024) {
      return { ok: false, status: 400, error: 'Данные аккаунта имеют неверный формат.' };
    }
    const current = selectUserById.get(session.user_id);
    const currentGame = JSON.parse(current.game_json);
    const mergedGame = Core.migrateSaveState(Object.assign({}, currentGame, gameState));
    const validation = safeProfile(profile, mergedGame);
    if (validation.error) return { ok: false, status: 400, error: validation.error };
    db.prepare('UPDATE users SET profile_json = ?, game_json = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(validation.profile), JSON.stringify(stripProfileFields(mergedGame)), now(), session.user_id);
    return { ok: true };
  }

  function getSessionRow(sessionToken) {
    if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.length > 128) return null;
    const tokenHash = hmac(options.authSecret, sessionToken);
    const session = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?').get(tokenHash);
    if (!session || session.expires_at <= now()) {
      if (session) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
      return null;
    }
    return session;
  }

  function savePhoto(sessionToken, dataUrl) {
    const session = getSessionRow(sessionToken);
    if (!session) return { ok: false, status: 401, error: 'Сессия истекла. Войди снова.' };
    if (typeof dataUrl !== 'string' || dataUrl.length > Math.ceil(MAX_PROFILE_PHOTO_BYTES * 1.4)) {
      return { ok: false, status: 413, error: 'Фото должно быть не больше 2 МБ.' };
    }
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) return { ok: false, status: 400, error: 'Поддерживаются JPEG, PNG и WebP.' };
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length || bytes.length > MAX_PROFILE_PHOTO_BYTES) return { ok: false, status: 413, error: 'Фото должно быть не больше 2 МБ.' };
    const validSignature = (match[1] === 'jpeg' && bytes[0] === 0xFF && bytes[1] === 0xD8)
      || (match[1] === 'png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
      || (match[1] === 'webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP');
    if (!validSignature) return { ok: false, status: 400, error: 'Содержимое файла не соответствует типу изображения.' };
    db.prepare('UPDATE users SET photo_data = ?, updated_at = ? WHERE id = ?').run(dataUrl, now(), session.user_id);
    return { ok: true };
  }

  function deletePhoto(sessionToken) {
    const session = getSessionRow(sessionToken);
    if (!session) return { ok: false, status: 401, error: 'Сессия истекла. Войди снова.' };
    db.prepare('UPDATE users SET photo_data = NULL, updated_at = ? WHERE id = ?').run(now(), session.user_id);
    return { ok: true };
  }

  function logout(sessionToken) {
    if (sessionToken && typeof sessionToken === 'string' && sessionToken.length <= 128) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hmac(options.authSecret, sessionToken));
    }
    return { ok: true };
  }

  function deleteAccount(sessionToken) {
    const session = getSessionRow(sessionToken);
    if (!session) return { ok: false, status: 401, error: 'Сессия истекла. Войди снова.' };
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(session.user_id);
      db.prepare('DELETE FROM users WHERE id = ?').run(session.user_id);
    });
    transaction();
    return { ok: true };
  }

  return {
    requestCode,
    verifyCode,
    getSession,
    saveAccount,
    savePhoto,
    deletePhoto,
    logout,
    deleteAccount,
    normalizeEmail,
    maskEmail,
    constants: { OTP_LENGTH, OTP_TTL_MS, RESEND_DELAY_MS, MAX_OTP_ATTEMPTS, SESSION_TTL_MS, MAX_PROFILE_PHOTO_BYTES }
  };
}

module.exports = { createAuthService, normalizeEmail, maskEmail, stripProfileFields, profileFromState };

