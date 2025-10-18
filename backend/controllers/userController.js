// controllers/userController.js

// Mảng tạm giữ users (id tự tăng đơn giản)
let users = [
  { id: 1, name: "Nguyen Van A", email: "a@example.com" },
  { id: 2, name: "Tran Thi B", email: "b@example.com" }
];

// Helper tạo id mới (đơn giản)
const getNextId = () => {
  if (users.length === 0) return 1;
  return Math.max(...users.map(u => u.id)) + 1;
};

// GET /users
const getUsers = (req, res) => {
  res.json({ success: true, count: users.length, data: users });
};

// POST /users
const createUser = (req, res) => {
  const { name, email } = req.body;

  // Validate cơ bản
  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Missing name or email" });
  }

  // Kiểm tra trùng email (ví dụ)
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: "Email already exists" });
  }

  const newUser = {
    id: getNextId(),
    name: name.trim(),
    email: email.trim().toLowerCase()
  };

  users.push(newUser);

  // Trả về user vừa tạo
  res.status(201).json({ success: true, data: newUser });
};

// Export (nếu muốn test nội bộ)
module.exports = {
  getUsers,
  createUser,
  // để thuận tiện khi unit test hoặc reset trong dev:
  _internal: { users, setUsers: arr => (users = arr) }
};