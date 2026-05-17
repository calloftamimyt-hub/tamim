import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Video, MessageCircle, Send, TrendingUp, AlertCircle, Settings, X } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { AppUsagePlugin } from './ScreenTime';
import { registerPlugin } from '@capacitor/core';

const AppUsage = registerPlugin<AppUsagePlugin>('AppUsage');

interface SocialMediaBlockerProps {
  onBack: () => void;
  language: string;
}

interface AppOption {
  id: string;
  name: string;
  nameBn: string;
  icon: React.ReactNode;
  color: string;
  packageName?: string;
  action?: string;
}

const APPS_TO_BLOCK: AppOption[] = [
  { id: 'youtube_app', name: 'YouTube App', nameBn: 'ইউটিউব অ্যাপ', icon: <Video className="w-6 h-6" />, color: 'text-red-500', packageName: 'com.google.android.youtube' },
  { id: 'youtube_shorts', name: 'YouTube Shorts', nameBn: 'ইউটিউব শর্টস', icon: <Video className="w-6 h-6" />, color: 'text-red-500', action: 'shorts' },
  { id: 'youtube_video', name: 'YouTube Video', nameBn: 'ইউটিউব ভিডিও', icon: <Video className="w-6 h-6" />, color: 'text-red-500', action: 'video' },
  { id: 'facebook_app', name: 'Facebook App', nameBn: 'ফেসবুক অ্যাপ', icon: <MessageCircle className="w-6 h-6" />, color: 'text-blue-600', packageName: 'com.facebook.katana' },
  { id: 'facebook_reels', name: 'Facebook Reels', nameBn: 'ফেসবুক রিলস', icon: <Video className="w-6 h-6" />, color: 'text-blue-600', action: 'facebook_reels' },
  { id: 'facebook_status', name: 'Facebook Status', nameBn: 'ফেসবুক স্ট্যাটাস', icon: <MessageCircle className="w-6 h-6" />, color: 'text-blue-600', action: 'facebook_status' },
  { id: 'messenger_app', name: 'Messenger App', nameBn: 'মেসেঞ্জার অ্যাপ', icon: <MessageCircle className="w-6 h-6" />, color: 'text-indigo-500', packageName: 'com.facebook.orca' },
  { id: 'messenger_status', name: 'Messenger Status', nameBn: 'মেসেঞ্জার স্ট্যাটাস', icon: <MessageCircle className="w-6 h-6" />, color: 'text-indigo-500', action: 'messenger_status' },
  { id: 'whatsapp_app', name: 'WhatsApp App', nameBn: 'হোয়াটসঅ্যাপ অ্যাপ', icon: <MessageCircle className="w-6 h-6" />, color: 'text-emerald-500', packageName: 'com.whatsapp' },
  { id: 'whatsapp_status', name: 'WhatsApp Status', nameBn: 'হোয়াটসঅ্যাপ স্ট্যাটাস', icon: <MessageCircle className="w-6 h-6" />, color: 'text-emerald-500', action: 'whatsapp_status' },
  { id: 'imo_app', name: 'IMO App', nameBn: 'ইমো অ্যাপ', icon: <MessageCircle className="w-6 h-6" />, color: 'text-blue-400', packageName: 'com.imo.android.imoim' },
  { id: 'imo_status', name: 'IMO Status', nameBn: 'ইমো স্ট্যাটাস', icon: <MessageCircle className="w-6 h-6" />, color: 'text-blue-400', action: 'imo_status' },
  { id: 'imo_talent', name: 'IMO Talent', nameBn: 'ইমো ট্যালেন্ট', icon: <Video className="w-6 h-6" />, color: 'text-blue-400', action: 'imo_talent' },
  { id: 'telegram_app', name: 'Telegram App', nameBn: 'টেলিগ্রাম অ্যাপ', icon: <Send className="w-6 h-6" />, color: 'text-sky-500', packageName: 'org.telegram.messenger' },
  { id: 'telegram_search', name: 'Telegram Search', nameBn: 'টেলিগ্রাম সার্চ', icon: <Send className="w-6 h-6" />, color: 'text-sky-500', action: 'telegram_search' },
  { id: 'tiktok_app', name: 'TikTok App', nameBn: 'টিকটক অ্যাপ', icon: <TrendingUp className="w-6 h-6" />, color: 'text-black dark:text-white', packageName: 'com.zhiliaoapp.musically' },
  { id: 'tiktok_reels', name: 'TikTok Reels', nameBn: 'টিকটক রিলস', icon: <TrendingUp className="w-6 h-6" />, color: 'text-black dark:text-white', action: 'tiktok_reels' },
];

export function SocialMediaBlocker({ onBack, language }: SocialMediaBlockerProps) {
  const [blockedApps, setBlockedApps] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessibilityPopup, setShowAccessibilityPopup] = useState(false);
  const [pendingApp, setPendingApp] = useState<{id: string, packageName?: string, action?: string} | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { value } = await Preferences.get({ key: 'blocked_social_apps' });
      if (value) {
        setBlockedApps(JSON.parse(value));
      }
    } catch (e) {
      console.error('Failed to load blocker settings', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBlock = async (id: string, packageName?: string, action?: string, forceState?: boolean) => {
    const isBlocking = forceState !== undefined ? forceState : !blockedApps[id];
    
    if (isBlocking && forceState === undefined) {
      setPendingApp({ id, packageName, action });
      setShowAccessibilityPopup(true);
      return;
    }

    const newBlockedStates = {
      ...blockedApps,
      [id]: isBlocking
    };
    
    setBlockedApps(newBlockedStates);
    
    try {
      await Preferences.set({
        key: 'blocked_social_apps',
        value: JSON.stringify(newBlockedStates)
      });
      // Native code will read from SharedPreferences
    } catch (e) {
      console.error('Failed to save blocker settings', e);
    }
  };

  const confirmBlock = async () => {
    if (pendingApp) {
      toggleBlock(pendingApp.id, pendingApp.packageName, pendingApp.action, true);
    }
    
    if (Capacitor.isNativePlatform()) {
       try {
          await AppUsage.openAccessibilitySettings();
       } catch (e) {
          window.location.href = "intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end";
       }
    } else {
       window.location.href = "intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end";
    }
    
    setShowAccessibilityPopup(false);
    setPendingApp(null);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between p-4 pt-safe bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          {language === 'bn' ? 'সোশ্যাল মিডিয়া ব্লকার' : 'Social Media Blocker'}
        </h1>
        <div className="w-10"></div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 content-area space-y-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex gap-3 text-indigo-800 dark:text-indigo-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            {language === 'bn' 
              ? 'নিচের অ্যাপগুলি ব্লক করলে, ব্যবহারকারী খোলার ৬ সেকেন্ডের মধ্যে স্বয়ংক্রিয়ভাবে অ্যাপগুলো বন্ধ হয়ে যাবে।' 
              : 'Blocking the apps below will automatically close them within 6 seconds of opening.'}
          </p>
        </div>

        <div className="space-y-3">
          {APPS_TO_BLOCK.map(app => (
            <motion.div 
              key={app.id}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${app.color}`}>
                  {app.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">
                    {language === 'bn' ? app.nameBn : app.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {app.packageName || app.action ? 'System tracking active' : ''}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => toggleBlock(app.id, app.packageName, app.action)}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  blockedApps[app.id] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    blockedApps[app.id] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAccessibilityPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setShowAccessibilityPopup(false)}
                  className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Settings className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {language === 'bn' ? 'অ্যাকসেসিবিলিটি প্রয়োজন' : 'Accessibility Required'}
                </h3>
                
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <p>
                    {language === 'bn' 
                      ? 'এই অ্যাপটি ব্লক করার জন্য আপনার ফোনের "Accessibility Services" চালু থাকা প্রয়োজন।' 
                      : 'To block this app, your phone\'s "Accessibility Services" needs to be enabled.'}
                  </p>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {language === 'bn' 
                      ? 'ব্লকটি চালু করতে Settings এ যান' 
                      : 'Go to Settings to enable the block'}
                  </p>
                </div>

                <div className="w-full flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAccessibilityPopup(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button 
                    onClick={confirmBlock}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                  >
                    {language === 'bn' ? 'ওপেন সেটিংস' : 'Open Settings'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
