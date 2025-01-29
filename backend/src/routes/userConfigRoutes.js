const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userConfigController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware para proteger rutas
const userConfigController = require('../controllers/userConfigController');

// Actualizar perfil del usuario
router.put('/update-profile', authMiddleware, userConfigController.updateProfile);

// Actualizar contraseña
router.put('/update-password', authMiddleware, userConfigController.updatePassword);

// Eliminar usuario y sus datos relacionados
router.delete('/delete-user', authMiddleware, userConfigController.deleteUser);

module.exports = router;
