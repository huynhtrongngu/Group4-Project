// routes/user.js
// -----------------------------
// Mô tả: File định nghĩa các route (đường dẫn API) cho user
// -----------------------------

const express = require('express');
const router = express.Router();

// Import các hàm xử lý từ controller
const { getUsers, createUser } = require('../controllers/userController');

/**
 * @route   GET /users
 * @desc    Lấy danh sách tất cả người dùng (users)
 * @access  Public
 */
router.get('/', getUsers);

/**
 * @route   POST /users
 * @desc    Thêm người dùng mới
 * @access  Public
 */
router.post('/', createUser);

// Export router để sử dụng trong server.js
module.exports = router;
