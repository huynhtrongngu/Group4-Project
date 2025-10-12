// controllers/userController.js

// Mảng users tạm
let users = [
  { id: 1, name: "Nguyen Van A", email: "a@example.com" },
  { id: 2, name: "Tran Thi B", email: "b@example.com" },
];

// GET /users - lấy danh sách người dùng
const getUsers = (req, res) => {
  res.status(200).json(users);
};

// POST /users - thêm người dùng mới
const createUser = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser);
};

// Xuất các hàm để route sử dụng
module.exports = { getUsers, createUser };
