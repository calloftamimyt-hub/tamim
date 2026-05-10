import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function OfflineBlocker() {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center max-w-sm w-full"
      >
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
          <WifiOff className="w-8 h-8" />
        </div>
        
        {language === 'bn' ? (
          <>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Halal Circle অ্যাপ</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
              ইসলামিক জ্ঞান, দোয়া, ভিডিও এবং কমিউনিটির জন্য তৈরি একটি প্ল্যাটফর্ম।
            </p>
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl w-full text-sm font-medium mb-4">
              বর্তমানে আপনি অফলাইনে আছেন।
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed">
              এই সেকশনটি ব্যবহার করতে ইন্টারনেট সংযোগ প্রয়োজন।<br/>অনুগ্রহ করে নেটওয়ার্ক চালু করে পুনরায় অ্যাপে প্রবেশ করুন।
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Halal Circle App</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
              A platform created for Islamic knowledge, dua, video, and community.
            </p>
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-4 rounded-2xl w-full text-sm font-medium mb-4">
              You are currently offline.
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed">
              Internet connection is required to use this section.<br/>Please turn on the network and re-enter the app.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
