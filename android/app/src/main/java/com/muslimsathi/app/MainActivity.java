package com.muslimsathi.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppUsagePlugin.class);
        registerPlugin(PrayerAutoSilentPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
