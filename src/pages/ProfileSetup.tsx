import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToasts } from '../hooks/useToasts';
import './ProfileSetup.css';
import { useAuth } from '../hooks/useAuth';
import { useValidatedForm } from '../hooks/useValidatedForm';
import { usernameSchema } from '../lib/validation';
import { z } from 'zod';

// Schema de validación para el setup de perfil
const profileSetupFormSchema = z.object({
  username: usernameSchema,
});

type ProfileSetupFormData = z.infer<typeof profileSetupFormSchema>;

function ProfileSetup() {
  const { showSuccessToast } = useToasts();
  const navigate = useNavigate();
  const { refetchProfile } = useAuth();

  useEffect(() => {
    // Check if user is logged in, if not, redirect to login
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      }
    };
    checkUser();
  }, [navigate]);

  const {
    isSubmitting,
    getFieldProps,
    getFieldError,
    hasFieldError,
    handleSubmit,
  } = useValidatedForm<ProfileSetupFormData>({
    schema: profileSetupFormSchema,
    initialValues: {
      username: '',
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (data) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      const upsertData: { id: string; username: string; avatar_url?: string } = {
        id: user.id,
        username: data.username,
      };

      // If the user has an avatar from their email, use it as a default
      if (user.user_metadata?.avatar_url) {
        upsertData.avatar_url = user.user_metadata.avatar_url as string;
      }

      const { error } = await supabase.from('profiles').upsert(upsertData);

      if (error) {
        throw error;
      }

      showSuccessToast('¡Perfil actualizado correctamente!');

      // Refetch the profile to update the hasUsername state
      await refetchProfile();

      navigate('/'); // Redirect to home/dashboard after setup
    },
  });

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-box">
        <h2>Configurar Perfil</h2>
        <p>Por favor, elige un nombre de usuario.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario:</label>
            <input
              type="text"
              id="username"
              {...getFieldProps('username')}
              disabled={isSubmitting}
              className={hasFieldError('username') ? 'error' : ''}
            />
            {hasFieldError('username') && (
              <span className="error-message">{getFieldError('username')}</span>
            )}
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Nombre de Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;
