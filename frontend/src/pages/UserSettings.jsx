import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UserSettings = () => {
  const { user, logout } = useContext(AuthContext); // Datos del usuario y función de logout
  const navigate = useNavigate();

  // Estados para manejar los datos
  const [editingField, setEditingField] = useState(null); // Campo que se está editando
  const [formData, setFormData] = useState({
    username: user?.user?.username || '',
    email: user?.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '', // Contraseña para confirmar cambios
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (field) => {
    setEditingField(field); // Activa la edición para el campo seleccionado
  };

  const handleCancel = () => {
    setEditingField(null); // Cancela la edición
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Token de autenticación

    try {
      if (editingField === 'username') {
        await axios.put(
          '/api/user-profile/update-profile',
          { username: formData.username, password: formData.confirmPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Nombre actualizado con éxito.');
      }

      if (editingField === 'email') {
        await axios.put(
          '/api/user-profile/update-profile',
          { email: formData.email, password: formData.confirmPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Correo actualizado con éxito.');
      }

      if (editingField === 'password') {
        await axios.put(
          '/api/user-profile/update-password',
          {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Contraseña actualizada con éxito.');
      }

      setEditingField(null); // Salir del modo edición
    } catch (error) {
      alert('Error al actualizar la información.');
    }
  };

  const handleDeleteUser = async () => {
    const token = localStorage.getItem('token');
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
    );

    if (confirmDelete) {
      try {
        await axios.delete('/api/user-profile/delete-user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Cuenta eliminada con éxito.');
        logout(); // Cerrar sesión automáticamente después de eliminar el usuario
        navigate('/login');
      } catch (error) {
        alert('Error al eliminar la cuenta.');
      }
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard'); // Redirige al Dashboard
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white text-center">
          <h3>Configuración de Usuario</h3>
        </div>
        <div className="card-body">
          {!editingField ? (
            // Vista de solo lectura
            <div>
              <div className="mb-3">
                <h5 className="fw-bold">Nombre:</h5>
                <p>{user?.user?.username || 'No disponible'}</p>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleEdit('username')}
                >
                  Editar Nombre
                </button>
              </div>
              <div className="mb-3">
                <h5 className="fw-bold">Email:</h5>
                <p>{user?.user?.email || 'No disponible'}</p>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleEdit('email')}
                >
                  Editar Correo
                </button>
              </div>
              <div className="mb-3">
                <h5 className="fw-bold">Contraseña:</h5>
                <p>********</p>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleEdit('password')}
                >
                  Cambiar Contraseña
                </button>
              </div>
              <div className="mb-3">
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteUser}
                >
                  Eliminar Cuenta
                </button>
              </div>
              <div className="mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={handleGoToDashboard}
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
          ) : (
            // Vista de edición
            <form onSubmit={handleSubmit}>
              {editingField === 'username' && (
                <div className="mb-3">
                  <label className="form-label">Nuevo Nombre</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nuevo Nombre"
                  />
                </div>
              )}
              {editingField === 'email' && (
                <div className="mb-3">
                  <label className="form-label">Nuevo Correo</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nuevo Correo"
                  />
                </div>
              )}
              {editingField === 'password' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Contraseña Actual</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-control"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Contraseña Actual"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="form-control"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Nueva Contraseña"
                    />
                  </div>
                </>
              )}
              {(editingField === 'username' || editingField === 'email') && (
                <div className="mb-3">
                  <label className="form-label">Contraseña para Confirmar</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Contraseña"
                  />
                </div>
              )}
              <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-success">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
