# Backend Auth API

Routes:
- POST /signup: { name, email, password } -> 201 { message, user }
- POST /login: { email, password } -> 200 { message, token, user }
- POST /logout: -> 200 { message }

User management endpoints (Admin):
- GET /users -> 200 list of users (requires Bearer token of an admin)
- POST /users -> 201 create a user (public, role can be 'admin' or 'user')
- PUT /users/:id -> 200 update user (requires auth; admin or the user themself)
- DELETE /users/:id -> 200 delete user (requires auth; admin or the user themself)

Postman / quick test (happy path):
1. Create an admin account via POST /signup with body { name, email, password, role: 'admin' }.
2. Login with POST /login to receive { token }.
3. In Postman, set header Authorization: Bearer <token>.
4. GET /users should return an array of users when using the admin token.
5. DELETE /users/:id will remove the user if you are admin or deleting your own id.

Notes:
- Tokens are JWT signed with JWT_SECRET from .env. Default expires in 1h.
- The middleware `requireAuth` attaches the user document to `req.user`.

Env (.env):
- PORT=3000
- MONGODB_URI=mongodb://localhost:27017/group4_project
- JWT_SECRET=change_me_in_production
- JWT_EXPIRES_IN=1h

