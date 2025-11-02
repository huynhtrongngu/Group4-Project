require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/group4_project';
  const DB_NAME = process.env.DB_NAME || 'groupDB';
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log(`✅ Connected to MongoDB (${DB_NAME})`);

  const samples = [
    { name: 'Admin One', email: 'admin@example.com', role: 'admin' },
    { name: 'Mod One', email: 'mod@example.com', role: 'moderator' },
    { name: 'User One', email: 'user@example.com', role: 'user' },
  ];
  const password = process.env.SEED_PASSWORD || '123456';
  const passwordHash = await bcrypt.hash(password, 10);

  for (const s of samples) {
    const exists = await User.findOne({ email: s.email }).lean();
    if (exists) {
      console.log(`↷ Skip existing ${s.email}`);
      continue;
    }
    const created = await User.create({ ...s, passwordHash });
    console.log(`＋ Created ${created.email} (${s.role})`);
  }

  console.log('Done. Accounts:');
  console.log('- admin@example.com / 123456');
  console.log('- mod@example.com / 123456');
  console.log('- user@example.com / 123456');

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
