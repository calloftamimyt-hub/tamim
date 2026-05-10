import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Rocket, Zap, Play, Pause, ChevronRight, BarChart2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { cn, getApiUrl } from "@/lib/utils";

export const BoostCenterModal = ({
  isOpen,
  onClose,
  onOpenAnalytics, // Add this to let user jump straight to analytics from here
  onOpenBoost, // Add this to let user buy another boost package
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenAnalytics?: (post: any) => void;
  onOpenBoost?: (post: any) => void;
}) => {
  const { language } = useLanguage();
  const [boostedPosts, setBoostedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;
    
    // Fetch boosted posts
    const fetchBoosted = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "posts"),
          where("authorUid", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const allPosts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        const posts = allPosts.filter((p: any) => p.isBoosted || p.boostInfo?.status);
        
        // Auto-fill missing views for completed campaigns
        for (const post of posts) {
          if (post.boostInfo && post.boostInfo.status !== 'pending' && !post.boostInfo.autoFilled) {
            const boostedAt = post.boostInfo.boostedAt?.toMillis ? post.boostInfo.boostedAt.toMillis() : (post.createdAt?.seconds ? post.createdAt.seconds * 1000 : Date.now());
            const targetViews = post.boostInfo.targetViews || 1500;
            const daysMs = (post.boostInfo.days || 1) * 24 * 60 * 60 * 1000;
            const isTimeUp = (Date.now() - boostedAt) > daysMs;
            
            if (isTimeUp && (post.views || 0) < targetViews) {
              try {
                const postRef = doc(db, "posts", post.id);
                await updateDoc(postRef, {
                  views: targetViews,
                  "boostInfo.autoFilled": true
                });
                post.views = targetViews;
                post.boostInfo.autoFilled = true;
              } catch (e) {
                console.error("Failed to auto-fill views", e);
              }
            }
          }
        }
        
        // Sort by boost start time down here since we couldn't create a composite index
        posts.sort((a: any, b: any) => {
           const timeA = a.boostInfo?.boostedAt?.seconds || a.createdAt?.seconds || 0;
           const timeB = b.boostInfo?.boostedAt?.seconds || b.createdAt?.seconds || 0;
           return timeB - timeA;
        });
        setBoostedPosts(posts);
      } catch (err) {
        console.error("Error fetching boosted posts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBoosted();
  }, [isOpen]);

  const getBoostStatus = (post: any) => {
    if (!post.boostInfo) return { isCompleted: false, isActive: false, isPending: false };
    
    if (post.boostInfo.status === 'pending') {
       return { isCompleted: false, isActive: false, isPending: true };
    }
    
    const boostedAt = post.boostInfo.boostedAt?.toMillis ? post.boostInfo.boostedAt.toMillis() : Date.now();
    const targetViews = post.boostInfo.targetViews || 1500;
    const daysMs = (post.boostInfo.days || 1) * 24 * 60 * 60 * 1000;
    const isCompleted = (Date.now() - boostedAt) > daysMs || (post.views || 0) >= targetViews;
    const isActive = !isCompleted && (post.boostInfo?.isActive ?? true);
    return { isCompleted, isActive, isPending: false };
  };

  const activeCount = boostedPosts.filter(p => getBoostStatus(p).isActive).length;
  const completedCount = boostedPosts.filter(p => getBoostStatus(p).isCompleted).length;
  const pendingCount = boostedPosts.filter(p => getBoostStatus(p).isPending).length;

  const toggleBoostStatus = async (post: any) => {
    const currentState = post.boostInfo?.isActive ?? true;
    const newState = !currentState;
    
    // Optimistic UI update
    setBoostedPosts(prev => prev.map(p => 
      p.id === post.id 
        ? { ...p, boostInfo: { ...p.boostInfo, isActive: newState } }
        : p
    ));

    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        "boostInfo.isActive": newState
      });
    } catch (err) {
      console.error("Failed to toggle boost status", err);
      // Revert optimistic update
      setBoostedPosts(prev => prev.map(p => 
        p.id === post.id 
          ? { ...p, boostInfo: { ...p.boostInfo, isActive: currentState } }
          : p
      ));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[400] bg-slate-50 dark:bg-slate-950 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-safe">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <span className="font-bold text-[17px] text-slate-900 dark:text-white flex items-center gap-1.5">
          <Rocket className="w-5 h-5 text-violet-500" />
          {language === "bn" ? "বুস্ট সেন্টার" : "Boost Center"}
        </span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status / Balance Header */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Rocket className="w-24 h-24" />
           </div>
           
           <h3 className="font-medium text-violet-100 mb-1 text-sm">
             {language === "bn" ? "মোট বুস্টেড ভিডিও" : "Total Boosted Videos"}
           </h3>
           <div className="text-3xl font-black mb-4">
               {boostedPosts.length}
           </div>
           
           <div className="flex items-center gap-4 text-sm font-medium border-t border-white/20 pt-3">
               <div>
                  <span className="text-violet-200">{language === "bn" ? "অ্যাক্টিভ:" : "Active:"}</span>{" "}
                  {activeCount}
               </div>
               <div>
                  <span className="text-violet-200">{language === "bn" ? "অপেক্ষমান:" : "Pending:"}</span>{" "}
                  {pendingCount}
               </div>
               <div>
                  <span className="text-violet-200">{language === "bn" ? "কমপ্লিট:" : "Done:"}</span>{" "}
                  {completedCount}
               </div>
           </div>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white pt-2 px-1">
          {language === "bn" ? "আপনার ক্যাম্পেইন সমূহ" : "Your Campaigns"}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
             <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : boostedPosts.length > 0 ? (
          <div className="space-y-3">
            {boostedPosts.map(post => {
               const { isCompleted, isActive, isPending } = getBoostStatus(post);
               
               const targetViews = post.boostInfo?.targetViews || 1500;
               const progress = Math.min(Math.round(((post.views || 0) / targetViews) * 100), 100);
               
               // Extract proper media/file data
               let displayContent = "";
               let fallbackFileId = post?.fileId;
               let fallbackType = post?.type;

               if (post && typeof post.content === "object" && post.content !== null) {
                 displayContent = post.content.text || "";
                 if (post.content.fileId) fallbackFileId = post.content.fileId;
                 if (post.content.type) fallbackType = post.content.type;
               } else if (post && typeof post.content === "string") {
                 displayContent = post.content;
                 if (displayContent.startsWith("{")) {
                   try {
                     const parsed = JSON.parse(displayContent);
                     displayContent = parsed.text || displayContent;
                     if (parsed.fileId && !fallbackFileId) fallbackFileId = parsed.fileId;
                     if (parsed.type && !fallbackType) fallbackType = parsed.type;
                   } catch (e) {}
                 }
               }
               
               return (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex gap-3 relative z-10">
                    <div className="w-20 h-28 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                      {fallbackFileId && (
                        fallbackType === "video" ? (
                          <video src={getApiUrl(`/api/telegram/file/${fallbackFileId}`)} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={getApiUrl(`/api/telegram/file/${fallbackFileId}`)} className="w-full h-full object-cover" />
                        )
                      )}
                    </div>
                    
                    <div className="flex-1 py-0.5 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-2">
                         <h4 className="font-semibold text-sm line-clamp-2 text-slate-900 dark:text-white leading-snug">
                           {displayContent || post.content}
                         </h4>
                      </div>
                      
                      {/* Active Status Badge */}
                      <div className="mb-auto">
                        <span className={cn(
                           "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                           isCompleted
                             ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                             : isPending
                             ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                             : isActive 
                             ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" 
                             : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", isCompleted ? "bg-blue-500" : isPending ? "bg-amber-500 animate-pulse" : isActive ? "bg-green-500 animate-pulse" : "bg-slate-400")} />
                            {isCompleted 
                               ? (language === "bn" ? "কমপ্লিট" : "Completed")
                               : isPending
                               ? (language === "bn" ? "অপেক্ষমান" : "Pending")
                               : isActive 
                               ? (language === "bn" ? "অ্যাক্টিভ" : "Active")
                               : (language === "bn" ? "পজ করা আছে" : "Paused")}
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                         <div className="flex justify-between text-[11px] font-medium mb-1">
                            <span className="text-slate-500">
                               Views: <span className="text-slate-900 dark:text-white font-bold">{post.views || 0}</span> / {targetViews}
                            </span>
                            <span className="text-violet-600 dark:text-violet-400">{progress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${progress}%` }} />
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions Matrix */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                     <button
                        onClick={() => !isCompleted && !isPending && toggleBoostStatus(post)}
                        disabled={isCompleted || isPending}
                        className={cn(
                           "flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[12px] bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                           isCompleted || isPending ? "text-slate-400" : isActive ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                        )}
                     >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : isPending ? <Pause className="w-3.5 h-3.5" /> : isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {isCompleted 
                           ? (language === "bn" ? "শেষ হয়েছে" : "Done")
                           : isPending
                           ? (language === "bn" ? "অপেক্ষমান" : "Pending")
                           : isActive 
                           ? (language === "bn" ? "পজ করুন" : "Pause")
                           : (language === "bn" ? "স্টার্ট করুন" : "Start")}
                     </button>
                     
                     <button
                        onClick={() => {
                           onClose();
                           setTimeout(() => onOpenAnalytics?.(post), 150);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[12px] text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors"
                     >
                        <BarChart2 className="w-3.5 h-3.5" />
                        {language === "bn" ? "অ্যানালিটিক্স" : "Stats"}
                     </button>
                     
                     <button
                        onClick={() => {
                           onClose();
                           setTimeout(() => onOpenBoost?.(post), 150);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[12px] text-violet-600 dark:text-violet-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors"
                     >
                        <Zap className="w-3.5 h-3.5" />
                        {language === "bn" ? "আরও বুস্ট" : "Boost +"}
                     </button>
                  </div>
                </div>
               )
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-slate-300" />
             </div>
             <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                {language === "bn" ? "কোনো বুস্ট নেই" : "No active boosts"}
             </h4>
             <p className="text-sm text-slate-500 mb-6 font-medium max-w-[200px] mx-auto leading-relaxed">
                {language === "bn" 
                  ? "আপনার কোনো ভিডিও এখন বুস্ট অবস্থায় নেই। ভিডিওকে ভাইরালে নিতে আজই বুস্ট করুন।" 
                  : "You haven't boosted any videos yet. Boost today to reach more people!"}
             </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
