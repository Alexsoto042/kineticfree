package com.kinetic.app

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Capacitor plugin for managing Android widget data
 * Writes to SharedPreferences that the widget can read
 */
@CapacitorPlugin(name = "WidgetData")
class WidgetDataPlugin : Plugin() {

    companion object {
        private const val TAG = "WidgetDataPlugin"
        private const val PREFS_NAME = "com.kinetic.app.widgets"
    }

    /**
     * Set a value in the widget's SharedPreferences
     */
    @PluginMethod
    fun setItem(call: PluginCall) {
        try {
            val key = call.getString("key")
            val value = call.getString("value")

            if (key == null) {
                call.reject("Key is required")
                return
            }

            if (value == null) {
                call.reject("Value is required")
                return
            }

            Log.d(TAG, "Setting widget data: key=$key, value=$value")

            // Get SharedPreferences
            val prefs: SharedPreferences = getContext().getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            )

            // Write the value
            val editor = prefs.edit()
            editor.putString(key, value)
            val success = editor.commit()

            if (success) {
                Log.d(TAG, "Successfully wrote to SharedPreferences")
                
                // Update all widgets after data change
                StreakWidgetProvider.updateAllWidgets(getContext())
                
                call.resolve()
            } else {
                Log.e(TAG, "Failed to write to SharedPreferences")
                call.reject("Failed to write to SharedPreferences")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in setItem", e)
            call.reject("Error setting widget data: ${e.message}", e)
        }
    }

    /**
     * Get a value from the widget's SharedPreferences
     */
    @PluginMethod
    fun getItem(call: PluginCall) {
        try {
            val key = call.getString("key")

            if (key == null) {
                call.reject("Key is required")
                return
            }

            Log.d(TAG, "Getting widget data: key=$key")

            // Get SharedPreferences
            val prefs: SharedPreferences = getContext().getSharedPreferences(
                PREFS_NAME,
                Context.MODE_PRIVATE
            )

            // Read the value
            val value = prefs.getString(key, null)

            val result = JSObject()
            result.put("value", value)

            Log.d(TAG, "Read from SharedPreferences: key=$key, value=$value")
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error in getItem", e)
            call.reject("Error getting widget data: ${e.message}", e)
        }
    }

    /**
     * Check if the plugin is available
     */
    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val result = JSObject()
        result.put("available", true)
        call.resolve(result)
    }
}
