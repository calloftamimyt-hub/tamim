import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Trophy, Coins, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { showRewardedAd } from '@/lib/admob';
import { earningService } from '@/services/earningService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SEGMENTS = [
  { id: '1000', label: '1000৳', probability: 0, color: '#f43f5e' }, 
  { id: '0.50', label: '0.50৳', probability: 0.2, color: '#10b981' }, 
  { id: '500', label: '500৳', probability: 0, color: '#8b5cf6' }, 
  { id: '0.05', label: '0.05৳', probability: 0.2, color: '#f59e0b' }, 
  { id: '100', label: '100৳', probability: 0, color: '#3b82f6' }, 
  { id: '0.02', label: '0.02৳', probability: 0.25, color: '#14b8a6' }, 
  { id: '50', label: '50৳', probability: 0, color: '#d946ef' }, 
  { id: '0.01', label: '0.01৳', probability: 0.25, color: '#06b6d4' }, 
  { id: '10', label: '10৳', probability: 0, color: '#f97316' }, 
  { id: '1', label: '1৳', probability: 0.1, color: '#eab308' }, 
  { id: '5', label: '5৳', probability: 0, color: '#6366f1' }, 
];

function pickSegment() {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    cumulative += SEGMENTS[i].probability;
    if (rand <= cumulative) {
      return i;
    }
  }
  return SEGMENTS.length - 1;
}

export function SpinView() {
  const { language } = useLanguage();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof SEGMENTS[0] | null>(null);
  const [rotation, setRotation] = useState(0);
  
  const [dailyLimit, setDailyLimit] = useState(10);
  const [spinsUsedToday, setSpinsUsedToday] = useState(0);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    const initLimit = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'earning'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.dailySpinLimit) {
            setDailyLimit(data.dailySpinLimit);
          }
        }
      } catch (e) {
        console.error('Failed to get daily spin limit', e);
      }
      
      const history = await earningService.getEarningHistory();
      const todayString = new Date().toISOString().split('T')[0];
      const spinsToday = history.filter(h => 
        h.type === 'Spin' && 
        h.createdAt.startsWith(todayString)
      ).length;
      
      setSpinsUsedToday(spinsToday);
    };
    initLimit();
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    if (spinsUsedToday >= dailyLimit) {
      alert(language === 'bn' ? 'আজকের স্পিন লিমিট শেষ!' : 'Daily spin limit reached!');
      return;
    }

    setIsSpinning(true);
    setResult(null);

    const targetIndex = pickSegment();
    const segment = SEGMENTS[targetIndex];

    const sliceAngle = 360 / SEGMENTS.length;
    const centerAngle = targetIndex * sliceAngle + sliceAngle / 2;
    
    const spinSpins = 360 * 6; // 6 full spins
    const rOffset = (Math.random() - 0.5) * (sliceAngle * 0.8);
    
    const currentMod = rotation % 360;
    const targetMod = (360 - centerAngle + rOffset) % 360;
    
    let diff = targetMod - currentMod;
    if (diff < 0) diff += 360;
    
    const newRotation = rotation + diff + spinSpins;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(segment);
      setShowCollectModal(true);
    }, 4500);
  };

  const handleCollect = () => {
    setIsCollecting(true);
    showRewardedAd(
      async () => {
        // Rewarded functionality
        if (result) {
          try {
            await earningService.addEarningRecord({
              type: 'Spin',
              description: 'Spin reward',
              amount: parseFloat(result.id),
              status: 'approved' 
            });
            setSpinsUsedToday(prev => prev + 1);
          } catch (e) {
            console.error('Failed to save reward', e);
          }
        }
      },
      (error) => {
        setIsCollecting(false);
        console.warn('Ad failed to load or show', error);
      },
      () => {
        // On dismiss
        setIsCollecting(false);
        setShowCollectModal(false);
        setResult(null);
      }
    );
  };

  const sliceAngle = 360 / SEGMENTS.length;

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[100] flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-safe px-4 py-3 flex items-center justify-center shadow-sm">
        <h2 className="text-base font-black text-slate-800 dark:text-white">
          {language === 'bn' ? 'স্পিন ও আর্ন' : 'Spin & Earn'}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center relative">
        <div className="absolute top-4 left-4 right-4 bg-primary/10 rounded-xl p-3 text-center border border-primary/20">
          <p className="text-primary font-bold">
            {language === 'bn' ? 'আজকের স্পিন বাকি:' : 'Spins remaining today:'} <span className="text-lg">{Math.max(0, dailyLimit - spinsUsedToday)}</span>/{dailyLimit}
          </p>
        </div>

        <div className="relative mb-12 mt-10">
          {/* Wheel Container */}
          <div className="w-[300px] h-[300px] rounded-full border-4 border-slate-200 dark:border-slate-800 shadow-2xl relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div 
              className="absolute inset-0 w-full h-full"
              animate={{ rotate: rotation }}
              transition={{ duration: 4.5, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {SEGMENTS.map((seg, i) => {
                  const startAngle = i * sliceAngle;
                  const endAngle = (i + 1) * sliceAngle;
                  
                  const startX = 50 + 50 * Math.cos((startAngle) * Math.PI / 180);
                  const startY = 50 + 50 * Math.sin((startAngle) * Math.PI / 180);
                  const endX = 50 + 50 * Math.cos((endAngle) * Math.PI / 180);
                  const endY = 50 + 50 * Math.sin((endAngle) * Math.PI / 180);
                  const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M 50 50`,
                    `L ${startX} ${startY}`,
                    `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                    `Z`,
                  ].join(' ');

                  const textAngle = startAngle + sliceAngle / 2;
                  const textRadius = 38; 
                  const textX = 50 + textRadius * Math.cos((textAngle) * Math.PI / 180);
                  const textY = 50 + textRadius * Math.sin((textAngle) * Math.PI / 180);

                  return (
                    <g key={seg.id}>
                      <path d={pathData} fill={seg.color} stroke="#ffffff" strokeWidth="0.5" />
                      <text
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        fontSize="5"
                        fontWeight="900"
                        textAnchor="end"
                        alignmentBaseline="middle"
                        transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </motion.div>
            
            {/* Center Hub */}
            <div className="z-20 bg-white dark:bg-slate-900 w-16 h-16 rounded-full shadow-lg flex items-center justify-center border-4 border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-primary" />
              </div>
            </div>
          </div>
          
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 drop-shadow-lg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800 dark:text-white">
              <path d="M12 22L2 2L22 2L12 22Z" />
            </svg>
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning || spinsUsedToday >= dailyLimit}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-primary to-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSpinning ? (
            <>{language === 'bn' ? 'স্পিন হচ্ছে...' : 'Spinning...'}</>
          ) : spinsUsedToday >= dailyLimit ? (
            <>{language === 'bn' ? 'লিমিট শেষ' : 'Limit Reached'}</>
          ) : (
            <>{language === 'bn' ? 'স্পিন করুন' : 'Spin Now'}</>
          )}
        </button>

        <AnimatePresence>
          {showCollectModal && result && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                
                <div className="text-center mt-12 mb-8">
                  <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {language === 'bn' ? 'অভিনন্দন!' : 'Congratulations!'}
                  </h3>
                  <div className="flex items-center justify-center gap-2 text-4xl font-black text-slate-800 dark:text-white">
                    <Coins className="w-8 h-8 text-amber-500" />
                    <span>{result.label}</span>
                  </div>
                  <p className="mt-3 text-slate-500 text-sm">
                    {language === 'bn' 
                      ? 'রিওয়ার্ডটি পেতে একটি ভিডিও অ্যাড দেখুন।'
                      : 'Watch a video ad to collect your reward.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowCollectModal(false);
                      setResult(null);
                    }}
                    disabled={isCollecting}
                    className="flex-1 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 disabled:opacity-50"
                  >
                    {language === 'bn' ? 'বাদ দিন' : 'Skip'}
                  </button>
                  <button 
                    onClick={handleCollect}
                    disabled={isCollecting}
                    className="flex-2 py-3.5 px-6 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-95 transition-all"
                  >
                    {isCollecting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>{language === 'bn' ? 'কালেক্ট করুন' : 'Collect Reward'}</>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
