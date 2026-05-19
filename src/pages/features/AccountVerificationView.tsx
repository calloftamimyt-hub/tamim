import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, CheckCircle2, XCircle, Loader2, ShieldCheck, Star, Award, Crown, Zap, Check, X } from 'lucide-react';
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
    price: '50 ৳ / 7 Days',
    priceBn: '৫০ ৳ / ৭ দিন',
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
    price: '100 ৳ / 7 Days',
    priceBn: '১০০ ৳ / ৭ দিন',
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
    price: '200 ৳ / 7 Days',
    priceBn: '২০০ ৳ / ৭ দিন',
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

        if (verified && pExpiresAt && new Date() > pExpiresAt) {
          verified = false;
          pId = 'basic';
        }

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

  const handleUpgrade = async () => {
    if (!auth.currentUser) return;
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
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setUpgrading(false);
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

  const getExpirationText = () => {
    if (!planExpiresAt) return language === 'bn' ? 'বর্তমান প্ল্যান (লাইফটাইম)' : 'Current Plan (Lifetime)';
    const diff = planExpiresAt.getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) {
      return language === 'bn' ? `বর্তমান প্ল্যান (মেয়াদ: ${days} দিন ${hours} ঘণ্টা)` : `Current Plan (Expires in ${days}d ${hours}h)`;
    }
    if (hours > 0) {
      return language === 'bn' ? `বর্তমান প্ল্যান (মেয়াদ: ${hours} ঘণ্টা)` : `Current Plan (Expires in ${hours}h)`;
    }
    return language === 'bn' ? 'বর্তমান প্ল্যান (শীঘ্রই শেষ হবে)' : 'Current Plan (Ending Soon)';
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
                            {getExpirationText()}
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
                        onClick={handleUpgrade}
                        disabled={upgrading || isVerified}
                        className={cn(
                          "w-full py-3 rounded-xl font-bold text-white text-sm shadow-md flex justify-center items-center gap-2 transition-all active:scale-[0.98]",
                          `bg-gradient-to-r ${selectedPlanDetails.gradient}`,
                          (upgrading || isVerified) && "opacity-70 pointer-events-none cursor-not-allowed"
                        )}
                      >
                        {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isVerified && currentPlanId === selectedPlanId) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            {getExpirationText()}
                          </>
                        ) : isVerified ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            {language === 'bn' ? 'আপগ্রেড আপাতত বন্ধ (মেয়াদ আছে)' : 'Upgrade Locked (Active Plan)'}
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
    </div>
  );
};

