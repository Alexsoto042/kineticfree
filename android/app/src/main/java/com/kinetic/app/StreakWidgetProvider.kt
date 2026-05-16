package com.kinetic.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.content.SharedPreferences
import android.util.Log

/**
 * Implementation of App Widget functionality for displaying workout streak
 */
class StreakWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        try {
            // Update each widget instance
            for (appWidgetId in appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in onUpdate", e)
        }
    }

    override fun onEnabled(context: Context) {
        // Schedule periodic updates using WorkManager
        WidgetUpdateScheduler.schedulePeriodicUpdates(context)
    }

    override fun onDisabled(context: Context) {
        // Cancel periodic updates
        WidgetUpdateScheduler.cancelPeriodicUpdates(context)
    }

    companion object {
        private const val TAG = "StreakWidget"
        // Capacitor Preferences stores data in SharedPreferences with this name
        private const val PREFS_NAME = "CapacitorStorage"
        private const val STREAK_KEY = "widget_streak"
        private const val DEFAULT_STREAK = "0"

        internal fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            try {
                // Get streak value from Capacitor Preferences SharedPreferences
                val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val streakValue = prefs.getString(STREAK_KEY, DEFAULT_STREAK) ?: DEFAULT_STREAK

                Log.d(TAG, "Updating widget with streak: $streakValue")

                // Construct the RemoteViews object
                val views = RemoteViews(context.packageName, R.layout.streak_widget)
                
                // Safely set the streak number
                try {
                    views.setTextViewText(R.id.widget_streak_number, streakValue)
                } catch (e: Exception) {
                    Log.e(TAG, "Error setting text", e)
                    views.setTextViewText(R.id.widget_streak_number, DEFAULT_STREAK)
                }


                // Create an Intent to launch MainActivity when widget is clicked
                try {
                    val intent = Intent(context, MainActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    val pendingIntent = PendingIntent.getActivity(
                        context,
                        0,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    
                    // Set click listener on the entire widget layout
                    views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
                } catch (e: Exception) {
                    Log.e(TAG, "Error setting click listener", e)
                }

                // Instruct the widget manager to update the widget
                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                // Log error but don't crash
                Log.e(TAG, "Error updating widget", e)
            }
        }

        /**
         * Force update all widgets
         */
        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(
                android.content.ComponentName(context, StreakWidgetProvider::class.java)
            )
            for (appWidgetId in appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        }
    }
}
