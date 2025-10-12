const express = require('express');
const app = express();
app.use(express.json());

const userRoute = require('./routes/user');
app.use('/', userRoute);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
