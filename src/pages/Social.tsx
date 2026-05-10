import React, { useState, useEffect } from 'react';
import { 
  Trophy, Play, CheckCircle2, XCircle, Share2, HelpCircle, 
  X, BadgeCheck, Gift, Loader2, Timer, User, DollarSign, 
  Menu, ChevronDown, ChevronUp, Bell, History, Wallet,
  Smartphone, BookOpen, Heart, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot, increment, serverTimestamp } from 'firebase/firestore';
import { Share } from '@capacitor/share';
import { QUESTION_BANK } from '../data/quizzes';
import { showRewardedAd, showInterstitialAd, showRewardedInterstitialAd } from '../lib/admob';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useLanguage } from '@/contexts/LanguageContext';

export const Social = () => {
  const { language, t } = useLanguage();
  // Local persistence for played quizzes
  const [playedQuizzes, setPlayedQuizzes] = useState<Record<number, { isCorrect: boolean, selectedOpt: number, timestamp?: number }>>({});
  
  // Daily Goal state
  const [dailyLimit, setDailyLimit] = useState(10);
  const [bonusReward, setBonusReward] = useState(2.0); // 2 Taka
  const [dailyProgress, setDailyProgress] = useState(0);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [dailyQuizDate, setDailyQuizDate] = useState("");
  const [progressLoading, setProgressLoading] = useState(true);

  // Cooldown & Ad Sequence State
  const [sessionQuizCount, setSessionQuizCount] = useState(0);
  const [cooldownEndTime, setCooldownEndTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingAdFor, setLoadingAdFor] = useState<number | null>(null);

  // User Data state
  const [currentUser] = useState(auth.currentUser);
  const [balance, setBalance] = useState<any>(null);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [showBalance, setShowBalance] = useState(false);

  // Modal tracking
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [tempSelection, setTempSelection] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Real-time listener for balance and verification
    const unsubBalance = onSnapshot(doc(db, 'user_balances', currentUser.uid), (snap) => {
      if (snap.exists()) setBalance(snap.data());
    });

    const unsubVerification = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) setIsVerified(snap.data().isVerified);
    });

    return () => {
      unsubBalance();
      unsubVerification();
    };
  }, [currentUser]);

  useEffect(() => {
    // Fetch limits
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'app_settings', 'rewards'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.daily_quiz_limit) setDailyLimit(Number(data.daily_quiz_limit));
          if (data.quiz_bonus_reward) setBonusReward(Number(data.quiz_bonus_reward));
        }
      } catch(e) {}
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    
    // Listen to user daily quiz progress from firestore
    const unsub = onSnapshot(doc(db, 'user_data', user.uid), (docSnap) => {
      setProgressLoading(false);
      const todayStr = new Date().toDateString();

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.dailyQuizDate === todayStr) {
          setDailyProgress(data.dailyQuizProgress || 0);
          setBonusClaimed(data.dailyBonusClaimed || false);
          setDailyQuizDate(data.dailyQuizDate);
          setSessionQuizCount(data.sessionQuizCount || 0);
          setCooldownEndTime(data.cooldownEndTime || 0);
        } else {
          // If the date in DB doesn't match today, we treat progress as 0 locally
          setDailyProgress(0);
          setBonusClaimed(false);
          setDailyQuizDate(todayStr);
          setSessionQuizCount(0);
          setCooldownEndTime(0);
        }
      } else {
        setDailyProgress(0);
        setBonusClaimed(false);
        setDailyQuizDate(todayStr);
        setSessionQuizCount(0);
        setCooldownEndTime(0);
      }
    });

    return () => unsub();
  }, []);

  // Cooldown Timer
  useEffect(() => {
    if (cooldownEndTime <= Date.now()) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(cooldownEndTime - Date.now());
    const interval = setInterval(() => {
      const diff = cooldownEndTime - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  useEffect(() => {
    // Load played state from local storage so we don't bother Firestore with quiz states
    const saved = localStorage.getItem('played_quizzes_v2');
    if (saved) {
      try {
        setPlayedQuizzes(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const savePlayedQuiz = (id: number, isCorrect: boolean, selectedOpt: number) => {
    setPlayedQuizzes(prev => {
      const updated = { ...prev, [id]: { isCorrect, selectedOpt, timestamp: Date.now() } };
      localStorage.setItem('played_quizzes_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // 24 Hours filter logic
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  const visibleFeedQuizzes = QUESTION_BANK.filter(quiz => {
    const played = playedQuizzes[quiz.id];
    if (!played) return true;
    if (played.timestamp && (Date.now() - played.timestamp >= TWENTY_FOUR_HOURS)) return true;
    return false;
  });

  const handleSelectOption = async (quiz: any, optIdx: number) => {
    if (tempSelection !== null) return; // Prevent multiple clicks
    
    setTempSelection(optIdx);
    const isCorrect = optIdx === quiz.ans;
    
    // Update daily progress safely right away (any answer counts towards daily goal ONLY IF IT IS CORRECT as per user request)
    const user = auth.currentUser;
    if (user && isCorrect) {
      const todayStr = new Date().toDateString();
      const userRef = doc(db, 'user_data', user.uid);
      
      let newProgress = 1;
      let newClaimed = false;
      
      if (dailyQuizDate === todayStr) {
        newProgress = dailyProgress + 1;
        newClaimed = bonusClaimed;
      }
      
      try {
        await setDoc(userRef, {
          dailyQuizDate: todayStr,
          dailyQuizProgress: newProgress,
          dailyBonusClaimed: newClaimed
        }, { merge: true });
      } catch (e) {
        console.error("Progress save error", e);
      }
    }

    // Give user visual feedback for 1 second before closing modal
    setTimeout(async () => {
      savePlayedQuiz(quiz.id, isCorrect, optIdx);
      setActiveQuizId(null);
      setTempSelection(null);

      if (isCorrect) {
        const user = auth.currentUser;
        if (user) {
          try {
            // 1. Give 10 points (Virtual Score for User Display/Motivation)
            const userRef = doc(db, 'user_data', user.uid);
            await setDoc(userRef, {
              quizScore: increment(10),
              displayName: user.displayName || user.email?.split('@')[0] || 'App User',
              photoURL: user.photoURL,
              updatedAt: serverTimestamp()
            }, { merge: true });

            // 2. Add Real Money to Earning Wallet Balance (Server Side logic)
            // Retrieve dynamic reward amount from firestore 'app_settings/rewards'
            let rewardInTaka = 0.05; // default fallback 5 poysha
            try {
              const settingsSnap = await getDoc(doc(db, 'app_settings', 'rewards'));
              if (settingsSnap.exists() && settingsSnap.data().quiz_reward_points) {
                rewardInTaka = Number(settingsSnap.data().quiz_reward_points);
              }
            } catch (e) {
              console.log('Using default reward amounts', e);
            }

            const balanceRef = doc(db, 'user_balances', user.uid);
            await setDoc(balanceRef, {
              userId: user.uid,
              currentBalance: increment(rewardInTaka),
              totalEarned: increment(rewardInTaka),
              updatedAt: serverTimestamp()
            }, { merge: true });

          } catch (err) {
            console.error("Failed to update score or balance: ", err);
          }
        }
      }
    }, 1200);
  };

  const activeQuiz = activeQuizId ? QUESTION_BANK.find(q => q.id === activeQuizId) : null;

  const handleShare = async (quiz: any) => {
    const text = `Can you answer this Islamic Quiz?\n\n"${quiz.q}"\n\nPlay and earn points on Halal Circle!`;
    try {
      await Share.share({
        title: 'Islamic Quiz',
        text: text,
        dialogTitle: 'Share with friends',
      });
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaimBonus = async () => {
    const user = auth.currentUser;
    if (!user || bonusClaimed || dailyProgress < dailyLimit || isClaiming || timeLeft > 0) return;

    setIsClaiming(true);

    await showRewardedAd(
      async () => {
        // onReward - Ad watch successful
        try {
          // 1. Mark as claimed
          await setDoc(doc(db, 'user_data', user.uid), {
            dailyBonusClaimed: true
          }, { merge: true });
          
          // 2. Add to balance
          const balanceRef = doc(db, 'user_balances', user.uid);
          await setDoc(balanceRef, {
            userId: user.uid,
            currentBalance: increment(bonusReward),
            totalEarned: increment(bonusReward),
            updatedAt: serverTimestamp()
          }, { merge: true });
          
        } catch (err) {
          console.error("Error claiming bonus", err);
        }
      },
      (err) => {
        // onError - handle ad load failure (optional: you could still give them the reward or show a message)
        console.error("Ad failed, cannot claim right now", err);
        alert("Ad failed to load. Please try again later to claim your bonus.");
        setIsClaiming(false);
      },
      () => {
        // onDismiss
        setIsClaiming(false);
      }
    );
  };

  const handlePlayQuiz = async (quizId: number) => {
    if (loadingAdFor !== null || timeLeft > 0) return;
    setLoadingAdFor(quizId);

    const user = auth.currentUser;
    const adIndex = sessionQuizCount % 3;
    let isFinished = false;

    const openQuizAndProgress = async () => {
      if (isFinished) return;
      isFinished = true;
      
      setLoadingAdFor(null);
      
      let newCount = sessionQuizCount + 1;
      let newCooldown = cooldownEndTime;

      // Reset after 10 quizzes and start 10 min break
      if (newCount >= 10) {
        newCooldown = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        newCount = 0;
      }

      if (user) {
        try {
          await setDoc(doc(db, 'user_data', user.uid), {
            sessionQuizCount: newCount,
            cooldownEndTime: newCooldown
          }, { merge: true });
        } catch(e) {
             console.log(e);
        }
      }
      
      setActiveQuizId(quizId);
    };

    // Sequential Ad logic based on Modulo Operator
    if (adIndex === 0) {
      // #1: Rewarded Ad
      await showRewardedAd(
          () => {}, 
          openQuizAndProgress, // on error, let them play anyway
          openQuizAndProgress  // on dismiss
      );
    } else if (adIndex === 1) {
      // #2: Interstitial Ad
      await showInterstitialAd(
          openQuizAndProgress, 
          openQuizAndProgress
      );
    } else {
      // #3: Rewarded Interstitial Ad
      await showRewardedInterstitialAd(
          () => {}, 
          openQuizAndProgress, 
          openQuizAndProgress
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden relative">
      
      {/* Header / Navigation */}
      <div className="pt-safe pb-4 px-4 flex items-center justify-between relative z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none">
              {language === 'bn' ? 'সোশ্যাল স্পেস' : 'Social Space'}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
              {language === 'bn' ? 'খেলুন এবং পুরস্কার জিতুন' : 'Play & Earn Rewards'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors active:scale-95">
             <Bell className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Main Content Area (Rounded Card with reduced rounding) */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-t-2xl relative z-20 overflow-y-auto custom-scrollbar pb-24 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        
        <div className="max-w-[500px] mx-auto px-4 pt-4">
        
        {/* BREAK TIME BANNER */}
        {timeLeft > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 rounded-xl mb-5 flex items-center justify-between shadow-lg shadow-red-500/20">
             <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Timer className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="font-bold block leading-tight">Take a Break!</span>
                  <span className="text-xs text-red-100">You've played a lot. Rest your eyes.</span>
                </div>
             </div>
             <div className="font-mono font-black text-2xl drop-shadow-sm bg-black/10 px-3 py-1 rounded-lg">
                {String(Math.floor(timeLeft / 60000)).padStart(2, '0')}:
                {String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, '0')}
             </div>
          </div>
        )}

        {/* GOLD CARD - Daily Progress Goal */}
        {!progressLoading && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 shadow-lg shadow-orange-500/20 mb-5 text-white relative overflow-hidden">
            {/* decorative bg */}
            <div className="absolute -right-4 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -left-4 -bottom-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
            
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                    <Gift className="w-5 h-5 text-yellow-100" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] leading-tight text-white drop-shadow-sm">Daily Quiz Goal</h3>
                    <p className="text-[11px] text-orange-100 font-medium mt-0.5">Complete {dailyLimit} quizzes for bonus!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl drop-shadow-sm">{Math.min(dailyProgress, dailyLimit)}<span className="text-sm font-bold text-orange-200">/{dailyLimit}</span></div>
                </div>
              </div>

              <div className="w-full bg-orange-900/30 rounded-full h-3 border border-orange-900/10 overflow-hidden shadow-inner mt-1">
                <motion.div 
                  className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((dailyProgress / dailyLimit) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                ></motion.div>
              </div>

              {dailyProgress >= dailyLimit && (
                <div className="mt-1">
                  {bonusClaimed ? (
                    <div className="bg-white/10 text-white text-xs font-bold text-center py-2.5 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-300" /> Bonus Claimed! More tomorrow.
                    </div>
                  ) : (
                    <button 
                      onClick={handleClaimBonus}
                      disabled={isClaiming || timeLeft > 0}
                      className="w-full bg-white text-orange-600 font-black text-sm py-2.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isClaiming ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Loading Ad...</>
                      ) : (
                        <><Gift className="w-4 h-4 mb-0.5" /> Claim ৳{bonusReward} Bonus</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {visibleFeedQuizzes.length > 0 ? visibleFeedQuizzes.map((quiz, idx) => {
              const played = playedQuizzes[quiz.id];
              return (
                <React.Fragment key={quiz.id}>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    
                    {/* Post Header */}
                    <div className="flex items-center gap-3 p-3 pb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                        <span className="font-bold text-white text-lg">M</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-slate-900 dark:text-white text-[14px] truncate">Halal Circle</h3>
                          <BadgeCheck className="w-[16px] h-[16px] text-blue-500 fill-blue-500/20 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Sponsored • Win Points</p>
                      </div>
                      <button 
                        onClick={() => handleShare(quiz)}
                        className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary transition-colors bg-slate-50 hover:bg-primary/10 dark:bg-slate-800 dark:hover:bg-primary/20 rounded-full"
                      >
                        <Share2 className="w-[16px] h-[16px]" />
                      </button>
                    </div>

                    {/* Thinner Interactive Quiz Area */}
                    <div className="px-3 pb-3">
                      <div className="relative aspect-[21/9] w-full rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-900/50 border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center overflow-hidden p-4 text-center">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
                        <div className="absolute top-2 left-3 text-5xl text-primary/10 font-serif leading-none italic z-0">"</div>
                        
                        {played ? (
                          <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center p-3 rounded-xl border ${played.isCorrect ? 'bg-emerald-50/80 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800' : 'bg-red-50/80 dark:bg-red-900/40 border-red-200 dark:border-red-800'}`}>
                            <div className="flex items-center justify-center gap-1.5 mb-2">
                              {played.isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                              <span className={`font-black text-[15px] ${played.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                {played.isCorrect ? '+10 Points Earned!' : 'Incorrect'}
                              </span>
                            </div>
                            <p className="text-[13px] text-slate-700 dark:text-slate-300">
                              Your answer: <span className="font-bold text-slate-900 dark:text-white">{quiz.options[played.selectedOpt]}</span>
                            </p>
                            {!played.isCorrect && (
                              <p className="text-[12px] text-slate-700 dark:text-slate-300 mt-0.5">
                                Correct: <span className="font-bold text-emerald-600 dark:text-emerald-400">{quiz.options[quiz.ans]}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <h2 className="relative z-10 text-[1rem] leading-snug font-bold text-slate-900 dark:text-slate-100 mb-4 px-2 max-h-16 overflow-hidden">
                              {quiz.q}
                            </h2>
                            
                            <button 
                              onClick={() => handlePlayQuiz(quiz.id)}
                              disabled={timeLeft > 0 || loadingAdFor === quiz.id}
                              className="relative z-10 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 active:scale-[0.96] transition-all text-white py-2 px-5 rounded-full flex items-center justify-center gap-2 group shadow-md shadow-primary/20 border border-white/10 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                              {loadingAdFor === quiz.id ? (
                                 <><Loader2 className="w-4 h-4 animate-spin fill-white" /> <span className="font-bold text-[13px] tracking-wide uppercase">Loading Ad...</span></>
                              ) : (
                                 <><Play className="w-4 h-4 fill-white" /> <span className="font-bold text-[13px] tracking-wide uppercase">Play & Earn</span></>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* NATIVE / BANNER AD SLOT - Shows after every 10 quizzes */}
                  {(idx + 1) % 10 === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col p-4 mb-4 min-h-[280px]">
                      <div className="w-full flex justify-between items-center mb-3">
                         <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-200 dark:border-slate-700">AD</div>
                            <span className="text-xs font-semibold uppercase tracking-wider">Advertisement</span>
                         </div>
                      </div>
                      
                      {/* Banner Ad Container */}
                      <div id={`banner-ad-slot-${idx}`} className="w-full flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-6 mt-1">
                        <span className="text-slate-400 dark:text-slate-500 font-medium mb-1">Banner Ad (Medium Rectangle)</span>
                        <span className="text-[10px] text-slate-400/70 dark:text-slate-500/70 font-mono">ca-app-pub-4288324218526190/9060448049</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )
            }) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You're All Caught Up!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">You've answered all available quizzes. They will reappear 24 hours after you played them.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* QUIZ PLAY MODAL */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 perspective-1000">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => tempSelection === null && setActiveQuizId(null)}
            />
            
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-slate-50 dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <HelpCircle className="w-5 h-5" /> Answer to Earn
                </div>
                <button 
                  onClick={() => tempSelection === null && setActiveQuizId(null)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center leading-relaxed">
                  {activeQuiz.q}
                </h2>
                
                <div className="space-y-3">
                  {activeQuiz.options.map((opt: string, idx: number) => {
                    const isSelected = tempSelection === idx;
                    const isCorrectOption = activeQuiz.ans === idx;
                    const showCorrect = tempSelection !== null && isCorrectOption;
                    const showWrong = tempSelection !== null && isSelected && !isCorrectOption;

                    let btnClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200";
                    if (showCorrect) btnClass = "bg-emerald-500 border-emerald-600 text-white shadow-emerald-500/30";
                    else if (showWrong) btnClass = "bg-red-500 border-red-600 text-white shadow-red-500/30";
                    else if (tempSelection !== null) btnClass = "opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400";

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(activeQuiz, idx)}
                        disabled={tempSelection !== null}
                        className={`w-full p-4 rounded-xl border-2 font-medium text-left transition-all relative shadow-sm flex items-center justify-between ${
                          tempSelection === null ? 'hover:border-primary/50 hover:bg-primary/5' : ''
                        } ${btnClass}`}
                      >
                        <span className="text-lg">{opt}</span>
                        {showCorrect && <CheckCircle2 className="w-6 h-6" />}
                        {showWrong && <XCircle className="w-6 h-6" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

