import { Link } from 'react-router-dom';
import { FaRunning, FaPlus } from 'react-icons/fa';
import { Button } from '../ui/Button/Button';

export function QuickActions() {
  return (
    <div className="quick-actions">
      <h4>Acciones Rápidas</h4>
      <div className="quick-actions-list">
        <Button as={Link} to="/routines" variant="primary">
          <FaRunning />
          <span>Iniciar una Rutina</span>
        </Button>
        <Button as={Link} to="/build-routine" variant="secondary">
          <FaPlus />
          <span>Crear Nueva Rutina</span>
        </Button>
      </div>
    </div>
  );
}
