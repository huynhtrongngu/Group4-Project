require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();

const FRONTEND_URLS = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000,http://localhost:3001')
	.split(',')
	.map((s) => s.trim().replace(/\/$/, ''));
app.use(cors({
	origin: (origin, callback) => {
		// Allow requests with no origin (like mobile apps or same-origin/proxy)
		if (!origin) return callback(null, true);
		const ok = FRONTEND_URLS.includes(origin);
		return callback(ok ? null : new Error('Not allowed by CORS'), ok);
	},
	credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB at server start
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/group4_project';
const DB_NAME = process.env.DB_NAME || 'groupDB';
mongoose
	.connect(MONGODB_URI, { dbName: DB_NAME })
	.then(() => console.log(`✅ [backend] MongoDB connected (db: ${DB_NAME})`))
	.catch((err) => console.error('❌ [backend] MongoDB connection error:', err.message));

// Health
app.get('/', (req, res) => res.json({ ok: true }));
app.get('/health', (req, res) => {
	const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
	res.json({
		ok: true,
		dbState: states[mongoose.connection.readyState] || String(mongoose.connection.readyState),
		dbName: mongoose.connection.name,
	});
});

// Existing demo routes
const userRoute = require('./routes/user');
app.use('/', ensureDb, userRoute);

// Middleware to ensure DB is up before auth routes
function ensureDb(req, res, next) {
	if (mongoose.connection.readyState !== 1) {
		return res.status(503).json({ message: 'Database chưa sẵn sàng. Kiểm tra MongoDB/MONGODB_URI.' });
	}
	next();
}

// Auth routes
const authRoute = require('./routes/auth');
app.use('/', ensureDb, authRoute);

// Profile routes (yêu cầu token)
const profileRoute = require('./routes/profile');
app.use('/', ensureDb, profileRoute);

// Static serve for uploaded files
const { uploadRoot } = require('./middleware/upload');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload routes (yêu cầu token)
const uploadRoute = require('./routes/upload');
app.use('/', ensureDb, uploadRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
