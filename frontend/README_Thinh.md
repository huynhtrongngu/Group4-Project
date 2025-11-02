# Frontend (React) – JWT Auto Refresh Demo

What changed:
- Added `src/api.js`: a shared Axios client with interceptors to:
  - Attach `Authorization: Bearer <accessToken>` from localStorage
  - On 401, call `/refresh` with HttpOnly cookie, store new access token, and retry the original request
- Updated components to use this client instead of raw axios.

How to test locally:
1. Start backend on http://localhost:3000
2. In frontend folder:
	- `npm start`
3. Login in the app. The backend sets an HttpOnly `refreshToken` cookie and returns an access token saved to localStorage.
4. Open Profile and perform actions normally.
5. To see auto-refresh in action, open DevTools > Application > Local Storage and edit `token` to an invalid value. Next API call will:
	- Fail with 401
	- Interceptor will POST `/refresh`, receive a new token, save it, then retry the original request automatically.
6. Click Đăng xuất — this calls `/logout`, revoking the refresh token and clearing the cookie. Next refresh attempt will be 401.

Env var for custom API base:
- `REACT_APP_API_URL` (default to http://localhost:3000 when in development)
