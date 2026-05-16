import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaUndo } from 'react-icons/fa';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Button } from '../../../../components/ui/Button/Button';
import './RestTimer.css';

interface RestTimerProps {
  durationSeconds: number; // e.g., 90
}

export function RestTimer({ durationSeconds }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset timer if the duration prop changes
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsActive(false);
      // Schedule a local notification when the timer finishes
      const scheduleNotification = async () => {
        const hasPermission = await LocalNotifications.requestPermissions();
        if (hasPermission.display === 'granted') {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: '¡Tiempo de Descanso Terminado!',
                body: 'Es hora de tu siguiente serie.',
                id: 1, // Unique ID for this notification
                schedule: { at: new Date(Date.now() + 1000) }, // Schedule for 1 second in the future
                sound: 'default',
                attachments: [],
                actionTypeId: '',
                extra: null,
              },
            ],
          });
        }
      };
      scheduleNotification();
    }
  }, [timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsActive(false);
    setTimeLeft(durationSeconds);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="rest-timer-container">
      <h4>Descanso</h4>
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <div className="timer-controls">
        <Button
          onClick={toggleTimer}
          aria-label={isActive ? 'Pause timer' : 'Start timer'}
          variant="secondary"
        >
          {isActive ? <FaPause /> : <FaPlay />}
        </Button>
        <Button
          onClick={resetTimer}
          aria-label="Reset timer"
          variant="secondary"
        >
          <FaUndo />
        </Button>
      </div>
    </div>
  );
}
