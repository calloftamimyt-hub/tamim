import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ArrowLeft, 
    Plus, 
    ChevronRight, 
    Star, 
    Video, 
    Heart, 
    Check,
    Info,
    ShieldAlert,
    AlertCircle,
    BadgeCheck,
    ShoppingBag
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, onSnapshot, getCountFromServer, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function MonetizationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { language } = useLanguage();
    const [balance, setBalance] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showGiftDetails, setShowGiftDetails] = useState(false);
    const [showInstreamDetails, setShowInstreamDetails] = useState(false);
    const [showEarningsDetail, setShowEarningsDetail] = useState(false);

    useEffect(() => {
        if (!isOpen || !auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const balancePath = `user_balances/${userId}`;
        const userPath = `users/${userId}`;

        const unsubBalance = onSnapshot(doc(db, 'user_balances', userId), 
            (snap) => {
                if (snap.exists()) {
                    setBalance(snap.data());
                }
            },
            (error) => handleFirestoreError(error, OperationType.GET, balancePath)
        );

        const unsubProfile = onSnapshot(doc(db, 'users', userId), 
            (snap) => {
                if (snap.exists()) {
                    setUserProfile(snap.data());
                }
            },
            (error) => handleFirestoreError(error, OperationType.GET, userPath)
        );

        const fetchFollowers = async () => {
            if (!auth.currentUser) return;
            const q = query(
                collection(db, "follows"),
                where("following_id", "==", auth.currentUser.uid)
            );
            const snap = await getCountFromServer(q);
            setFollowerCount(snap.data().count);
        };

        fetchFollowers();
        setLoading(false);

        return () => {
            unsubBalance();
            unsubProfile();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const reportsCount = userProfile?.reportsCount || 0;
    const isProfileHealthy = reportsCount < 5;
    
    // Circle Gift Criteria (200 followers + Healthy)
    const meetsFollowerGoal = followerCount >= 200;
    const isEligibleForGifts = meetsFollowerGoal && isProfileHealthy;
    
    // In-stream Ads Criteria (2000 followers + 5000 hours + Healthy)
    const GOAL_WATCH_HOURS = 5000;
    const watchSeconds = userProfile?.watchTimeSeconds || 0;
    const watchHours = watchSeconds / 3600;
    const meetsAdsFollowerGoal = followerCount >= 2000;
    const meetsWatchTimeGoal = watchHours >= GOAL_WATCH_HOURS;
    const isEligibleForInstream = meetsAdsFollowerGoal && meetsWatchTimeGoal && isProfileHealthy;

    const t = {
        title: language === 'bn' ? 'মনিটাইজেশন' : 'Monetize',
        approxEarnings: language === 'bn' ? 'আনুমানিক আয়' : 'Approximate earnings',
        seeAll: language === 'bn' ? 'সব দেখুন' : 'See all',
        payoutMin: language === 'bn' ? '৳১০০.০০ পেআউট মিনিমাম' : '৳100.00 to payout minimum',
        yourPrograms: language === 'bn' ? 'আপনার প্রোগ্রাম' : 'Your programs',
        circleGift: language === 'bn' ? 'সার্কেল গিফট' : 'Circle Gift',
        circleGiftDesc: language === 'bn' ? 'আপনার ফ্যানদের কাছ থেকে গিফট পেয়ে আয় করুন' : 'Let your fans support you by sending stars and gifts.',
        instreamAds: language === 'bn' ? 'ইন-স্ট্রিম অ্যাডস' : 'In-stream Ads',
        received: language === 'bn' ? 'গ্ৰহণ করা হয়েছে' : 'received',
        giftsReceived: language === 'bn' ? 'উপহার গ্ৰহণ' : 'Gifts received',
        activeAds: language === 'bn' ? 'সক্রিয় বিজ্ঞাপন' : 'Active ads',
        requests: language === 'bn' ? 'অনুরোধ' : 'requests',
        notAvailable: language === 'bn' ? 'এখনো উপলব্ধ নয়' : 'Not yet available',
        currentSession: language === 'bn' ? '১ - ৮ মে' : 'May 1 - 8', // Mocking current period
        criteriaMet: language === 'bn' ? `শর্ত পূরণ হয়েছে` : `criteria met`,
        applyNow: language === 'bn' ? 'আবেদন করুন' : 'Apply Now',
        hours: language === 'bn' ? 'ঘণ্টা' : 'hours',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed inset-0 z-[400] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden"
            >
                {/* Header */}
                <header className="sticky top-0 z-[401] bg-white dark:bg-slate-900 px-4 pt-safe pb-3 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center">
                        <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
                            <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                        </button>
                    </div>
                    <h1 className="text-[18px] font-semibold text-slate-900 dark:text-white tracking-tight">
                        {t.title}
                    </h1>
                    <button className="p-2 -mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
                        <Plus className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-0 pb-0 bg-white dark:bg-black">
                    <div className="relative bg-white dark:bg-slate-900 shadow-sm min-h-full">
                        <div className="max-w-[700px] mx-auto pt-6 pb-12 px-6">
                            {/* SECTION: Approximate Earnings */}
                            <div className="mb-10 p-6 border border-slate-200 dark:border-slate-800 rounded-[20px]">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-[17px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                        {t.approxEarnings}
                                    </h2>
                                    <button 
                                        onClick={() => setShowEarningsDetail(true)}
                                        className="text-[#0064E0] font-bold text-[17px]"
                                    >
                                        {t.seeAll}
                                    </button>
                                </div>
                                <p className="text-[14px] text-slate-500 font-medium mb-2">
                                    {language === 'bn' ? 'মে ১ - ৮' : 'May 1 - 8'}
                                </p>
                                <div className="text-[48px] font-bold text-slate-900 dark:text-white leading-tight mb-4">
                                    ৳{Number(balance?.totalEarned || 0).toFixed(2)}
                                </div>
                                <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((balance?.totalEarned || 0), 100)}%` }}
                                        className="absolute inset-y-0 left-0 bg-slate-300 rounded-full"
                                    />
                                </div>
                                <p className="text-[14px] text-slate-500 font-medium">
                                    ৳১০০.০০ {language === 'bn' ? 'পেশ আউট মিনিমাম পর্যন্ত' : 'to payout minimum'}
                                </p>
                            </div>

                            {/* SECTION: Your Programs */}
                            <div className="mb-10">
                                <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6">
                                    {t.yourPrograms}
                                </h2>

                                <div className="space-y-4">
                                    {isEligibleForGifts && (
                                        <div className="group cursor-pointer border border-slate-200 dark:border-slate-800 rounded-[20px] p-5 hover:shadow-sm transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 flex items-center justify-center">
                                                        <Star className="w-8 h-8 text-black dark:text-white fill-black dark:fill-white" />
                                                    </div>
                                                    <span className="text-[20px] font-bold text-slate-900 dark:text-white">
                                                        {t.circleGift}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#F0F2F5] dark:bg-slate-800 rounded-2xl p-4">
                                                    <p className="text-[18px] font-bold text-slate-900 dark:text-white">৳{Number(balance?.giftsEarned || 0).toFixed(2)}</p>
                                                    <p className="text-[12px] text-slate-500 font-medium">{t.approxEarnings}</p>
                                                </div>
                                                <div className="bg-[#F0F2F5] dark:bg-slate-800 rounded-2xl p-4">
                                                    <p className="text-[18px] font-bold text-slate-900 dark:text-white">0</p>
                                                    <p className="text-[12px] text-slate-500 font-medium">{language === 'bn' ? 'গিফট রিসিভ' : 'Gifts received'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isEligibleForInstream && (
                                        <div className="group cursor-pointer border border-slate-200 dark:border-slate-800 rounded-[20px] p-5 hover:shadow-sm transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 flex items-center justify-center">
                                                        <Video className="w-8 h-8 text-black dark:text-white" />
                                                    </div>
                                                    <span className="text-[20px] font-bold text-slate-900 dark:text-white">
                                                        {language === 'bn' ? 'পার্টনারশিপ বিজ্ঞাপন' : 'Partnership ads'}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#F0F2F5] dark:bg-slate-800 rounded-2xl p-4">
                                                    <p className="text-[18px] font-bold text-slate-900 dark:text-white">0</p>
                                                    <p className="text-[12px] text-slate-500 font-medium">{language === 'bn' ? 'রিকোয়েস্ট' : 'Requests'}</p>
                                                </div>
                                                <div className="bg-[#F0F2F5] dark:bg-slate-800 rounded-2xl p-4">
                                                    <p className="text-[18px] font-bold text-slate-900 dark:text-white">0</p>
                                                    <p className="text-[12px] text-slate-500 font-medium">{language === 'bn' ? 'অ্যাক্টিভ বিজ্ঞাপন' : 'Active ads'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION: Not Available */}
                            <div className="pb-8">
                                <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6">
                                    {language === 'bn' ? 'এখনও পাওয়া যায় নাই' : 'Not yet available'}
                                </h2>

                                <div className="space-y-3">
                                    {!isEligibleForGifts && (
                                        <div 
                                            onClick={() => setShowGiftDetails(true)}
                                            className="flex items-start p-5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer hover:shadow-sm"
                                        >
                                            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                                <Heart className="w-8 h-8 text-black dark:text-white fill-black dark:fill-white" />
                                            </div>
                                            <div className="flex-1 ml-4 mr-2">
                                                <p className="text-[18px] font-bold text-slate-900 dark:text-white">
                                                    {language === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions'}
                                                </p>
                                                <p className="text-[14px] text-slate-500 leading-snug">
                                                    {language === 'bn' ? 'এক্সক্লুসিভ কন্টেন্ট দিয়ে মাসিক আয় নিশ্চিত করুন।' : 'Generate income monthly with exclusive content.'}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-slate-300 self-center" />
                                        </div>
                                    )}

                                    {!isEligibleForInstream && (
                                        <div 
                                            onClick={() => setShowInstreamDetails(true)}
                                            className="flex items-start p-5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors cursor-pointer hover:shadow-sm"
                                        >
                                            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                                <Video className="w-8 h-8 text-black dark:text-white" />
                                            </div>
                                            <div className="flex-1 ml-4 mr-2">
                                                <p className="text-[18px] font-bold text-slate-900 dark:text-white">
                                                    {language === 'bn' ? 'কন্টেন্ট মনিটাইজেশন' : 'Content monetization'}
                                                </p>
                                                <p className="text-[14px] text-slate-500 leading-snug">
                                                    {language === 'bn' ? 'আপনার ভিডিওর বিজ্ঞাপনের মাধ্যমে টাকা আয় করুন।' : 'Earn money from ads during your videos.'}
                                                </p>
                                                <div className="mt-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                                    {language === 'bn' ? 'শুধুমাত্র ইনভাইটেশন' : 'INVITE ONLY'}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-slate-300 self-center" />
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Earnings Breakdown Detailed Page */}
                <AnimatePresence>
                    {showEarningsDetail && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed inset-0 z-[410] bg-slate-50 dark:bg-slate-950 flex flex-col"
                        >
                            <header className="sticky top-0 z-[411] bg-white dark:bg-slate-900 px-4 pt-safe pb-3 flex items-center shrink-0 border-b border-slate-100 dark:border-slate-800">
                                <button onClick={() => setShowEarningsDetail(false)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
                                    <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                                </button>
                                <h1 className="text-[18px] font-semibold text-slate-900 dark:text-white ml-2 tracking-tight">
                                    {language === 'bn' ? 'আয়ের বিস্তারিত' : 'Earnings Breakdown'}
                                </h1>
                            </header>

                            <div className="flex-1 overflow-y-auto px-4 py-8">
                                <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 mb-8 border border-slate-100 dark:border-slate-800 text-center shadow-sm">
                                    <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                                        {language === 'bn' ? 'মোট আয়' : 'Total Earnings'}
                                    </p>
                                    <h2 className="text-[36px] font-bold text-slate-900 dark:text-white">
                                        ৳{Number(balance?.totalEarned || 0).toFixed(2)}
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[18px] font-bold text-slate-900 dark:text-white px-2">
                                        {language === 'bn' ? 'উৎস সমূহ' : 'Sources'}
                                    </h3>
                                    
                                    <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                                        {/* Gift Earnings */}
                                        <div className="flex items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center">
                                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[16px] font-bold text-slate-900 dark:text-white">{t.circleGift}</p>
                                                    <p className="text-[12px] text-slate-500 dark:text-slate-400">{t.received}</p>
                                                </div>
                                            </div>
                                            <p className="text-[17px] font-bold text-slate-900 dark:text-white">
                                                ৳{Number(balance?.giftsEarned || 0).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Instream Earnings */}
                                        <div className="flex items-center justify-between p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center">
                                                    <Video className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[16px] font-bold text-slate-900 dark:text-white">{t.instreamAds}</p>
                                                    <p className="text-[12px] text-slate-500 dark:text-slate-400">{t.activeAds}</p>
                                                </div>
                                            </div>
                                            <p className="text-[17px] font-bold text-slate-900 dark:text-white">
                                                ৳0.00
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <p className="text-center text-[13px] text-slate-400 leading-relaxed italic">
                                            {language === 'bn' 
                                                ? '* এই তথ্যগুলো আনুমানিক এবং শেষ পেমেন্ট সাইকেল অনুযায়ী পরিবর্তিত হতে পারে।'
                                                : '* These figures are approximate and may change based on the final payout validation.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Gift Criteria Detail View */}
                <AnimatePresence>
                    {showGiftDetails && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed inset-0 z-[405] bg-white dark:bg-slate-950 flex flex-col"
                        >
                            <header className="sticky top-0 z-[406] bg-white dark:bg-slate-900 px-4 pt-safe pb-3 flex items-center shrink-0 border-b border-slate-100 dark:border-slate-800">
                                <button onClick={() => setShowGiftDetails(false)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
                                    <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                                </button>
                                <h1 className="text-[18px] font-semibold text-slate-900 dark:text-white ml-2 tracking-tight">
                                    {t.circleGift}
                                </h1>
                            </header>

                            <div className="flex-1 overflow-y-auto px-4 py-8">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <div className="w-20 h-20 bg-yellow-400/10 rounded-3xl flex items-center justify-center mb-4">
                                        <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <h2 className="text-[24px] font-bold text-slate-900 dark:text-white mb-2">
                                        {t.circleGift}
                                    </h2>
                                    <p className="text-[15px] text-slate-600 dark:text-slate-400 max-w-[300px]">
                                        {t.circleGiftDesc}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[18px] font-bold text-slate-900 dark:text-white">
                                        {language === 'bn' ? 'আবেদনের শর্তাবলী' : 'Eligibility criteria'}
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Follower Criteria */}
                                        <CriteriaRow 
                                            met={meetsFollowerGoal}
                                            title={language === 'bn' ? 'কমপক্ষে ২০০ ফলোয়ার' : 'Have at least 200 followers'}
                                            subtitle={language === 'bn' ? `${followerCount}/২০০ ফলোয়ার` : `${followerCount}/200 followers`}
                                        />

                                        {/* Profile Status Criteria */}
                                        <CriteriaRow 
                                            met={isProfileHealthy}
                                            title={language === 'bn' ? 'প্রোফাইলে কোনো ইস্যু নেই' : 'No profile issues'}
                                            subtitle={isProfileHealthy 
                                                ? (language === 'bn' ? 'আপনার প্রোফাইল নিরাপদ' : 'Your profile is safe') 
                                                : (language === 'bn' ? 'আপনার প্রোফাইলে সমস্যা আছে' : 'Your profile has issues')
                                            }
                                        />

                                        {/* Community Standards */}
                                        <CriteriaRow 
                                            met={true} // Assumed met
                                            title={language === 'bn' ? 'অধিকার ও নীতি মেনে চলা' : 'Following community standards'}
                                            subtitle={language === 'bn' ? 'নিয়মিত ভালো কন্টেন্ট পোস্ট করুন' : 'Regularly post helpful content'}
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-start gap-4">
                                        <Info className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">
                                                {language === 'bn' ? 'কীভাবে কাজ করে?' : 'How it works?'}
                                            </h4>
                                            <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {language === 'bn' 
                                                    ? 'যোগ্য হওয়ার পর আবেদন করলে আপনার প্রোফাইলে গিফট অপশন চালু হবে। ফ্যানরা আপনাকে গিফট পাঠালে সেই টাকা সরাসরি আপনার ওয়ালেটে জমা হবে।'
                                                    : 'Once eligible, you can apply to enable gifts on your profile. When fans send you gifts, the money will be deposited directly into your wallet.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky footer with apply button */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    disabled={!isEligibleForGifts}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-bold text-[16px] transition-all active:scale-[0.98]",
                                        isEligibleForGifts 
                                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                    )}
                                >
                                    {t.applyNow}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* In-stream Ads Criteria Detail View */}
                <AnimatePresence>
                    {showInstreamDetails && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className="fixed inset-0 z-[405] bg-white dark:bg-slate-950 flex flex-col"
                        >
                            <header className="sticky top-0 z-[406] bg-white dark:bg-slate-900 px-4 pt-safe pb-3 flex items-center shrink-0 border-b border-slate-100 dark:border-slate-800">
                                <button onClick={() => setShowInstreamDetails(false)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
                                    <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                                </button>
                                <h1 className="text-[18px] font-semibold text-slate-900 dark:text-white ml-2 tracking-tight">
                                    {t.instreamAds}
                                </h1>
                            </header>

                            <div className="flex-1 overflow-y-auto px-4 py-8">
                                <div className="flex flex-col items-center text-center mb-8">
                                    <div className="w-20 h-20 bg-blue-400/10 rounded-3xl flex items-center justify-center mb-4">
                                        <Video className="w-12 h-12 text-blue-500" />
                                    </div>
                                    <h2 className="text-[24px] font-bold text-slate-900 dark:text-white mb-2">
                                        {t.instreamAds}
                                    </h2>
                                    <p className="text-[15px] text-slate-600 dark:text-slate-400 max-w-[300px]">
                                        {language === 'bn' ? 'ভিডিওর মাঝে বিজ্ঞাপন থেকে আয় করুন' : 'Earn from ads inside your videos'}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-[18px] font-bold text-slate-900 dark:text-white">
                                        {language === 'bn' ? 'আবেদনের শর্তাবলী' : 'Eligibility criteria'}
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Follower Criteria */}
                                        <CriteriaRow 
                                            met={meetsAdsFollowerGoal}
                                            title={language === 'bn' ? 'কমপক্ষে ২০০০ ফলোয়ার' : 'Have at least 2000 followers'}
                                            subtitle={language === 'bn' ? `${followerCount}/২০০০ ফলোয়ার` : `${followerCount}/2000 followers`}
                                        />

                                        {/* Watch Time Criteria */}
                                        <CriteriaRow 
                                            met={meetsWatchTimeGoal}
                                            title={language === 'bn' ? 'কমপক্ষে ৫০০০ ঘণ্টা ওয়াচ টাইম' : 'Have at least 5000 watch hours'}
                                            subtitle={language === 'bn' ? `${Math.floor(watchHours)}/৫০০০ ঘণ্টা` : `${Math.floor(watchHours)}/5000 ${t.hours}`}
                                        />

                                        {/* Profile Status Criteria */}
                                        <CriteriaRow 
                                            met={isProfileHealthy}
                                            title={language === 'bn' ? 'প্রোফাইলে কোনো ইস্যু নেই' : 'No profile issues'}
                                            subtitle={isProfileHealthy 
                                                ? (language === 'bn' ? 'আপনার প্রোফাইল নিরাপদ' : 'Your profile is safe') 
                                                : (language === 'bn' ? 'আপনার প্রোফাইলে সমস্যা আছে' : 'Your profile has issues')
                                            }
                                        />

                                        {/* Account Active */}
                                        <CriteriaRow 
                                            met={true}
                                            title={language === 'bn' ? 'অ্যাকাউন্ট সক্রিয়' : 'Account Active'}
                                            subtitle={language === 'bn' ? 'আপনার অ্যাকাউন্ট সচল আছে' : 'Your account is active'}
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-start gap-4">
                                        <Info className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">
                                                {language === 'bn' ? 'কীভাবে কাজ করে?' : 'How it works?'}
                                            </h4>
                                            <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {language === 'bn' 
                                                    ? 'যোগ্য হওয়ার পর আবেদন করলে আপনার দীর্ঘ ভিডিওগুলোতে বিজ্ঞাপন দেখানো হবে। বিজ্ঞাপনের আয় সরাসরি আপনার ওয়ালেটে জমা হবে।'
                                                    : 'Once eligible, you can apply to show ads in your long videos. Ad revenue will be deposited directly into your wallet.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky footer with apply button */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    disabled={!isEligibleForInstream}
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-bold text-[16px] transition-all active:scale-[0.98]",
                                        isEligibleForInstream 
                                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                    )}
                                >
                                    {t.applyNow}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}

function CriteriaRow({ met, title, subtitle }: { met: boolean; title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                met ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
            )}>
                {met ? <Check className="w-3.5 h-3.5 text-white stroke-[3px]" /> : null}
            </div>
            <div className="flex-1">
                <p className={cn(
                    "text-[15px] font-bold",
                    met ? "text-slate-900 dark:text-white" : "text-slate-500"
                )}>{title}</p>
                <p className="text-[12px] text-slate-400 font-medium">{subtitle}</p>
            </div>
        </div>
    );
}
