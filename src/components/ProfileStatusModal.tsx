import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Calendar, Star, Info, TrendingUp, Activity, ChevronRight, BookOpen, ShieldAlert, Search, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { auth } from '@/lib/firebase';
import { OfflineImage } from './OfflineImage';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Sat', score: 300 },
  { name: 'Sun', score: 450 },
  { name: 'Mon', score: 400 },
  { name: 'Tue', score: 600 },
  { name: 'Wed', score: 800 },
  { name: 'Thu', score: 750 },
  { name: 'Fri', score: 950 },
];

export function ProfileStatusModal({ isOpen, onClose, userProfile, onOpenSupport }: any) {
    const { language } = useLanguage();
    
    const firstName = userProfile?.name?.split(' ')[0] || auth.currentUser?.displayName?.split(' ')[0] || 'User';
    const fullName = userProfile?.name || auth.currentUser?.displayName || 'User';
    const photoUrl = userProfile?.photoURL || auth.currentUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user';
    const isVerified = userProfile?.isVerified || userProfile?.blueBadge || false;
    const reportsCount = userProfile?.reportsCount || 0;
    const strikes = userProfile?.strikes || 0;
    const isReported = reportsCount >= 5;

    // Strike logic
    const strikeStatus = strikes === 0 
        ? { text: language === 'bn' ? '০ স্ট্রাইক (অ্যাক্টিভ)' : '0 Strikes (Active)', color: 'text-emerald-500' }
        : strikes === 1
        ? { text: language === 'bn' ? '১ স্ট্রাইক (সতর্কবার্তা)' : '1 Strike (Warning)', color: 'text-amber-500' }
        : strikes === 2
        ? { text: language === 'bn' ? '২ স্ট্রাইক (ঝুঁকিপূর্ণ)' : '2 Strikes (At Risk)', color: 'text-orange-500' }
        : { text: language === 'bn' ? '৩ স্ট্রাইক (রেস্ট্রিক্টেড)' : '3 Strikes (Restricted)', color: 'text-red-600' };

    const joinedDateStr = userProfile?.createdAt 
        ? (typeof userProfile.createdAt.toDate === 'function' ? userProfile.createdAt.toDate().toLocaleDateString() : new Date(userProfile.createdAt).toLocaleDateString())
        : 'Active';

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed inset-0 z-[400] bg-white dark:bg-slate-950 flex flex-col"
            >
                {/* Header */}
                <header className="sticky top-0 z-[401] bg-white dark:bg-slate-950 px-3 pt-safe pb-2 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center">
                        <button onClick={() => { window.history.back(); onClose(); }} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
                            <ArrowLeft className="w-6 h-6 stroke-[2.5px] text-slate-800 dark:text-slate-200" />
                        </button>
                        <h1 className="text-[20px] font-bold text-slate-900 dark:text-white ml-2 tracking-tight">
                            {language === 'bn' ? 'প্রোফাইল স্ট্যাটাস' : 'Profile status'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <Search className="w-6 h-6 stroke-[2.5px] text-slate-800 dark:text-slate-200" />
                        </button>
                        {auth.currentUser?.photoURL ? (
                            <OfflineImage src={auth.currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-500" />
                            </div>
                        )}
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto w-full pb-24 bg-white dark:bg-slate-950 font-sans">
                    
                    <div className="px-4 pt-4 pb-6 mt-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative inline-block">
                                <OfflineImage src={photoUrl} className="w-[60px] h-[60px] rounded-full border border-slate-200 dark:border-slate-800 object-cover" alt="Profile" />
                                {isReported && isVerified ? (
                                    <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-red-500 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                ) : isReported ? (
                                    <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-red-500 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center">
                                        <AlertTriangle className="w-3 h-3 text-white" />
                                    </div>
                                ) : isVerified ? (
                                    <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-blue-500 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                ) : null}
                            </div>
                            {isReported && (
                                <div>
                                    <h3 className="font-bold text-red-600 dark:text-red-500 text-base leading-tight">Profile Issue</h3>
                                    <p className="text-xs font-semibold text-red-500/90 dark:text-red-400/90">{userProfile?.profileIssue || "Spam or Harmful Content"} ({reportsCount} Reports)</p>
                                </div>
                            )}
                        </div>
                        <h1 className="text-[22px] font-bold text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">
                            {language === 'bn' ? `স্বাগতম, ${firstName}!` : `Welcome, ${firstName}!`}
                        </h1>
                        <p className={cn("text-[15px] leading-snug", strikes > 0 ? "text-amber-600 dark:text-amber-500 font-medium" : "text-slate-600 dark:text-slate-400")}>
                            {strikes === 0 
                                ? (language === 'bn' 
                                    ? 'আপনার প্রোফাইল, কন্টেন্ট বা স্ট্যান্ডার্ডের বিরুদ্ধে নেওয়া কোনো পদক্ষেপ আপনি এখানে দেখতে পাবেন।' 
                                    : 'When we take actions on your profile or your content for going against our standards, you\'ll see them here.')
                                : (language === 'bn'
                                    ? `সতর্কতা: আপনার অ্যাকাউন্টে ${strikes}টি স্ট্রাইক রয়েছে। দয়া করে নিয়ম মেনে চলুন।`
                                    : `Warning: Your account has ${strikes} strike(s). Please follow our community standards.`)}
                        </p>
                    </div>

                    <div className="h-[6px] w-full bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800" />

                    <div className="px-4 py-6">
                        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                            {language === 'bn' ? 'অতিরিক্ত ফিচারসমূহ' : 'Extra features'}
                        </h2>
                        <p className="text-[15px] text-slate-600 dark:text-slate-400 mb-4 leading-snug">
                            {language === 'bn' 
                                ? 'এই সব ফিচার ব্যবহার করতে হলে আপনাকে অবশ্যই নিয়মকানুন মেনে চলতে এবং যোগ্য হতে হবে।' 
                                : 'To use these features, you must be eligible and avoid breaking any rules.'}
                        </p>
                        
                        <div className="border border-slate-200 dark:border-slate-800 rounded-[12px] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                            <FeatureRow 
                                icon={ShieldCheck} 
                                title={language === 'bn' ? 'প্রোফাইল হেলথ' : 'Profile Health'} 
                                subtitle={language === 'bn' ? 'অ্যাক্টিভ' : 'Active'} 
                            />
                            <FeatureRow 
                                icon={Star} 
                                title={language === 'bn' ? 'অ্যাকাউন্ট টাইপ' : 'Account Type'} 
                                subtitle={isVerified ? (language === 'bn' ? 'ভেরিফাইড ইউজার' : 'Verified User') : (language === 'bn' ? 'অ্যাক্টিভ' : 'Active')} 
                            />
                            <FeatureRow 
                                icon={AlertTriangle} 
                                title={language === 'bn' ? 'কমিউনিটি স্ট্রাইক' : 'Community Strikes'} 
                                subtitle={strikeStatus.text} 
                                subtitleColor={strikeStatus.color}
                            />
                             <FeatureRow 
                                icon={Calendar} 
                                title={language === 'bn' ? 'যোগদানের তারিখ' : 'Joined Date'} 
                                subtitle={joinedDateStr === 'Active' ? (language === 'bn' ? 'অ্যাক্টিভ' : 'Active') : joinedDateStr} 
                            />
                        </div>
                    </div>

                    <div className="h-[6px] w-full bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800" />

                    {/* Chart Section */}
                    <div className="px-4 py-6">
                         <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                             {language === 'bn' ? 'সাপ্তাহিক এঙ্গেজমেন্ট' : 'Weekly Engagement'}
                         </h2>
                         <div className="bg-white dark:bg-slate-900 rounded-[12px] border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                             <div className="h-40 w-full">
                                 <ResponsiveContainer width="100%" height="100%">
                                     <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                         <defs>
                                             <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                             </linearGradient>
                                         </defs>
                                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                         <XAxis 
                                             dataKey="name" 
                                             axisLine={false} 
                                             tickLine={false} 
                                             tick={{ fill: '#94a3b8', fontSize: 12 }}
                                             dy={10}
                                         />
                                         <Tooltip 
                                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                         />
                                         <Area 
                                             type="monotone" 
                                             dataKey="score" 
                                             stroke="#3b82f6" 
                                             strokeWidth={3}
                                             fillOpacity={1} 
                                             fill="url(#colorScore)" 
                                         />
                                     </AreaChart>
                                 </ResponsiveContainer>
                             </div>
                         </div>
                     </div>

                    <div className="h-[6px] w-full bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800" />

                    <div className="px-4 py-6">
                         <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                             {language === 'bn' ? 'আরও জানুন' : 'Find out more'}
                         </h2>
                         <p className="text-[15px] text-slate-600 dark:text-slate-400 mb-5 leading-snug">
                             {language === 'bn' 
                                 ? 'আমাদের কমিউনিটি স্ট্যান্ডার্ডস দেখুন এবং ভালো কন্টেন্টের জন্য টিপস পান।' 
                                 : 'See our Community Standards and get tips for great content.'}
                         </p>
                         
                         <div className="flex gap-4 overflow-x-auto pb-4 snap-x pr-4 -mr-4 no-scrollbar">
                             <InfoCard 
                                title={language === 'bn' ? 'কমিউনিটি স্ট্যান্ডার্ডস এর পরিচিতি' : 'Introduction to Community Standards'}
                                colorClass="bg-red-50 dark:bg-rose-500/10"
                                icon={<BookOpen className="w-10 h-10 text-red-400 dark:text-red-500" strokeWidth={1.5} />}
                             />
                             <InfoCard 
                                title={language === 'bn' ? 'আমরা কীভাবে নীতি প্রয়োগ করি' : 'How we enforce Community Standards'}
                                colorClass="bg-blue-50 dark:bg-blue-500/10"
                                icon={<ShieldAlert className="w-10 h-10 text-blue-400 dark:text-blue-500" strokeWidth={1.5} />}
                             />
                             <InfoCard 
                                title={language === 'bn' ? 'অ্যাকাউন্ট রেস্ট্রিকশন সম্পর্কে জানুন' : 'Understanding Account Restrictions'}
                                colorClass="bg-amber-50 dark:bg-amber-500/10"
                                icon={<AlertTriangle className="w-10 h-10 text-amber-400 dark:text-amber-500" strokeWidth={1.5} />}
                             />
                         </div>
                     </div>

                    <div className="px-4 py-4 mb-4">
                        <button 
                            onClick={onOpenSupport}
                            className="w-full py-3 bg-red-50 dark:bg-slate-900 border border-red-200 dark:border-slate-800 rounded-xl text-red-600 dark:text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Help & Support (Appeal Issue)
                        </button>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function FeatureRow({ icon: Icon, title, subtitle, subtitleColor }: { icon: any, title: string, subtitle: string, subtitleColor?: string }) {
    return (
        <div className="flex items-center gap-4 py-3 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-slate-800 dark:text-slate-200 stroke-[2px]" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-[17px] font-medium text-slate-900 dark:text-slate-100 truncate">{title}</h4>
                <p className={cn("text-[14px] truncate", subtitleColor || "text-slate-500 dark:text-slate-400")}>{subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
        </div>
    );
}

function InfoCard({ title, colorClass, icon }: { title: string, colorClass: string, icon: any }) {
    return (
        <div className={`shrink-0 w-[240px] rounded-[16px] border border-slate-200 dark:border-slate-800 overflow-hidden snap-start flex flex-col cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]`}>
            <div className={`h-[120px] w-full ${colorClass} flex items-center justify-center`}>
                {icon}
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-1 flex items-center">
                <h3 className="text-[15px] font-medium text-slate-900 dark:text-white leading-snug">
                    {title}
                </h3>
            </div>
        </div>
    );
}