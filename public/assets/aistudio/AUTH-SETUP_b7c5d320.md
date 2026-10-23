# LifeSkill account setup

The account flow requires Node.js 20 or later. It uses SQLite for users, OTP challenges, rate limits, and sessions, and Nodemailer for SMTP delivery. No development PIN or fake successful response is enabled.

## Local setup

1. Install Node.js 20 LTS or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set unique values for `AUTH_SECRET` and `OTP_PEPPER` (each at least 32 characters).
4. Set the SMTP provider values: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `EMAIL_FROM`. Use an app password or provider API credential, not a personal mailbox password.
5. Set `APP_ORIGIN=http://localhost:8080` for local development.
6. Run `npm start` and open `http://localhost:8080`.

Generate separate secrets with Node 20:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The OTP endpoint returns `503` when SMTP configuration is missing or delivery fails. It never returns the code to the browser. Configure a real SMTP account before attempting email sign-in.

## Production

Use HTTPS and set `NODE_ENV=production`, `APP_ORIGIN=https://your-domain.example`, and a persistent `DATABASE_PATH` on protected storage. The session cookie is `HttpOnly`, `SameSite=Strict`, and gains `Secure` in production. Terminate TLS at a trusted reverse proxy. Set `TRUST_PROXY=true` only when the server is behind a proxy that overwrites `X-Forwarded-For`.

Back up the SQLite database securely. Keep `.env`, database files, and backups out of source control. Restrict database and secret-file permissions. Do not expose the SQLite file through static hosting.

## API

- `GET /api/session` checks the current cookie session.
- `POST /api/auth/request-code` accepts `{ "email": "..." }` and sends a six-digit code through SMTP.
- `POST /api/auth/verify-code` accepts `{ "email": "...", "code": "..." }`; an optional `{ "importLocalProgress": true, "legacyState": ... }` is accepted only after explicit user consent.
- `POST /api/auth/logout` revokes the current session.
- `PUT /api/account/state` saves the signed-in account profile and game state.
- `PUT /api/account/photo` saves a validated JPEG, PNG, or WebP photo (maximum 2 MB).
- `DELETE /api/account` requires `{ "confirm": true }` and deletes the account, photo, progress, and sessions.

Codes expire after 10 minutes, are single-use, allow five verification attempts, and can be resent once per 60 seconds. Per-email and per-IP request limits are enforced server-side.

## Local progress

The existing browser save remains untouched when the app is first gated by login. A checkbox offers to import that save only when verifying the address. If the address already has an account, its server progress is restored and the local save is not merged. Choosing a new game starts the normal initial state.

No production SMTP credentials are included in this repository. Email delivery and inbox receipt must be tested with the deployment's SMTP provider before enabling account sign-in for users.

