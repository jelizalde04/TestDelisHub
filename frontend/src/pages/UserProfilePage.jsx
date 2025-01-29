import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiClient from '../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [newComments, setNewComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !user.user || !user.user.id) return;

      try {
        const response = await apiClient.get(`/user-profile/${user.user.id}`);
        setRecipes(response.data);

        const initialComments = {};
        response.data.forEach((recipe) => {
          initialComments[recipe.id] = '';
        });
        setNewComments(initialComments);
      } catch (error) {
        console.error('Error al cargar el perfil del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleEditRecipe = (recipeId) => {
    navigate(`/recipes/edit/${recipeId}`);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta receta?')) {
      try {
        await apiClient.delete(`/recipes/${recipeId}`);
        setRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
      } catch (error) {
        console.error('Error al eliminar la receta:', error);
      }
    }
  };

  const handleAddComment = async (recipeId, content) => {
    try {
      const response = await apiClient.post('/comments', { recipeId, content });
      const newComment = response.data.comment;

      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId
            ? { ...recipe, Comments: [...recipe.Comments, { ...newComment, User: user.user }] }
            : recipe
        )
      );
      setNewComments((prev) => ({ ...prev, [recipeId]: '' }));
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const handleDeleteComment = async (recipeId, commentId) => {
    try {
      await apiClient.delete(`/comments/${commentId}`);
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                Comments: recipe.Comments.filter((c) => c.id !== commentId),
              }
            : recipe
        )
      );
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    }
  };

  const handleEditComment = async (recipeId, commentId, content) => {
    try {
      const response = await apiClient.put(`/comments/${commentId}`, { content });
      const updatedComment = response.data.comment;

      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                Comments: recipe.Comments.map((comment) =>
                  comment.id === commentId
                    ? { ...updatedComment, User: user.user }
                    : comment
                ),
              }
            : recipe
        )
      );
      setEditingComment(null);
    } catch (error) {
      console.error('Error al editar comentario:', error);
    }
  };

  const handleEditClick = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando recetas...</div>;
  }

  return (
    <div className="container mt-5">
      {/* Botón DelisHub */}
      <div className="text-center mb-4">
        <button
          className="btn btn-outline-primary btn-lg fw-bold rounded-pill px-4 shadow-sm"
          onClick={() => navigate('/dashboard')}
          style={{
            fontSize: '1.25rem',
            letterSpacing: '0.5px',
          }}
        >
          <span role="img" aria-label="home">
            🍴
          </span>{' '}
          DelisHub
        </button>
      </div>

      {/* Título del perfil */}
      <h1 className="text-center mb-4">
        <span className="fw-bold text-primary">Perfil de {user.user.username}</span>
      </h1>

      {/* Lista de recetas */}
      <div className="row justify-content-center">
        {recipes.length === 0 ? (
          <div className="col-12 text-center">
            <p className="text-muted">No has creado ninguna receta aún.</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.id} className="col-md-8 mb-4">
              <div className="card shadow-lg border-0 rounded-lg">
                <div className="card-header d-flex justify-content-between align-items-center bg-light">
                  <h4 className="text-primary mb-0 fw-bold">{recipe.title}</h4>
                  <div>
                    <button
                      className="btn btn-primary btn-sm me-2 rounded-pill shadow-sm"
                      onClick={() => handleEditRecipe(recipe.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm rounded-pill shadow-sm"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-2">
                    <strong>Publicado por:</strong> {recipe.user?.username || 'Desconocido'} -{' '}
                    {formatDistanceToNow(new Date(recipe.createdAt), { locale: es })}
                  </p>
                  <h6 className="fw-bold text-secondary mt-4">Ingredientes:</h6>
                  <ul className="list-unstyled ps-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="mb-1">• {ingredient}</li>
                    ))}
                  </ul>
                  <h6 className="fw-bold text-secondary mt-4">Pasos:</h6>
                  <ol className="ps-3">
                    {recipe.steps.map((step, index) => (
                      <li key={index} className="mb-1">{step}</li>
                    ))}
                  </ol>
                  <h6 className="fw-bold text-secondary mt-4">Comentarios:</h6>
                  {recipe.Comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 rounded bg-light shadow-sm mb-2 d-flex justify-content-between align-items-start"
                    >
                      {editingComment === comment.id ? (
                        <div className="flex-grow-1">
                          <textarea
                            className="form-control"
                            rows="1"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          ></textarea>
                          <div className="mt-2">
                            <button
                              className="btn btn-primary btn-sm me-2 rounded-pill shadow-sm"
                              onClick={() =>
                                handleEditComment(recipe.id, comment.id, editContent)
                              }
                            >
                              Guardar
                            </button>
                            <button
                              className="btn btn-secondary btn-sm rounded-pill shadow-sm"
                              onClick={() => setEditingComment(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="mb-1">
                              <strong>{comment.User?.username || 'Anónimo'}</strong>{' '}
                              <span className="text-muted small">
                                -{' '}
                                {new Date(comment.createdAt).toLocaleString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </p>
                            <p className="mb-0">{comment.content}</p>
                          </div>
                          {comment.User?.id === user.user.id && (
                            <div className="d-flex align-items-center">
                              <button
                                className="btn btn-sm me-2 rounded-pill border shadow-none text-muted px-4 py-2"
                                onClick={() => handleEditClick(comment)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm me-2 rounded-pill border shadow-none text-muted px-4 py-2"
                                onClick={() => handleDeleteComment(recipe.id, comment.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <textarea
                    className="form-control mt-3"
                    placeholder="Escribe un comentario"
                    value={newComments[recipe.id] || ''}
                    onChange={(e) =>
                      setNewComments((prev) => ({
                        ...prev,
                        [recipe.id]: e.target.value,
                      }))
                    }
                  ></textarea>
                  <button
                    className="btn btn-primary btn-sm mt-2 rounded-pill shadow-sm"
                    onClick={() =>
                      handleAddComment(recipe.id, newComments[recipe.id])
                    }
                    disabled={!newComments[recipe.id]}
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
