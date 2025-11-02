const express = require('express');

const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');
const { requireAdmin, checkRole, allowSelfOrRoles } = require('../middleware/rbac');

// GET /users - admin only
router.get('/users', requireAuth, checkRole('admin'), getUsers);

// POST /users - create user (admin only)
router.post('/users', requireAuth, checkRole('admin'), createUser);

// PUT /users/:id - admin only (no moderator/self edits via this route)
router.put('/users/:id', requireAuth, checkRole('admin'), updateUser);

// DELETE /users/:id - admin only
router.delete('/users/:id', requireAuth, checkRole('admin'), deleteUser);

module.exports = router;
