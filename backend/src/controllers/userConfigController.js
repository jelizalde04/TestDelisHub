const bcrypt = require('bcrypt');
const { User, Recipe, Comment } = require('../models');

module.exports = {
    // Actualizar perfil del usuario
    async updateProfile(req, res) {
        const { username, email } = req.body;

        try {
            const user = await User.findByPk(req.user.id);
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            // Actualizar campos
            user.username = username || user.username;
            user.email = email || user.email;
            await user.save();

            res.json({ message: 'Perfil actualizado con éxito', user });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar perfil', error });
        }
    },

    // Actualizar contraseña
    async updatePassword(req, res) {
        const { currentPassword, newPassword } = req.body;

        try {
            const user = await User.findByPk(req.user.id);
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            // Verificar contraseña actual
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

            // Actualizar con nueva contraseña
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            res.json({ message: 'Contraseña actualizada con éxito' });
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar contraseña', error });
        }
    },

    // Eliminar usuario y sus datos relacionados
    async deleteUser(req, res) {
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            // Eliminar usuario (recetas y comentarios se eliminan en cascada)
            await user.destroy();

            res.json({ message: 'Usuario eliminado con éxito' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar usuario', error });
        }
    },
};
