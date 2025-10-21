# Backend Auth API

Routes:
- POST /signup: { name, email, password } -> 201 { message, user }
- POST /login: { email, password } -> 200 { message, token, user }
- POST /logout: -> 200 { message }

Env (.env):
- PORT=3000
- MONGODB_URI=mongodb://localhost:27017/group4_project
- JWT_SECRET=change_me_in_production
- JWT_EXPIRES_IN=1h

