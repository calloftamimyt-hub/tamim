import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, CheckCircle2, XCircle, Loader2, ShieldCheck, Star, Award, Crown, Zap, Check, X, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, Timestamp, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { showRewardedAd } from '@/lib/admob';

interface AccountVerificationViewProps {
  onBack: () => void;
}

export const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    nameBn: 'বেসিক প্ল্যান',
    gradient: 'from-slate-400 to-slate-500',
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
    price: 'Free',
    priceBn: 'ফ্রি',
    features: [
      { id: 'f1', included: true },
      { id: 'f2', included: true },
      { id: 'f3', included: true },
      { id: 'f4', included: false },
      { id: 'f5', included: false },
      { id: 'f6', included: false },
    ]
  },
  {
    id: 'silver',
    name: 'Silver Plan',
    nameBn: 'সিলভার প্ল্যান',
    gradient: 'from-zinc-400 to-slate-600',
    icon: <Award className="w-8 h-8 text-white" />,
    price: '50 ৳ / Lifetime',
    priceBn: '৫০ ৳ / লাইফটাইম',
    features: [
      { id: 'f1', included: true },
      { id: 'f2', included: true },
      { id: 'f3', included: true },
      { id: 'f4', included: true },
      { id: 'f5', included: false },
      { id: 'f6', included: false },
    ]
  },
  {
    id: 'gold',
    name: 'Gold Plan',
    nameBn: 'গোল্ড প্ল্যান',
    gradient: 'from-amber-400 to-orange-500',
    icon: <Crown className="w-8 h-8 text-white" />,
    price: '100 ৳ / Lifetime',
    priceBn: '১০০ ৳ / লাইফটাইম',
    features: [
      { id: 'f1', included: true },
      { id: 'f2', included: true },
      { id: 'f3', included: true },
      { id: 'f4', included: true },
      { id: 'f5', included: true },
      { id: 'f6', included: false },
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    nameBn: 'প্রিমিয়াম প্ল্যান',
    gradient: 'from-purple-500 to-indigo-600',
    icon: <Zap className="w-8 h-8 text-white" />,
    price: '200 ৳ / Lifetime',
    priceBn: '২০০ ৳ / লাইফটাইম',
    features: [
      { id: 'f1', included: true },
      { id: 'f2', included: true },
      { id: 'f3', included: true },
      { id: 'f4', included: true },
      { id: 'f5', included: true },
      { id: 'f6', included: true },
    ]
  }
];

const featureList = [
  { id: 'f1', label: 'Play Mini Games (Entertainment Only, No Earnings)', labelBn: 'মিনি গেমস খেলুন (শুধু বিনোদনের জন্য, কোনো আয় হবে না)' },
  { id: 'f2', label: 'Daily Quizzes & Ad Views', labelBn: 'ডেইলি কুইজ এবং বিজ্ঞাপন দেখে আয়' },
  { id: 'f3', label: 'Standard Profile Status', labelBn: 'স্ট্যান্ডার্ড প্রোফাইল স্ট্যাটাস' },
  { id: 'f4', label: 'Verified Trust Badge (Blue Tick)', labelBn: 'ভেরিফাইড ট্রাস্ট ব্যাজ (ব্লু টিক)' },
  { id: 'f5', label: 'Priority Support & Fast Withdraw', labelBn: 'প্রায়োরিটি সাপোর্ট এবং দ্রুত উইথড্র' },
  { id: 'f6', label: 'Premium Earning Tasks & Unlimited Limits', labelBn: 'প্রিমিয়াম টাস্ক এবং লিমিট ছাড়া আয়' },
];

export const AccountVerificationView: React.FC<AccountVerificationViewProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [adsWatched, setAdsWatched] = useState(0);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState(false);
  const [targetAds, setTargetAds] = useState(10);
  const [adsWatchedThisSession, setAdsWatchedThisSession] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>('basic');
  const [currentPlanId, setCurrentPlanId] = useState<string>('basic');
  const [planExpiresAt, setPlanExpiresAt] = useState<Date | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const [upgradeState, setUpgradeState] = useState<'idle' | 'confirm' | 'method' | 'transaction' | 'cooldown_popup'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | null>(null);
  const [transactionId, setTransactionId] = useState('');

  // Timer effect for cooldown
  useEffect(() => {
    if (!cooldownUntil) {
      setTimeLeft(0);
      return;
    }
    
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((cooldownUntil.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) {
        setCooldownUntil(null);
      }
    };

    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Real-time settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'earning'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.adViewsForVerification !== undefined) {
          setTargetAds(data.adViewsForVerification);
        } else if (data.adsRequiredForVerification !== undefined) {
          setTargetAds(data.adsRequiredForVerification);
        }
      }
    });

    // Real-time verification status listener
    const unsub = onSnapshot(doc(db, 'account_verifications', auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        let verified = data.isVerified || false;
        let pId = data.planId || 'basic';
        const pExpiresAt = data.planExpiresAt?.toDate();

        setAdsWatched(verified ? 0 : (data.adsWatched || 0));
        setIsVerified(verified);
        setCurrentPlanId(pId);
        setPlanExpiresAt(pExpiresAt || null);
        setAdsWatchedThisSession(data.adsWatchedThisSession || 0);
        if (data.cooldownUntil) {
          setCooldownUntil(data.cooldownUntil.toDate());
        }
      } else {
        // Initialize if doesn't exist
        setDoc(doc(db, 'account_verifications', auth.currentUser!.uid), {
          userId: auth.currentUser!.uid,
          adsWatched: 0,
          adsWatchedThisSession: 0,
          cooldownUntil: null,
          isVerified: false,
          planId: 'basic',
          updatedAt: serverTimestamp()
        });
        setIsVerified(false);
        setCurrentPlanId('basic');
        setPlanExpiresAt(null);
      }
      setLoading(false);
    });

    return () => {
      unsub();
      unsubSettings();
    };
  }, []);

  const processUpgrade = async () => {
    if (!auth.currentUser) return;
    if (!transactionId.trim()) return;
    setUpgrading(true);
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const verificationPromise = updateDoc(doc(db, 'account_verifications', auth.currentUser.uid), {
        planId: selectedPlanId,
        isVerified: true,
        planExpiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: serverTimestamp()
      });

      const userPromise = updateDoc(doc(db, 'users', auth.currentUser.uid), {
        planId: selectedPlanId,
        isVerified: true,
        planExpiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: serverTimestamp()
      });

      await Promise.all([verificationPromise, userPromise]);
      setCurrentPlanId(selectedPlanId);
      setPlanExpiresAt(expiresAt);
      setIsVerified(true);
      setUpgradeState('idle');
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setUpgrading(false);
      setTransactionId('');
    }
  };

  const handleUpgradeClick = () => {
    if (isVerified && planExpiresAt && new Date() < planExpiresAt) {
      setUpgradeState('cooldown_popup');
    } else {
      setUpgradeState('confirm');
    }
  };

  const handleWatchAd = async () => {
    if (!auth.currentUser || isVerified || timeLeft > 0) return;
    setWatching(true);
    
    await showRewardedAd(
      async () => {
        // onReward - User finished watching the ad
        const newAdsWatched = adsWatched + 1;
        const newIsVerified = newAdsWatched >= targetAds;
        let newSessionAds = adsWatchedThisSession + 1;
        let newCooldown: Date | null = null;
        let expiresAt: Date | null = null;
        
        // If watched 3 ads and not yet verified, start 10 min cooldown
        if (newSessionAds >= 3 && !newIsVerified) {
          newCooldown = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
          newSessionAds = 0;
        }

        if (newIsVerified) {
          expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
        
        try {
          const updateData: any = {
            adsWatched: newAdsWatched,
            adsWatchedThisSession: newIsVerified ? 0 : newSessionAds,
            cooldownUntil: newCooldown ? Timestamp.fromDate(newCooldown) : null,
            isVerified: newIsVerified,
            updatedAt: serverTimestamp()
          };

          if (expiresAt) {
            updateData.planExpiresAt = Timestamp.fromDate(expiresAt);
          }

          const verificationPromise = updateDoc(doc(db, 'account_verifications', auth.currentUser!.uid), updateData);

          // If verified, also update the main users document for global visibility
          if (newIsVerified) {
            await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
              isVerified: true,
              planExpiresAt: Timestamp.fromDate(expiresAt!),
              updatedAt: serverTimestamp()
            });
          }

          await verificationPromise;
          setAdsWatched(newIsVerified ? 0 : newAdsWatched);
          setAdsWatchedThisSession(newIsVerified ? 0 : newSessionAds);
          setCooldownUntil(newCooldown);
          if (expiresAt) setPlanExpiresAt(expiresAt);
          setIsVerified(newIsVerified);
        } catch (error) {
          console.error('Error updating verification:', error);
          // Error handling as per instructions
          const errInfo = {
            error: error instanceof Error ? error.message : String(error),
            operationType: 'update',
            path: `account_verifications/${auth.currentUser!.uid}`,
            authInfo: {
              userId: auth.currentUser?.uid,
              email: auth.currentUser?.email,
              emailVerified: auth.currentUser?.emailVerified,
              isAnonymous: auth.currentUser?.isAnonymous,
              tenantId: auth.currentUser?.tenantId,
              providerInfo: auth.currentUser?.providerData.map(provider => ({
                providerId: provider.providerId,
                displayName: provider.displayName,
                email: provider.email,
                photoUrl: provider.photoURL
              })) || []
            }
          };
          console.error('Firestore Error: ', JSON.stringify(errInfo));
        }
      },
      (error) => {
        // onError - Ad failed to load or show
        console.error("Ad failed", error);
        setWatching(false);
      },
      () => {
        // onDismiss - Ad was closed
        setWatching(false);
      }
    );
  };

  const progress = Math.min((adsWatched / targetAds) * 100, 100);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectedPlanDetails = plans.find(p => p.id === selectedPlanId) || plans[0];
  const includedFeatures = featureList.filter(f => selectedPlanDetails.features.find(pf => pf.id === f.id && pf.included));
  const excludedFeatures = featureList.filter(f => selectedPlanDetails.features.find(pf => pf.id === f.id && !pf.included));

  return (
    <div className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex flex-col">
      <div className="pt-safe bg-transparent" />

      <div className="flex-1 overflow-y-auto pb-safe">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="flex flex-col min-h-full relative">
            {/* Abstract Background Animation */}
            <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full" />
              <div className="absolute top-16 -left-32 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/20 blur-[80px] rounded-full" />
            </div>

            {/* Animation Header */}
            <div className="relative pt-4 pb-6 flex flex-col items-center justify-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-3"
                >
                  <ShieldCheck className="w-12 h-12 text-white" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute -inset-2 border border-blue-400/40 rounded-2xl border-dashed"
                  />
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-950">
                    <Star className="w-5 h-5 text-amber-900 fill-amber-900" />
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Header / Subtitle */}
            <div className="px-5 pt-2 pb-6 text-center relative z-10">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2 leading-tight">
                {language === 'bn' ? 'আপনার প্ল্যান বেছে নিন' : 'Choose Your Plan'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'আরও বেশি সুবিধা এবং ইনকামের সুযোগ পেতে আপনার প্রোফাইল আপগ্রেড করুন।' : 'Upgrade your profile to unlock more features and earning opportunities.'}
              </p>
            </div>

            {/* Vertical Plan Cards (Edge to edge) */}
            <div className="px-5 flex flex-col gap-3 relative z-10">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      "w-full p-4 flex items-center text-left relative overflow-hidden transition-all duration-300",
                      "border rounded-lg",
                      isSelected 
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm" 
                        : "border-slate-200 dark:border-slate-800 bg-transparent opacity-90 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    {!isSelected && (
                      <div className="absolute inset-0 bg-slate-900/5 dark:bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
                    )}
                    
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 mr-4 shadow-sm",
                      `bg-gradient-to-br ${plan.gradient}`
                    )}>
                      {React.cloneElement(plan.icon, { className: "w-6 h-6 text-white" })}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={cn(
                        "text-base font-bold mb-0.5",
                        isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-white"
                      )}>
                        {language === 'bn' ? plan.nameBn : plan.name}
                      </h3>
                      
                      <p className={cn(
                        "text-sm font-bold tracking-tight",
                        isSelected ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"
                      )}>
                        {language === 'bn' ? plan.priceBn : plan.price}
                      </p>
                    </div>
                    
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0 ml-3 shadow-md shadow-blue-500/50">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 ml-3" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Features Details View */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlanId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <div className="p-6">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-6 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    {language === 'bn' ? 'প্ল্যানের সুবিধাসমূহ' : 'Plan Features'}
                  </h3>

                  <div className="space-y-4">
                    {/* Included Features */}
                    {includedFeatures.map(f => (
                      <div key={f.id} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400 stroke-[3]" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                          {language === 'bn' ? f.labelBn : f.label}
                        </span>
                      </div>
                    ))}

                    {/* Divider if there are excluded features */}
                    {excludedFeatures.length > 0 && includedFeatures.length > 0 && (
                      <div className="my-5 border-t border-slate-100 dark:border-slate-800" />
                    )}

                    {/* Excluded Features */}
                    {excludedFeatures.map(f => (
                      <div key={f.id} className="flex items-start gap-4 opacity-50 grayscale">
                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <X className="w-4 h-4 text-red-600 dark:text-red-400 stroke-[3]" />
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-through decoration-slate-300 dark:decoration-slate-700">
                          {language === 'bn' ? f.labelBn : f.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pb-2">
                    {selectedPlanId === 'basic' ? (
                        /* Using the existing Ad verify logic conditionally within basic if not verified */
                         isVerified ? (
                          <div className="w-full py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm text-sm opacity-90 cursor-not-allowed">
                            <CheckCircle2 className="w-4 h-4" />
                            {language === 'bn' ? 'বর্তমান প্ল্যান (লাইফটাইম)' : 'Current Plan (Lifetime)'}
                          </div>
                         ) : (
                          <div className="space-y-3">
                            <p className="text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                              {language === 'bn' 
                                ? `ফ্রিতে ভেরিফাই করতে ${targetAds}টি অ্যাড দেখুন (${adsWatched}/${targetAds})`
                                : `Watch ${targetAds} ads to verify for free (${adsWatched}/${targetAds})`}
                            </p>
                            
                            {/* Progres Bar */}
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-blue-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                              />
                            </div>

                            {timeLeft > 0 ? (
                              <div className="w-full py-3 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-bold rounded-xl text-center text-sm">
                                {formatTime(timeLeft)}
                              </div>
                            ) : (
                              <button
                                onClick={handleWatchAd}
                                disabled={watching}
                                className="w-full py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                              >
                                {watching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                {language === 'bn' ? 'অ্যাড দেখুন' : 'Watch Ad'}
                              </button>
                            )}
                          </div>
                         )
                    ) : (
                      <button 
                        onClick={handleUpgradeClick}
                        disabled={upgrading || (isVerified && currentPlanId === selectedPlanId)}
                        className={cn(
                          "w-full py-3 rounded-xl font-bold text-white text-sm shadow-md flex justify-center items-center gap-2 transition-all active:scale-[0.98]",
                          `bg-gradient-to-r ${selectedPlanDetails.gradient}`,
                          (upgrading || (isVerified && currentPlanId === selectedPlanId)) && "opacity-70 pointer-events-none cursor-not-allowed"
                        )}
                      >
                        {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isVerified && currentPlanId === selectedPlanId) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            {language === 'bn' ? 'বর্তমান প্ল্যান (লাইফটাইম)' : 'Current Plan (Lifetime)'}
                          </>
                        ) : (language === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade Now')}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        )}
      </div>

      {/* Upgrade Payment Modals */}
      <AnimatePresence>
        {(upgradeState === 'confirm' || upgradeState === 'cooldown_popup') && (
          <motion.div
            key="popup-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
            >
              {upgradeState === 'confirm' && (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                    {language === 'bn' ? 'আপগ্রেড নিশ্চিত করুন' : 'Confirm Upgrade'}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
                    {language === 'bn' 
                      ? `${selectedPlanDetails.nameBn}-এ আপগ্রেড করতে চান?` 
                      : `Are you sure you want to upgrade to ${selectedPlanDetails.name}?`}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setUpgradeState('idle')}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl active:scale-95 transition-transform"
                    >
                      {language === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      onClick={() => setUpgradeState('method')}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-md shadow-blue-500/20"
                    >
                      {language === 'bn' ? 'হ্যাঁ, আপগ্রেড' : 'Yes, Upgrade'}
                    </button>
                  </div>
                </div>
              )}

              {upgradeState === 'cooldown_popup' && (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                    {language === 'bn' ? 'অপেক্ষা করুন' : 'Please Wait!'}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
                    {language === 'bn' 
                      ? 'নতুন প্ল্যান নেওয়ার পর কমপক্ষে ৭ দিন অপেক্ষা করতে হবে। এরপর আপনি অন্য প্ল্যানে আপগ্রেড করতে পারবেন।' 
                      : 'You must wait at least 7 days after upgrading to switch to a new plan. Please try again later.'}
                  </p>
                  
                  {planExpiresAt && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-6">
                      <p className="text-xs text-slate-500 mb-1">
                        {language === 'bn' ? 'পরবর্তী আপগ্রেড সম্ভব:' : 'Next Upgrade Available:'}
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {planExpiresAt.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setUpgradeState('idle')}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-transform"
                  >
                    {language === 'bn' ? 'ঠিক আছে' : 'Okay'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Full Screen Method & Transaction UI */}
        {(upgradeState === 'method' || upgradeState === 'transaction') && (
          <motion.div
            key="fullscreen-modal"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[2000] flex flex-col bg-white dark:bg-slate-900 font-sans"
          >
            {/* Thin Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
              <button 
                onClick={() => setUpgradeState(upgradeState === 'transaction' ? 'method' : 'idle')} 
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500 scale-75 origin-right">
                 {/* Fake status bar icons to represent the thin mobile status bar */}
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="22" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative flex flex-col pt-4 overflow-y-auto w-full pb-24">
               {upgradeState === 'method' && (
                 <div className="flex flex-col max-w-sm mx-auto w-full px-4">
                    
                    {/* Method Selection Animation Placehholder */}
                    <div className="w-full flex justify-center mb-8 mt-4">
                      <div className="relative w-24 h-24">
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 dark:border-blue-800"
                        />
                        <div className="absolute inset-2 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                           <ShieldCheck className="w-10 h-10 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1 text-center">
                      {language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-center text-sm">
                      {language === 'bn' ? 'যেকোনো একটি পদ্ধতি বেছে নিন' : 'Choose a gateway to proceed'}
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                      <button
                        onClick={() => setPaymentMethod('bkash')}
                        className={cn(
                          "w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                          paymentMethod === 'bkash' 
                            ? "border-[#E2136E] bg-[#E2136E]/10" 
                            : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100"
                        )}
                      >
                        <div className="w-12 h-12 bg-[#E2136E]/10 rounded-full flex items-center justify-center mb-2">
                          <span className="font-black text-[#E2136E] text-xl">b</span>
                        </div>
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">bKash</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('nagad')}
                        className={cn(
                          "w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                          paymentMethod === 'nagad' 
                            ? "border-[#F7931E] bg-[#F7931E]/10" 
                            : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100"
                        )}
                      >
                        <div className="w-12 h-12 bg-[#F7931E]/10 rounded-full flex items-center justify-center mb-2">
                          <span className="font-black text-[#F7931E] text-xl">ন</span>
                        </div>
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Nagad</span>
                      </button>
                    </div>
                 </div>
               )}

               {upgradeState === 'transaction' && (
                 <div className="max-w-sm mx-auto w-full px-4">
                   {/* Transaction Animation Placeholder */}
                   <div className="w-full flex justify-center mb-6 mt-2">
                      <div className="relative w-20 h-20">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 rounded-full bg-blue-50 dark:bg-blue-900/20"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Loader2 className="w-8 h-8 text-blue-500 animate-[spin_3s_linear_infinite]" />
                        </div>
                      </div>
                    </div>

                   <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">
                      Payment Details
                   </h2>

                   {/* Content Box */}
                   <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 mb-6">
                     <div className="flex items-center justify-between mb-4">
                       <span className="text-slate-500 font-medium">Method</span>
                       <div className="flex items-center gap-2">
                         <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", paymentMethod === 'bkash' ? "bg-[#E2136E]/10 text-[#E2136E]" : "bg-[#F7931E]/10 text-[#F7931E]")}>
                           <span className="font-bold text-xs">{paymentMethod === 'bkash' ? 'b' : 'ন'}</span>
                         </div>
                         <span className="font-bold capitalize">{paymentMethod}</span>
                       </div>
                     </div>
                     <div className="flex items-center justify-between mb-4">
                       <span className="text-slate-500 font-medium">To Number</span>
                       <span className="font-bold">{paymentMethod === 'bkash' ? '01909902319' : '01623673650'}</span>
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                       <span className="text-slate-500 font-medium">Amount</span>
                       <span className="font-bold text-lg text-blue-600">
                          {selectedPlanId === 'silver' ? '50 BDT' : selectedPlanId === 'gold' ? '100 BDT' : '200 BDT'}
                       </span>
                     </div>
                   </div>

                   {/* Transaction ID Input */}
                   <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Transaction ID
                      </label>
                      <input 
                        type="text" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter TxnID here"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                      />
                   </div>
                 </div>
               )}
            </div>

            {/* Bottom Sticky action area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
               {upgradeState === 'method' && (
                 <button
                   onClick={() => setUpgradeState('transaction')}
                   disabled={!paymentMethod}
                   className="w-full max-w-sm mx-auto block py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl transition-all disabled:opacity-30 disabled:active:scale-100 active:scale-[0.98]"
                 >
                   {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Selection'}
                 </button>
               )}
               {upgradeState === 'transaction' && (
                 <button
                   onClick={processUpgrade}
                   disabled={upgrading || !transactionId.trim()}
                   className="w-full max-w-sm mx-auto flex items-center justify-center py-3 px-4 bg-[#1A56DB] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98]"
                 >
                   {upgrading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Payment'}
                 </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

