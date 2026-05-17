package com.muslimsathi.app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class BlockerAccessibilityService extends AccessibilityService {

    private static final String TAG = "BlockerService";
    
    private static final String PREFS_NAME = "CapacitorStorage";
    
    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        try {
            if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED ||
                event.getEventType() == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED) {
                
                String packageName = event.getPackageName() != null ? event.getPackageName().toString() : "";
                
                if (isAppBlocked(packageName)) {
                    showBlockScreen("Social Media", packageName);
                    return;
                }
                
                if (isBrowser(packageName)) {
                    AccessibilityNodeInfo rootNode = getRootInActiveWindow();
                    if (rootNode != null) {
                        String url = findUrl(rootNode);
                        if (url != null && isWebsiteBlocked(url)) {
                            showBlockScreen("Website", url);
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing event", e);
        }
    }
    
    private boolean isBrowser(String packageName) {
        return packageName.contains("chrome") || 
               packageName.contains("firefox") || 
               packageName.contains("browser") || 
               packageName.contains("opera") ||
               packageName.contains("duckduckgo") ||
               packageName.contains("brave") ||
               packageName.contains("edge");
    }
    
    private String findUrl(AccessibilityNodeInfo nodeInfo) {
        if (nodeInfo == null) return null;
        
        if (nodeInfo.getClassName() != null && 
           (nodeInfo.getClassName().toString().contains("EditText") || 
            nodeInfo.getClassName().toString().contains("TextView"))) {
            if (String.valueOf(nodeInfo.getViewIdResourceName()).contains("id/url_bar") ||
                String.valueOf(nodeInfo.getViewIdResourceName()).contains("id/address_bar")) {
                if (nodeInfo.getText() != null) {
                    return nodeInfo.getText().toString();
                }
            }
        }
        
        for (int i = 0; i < nodeInfo.getChildCount(); i++) {
            String url = findUrl(nodeInfo.getChild(i));
            if (url != null) return url;
        }
        return null;
    }
    
    private boolean isAppBlocked(String packageName) {
        if (packageName.equals(getPackageName())) return false;
        
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String blockedAppsStr = prefs.getString("blocked_social_apps", "[]");
            JSONArray array = new JSONArray(blockedAppsStr);
            for (int i = 0; i < array.length(); i++) {
                JSONObject app = array.getJSONObject(i);
                if (app.getString("packageName").equals(packageName) && 
                    app.getBoolean("isBlocked")) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Ignored
        }
        return false;
    }
    
    private boolean isWebsiteBlocked(String url) {
        if (url == null || url.isEmpty()) return false;
        url = url.toLowerCase();
        
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String blockedWebsitesStr = prefs.getString("blocked_websites", "[]");
            JSONArray array = new JSONArray(blockedWebsitesStr);
            for (int i = 0; i < array.length(); i++) {
                String blockedUrl = array.getString(i).toLowerCase();
                if (url.contains(blockedUrl)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Ignored
        }
        return false;
    }
    
    private void showBlockScreen(String type, String target) {
        performGlobalAction(GLOBAL_ACTION_HOME);
        
        Intent intent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            intent.putExtra("block_type", type);
            intent.putExtra("block_target", target);
            startActivity(intent);
        }
    }

    @Override
    public void onInterrupt() {
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED | AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS | 
                     AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS |
                     AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;
        setServiceInfo(info);
    }
}
