package com.muslimsathi.app;

import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Calendar;
import java.util.List;

@CapacitorPlugin(name = "AppUsage")
public class AppUsagePlugin extends Plugin {

    @PluginMethod
    public void checkUsagePermission(PluginCall call) {
        Context context = getContext();
        AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, 
                android.os.Process.myUid(), context.getPackageName());
        
        boolean granted = mode == AppOpsManager.MODE_ALLOWED;
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestUsagePermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void getUsageStats(PluginCall call) {
        String filter = call.getString("filter", "today");
        
        Calendar cal = Calendar.getInstance();
        long endTime = cal.getTimeInMillis();
        long startTime = endTime;
        
        if (filter.equals("today")) {
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            startTime = cal.getTimeInMillis();
        } else if (filter.equals("yesterday")) {
            cal.add(Calendar.DAY_OF_YEAR, -1);
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            startTime = cal.getTimeInMillis();
            cal.set(Calendar.HOUR_OF_DAY, 23);
            cal.set(Calendar.MINUTE, 59);
            cal.set(Calendar.SECOND, 59);
            endTime = cal.getTimeInMillis();
        } else if (filter.equals("days7")) {
            cal.add(Calendar.DAY_OF_YEAR, -7);
            startTime = cal.getTimeInMillis();
        } else {
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            startTime = cal.getTimeInMillis();
        }

        UsageStatsManager mUsageStatsManager = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        List<UsageStats> queryUsageStats = mUsageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime);

        PackageManager pm = getContext().getPackageManager();
        JSArray appsArray = new JSArray();

        if (queryUsageStats != null) {
            for (UsageStats usageStats : queryUsageStats) {
                long timeInForeground = usageStats.getTotalTimeInForeground();
                if (timeInForeground > 0) {
                    try {
                        String packageName = usageStats.getPackageName();
                        ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
                        String appName = pm.getApplicationLabel(appInfo).toString();
                        
                        // Try to filter out system apps
                        if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0) {
                            if (!packageName.contains("chrome") && !packageName.contains("youtube") && !packageName.contains("facebook")) {
                                continue;
                            }
                        }

                        JSObject appObj = new JSObject();
                        appObj.put("packageName", packageName);
                        appObj.put("name", appName);
                        appObj.put("timeInMs", timeInForeground);
                        
                        appsArray.put(appObj);
                    } catch (PackageManager.NameNotFoundException e) {
                        // Ignore
                    }
                }
            }
        }

        JSObject ret = new JSObject();
        ret.put("stats", appsArray);
        call.resolve(ret);
    }
    
    @PluginMethod
    public void openAccessibilitySettings(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }
}
