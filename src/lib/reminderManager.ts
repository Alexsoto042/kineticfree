import { LocalNotifications } from '@capacitor/local-notifications';

export const scheduleDailyReminder = async () => {
  const hasPermission = await LocalNotifications.requestPermissions();
  if (hasPermission.display !== 'granted') {
    return;
  }

  // Schedule a daily reminder for 10:00 AM
  await LocalNotifications.schedule({
    notifications: [
      {
        title: '¡Es hora de entrenar!',
        body: 'No te olvides de tu entrenamiento de hoy.',
        id: 2, // Unique ID for this notification
        schedule: { 
          on: {
            hour: 10,
            minute: 0
          },
          repeats: true 
        },
        sound: 'default',
        attachments: [],
        actionTypeId: '',
        extra: null,
      },
    ],
  });
};
