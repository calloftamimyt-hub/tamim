import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, History, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { format } from 'date-fns';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ZIKRS = [
  { id: 1, text: "সুবহানাল্লাহ", meaning: "আল্লাহ পবিত্র" },
  { id: 2, text: "আলহামদুলিল্লাহ", meaning: "সমস্ত প্রশংসা আল্লাহর" },
  { id: 3, text: "আল্লাহু আকবার", meaning: "আল্লাহ মহান" },
  { id: 4, text: "লা ইলাহা ইল্লাল্লাহ", meaning: "আল্লাহ ছাড়া কোনো উপাস্য নেই" },
  { id: 5, text: "আস্তাগফিরুল্লাহ", meaning: "আমি আল্লাহর কাছে ক্ষমা চাই" },
  { id: 6, text: "লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ", meaning: "আল্লাহ ছাড়া কোনো শক্তি নেই" },
  { id: 7, text: "সুবহানাল্লাহি ওয়া বিহামদিহি", meaning: "আল্লাহ পবিত্র এবং তাঁর প্রশংসা করি" },
  { id: 8, text: "সুবহানাল্লাহিল আজিম", meaning: "মহান আল্লাহ পবিত্র" },
  { id: 9, text: "আল্লাহুম্মা সাল্লি আলা মুহাম্মাদ", meaning: "হে আল্লাহ, আপনি মুহাম্মদ (সা.)-এর ওপর রহমত বর্ষণ করুন" },
  { id: 10, text: "লা ইলাহা ইল্লা আনতা সুবহানাকা ইন্নি কুনতু মিনাজ জোয়ালিমিন", meaning: "তুমি ছাড়া কোনো উপাস্য নেই, তুমি পবিত্র, আমি নিশ্চয়ই জালিমদের অন্তর্ভুক্ত" },
  { id: 11, text: "হাসবুনাল্লাহু ওয়ানিমাল ওয়াকিল", meaning: "আল্লাহই আমাদের জন্য যথেষ্ট এবং তিনি উত্তম কর্মবিধায়ক" },
  { id: 12, text: "আল্লাহুম্মা সাল্লি আলা মুহাম্মাদ ওয়া আলা আালি মুহাম্মাদ", meaning: "হে আল্লাহ, আপনি মুহাম্মদ (সা.) ও তাঁর বংশধরের ওপর রহমত বর্ষণ করুন" },
  { id: 13, text: "লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকালাহু, লাহুল মুলকু ওয়ালাহুল হামদু, ওয়া হুয়া আলা কুল্লি শাইয়িন কাদীর", meaning: "আল্লাহ ছাড়া কোনো উপাস্য নেই, তিনি এক, তাঁর কোনো শরিক নেই, রাজত্ব ও সমস্ত প্রশংসা তাঁরই, এবং তিনি সব কিছুর ওপর ক্ষমতাবান" },
  { id: 14, text: "সুবহানাল্লাহি ওয়া বিহামদিহি, সুবহানাল্লাহিল আযীম", meaning: "আল্লাহ পবিত্র এবং তাঁর প্রশংসা করি, মহান আল্লাহ পবিত্র" },
];

export function TasbihView({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState<33 | 99>(33);
  const [selectedZikr, setSelectedZikr] = useState(ZIKRS[0]);
  const [showZikrList, setShowZikrList] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<{ date: string; total: number }[]>(() => {
    const saved = localStorage.getItem('tasbihHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const updateTracker = useCallback(async (increment: number) => {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const saved = localStorage.getItem('prayerTracker');
    const trackerData = saved ? JSON.parse(saved) : {};
    
    const currentDay = trackerData[dateStr] || { prayers: {}, fasting: false, quran: 0, zikr: 0, qaza: 0 };
    currentDay.zikr = (currentDay.zikr || 0) + increment;
    
    trackerData[dateStr] = currentDay;
    localStorage.setItem('prayerTracker', JSON.stringify(trackerData));

    if (user) {
      try {
        await setDoc(doc(db, 'user_data', user.uid), {
          prayerTracker: trackerData
        }, { merge: true });
      } catch (error) {
        console.error("Error updating tracker from tasbih:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('tasbihHistory', JSON.stringify(history));
  }, [history]);

  const handleTap = () => {
    if (count < target) {
      setCount(c => c + 1);
      updateTracker(1);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
  };

  const handleReset = () => {
    if (count > 0) {
      const today = new Date().toLocaleDateString('bn-BD');
      setHistory(prev => {
        const newHistory = [...prev];
        const todayIndex = newHistory.findIndex(h => h.date === today);
        if (todayIndex >= 0) {
          newHistory[todayIndex].total += count;
        } else {
          newHistory.push({ date: today, total: count });
        }
        return newHistory;
      });
    }
    setCount(0);
  };

  return (
    <div className="flex-1 w-full max-w-sm mx-auto flex flex-col bg-slate-50 dark:bg-slate-950 px-4 pt-safe pb-32">
      <header className="flex items-center mb-4 pt-2">
        <button onClick={onBack} className="p-2 -ml-2 mr-2 text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('tasbih')}</h1>
      </header>

      {/* Zikr Display */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 shadow-sm text-center">
        <button 
          onClick={() => setShowZikrList(!showZikrList)}
          className="flex items-center justify-center w-full text-primary dark:text-primary-light font-bold text-lg"
        >
          {selectedZikr.text}
          <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
        </button>
        <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">{selectedZikr.meaning}</p>
      </div>

      {/* Zikr List Dropdown */}
      <AnimatePresence>
        {showZikrList && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 overflow-hidden max-h-64 overflow-y-auto z-50 shadow-xl"
          >
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">সিলেক্ট যিকর</span>
              <button onClick={() => setShowZikrList(false)} className="text-slate-400 hover:text-rose-500 transition-colors p-1"><X className="w-4 h-4" /></button>
            </div>
            {ZIKRS.map(zikr => (
              <button
                key={zikr.id}
                onClick={() => { setSelectedZikr(zikr); setShowZikrList(false); }}
                className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-800"
              >
                <div className="font-bold text-slate-900 dark:text-white text-sm">{zikr.text}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{zikr.meaning}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Counter Section */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleTap}
          className="relative group"
        >
          {/* Outer Ring */}
          <div className="absolute inset-0 -m-4 border-2 border-primary/10 rounded-full animate-pulse" />
          
          {/* Main Tap Area */}
          <div className="w-56 h-56 bg-white dark:bg-slate-900 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-primary flex flex-col items-center justify-center transition-all group-hover:scale-[1.02] active:scale-95">
            <motion.div 
              key={count}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter"
            >
              {count}
            </motion.div>
            <div className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">
              {t('zikr-count')}: {target}
            </div>
            
            {/* Progress indicator */}
            <div className="absolute bottom-10 w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(count / target) * 100}%` }}
              />
            </div>
          </div>
        </motion.button>
        
        <div className="mt-8 text-slate-300 dark:text-slate-700 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
          চাপ দিন
        </div>
      </div>

      {/* Controls - Positioned to sit flush above bottom nav */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] transition-all">
        <div className="max-w-sm mx-auto flex justify-between items-center py-1.5 px-4">
          <button 
            onClick={handleReset} 
            className="flex items-center text-rose-500 hover:text-rose-600 transition-all text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/30"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            {t('reset')}
          </button>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => { setTarget(33); setCount(0); }} 
              className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${target === 33 ? 'bg-primary text-white shadow-sm' : 'text-slate-500'}`}
            >
              ৩৩
            </button>
            <button 
              onClick={() => { setTarget(99); setCount(0); }} 
              className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${target === 99 ? 'bg-primary text-white shadow-sm' : 'text-slate-500'}`}
            >
              ৯৯
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
