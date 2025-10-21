const express = require('express');
const router = express.Router();

let users = []; // mảng tạm

router.get('/users', (req, res) => {
  res.json(users);
});

router.post('/users', (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.json(newUser);
});

module.exports = router;
