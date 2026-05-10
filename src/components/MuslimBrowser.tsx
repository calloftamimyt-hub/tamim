import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ArrowLeft, 
  X, 
  ShieldAlert, 
  Video, 
  Book, 
  MessageCircle, 
  Clock, 
  Globe,
  Lock,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MuslimBrowserProps {
  onBack: () => void;
  language: 'bn' | 'en';
}

export const MuslimBrowser = ({ onBack, language }: MuslimBrowserProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isBlocked, setIsBlocked] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeUrl, setActiveUrl] = useState<string | null>(null);

    // Hide main app navigation when browser is open
    useEffect(() => {
        window.dispatchEvent(new CustomEvent("hide-nav", { detail: true }));
        return () => {
            window.dispatchEvent(new CustomEvent("hide-nav", { detail: false }));
        };
    }, []);

    const HARAM_KEYWORDS = [
        'porn', 'adult', 'sex', 'sexy', 'naked', 'xxx', 'gambling', 'casino', 'betting', 
        'alcohol', 'wine', 'beer', 'pork', 'idol', 'dance', 'clubbing', 'nightclub',
        'পর্ণ', 'যৌন', 'জুয়া', 'মদ', 'শুয়োর', 'নাস্তিক', 'atheism'
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        const containsHaram = HARAM_KEYWORDS.some(keyword => 
            searchQuery.toLowerCase().includes(keyword.toLowerCase())
        );

        setTimeout(() => {
            if (containsHaram) {
                setIsBlocked(true);
            } else {
                setIsBlocked(false);
            }
            setHasSearched(true);
            setIsLoading(false);
        }, 600);
    };

    const handleResultClick = (url: string) => {
        setActiveUrl(url);
    };

    const closeWebView = () => {
        setActiveUrl(null);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[300] bg-white dark:bg-slate-950 flex flex-col h-full overscroll-none"
        >
            <AnimatePresence mode="wait">
                {activeUrl ? (
                    <motion.div 
                        key="webview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col h-full relative"
                    >
                        {/* Web View Top Bar */}
                        <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                            <button 
                                onClick={closeWebView}
                                className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                                <Lock className="w-3 h-3 text-green-500 flex-shrink-0" />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                                    {activeUrl}
                                </span>
                            </div>
                            <button 
                                onClick={() => setActiveUrl(null)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Note about iframe limitations */}
                        <div className="absolute inset-0 top-14 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950 -z-10">
                            <Globe className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-4" />
                            <p className="text-sm font-bold text-slate-400">
                                {language === 'bn' 
                                    ? 'নিরাপদ ব্রাউজিং মোড এ লোড হচ্ছে...' 
                                    : 'Loading in secure browsing mode...'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2 max-w-xs">
                                {language === 'bn'
                                    ? 'কিছু সাইট সরাসরি এখানে ওপেন হতে বাধা দিতে পারে। সেক্ষেত্রে আপনি লিঙ্কে ক্লিক করে ভিউ করতে পারেন।'
                                    : 'Some sites may restrict direct embedding. In that case, you can click the link to view.'}
                            </p>
                        </div>

                        <iframe 
                            src={activeUrl} 
                            className="flex-1 w-full border-none bg-white"
                            title="Muslim Browser View"
                        />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="browser-home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col h-full"
                    >
                        {/* 1. Control Bar */}
                        <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <button 
                                onClick={onBack}
                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">
                                <Lock className="w-3 h-3 text-green-500" />
                                <span className="text-[10px] font-bold text-slate-400 truncate">
                                    {hasSearched ? `search?q=${encodeURIComponent(searchQuery)}` : 'muslim-browser://home'}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {/* 2. Brand Name (Small & Elegant) */}
                            {!hasSearched && (
                                <div className="flex flex-col items-center justify-center mt-20 mb-8 transition-all">
                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-[0.4em] mb-0.5 ml-1">
                                        Muslim
                                    </span>
                                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                        Browser
                                    </h1>
                                </div>
                            )}

                            {/* 3. Search Bar */}
                            <form onSubmit={handleSearch} className={cn(
                                "w-full max-w-lg mx-auto relative transition-all duration-500",
                                hasSearched ? "mb-6" : "mb-10"
                            )}>
                                <div className="relative group">
                                    <input 
                                        type="text"
                                        placeholder={language === 'bn' ? 'হালাল সামগ্রী খুঁজুন...' : 'Search Halal Content...'}
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            if (hasSearched) setHasSearched(false);
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl py-4 px-12 text-slate-900 dark:text-white font-bold outline-none shadow-sm transition-all shadow-blue-500/0 focus:shadow-blue-500/5"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    {searchQuery && (
                                        <button 
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* 4. Content Area */}
                            <div className="flex-1 flex flex-col items-center">
                                {isLoading ? (
                                    <div className="py-12 flex flex-col items-center gap-4">
                                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching Safe Web...</p>
                                    </div>
                                ) : hasSearched ? (
                                    isBlocked ? (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center text-center p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[32px] max-w-sm mt-4 shadow-xl shadow-red-500/5"
                                        >
                                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                                <ShieldAlert className="w-8 h-8 text-red-500" />
                                            </div>
                                            <h3 className="text-xl font-black text-red-600 dark:text-red-400 mb-2">
                                                {language === 'bn' ? 'সার্চ ব্লক করা হয়েছে' : 'Search Blocked'}
                                            </h3>
                                            <p className="text-sm font-bold text-red-500/70">
                                                {language === 'bn' 
                                                    ? 'দুঃখিত, এই বিষয়টি আমাদের ইসলামিক নীতিমালার পরিপন্থী এবং এখানে পরিবেশিত হবে না।' 
                                                    : 'This content is against our Islamic guidelines and is not allowed here.'}
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <div className="w-full max-w-2xl space-y-6">
                                            <div className="flex items-center justify-between px-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {language === 'bn' ? 'সার্চ রেজাল্ট' : 'Search Results'}
                                                </p>
                                            </div>
                                            
                                            {/* Simulated Dynamic Results */}
                                            {[
                                                { 
                                                    title: searchQuery.toLowerCase().includes('youtube') ? 'YouTube - Safe & Halal Video Platform' : `${searchQuery} on Google Search`,
                                                    url: searchQuery.toLowerCase().includes('youtube') ? 'https://youtube.com' : `https://google.com/search?q=${encodeURIComponent(searchQuery)}`,
                                                    desc: 'Access the world\'s information through our filtered safe browser. Pure browsing for the Muslim Ummah.',
                                                    icon: searchQuery.toLowerCase().includes('youtube') ? <Video className="w-4 h-4 text-red-500" /> : <Globe className="w-4 h-4 text-blue-500" />
                                                },
                                                { 
                                                    title: 'Islamic Library & Resources',
                                                    url: 'https://islamicstudies.info',
                                                    desc: 'A comprehensive collection of verified Islamic knowledge, books, and lecture archives.',
                                                    icon: <Book className="w-4 h-4 text-emerald-500" />
                                                },
                                                { 
                                                    title: 'Halal Travel & Food Guide',
                                                    url: 'https://halaltrip.com',
                                                    desc: 'Find prayer times, halal restaurants, and travel guides for Muslims across the globe.',
                                                    icon: <Globe className="w-4 h-4 text-orange-500" />
                                                }
                                            ].map((result, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    onClick={() => handleResultClick(result.url)}
                                                    className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all hover:shadow-lg active:scale-[0.99] group cursor-pointer"
                                                >
                                                    <div className="text-[10px] text-slate-400 mb-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded-md bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                                                {result.icon}
                                                            </div>
                                                            {new URL(result.url).hostname}
                                                        </div>
                                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <h4 className="text-lg font-black text-blue-600 dark:text-blue-400 group-hover:text-blue-700 transition-colors mb-1">
                                                        {result.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 font-medium">
                                                        {result.desc}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col items-center w-full">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">
                                            {language === 'bn' ? 'দ্রুত অ্যাক্সেস' : 'Quick Access'}
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-lg">
                                            {[
                                                { label: 'YouTube', icon: Video, color: 'text-red-500', url: 'https://youtube.com' },
                                                { label: 'Quran', icon: Book, color: 'text-emerald-500', url: 'https://quran.com' },
                                                { label: 'Hadith', icon: MessageCircle, color: 'text-blue-500', url: 'https://sunnah.com' },
                                                { label: 'Prayer', icon: Clock, color: 'text-amber-500', url: 'https://muslimpro.com' }
                                            ].map((tag) => (
                                                <button 
                                                    key={tag.label}
                                                    onClick={() => handleResultClick(tag.url)}
                                                    className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-3 hover:border-blue-500 transition-all hover:scale-[1.05] active:scale-95 group shadow-sm"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-850 flex items-center justify-center shadow-sm group-hover:bg-blue-50 transition-colors">
                                                        <tag.icon className={cn("w-5 h-5", tag.color)} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                        {tag.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
