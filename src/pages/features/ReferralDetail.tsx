import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Share2, Copy, Contact, Gift, Clock, History, 
  CheckCircle2, AlertCircle, ChevronRight, Share, Users, Sparkles
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function ReferralDetail({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'pending' | 'all'>('all');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        // Dispatched event to hide navigation bar
        window.dispatchEvent(new CustomEvent('set-nav-visibility', { detail: false }));

        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (!data.referralCode) {
            // Generate unique referral code
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              referralCode: code,
              referralCount: 0
            });
            setUserProfile({ ...data, referralCode: code, referralCount: 0 });
          } else {
            setUserProfile(data);
          }
        }

        // Fetch referrals
        const q = query(collection(db, 'referrals'), where('referrerId', '==', auth.currentUser.uid));
        const snap = await getDocs(q);
        setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Show navigation bar again when leaving page
    return () => {
      window.dispatchEvent(new CustomEvent('set-nav-visibility', { detail: true }));
    };
  }, []);

  const handleCopy = () => {
    if (!userProfile?.referralCode) return;
    navigator.clipboard.writeText(userProfile.referralCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = async () => {
    if (!userProfile?.referralCode) return;
    const msg = `${t('share-msg')}${userProfile.referralCode}\nDownload: ${window.location.origin}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Halal Circle Referral',
          text: msg,
          url: window.location.origin,
        });
      } else {
        handleCopy();
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  const handleInvite = async () => {
    // In a real app, we'd use a contact picker or similar.
    // For web, we can just alert or simulate.
    alert('Connecting to contacts... (This feature requires a native mobile environment)');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingCount = referrals.filter(r => r.status === 'pending').length;
  const completedCount = referrals.filter(r => r.status === 'completed').length;

  return (
    <div className="fixed inset-0 z-[200] w-full flex flex-col bg-slate-50 dark:bg-slate-950 pb-safe overflow-hidden">
      <header className="flex items-center justify-between px-4 pb-4 pt-10 bg-white dark:bg-slate-900 shadow-sm z-10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('refer-claim')}</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Banner Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 relative">
          <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 flex relative min-h-[140px] mb-8 overflow-hidden">
            <div className="flex-1 z-10">
               <div className="flex items-center gap-1.5 text-white/90 font-bold text-[10px] uppercase tracking-wide mb-2">
                 Halal Circle App
               </div>
               <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
                 রেফার করে পান <br/>
                 <span className="text-orange-100">৫.০০ ৳ বোনাস</span>
               </h2>
            </div>
            <div className="absolute right-0 bottom-0 w-24 h-24 flex items-center justify-center p-4">
               <Gift className="w-12 h-12 text-white/30" strokeWidth={1.5} />
            </div>
          </div>

          <div className="text-center px-2 space-y-4">
             <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
               {t('refer-detail-title')}
             </h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
               {t('refer-detail-desc')}
             </p>

             <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-100 dark:border-slate-700/60 relative mt-6">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 px-3 py-1 text-[10px] font-black text-slate-500 border border-slate-200 dark:border-slate-700 rounded-full">
                   {t('referral-code')}
                </span>
                <div className="text-2xl font-black tracking-[0.2em] text-slate-800 dark:text-slate-200 mt-2">
                  {userProfile?.referralCode || '-------'}
                </div>
             </div>

             <div className="flex justify-center gap-6 pt-5">
               <button onClick={handleCopy} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
                 <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center text-orange-500 transition-colors border border-transparent group-hover:border-orange-200 dark:group-hover:border-slate-600 transition-all">
                    <Copy className="w-5 h-5" />
                 </div>
               </button>
               <button onClick={handleInvite} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
                 <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center text-orange-500 transition-colors border border-transparent group-hover:border-orange-200 dark:group-hover:border-slate-600 transition-all">
                    <Contact className="w-5 h-5" />
                 </div>
               </button>
               <button onClick={handleShare} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
                 <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center text-orange-500 transition-colors border border-transparent group-hover:border-orange-200 dark:group-hover:border-slate-600 transition-all">
                    <Share2 className="w-5 h-5" />
                 </div>
               </button>
             </div>
          </div>
        </div>

        {/* Combined Status Dashboard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Main Status */}
          <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-900/10">
            <div className="text-emerald-500 font-bold text-xs uppercase tracking-wider mb-2">{t('already-redeemed')}</div>
            <div className="text-xl font-black text-slate-800 dark:text-white">
              {t('redeemed-bonus')}
            </div>
          </div>

          <div
            onClick={() => {}}
            className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 bg-orange-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-orange-500">
              <Gift className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800 dark:text-white text-sm">{t('claim-rewards')}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{t('total-referrals')}: {completedCount}</div>
            </div>
            <div className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
              Claim
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => {
                setHistoryFilter('pending');
                setShowHistory(true);
              }}
              className="p-5 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500">
                <Users className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <div className="font-black text-slate-800 dark:text-white text-lg">{pendingCount}</div>
                <div className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mt-0.5">{t('pending-referrals')}</div>
              </div>
            </button>
            <button
              onClick={() => {
                setHistoryFilter('all');
                setShowHistory(true);
              }}
              className="p-5 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-500">
                <History className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <div className="font-black text-slate-800 dark:text-white text-lg">{referrals.length}</div>
                <div className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mt-0.5">{t('referral-history')}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {copySuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl z-50"
          >
            {t('copied')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Sheet */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[250]"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 h-[80vh] bg-slate-50 dark:bg-slate-950 rounded-t-3xl shadow-2xl z-[260] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                  {historyFilter === 'pending' ? t('pending-referrals') : t('referral-history')}
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5 -rotate-90" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {referrals
                  .filter(r => historyFilter === 'all' || r.status === historyFilter)
                  .map(referral => (
                    <div key={referral.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 dark:text-white">{referral.refereeName || referral.referredEmail || 'Unknown User'}</div>
                        <div className="text-sm text-slate-500">{new Date(referral.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                      </div>
                      <div>
                        {referral.status === 'completed' ? (
                          <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                            Completed
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">
                            Pending
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                
                {referrals.filter(r => historyFilter === 'all' || r.status === historyFilter).length === 0 && (
                  <div className="text-center text-slate-400 py-10 font-medium">
                    No records found
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
