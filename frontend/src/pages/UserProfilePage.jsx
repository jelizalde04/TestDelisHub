import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import apiClient from '../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [newComments, setNewComments] = useState({});
  const [editingComment, setEditingComment] = useState(null); // Para manejar el estado de edición
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleAddComment = async (recipeId, content) => {
    try {
      const response = await apiClient.post(`/api/recipes/${recipeId}/comments`, { content });
      const newComment = response.data.comment;

      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId
            ? { ...recipe, Comments: [...recipe.Comments, newComment] }
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
      await apiClient.delete(`/api/recipes/${recipeId}/comments/${commentId}`);
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
      const response = await apiClient.put(`/api/recipes/${recipeId}/comments/${commentId}`, {
        content,
      });

      const updatedComment = response.data.comment;

      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                Comments: recipe.Comments.map((comment) =>
                  comment.id === commentId ? updatedComment : comment
                ),
              }
            : recipe
        )
      );
      setEditingComment(null); // Salir del modo de edición
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
      <h1 className="text-center">Perfil de {user.user.username}</h1>
      <div className="row mt-4">
        {recipes.length === 0 ? (
          <div className="col-12 text-center">
            <p>No has creado ninguna receta aún.</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{recipe.title}</h5>
                  <p className="card-text">{recipe.description}</p>
                  <p>
                    <strong>Publicado por:</strong> {recipe.user?.username || 'Desconocido'} -{' '}
                    {formatDistanceToNow(new Date(recipe.createdAt), { locale: es })}
                  </p>
                  <h6>Ingredientes:</h6>
                  <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                  <h6>Pasos:</h6>
                  <ol>
                    {recipe.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                  <h6>Comentarios:</h6>
                  {recipe.Comments.map((comment) => (
                    <div key={comment.id} className="d-flex align-items-start mb-2">
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
                              className="btn btn-success btn-sm me-2"
                              onClick={() =>
                                handleEditComment(recipe.id, comment.id, editContent)
                              }
                            >
                              Guardar
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingComment(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-grow-1">
                            <strong>{comment.User?.username || 'Anónimo'}</strong>: {comment.content}
                          </div>
                          {comment.User?.id === user.user.id && (
                            <div className="ms-2">
                              <button
                                className="btn btn-outline-primary btn-sm me-1"
                                onClick={() => handleEditClick(comment)}
                              >
                                ✎
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() =>
                                  handleDeleteComment(recipe.id, comment.id)
                                }
                              >
                                🗑
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
                    className="btn btn-primary btn-sm mt-2"
                    onClick={() =>
                      handleAddComment(recipe.id, newComments[recipe.id])
                    }
                    disabled={!newComments[recipe.id]}
                  >
                    Agregar comentario
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
