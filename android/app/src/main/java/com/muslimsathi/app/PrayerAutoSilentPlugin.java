package com.muslimsathi.app;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;

@CapacitorPlugin(name = "PrayerAutoSilent")
public class PrayerAutoSilentPlugin extends Plugin {
    
    private static final String PREF_NAME = "PrayerSilentPrefs";

    @PluginMethod
    public void getPermissionStatus(PluginCall call) {
        JSObject ret = new JSObject();
        NotificationManager notificationManager = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            ret.put("granted", notificationManager.isNotificationPolicyAccessGranted());
        } else {
            ret.put("granted", true);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            NotificationManager notificationManager = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (!notificationManager.isNotificationPolicyAccessGranted()) {
                Intent intent = new Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void setAutoSilent(PluginCall call) {
        try {
            String prayerName = call.getString("prayerName");
            boolean isEnabled = call.getBoolean("isEnabled");
            int startHour = call.getInt("startHour");
            int startMinute = call.getInt("startMinute");
            int durationMinutes = call.getInt("durationMinutes");
            int prayerId = getPrayerId(prayerName);

            SharedPreferences prefs = getContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            
            JSONObject config = new JSONObject();
            config.put("isEnabled", isEnabled);
            config.put("startHour", startHour);
            config.put("startMinute", startMinute);
            config.put("durationMinutes", durationMinutes);
            editor.putString(prayerName, config.toString());
            editor.apply();

            cancelAlarms(prayerId);

            if (isEnabled) {
                scheduleAlarms(prayerId, startHour, startMinute, durationMinutes);
            }
            
            call.resolve();
        } catch (Exception e) {
            call.reject("Error setting auto silent", e);
        }
    }

    private void scheduleAlarms(int prayerId, int startHour, int startMinute, int durationMinutes) {
        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        Calendar startCal = Calendar.getInstance();
        startCal.set(Calendar.HOUR_OF_DAY, startHour);
        startCal.set(Calendar.MINUTE, startMinute);
        startCal.set(Calendar.SECOND, 0);

        if (startCal.getTimeInMillis() < System.currentTimeMillis()) {
            startCal.add(Calendar.DAY_OF_YEAR, 1);
        }

        Calendar endCal = (Calendar) startCal.clone();
        endCal.add(Calendar.MINUTE, durationMinutes);

        Intent startIntent = new Intent(context, PrayerSilentReceiver.class);
        startIntent.setAction("com.muslimsathi.app.SILENT_START");
        startIntent.putExtra("prayerId", prayerId);
        PendingIntent startPending = PendingIntent.getBroadcast(context, prayerId * 2, startIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent endIntent = new Intent(context, PrayerSilentReceiver.class);
        endIntent.setAction("com.muslimsathi.app.SILENT_END");
        endIntent.putExtra("prayerId", prayerId);
        PendingIntent endPending = PendingIntent.getBroadcast(context, prayerId * 2 + 1, endIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, startCal.getTimeInMillis(), startPending);
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, endCal.getTimeInMillis(), endPending);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, startCal.getTimeInMillis(), startPending);
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, endCal.getTimeInMillis(), endPending);
        }
    }

    private void cancelAlarms(int prayerId) {
        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        Intent startIntent = new Intent(context, PrayerSilentReceiver.class);
        startIntent.setAction("com.muslimsathi.app.SILENT_START");
        PendingIntent startPending = PendingIntent.getBroadcast(context, prayerId * 2, startIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent endIntent = new Intent(context, PrayerSilentReceiver.class);
        endIntent.setAction("com.muslimsathi.app.SILENT_END");
        PendingIntent endPending = PendingIntent.getBroadcast(context, prayerId * 2 + 1, endIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        alarmManager.cancel(startPending);
        alarmManager.cancel(endPending);
    }

    private int getPrayerId(String prayerName) {
        switch (prayerName.toLowerCase()) {
            case "fajr": return 1;
            case "dhuhr": return 2;
            case "asr": return 3;
            case "maghrib": return 4;
            case "isha": return 5;
            case "jumuah": return 6;
            default: return 0;
        }
    }
}
