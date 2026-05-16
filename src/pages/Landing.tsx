import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import './Landing.css';
import logo from '../assets/logo/logo_dark_bg.svg';
import { 
  FaRocket, 
  FaChartLine, 
  FaDumbbell, 
  FaAppleAlt, 
  FaTrophy, 
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaAndroid
} from 'react-icons/fa';

import { useAppConfig } from '../hooks/useAppConfig'; // Importar hook

const Landing: React.FC = () => {
  const { get, loading: configLoading } = useAppConfig();
  const apkUrl = get('android_apk_url', 'https://github.com/Alexsoto042/kineticapp/releases/download/v1.0.0-beta/app-kinetic-beta.apk');

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="dots-pattern"></div>
        </div>
        <div className="hero-content">
          <img src={logo} alt="Kinetic Logo" className="hero-logo" />
          <h1 className="hero-title">
            Transforma tu Cuerpo,
            <br />
            <span className="gradient-text">Eleva tu Mente</span>
          </h1>
          <p className="hero-subtitle">
            La aplicación definitiva para seguimiento de fitness, nutrición y progreso personal
          </p>
          <div className="hero-cta">
            <Button as={Link} to="/login" variant="primary" className="cta-primary">
              <span>Comenzar Gratis</span>
              <FaRocket />
            </Button>
            <Button as={Link} to="/login" variant="outline" className="cta-secondary">
              <span>Iniciar Sesión</span>
              <FaArrowRight />
            </Button>
          </div>
          <div className="download-apk-section">
            <Button 
              as="a" 
              href={apkUrl}
              download
              variant="outline" 
              className="download-apk-btn"
              disabled={configLoading} // Opcional: deshabilitar mientras carga
            >
              <FaAndroid />
              <span>{configLoading ? 'Cargando enlace...' : 'Descargar APK para Android'}</span>
            </Button>
            <p className="download-note">Versión Beta • Descarga directa</p>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Usuarios Activos</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">500K+</div>
              <div className="stat-label">Entrenamientos</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">4.8★</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Todo lo que necesitas para alcanzar tus metas</h2>
            <p>Herramientas poderosas diseñadas para tu éxito</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon icon-blue">
                <FaChartLine />
              </div>
              <h3>Seguimiento Inteligente</h3>
              <p>Registra cada detalle de tus entrenamientos con precisión y facilidad</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-green">
                <FaTrophy />
              </div>
              <h3>Metas Personalizadas</h3>
              <p>Define y alcanza objetivos adaptados a tu nivel y aspiraciones</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-purple">
                <FaDumbbell />
              </div>
              <h3>Rutinas Personalizadas</h3>
              <p>Crea entrenamientos únicos que se ajusten a tu estilo de vida</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-orange">
                <FaAppleAlt />
              </div>
              <h3>Nutrición Integrada</h3>
              <p>Controla tu dieta y macros para resultados óptimos</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-pink">
                <FaUsers />
              </div>
              <h3>Comunidad Motivadora</h3>
              <p>Comparte logros y mantente inspirado con otros atletas</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon icon-teal">
                <FaStar />
              </div>
              <h3>Logros y Rachas</h3>
              <p>Celebra tu progreso y mantén la consistencia día a día</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-container">
          <div className="benefit-row">
            <div className="benefit-content">
              <h2>Entrena más inteligente, no más duro</h2>
              <p>
                Kinetic analiza tu progreso y te proporciona insights valiosos para optimizar 
                cada entrenamiento. Deja de adivinar y empieza a entrenar con datos.
              </p>
              <ul className="benefit-list">
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>Análisis de progreso en tiempo real</span>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>Recomendaciones personalizadas</span>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>Ajustes automáticos de volumen</span>
                </li>
              </ul>
            </div>
            <div className="benefit-visual">
              <div className="visual-placeholder">
                <FaChartLine className="placeholder-icon" />
              </div>
            </div>
          </div>

          <div className="benefit-row reverse">
            <div className="benefit-visual">
              <div className="visual-placeholder">
                <FaTrophy className="placeholder-icon" />
              </div>
            </div>
            <div className="benefit-content">
              <h2>Tu progreso, visualizado</h2>
              <p>
                Gráficos detallados y estadísticas que te muestran exactamente cómo has mejorado. 
                Celebra cada PR y mantente motivado con tu evolución.
              </p>
              <ul className="benefit-list">
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>Gráficos de progreso detallados</span>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>Historial completo de entrenamientos</span>
                </li>
                <li>
                  <FaCheckCircle className="check-icon" />
                  <span>Comparativas de rendimiento</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="cta-content">
          <h2>¿Listo para transformarte?</h2>
          <p>Únete a miles de usuarios que ya están alcanzando sus metas</p>
          <Button as={Link} to="/login" variant="primary" className="cta-large">
            <span>Comenzar Ahora - Es Gratis</span>
            <FaRocket />
          </Button>
          <p className="cta-note">No se requiere tarjeta de crédito</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 Kinetic. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;
