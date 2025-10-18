// server.js
// ---------------------------------------------
// Mô tả: File khởi tạo server Express chính cho ứng dụng backend
// ---------------------------------------------

// Import thư viện cần thiết
const express = require('express');
const dotenv = require('dotenv');

// Load biến môi trường từ file .env (nếu có)
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();

// Middleware để đọc dữ liệu JSON từ request body
app.use(express.json());

// -------------------------------
// Kết nối routes
// -------------------------------
const userRouter = require('./routes/user');

// Khi truy cập đường dẫn bắt đầu bằng /users → chuyển qua userRouter xử lý
app.use('/users', userRouter);

// -------------------------------
// Route gốc (root route)
// -------------------------------
app.get('/', (req, res) => {
  res.send('🎉 Backend server is running successfully!');
});

// -------------------------------
// Khởi động server
// -------------------------------

// Lấy PORT từ file .env hoặc mặc định là 5000
const PORT = process.env.PORT || 5000;

// Lắng nghe trên PORT chỉ định
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
