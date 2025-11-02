# Backend Auth API (JWT Access + Refresh)

Routes:
- POST /signup: { name, email, password } -> 201 { message, user }
- POST /login: { email, password } -> 200 { message, token, user } and sets HttpOnly cookie `refreshToken`
- POST /logout: -> 200 { message } and clears HttpOnly cookie, refresh token revoked
- POST /refresh (alias: /auth/refresh): -> 200 { token } issues a new access token and rotates refresh cookie

Roles & permissions:
- Roles: user, moderator, admin
- checkRole middleware protects endpoints; hierarchy is not implicit, we explicitly allow roles per route.

User management endpoints (RBAC):
- GET /users -> 200 list users (requires Bearer token of an admin OR moderator)
- POST /users -> 201 create a user (admin only)
- PUT /users/:id -> 200 update (admin or moderator, or the user themself)
	- Only admin may change a user's role
	- Moderator cannot modify admin accounts
- DELETE /users/:id -> 200 delete (admin or moderator, or the user themself)
	- Moderator cannot delete admin accounts

Postman / quick test (happy path):
1. Create an admin account via POST /signup with body { name, email, password, role: 'admin' }.
2. Login with POST /login to receive { token }.
3. In Postman, set header Authorization: Bearer <token>.
4. GET /users should return an array of users when using the admin token.
5. DELETE /users/:id will remove the user if you are admin or deleting your own id.

Notes:
- Access tokens are short-lived (default 15m) and must be sent via `Authorization: Bearer <token>`.
- Refresh tokens are long-lived (default 7d), stored as HttpOnly cookie and hashed in DB for server-side revocation/rotation.
- The middleware `requireAuth` verifies access tokens and also checks a small in-memory blacklist for revoked access JTIs (on logout).

Env (.env):
- PORT=3000
- MONGODB_URI=mongodb://localhost:27017/group4_project
- DB_NAME=groupDB
- FRONTEND_URL=http://localhost:3000  # change to your CRA dev URL or deployed origin
- JWT_SECRET=change_me_in_production
- ACCESS_TOKEN_SECRET=change_access_secret
- REFRESH_TOKEN_SECRET=change_refresh_secret
- ACCESS_TOKEN_EXPIRES_IN=15m
- REFRESH_TOKEN_EXPIRES_IN=7d
- REFRESH_COOKIE_NAME=refreshToken
- COOKIE_SECURE=false  # set true in production (HTTPS)

Postman test for refresh flow:

Seeding sample users:
- Run: `npm run seed` inside backend folder
- It creates accounts (password 123456):
	- admin@example.com (admin)
	- mod@example.com (moderator)
	- user@example.com (user)
1) POST /signup (if needed):
	Body (JSON): { "name": "Alice", "email": "alice@example.com", "password": "secret123" }
2) POST /login:
	Body: { "email": "alice@example.com", "password": "secret123" }
	Result: { token, user } and a Set-Cookie: refreshToken=... (HttpOnly)
	- Save the `token` in a Postman variable `access_token`.
	- Postman automatically stores cookies per domain; ensure `Enable cookie manager` is on.
3) Call an auth endpoint with the access token, e.g. GET /profile with header `Authorization: Bearer {{access_token}}`.
4) Simulate expiry by editing the `access_token` to something invalid (or wait until it expires). Then:
	- POST /auth/refresh (or /refresh)
	- Ensure Cookie tab has `refreshToken`. If cookies disabled, send header `x-refresh-token: <refreshToken>` (dev only).
	- Response: { token } — set this as new `access_token`.
5) Retry GET /profile with the new token — it should succeed.
6) POST /logout — server revokes refresh token and clears cookie.
	- Subsequent POST /auth/refresh should now return 401.

