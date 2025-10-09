require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
const uri = process.env.MONGO_URI; // đã chứa /groupDB
mongoose
  .connect(uri, { maxPoolSize: 10 })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Routes
app.get('/api/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'name & email required' });

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already exists' });
    res.status(500).json({ message: err.message });
  }
});

app.get('/', (_, res) => res.send('API OK'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server listening on http://localhost:${port}`));
