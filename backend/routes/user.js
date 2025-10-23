const express = require('express');

const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');
const { requireAdmin, allowSelfOrAdmin } = require('../middleware/rbac');

// GET /users - admin only
router.get('/users', requireAuth, requireAdmin, getUsers);

// POST /users - create user (public)
router.post('/users', createUser);

// PUT /users/:id - update allowed for admin or the user themselves
router.put('/users/:id', requireAuth, allowSelfOrAdmin, updateUser);

// DELETE /users/:id - delete allowed for admin or the user themselves
router.delete('/users/:id', requireAuth, allowSelfOrAdmin, deleteUser);

module.exports = router;
