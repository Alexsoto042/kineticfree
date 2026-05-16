import './LoadingOverlay.css'; // We'll create this CSS file next

interface LoadingOverlayProps {
  message?: string; // Make message optional
}

function LoadingOverlay({ message = 'Cargando...' }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default LoadingOverlay;
