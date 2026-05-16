import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import './Login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import logo from '../assets/logo/logo_dark_bg.svg';
import { FaArrowLeft } from 'react-icons/fa';

function Login() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          navigate('/');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <Link to="/" className="back-to-home">
        <FaArrowLeft />
        <span>Volver al inicio</span>
      </Link>

      <div className="login-box">
        <div className="login-header">
          <img src={logo} alt="Kinetic Logo" className="login-logo" />
          <h1>Bienvenido de vuelta</h1>
          <p>Inicia sesión para continuar tu transformación</p>
        </div>
        <div className="auth-wrapper">
          <div className="auth-inner-wrapper">
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#00e676',
                      brandAccent: '#00c853',
                    }
                  }
                }
              }}
              theme={theme}
              providers={['google', 'github']}
              redirectTo={
                Capacitor.isNativePlatform()
                  ? 'com.kinetic.app://callback'
                  : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')
              }
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Correo electrónico',
                    password_label: 'Contraseña',
                    button_label: 'Iniciar sesión',
                    loading_button_label: 'Iniciando sesión...',
                    social_provider_text: 'Continuar con {{provider}}',
                    link_text: '¿Ya tienes cuenta? Inicia sesión'
                  },
                  sign_up: {
                    email_label: 'Correo electrónico',
                    password_label: 'Contraseña',
                    button_label: 'Registrarse',
                    loading_button_label: 'Registrando...',
                    social_provider_text: 'Continuar con {{provider}}',
                    link_text: '¿No tienes cuenta? Regístrate'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
