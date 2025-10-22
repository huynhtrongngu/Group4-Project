require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ Missing MONGODB_URI in .env');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'name và email là bắt buộc' });
    const created = await User.create({ name, email });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email đã tồn tại' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
