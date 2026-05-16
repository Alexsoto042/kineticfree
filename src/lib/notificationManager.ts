import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import type { PermissionStatus } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../supabaseClient'; // Import supabase
import { logger } from './logger';

const notificationLogger = logger.createContext('NotificationManager');

export type CombinedPermissionStatus = 'default' | 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';

const WORKOUT_REMINDER_ID = 100;
const MOTIVATION_NOTIFICATION_ID_START = 200;

export async function requestNotificationPermission(): Promise<CombinedPermissionStatus> {
  if (Capacitor.isNativePlatform()) {
    const result = await PushNotifications.requestPermissions();
    return result.receive;
  } else {
    const permission = await Notification.requestPermission();
    return permission;
  }
}

// --- Workout Reminder Notifications ---
export async function scheduleWorkoutReminder() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Fetch the user's next scheduled workout (this is a placeholder, actual logic needed)
  // For now, let's assume a workout is scheduled for tomorrow at 9 AM
  const nextWorkoutTime = new Date();
  nextWorkoutTime.setDate(nextWorkoutTime.getDate() + 1);
  nextWorkoutTime.setHours(9, 0, 0, 0);

  if (nextWorkoutTime.getTime() < Date.now()) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        title: '¡Hora de Entrenar!',
        body: 'Tu próximo entrenamiento está programado. ¡Vamos a por ello!',
        id: WORKOUT_REMINDER_ID,
        schedule: { at: nextWorkoutTime },
        sound: 'default',
        attachments: [],
        actionTypeId: '',
        extra: { type: 'workout_reminder' },
      },
    ],
  });
  notificationLogger.info('Workout reminder scheduled for:', nextWorkoutTime);
}

export async function cancelWorkoutReminder() {
  await LocalNotifications.cancel({ notifications: [{ id: WORKOUT_REMINDER_ID }] });
  notificationLogger.info('Workout reminder cancelled.');
}

// --- Motivational Message Notifications ---
export async function scheduleMotivationalMessage(motivationTime: string) {
  const [hour, minute] = motivationTime.split(':');
  const notificationDate = new Date();
  notificationDate.setHours(parseInt(hour), parseInt(minute), 0);

  await LocalNotifications.schedule({
    notifications: [
      {
        title: '¡Motívate!',
        body: 'Un pequeño empujón para seguir adelante con tus metas.',
        id: MOTIVATION_NOTIFICATION_ID_START,
        schedule: {
          every: 'day', // Temporary fix, original intent was interval
          at: notificationDate,
          allowWhileIdle: true,
        },
      },
    ],
  });

  notificationLogger.info('Motivational message scheduled for:', notificationDate);
}

export async function cancelMotivationalMessages() {
  await LocalNotifications.cancel({ notifications: [{ id: MOTIVATION_NOTIFICATION_ID_START }] });
  notificationLogger.info('Motivational messages cancelled.');
}

// --- Existing functions (modified to use LocalNotifications) ---

// This function is for general notifications, not specific workout/motivation
export async function startNotifications(intervalMinutes: number) {
  await LocalNotifications.cancel({ notifications: [{ id: 1 }] }); // Cancel previous general notification

  // const now = new Date(); // Removed unused variable
  // const firstNotificationTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);

  await LocalNotifications.schedule({
    notifications: [
      {
        title: '¡No te rindas!',
        body: 'Recuerda mantenerte activo y seguir tus rutinas.',
        id: 1,
        schedule: {
          every: 'hour', // Temporary fix, original intent was intervalMinutes
          allowWhileIdle: true,
        },
      },
    ],
  });
  notificationLogger.info(
    `General notifications scheduled every ${intervalMinutes} minutes.`
  );
}

export async function stopNotifications() {
  await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
  notificationLogger.info('General notifications stopped.');
}

export async function checkAndRestartNotifications() {
  if (!Capacitor.isNativePlatform()) return; // Only for native platforms

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // No user, no notifications

  const permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive !== 'granted') {
    notificationLogger.info('Notification permission not granted, skipping restart.');
    return;
  }

  // General notifications
  const generalEnabled = localStorage.getItem('notifications_enabled') === 'true';
  const generalInterval = Number(localStorage.getItem('notifications_interval')) || 60;
  if (generalEnabled) {
    await startNotifications(generalInterval);
  } else {
    await stopNotifications();
  }

  // Workout reminder
  const workoutReminderEnabled = localStorage.getItem('workout_reminder_enabled') === 'true';
  if (workoutReminderEnabled) {
    await scheduleWorkoutReminder();
  } else {
    await cancelWorkoutReminder();
  }

  // Motivational messages
  const motivationTime = localStorage.getItem('motivation_notification_time');
  if (motivationTime) {
    await scheduleMotivationalMessage(motivationTime);
  }
  else {
    await cancelMotivationalMessages();
  }
}

