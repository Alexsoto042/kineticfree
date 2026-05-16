package com.kinetic.app

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import android.util.Log

/**
 * WorkManager worker for updating the streak widget
 * Runs periodically to sync widget data with the app
 */
class StreakSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            Log.d(TAG, "Starting streak sync worker")
            
            // Update all widgets
            StreakWidgetProvider.updateAllWidgets(applicationContext)
            
            Log.d(TAG, "Streak sync completed successfully")
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error in streak sync worker", e)
            Result.retry()
        }
    }

    companion object {
        private const val TAG = "StreakSyncWorker"
        const val WORK_NAME = "streak_sync_work"
    }
}
