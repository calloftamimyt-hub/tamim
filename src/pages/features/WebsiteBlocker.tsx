import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Shield, Globe, AlertCircle, Settings, X, Plus, Trash2 } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';

interface WebsiteBlockerProps {
  onBack: () => void;
  language: string;
}

export function WebsiteBlocker({ onBack, language }: WebsiteBlockerProps) {
  const [blockedWebsites, setBlockedWebsites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessibilityPopup, setShowAccessibilityPopup] = useState(false);
  const [newWebsite, setNewWebsite] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { value } = await Preferences.get({ key: 'blocked_websites' });
      if (value) {
        setBlockedWebsites(JSON.parse(value));
      }
    } catch (e) {
      console.error('Failed to load website blocker settings', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (websites: string[]) => {
    try {
      await Preferences.set({
        key: 'blocked_websites',
        value: JSON.stringify(websites)
      });
      setBlockedWebsites(websites);
    } catch (e) {
      console.error('Failed to save website blocker settings', e);
    }
  };

  const handleAddWebsite = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    let url = newWebsite.trim().toLowerCase();
    if (!url) return;
    
    // basic url formatting
    if (url.startsWith('https://')) url = url.replace('https://', '');
    if (url.startsWith('http://')) url = url.replace('http://', '');
    if (url.startsWith('www.')) url = url.replace('www.', '');

    if (url && !blockedWebsites.includes(url)) {
       // Show accessibility popup at first block
       if (blockedWebsites.length === 0) {
          setShowAccessibilityPopup(true);
       }
       saveSettings([...blockedWebsites, url]);
       setNewWebsite('');
    }
  };

  const handleRemoveWebsite = (urlToRemove: string) => {
    const updatedWebsites = blockedWebsites.filter(url => url !== urlToRemove);
    saveSettings(updatedWebsites);
  };

  const confirmAccess = () => {
    setShowAccessibilityPopup(false);
    // Open accessibility settings using Android intent
    window.location.href = "intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end";
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
          <Globe className="w-5 h-5 text-indigo-500" />
          {language === 'bn' ? 'ওয়েবসাইট ব্লকার' : 'Website Blocker'}
        </h1>
        <div className="w-10"></div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 content-area space-y-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30 flex gap-3 text-amber-800 dark:text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            {language === 'bn' 
              ? 'খারাপ বা ক্ষতিকারক ওয়েবসাইটগুলোর লিংক নিচে যোগ করুন। ব্যবহারকারী এই ওয়েবসাইটগুলো ব্রাউজারে খোলার চেষ্টা করলে স্বয়ংক্রিয়ভাবে ব্লক হয়ে যাবে।' 
              : 'Add links to bad or harmful websites below. If a user tries to open them in a browser, they will automatically be blocked.'}
          </p>
        </div>

        <form onSubmit={handleAddWebsite} className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={newWebsite}
              onChange={(e) => setNewWebsite(e.target.value)}
              placeholder={language === 'bn' ? 'উদাহরণ: badwebsite.com' : 'Example: badwebsite.com'}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button 
            type="submit"
            disabled={!newWebsite.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white p-3 rounded-xl transition-colors shrink-0 flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>

        <div className="space-y-3 mt-4 text-left">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mx-1">
            {language === 'bn' ? 'ব্লক করা ওয়েবসাইটসমূহ' : 'Blocked Websites'}
          </h2>
          
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : blockedWebsites.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-8 text-center text-slate-500">
              {language === 'bn' ? 'কোনো ওয়েবসাইট ব্লক করা হয়নি' : 'No websites blocked yet'}
            </div>
          ) : (
            blockedWebsites.map((url, index) => (
              <motion.div 
                key={url}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate pr-4">
                    {url}
                  </p>
                </div>
                
                <button
                  onClick={() => handleRemoveWebsite(url)}
                  className="p-2 shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))
          )}
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
                      ? 'অ্যাপের বাহিরের ওয়েবসাইটগুলো ব্লক করার জন্য আপনার ফোনের "Accessibility Services" চালু থাকা প্রয়োজন।' 
                      : 'To block websites outside the app, your phone\'s "Accessibility Services" needs to be enabled.'}
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
                    onClick={confirmAccess}
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
