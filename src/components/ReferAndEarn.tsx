import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Gift, PartyPopper, Share2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function ReferAndEarn() {
  const { t } = useLanguage();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCode = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setReferralCode(userDoc.data().referralCode);
      }
    };
    fetchCode();
  }, []);

  const handleShare = async () => {
    // Navigate to detail page instead of showing basic share
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'refer-detail' }));
  };

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      alert(t('copied'));
    } else {
      handleShare(); // Navigate if no code yet
    }
  };

  return (
    <div className="relative overflow-hidden group pb-4">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-500/10 transition-all duration-700 pointer-events-none" />
      
      {/* Steps with Icons */}
      <div className="flex items-center justify-between px-4 mb-8 relative">
        <div className="relative flex flex-col items-center">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center border border-orange-100 dark:border-orange-900/30 shadow-sm transition-all"
          >
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
          </motion.div>
        </div>

        <div className="flex-1 px-1 flex justify-center opacity-20">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" className="text-slate-400">
              <path d="M5 10 Q 20 0 35 10" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M32 5 L37 10 L32 15" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>

        <div className="relative flex flex-col items-center">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center border border-orange-100 dark:border-orange-900/30 shadow-sm transition-all"
          >
            <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
          </motion.div>
        </div>

        <div className="flex-1 px-1 flex justify-center opacity-20">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" className="text-slate-400">
              <path d="M5 10 Q 20 0 35 10" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M32 5 L37 10 L32 15" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
        </div>

        <div className="relative flex flex-col items-center">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center border border-orange-100 dark:border-orange-900/30 shadow-sm transition-all"
          >
            <PartyPopper className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
          </motion.div>
        </div>
      </div>

      {/* Step Text Boxes */}
      <div className="flex items-stretch -mx-2 mb-8 overflow-hidden rounded-xl">
        {[
          { text: t('refer-friend') },
          { text: t('friend-gets') },
          { text: t('you-earn') }
        ].map((step, i) => (
          <div key={i} className="flex-1 flex min-w-0 relative">
            <div className={cn(
              "flex-1 bg-slate-50 dark:bg-slate-800/40 p-2 sm:p-3 border-y border-r border-slate-100 dark:border-slate-800/60 flex flex-col items-center justify-center text-center relative min-h-[60px]",
              i === 0 && "border-l rounded-l-xl",
              i === 2 && "rounded-r-xl",
              i < 2 && "after:content-[''] after:absolute after:top-1/2 after:-right-[14px] after:-translate-y-1/2 after:border-y-[30px] after:border-y-transparent after:border-l-[14px] after:border-l-slate-50 dark:after:border-l-slate-800/40 after:z-20 border-r-0",
              i > 0 && "before:content-[''] before:absolute before:top-1/2 before:-left-[15px] before:-translate-y-1/2 before:border-y-[30px] before:border-y-transparent before:border-l-[15px] before:border-l-white dark:before:border-l-slate-900 before:z-10 pl-6"
            )}>
              <span className="text-[10px] sm:text-[11px] leading-tight text-slate-700 dark:text-slate-300">
                {(step.text || '').split(' ').map((word, idx) => {
                  const isHighlight = word.match(/\d+(\.\d+)?/) || word.toLowerCase() === 'mybl' || word.includes('৳') || word.includes('5.00') || word.includes('2.00');
                  return (
                    <span key={idx} className={cn(isHighlight ? "font-bold text-slate-900 dark:text-slate-100" : "")}>
                      {word}{' '}
                    </span>
                  );
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pb-2 pt-1">
        <motion.button 
          whileTap={{ scale: 0.96 }}
          onClick={handleShare}
          className="flex-1 bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white font-bold py-2.5 px-4 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 text-sm sm:text-sm tracking-wide h-10"
        >
          <span>{t('refer-claim')}</span>
        </motion.button>
        
        <button 
          onClick={handleShare}
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border-[1.5px] border-orange-500 rounded-full text-orange-500 shadow-sm hover:bg-orange-50 dark:hover:bg-slate-700 active:scale-95 transition-all shrink-0"
        >
          <Share2 className="w-5 h-5" />
        </button>
        
        <button 
          onClick={handleCopy}
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border-[1.5px] border-orange-500 rounded-full text-orange-500 shadow-sm hover:bg-orange-50 dark:hover:bg-slate-700 active:scale-95 transition-all shrink-0"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
