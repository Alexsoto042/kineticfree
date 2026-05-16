package com.kinetic.app

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

/**
 * Schedules periodic widget updates using WorkManager
 */
object WidgetUpdateScheduler {
    
    fun schedulePeriodicUpdates(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(true)
            .build()

        val workRequest = PeriodicWorkRequestBuilder<StreakSyncWorker>(
            15, TimeUnit.MINUTES  // Update every 15 minutes
        )
            .setConstraints(constraints)
            .setBackoffCriteria(
                BackoffPolicy.LINEAR,
                10000L,  // 10 seconds backoff
                TimeUnit.MILLISECONDS
            )
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            StreakSyncWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            workRequest
        )
    }

    fun cancelPeriodicUpdates(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(StreakSyncWorker.WORK_NAME)
    }
}
