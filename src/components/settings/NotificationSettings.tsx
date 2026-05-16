import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useToasts } from '../../hooks/useToasts';
import { PushNotifications } from '@capacitor/push-notifications';
import {
  requestNotificationPermission,
  startNotifications,
  stopNotifications,
  scheduleWorkoutReminder,
  cancelWorkoutReminder,
  scheduleMotivationalMessage,
  cancelMotivationalMessages,
  type CombinedPermissionStatus,
} from '../../lib/notificationManager';
import './NotificationSettings.css';

export function NotificationSettings() {
  const { showSuccessToast, showErrorToast } = useToasts();
  const [permission, setPermission] = useState<CombinedPermissionStatus>('default');
  const [localIsEnabled, setLocalIsEnabled] = useState(false);
  const [localInterval, setLocalInterval] = useState(60);
  const [isNative, setIsNative] = useState(false);
  const [workoutReminderEnabled, setWorkoutReminderEnabled] = useState(false);
  const [motivationTime, setMotivationTime] = useState('09:00');

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    const checkPermission = async () => {
      if (Capacitor.isNativePlatform()) {
        const permStatus = await PushNotifications.checkPermissions();
        setPermission(permStatus.receive);
      } else {
        const currentPermission =
          'Notification' in window ? Notification.permission : 'denied';
        setPermission(currentPermission);
      }
    };
    checkPermission();

    const storedEnabled =
      localStorage.getItem('notifications_enabled') === 'true';
    setLocalIsEnabled(storedEnabled);

    const storedInterval = localStorage.getItem('notifications_interval');
    if (storedInterval) {
      setLocalInterval(Number(storedInterval));
    }

    const storedWorkoutReminder = localStorage.getItem('workout_reminder_enabled');
    if (storedWorkoutReminder) {
      setWorkoutReminderEnabled(storedWorkoutReminder === 'true');
    }

    const storedMotivationTime = localStorage.getItem('motivation_notification_time');
    if (storedMotivationTime) {
      setMotivationTime(storedMotivationTime);
    }
  }, []);

  const handleSave = async () => {
    localStorage.setItem('notifications_enabled', String(localIsEnabled));
    localStorage.setItem('notifications_interval', String(localInterval));
    localStorage.setItem('workout_reminder_enabled', String(workoutReminderEnabled));
    localStorage.setItem('motivation_notification_time', motivationTime);

    if (localIsEnabled) {
      let currentPermission = permission;
      if (isNative) {
        if (currentPermission !== 'granted') {
          const permResult = await PushNotifications.requestPermissions();
          currentPermission = permResult.receive;
          setPermission(currentPermission);
        }
      } else {
        if (currentPermission === 'default') {
          currentPermission = await requestNotificationPermission();
          setPermission(currentPermission);
        }
      }

      if (currentPermission === 'granted') {
        startNotifications(localInterval);
        if (workoutReminderEnabled) {
          await scheduleWorkoutReminder();
        } else {
          await cancelWorkoutReminder();
        }
        if (motivationTime !== '') {
          await scheduleMotivationalMessage(motivationTime);
        } else {
          await cancelMotivationalMessages();
        }
        showSuccessToast('¡Configuración de notificaciones guardada!');
      } else {
        showErrorToast(
          'Permiso de notificación denegado. No se pueden guardar los cambios.'
        );
        setLocalIsEnabled(false);
        stopNotifications();
        await cancelWorkoutReminder();
        await cancelMotivationalMessages();
      }
    } else {
      stopNotifications();
      await cancelWorkoutReminder();
      await cancelMotivationalMessages();
      showSuccessToast('¡Configuración de notificaciones guardada!');
    }
  };

  if (isNative && permission === 'denied') {
    return (
      <div className="setting-item">
        <span>Notificaciones Motivacionales:</span>
        <p className="permission-denied">
          Has bloqueado las notificaciones. Debes habilitarlas en los ajustes de
          tu dispositivo para poder activarlas aquí.
        </p>
      </div>
    );
  }

  if (!isNative && (!('Notification' in window) || permission === 'denied')) {
    return (
      <div className="setting-item">
        <span>Notificaciones Motivacionales:</span>
        <p className="permission-denied">
          Las notificaciones no están disponibles o han sido bloqueadas en este
          navegador.
        </p>
      </div>
    );
  }

  return (
    <div className="setting-item column-layout">
      <span>Notificaciones Motivacionales:</span>
      <div className="notification-controls">
        <label className="switch">
          <input
            type="checkbox"
            checked={localIsEnabled}
            onChange={(e) => setLocalIsEnabled(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
        <span className="switch-label">
          {localIsEnabled ? 'Activadas' : 'Desactivadas'}
        </span>
      </div>
      {localIsEnabled && (
        <div className="interval-selector">
          <label htmlFor="interval">Frecuencia:</label>
          <select
            id="interval"
            value={localInterval}
            onChange={(e) => setLocalInterval(Number(e.target.value))}
          >
            <option value={30}>Cada 30 minutos</option>
            <option value={60}>Cada hora</option>
            <option value={120}>Cada 2 horas</option>
            <option value={240}>Cada 4 horas</option>
          </select>
        </div>
      )}
      <button onClick={handleSave} className="save-btn">
        Guardar Cambios
      </button>

      <div className="setting-item column-layout">
        <span>Recordatorio de Próximo Entrenamiento:</span>
        <div className="notification-controls">
          <label className="switch">
            <input
              type="checkbox"
              checked={workoutReminderEnabled}
              onChange={(e) => setWorkoutReminderEnabled(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
          <span className="switch-label">
            {workoutReminderEnabled ? 'Activado' : 'Desactivado'}
          </span>
        </div>
      </div>

      <div className="setting-item column-layout">
        <span>Mensajes Motivacionales Diarios:</span>
        <div className="notification-controls">
          <label className="switch">
            <input
              type="checkbox"
              checked={motivationTime !== ''}
              onChange={(e) => setMotivationTime(e.target.checked ? '09:00' : '')}
            />
            <span className="slider round"></span>
          </label>
          <span className="switch-label">
            {motivationTime !== '' ? 'Activado' : 'Desactivado'}
          </span>
        </div>
        {motivationTime !== '' && (
          <div className="interval-selector">
            <label htmlFor="motivation-time">Hora:</label>
            <input
              type="time"
              id="motivation-time"
              value={motivationTime}
              onChange={(e) => setMotivationTime(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
