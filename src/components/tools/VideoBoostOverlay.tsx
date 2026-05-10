import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Rocket, Zap, Clock, Coins, CheckCircle2, AlertCircle, Eye, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { cn, getApiUrl } from "@/lib/utils";

export const VideoBoostOverlay = ({
  post,
  isOpen,
  onClose,
  onOpenDeposit,
}: {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit?: () => void;
}) => {
  const { language } = useLanguage();
  const [boostDays, setBoostDays] = useState<number>(1);
  const [isBoosting, setIsBoosting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;
    const unsub = onSnapshot(doc(db, 'user_balances', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserBalance(data.depositBalance || 0);
      }
    });
    return () => unsub();
  }, [isOpen]);

  const plans = [
    { price: 50, views: "1500", days: 1 },
    { price: 150, views: "4500", days: 3 },
    { price: 350, views: "10500", days: 7 },
  ];

  const pricePerDay = 50;
  const viewsPerDay = 1500;
  
  const totalPrice = boostDays * pricePerDay;
  const targetViews = boostDays * viewsPerDay;

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

  const handleBoost = async () => {
    if (!post || userBalance < totalPrice) return;
    
    setIsBoosting(true);
    try {
      const postRef = doc(db, "posts", post.id);
      await updateDoc(postRef, {
        boostInfo: {
          amountSpent: totalPrice,
          targetViews: targetViews,
          currentViews: 0,
          days: boostDays,
          isActive: false,
          isApproved: false,
          status: 'pending',
          requestedAt: serverTimestamp(),
        }
      });
      
      // Also deduct balance
      if (auth.currentUser) {
        const balanceRef = doc(db, 'user_balances', auth.currentUser.uid);
        import('firebase/firestore').then(({ increment }) => {
          updateDoc(balanceRef, {
            depositBalance: increment(-totalPrice)
          }).catch(console.error);
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setShowConfirm(false);
      }, 2000);
    } catch (error) {
      console.error("Boost failed:", error);
      alert(language === 'bn' ? "বুস্ট করতে সমস্যা হয়েছে!" : "Failed to boost!");
    } finally {
      setIsBoosting(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[500] bg-slate-50 dark:bg-slate-950 flex flex-col pt-safe"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => {
            if (showConfirm) setShowConfirm(false);
            else onClose();
          }}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <span className="font-bold text-[17px] text-slate-900 dark:text-white flex items-center gap-1.5">
          <Rocket className="w-5 h-5 text-violet-500" />
          {language === "bn" ? "ভিডিও বুস্ট" : "Boost Video"}
        </span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Post Preview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 flex gap-3 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
            {fallbackFileId && (
              fallbackType === "video" ? (
                <video src={getApiUrl(`/api/telegram/file/${fallbackFileId}`)} className="w-full h-full object-cover" />
              ) : (
                <img src={getApiUrl(`/api/telegram/file/${fallbackFileId}`)} className="w-full h-full object-cover" />
              )
            )}
          </div>
          <div className="flex flex-col py-1 overflow-hidden">
            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug">
              {displayContent || (language === "bn" ? "ভিডিও প্রিভিউ" : "Video Preview")}
            </h3>
            {post.boostInfo?.isActive && (
              <div className="mt-2 inline-flex items-center gap-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold w-max">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {language === "bn" ? "বুস্ট চলমান" : "Active Boost"}
              </div>
            )}
          </div>
        </div>

        {/* Balance Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{language === "bn" ? "আপনার ব্যালেন্স" : "Your Balance"}</p>
              <p className="font-bold text-slate-900 dark:text-white">৳{userBalance.toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={() => {
               onClose();
               onOpenDeposit?.();
            }}
            className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            {language === "bn" ? "ডিপোজিট" : "Deposit"}
          </button>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 px-1">
            <Zap className="w-4 h-4 text-amber-500" />
            {language === "bn" ? "প্যাকেজ নির্বাচন করুন" : "Select Package"}
          </h4>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {plans.map((plan, idx) => (
              <div
                key={plan.price}
                onClick={() => setBoostDays(plan.days)}
                className={cn(
                  "relative p-4 cursor-pointer transition-all flex items-center justify-between",
                  boostDays === plan.days ? "bg-violet-50 dark:bg-violet-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  idx !== plans.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                )}
              >
                 <div className="flex items-center gap-3">
                    <div className={cn(
                       "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                       boostDays === plan.days ? "border-violet-500 bg-white dark:bg-slate-900" : "border-slate-300 dark:border-slate-600"
                    )}>
                       {boostDays === plan.days && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {plan.days} {language === "bn" ? "দিন" : "Days"}
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-bold">
                          {plan.views} {language === "bn" ? "ভিউজ" : "Views"}
                        </span>
                      </div>
                    </div>
                 </div>
                 <div className="font-black text-lg text-slate-900 dark:text-white">
                    ৳{plan.price}
                 </div>
              </div>
            ))}
          </div>
          
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 px-1 mt-6">
            <Rocket className="w-4 h-4 text-violet-500" />
            {language === "bn" ? "অথবা কাস্টম দিন সেট করুন" : "Or Custom Days"}
          </h4>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-lg py-2 px-3 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-slate-400 shrink-0" />
               <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {language === "bn" ? "কাস্টম দিন" : "Custom Days"}
                 </span>
                 <div className="flex items-center gap-1.5 mt-0.5">
                   <button 
                     onClick={() => setBoostDays((prev) => Math.max(1, prev - 1))}
                     className="w-5 h-5 rounded bg-white/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-400 active:scale-95 transition-colors shadow-sm"
                   >
                     <Minus className="w-3 h-3" />
                   </button>
                   <div className="text-sm font-black w-6 text-center text-slate-900 dark:text-white leading-none">
                      {boostDays}
                   </div>
                   <button 
                     onClick={() => setBoostDays((prev) => prev + 1)}
                     className="w-5 h-5 rounded bg-white/80 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-400 active:scale-95 transition-colors shadow-sm"
                   >
                     <Plus className="w-3 h-3" />
                   </button>
                 </div>
               </div>
             </div>
             <div className="text-right flex flex-col justify-center shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 block">
                   {language === "bn" ? "মোট খরচ" : "Total"}
                </span>
                <span className="text-lg font-black text-violet-600 dark:text-violet-400 leading-none">
                   ৳{totalPrice}
                </span>
             </div>
          </div>
          
          <div className="bg-violet-50 dark:bg-violet-500/10 rounded-xl p-4 flex items-center justify-between border border-violet-100 dark:border-violet-500/20">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-200 dark:bg-violet-500/20 flex items-center justify-center">
                   <Eye className="w-4 h-4 text-violet-700 dark:text-violet-300" />
                </div>
                <span className="font-bold text-violet-900 dark:text-violet-100">
                   {language === "bn" ? "টার্গেট ভিউজ:" : "Target Views:"}
                </span>
             </div>
             <span className="text-xl font-black text-violet-700 dark:text-violet-300">
                {(targetViews - 500).toLocaleString()} - {(targetViews + 500).toLocaleString()}+
             </span>
          </div>
        </div>

        {userBalance < totalPrice && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-start gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {language === "bn" 
              ? "অপর্যাপ্ত ব্যালেন্স। প্লিজ ডিপোজিট করুন।" 
              : "Insufficient balance. Please deposit funds."}
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-safe">
        <AnimatePresence>
          {showConfirm && !success && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm"
             >
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white">
                   <AlertCircle className="w-4 h-4 text-amber-500" />
                   {language === "bn" ? "নিশ্চিত করুন" : "Confirm Action"}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-3">
                   {language === "bn" 
                      ? `আপনার মূল ব্যালেন্স থেকে ৳${totalPrice} কাটা হবে। আপনি কি নিশ্চিত?` 
                      : `৳${totalPrice} will be deducted from your main balance. Are you sure?`}
                </p>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setShowConfirm(false)}
                     className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold rounded-lg transition-colors text-slate-700 dark:text-slate-300"
                   >
                     {language === "bn" ? "বাতিল" : "Cancel"}
                   </button>
                   <button 
                     onClick={handleBoost}
                     className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 font-bold rounded-lg transition-colors text-white"
                   >
                     {language === "bn" ? "হ্যাঁ, বুস্ট করুন" : "Yes, Boost"}
                   </button>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
        
        {success ? (
          <div className="w-full h-14 bg-amber-500 text-white rounded-xl shadow-lg flex items-center justify-center gap-2 font-bold transition-all">
            <CheckCircle2 className="w-6 h-6" />
            {language === "bn" ? "অ্যাডমিনের অনুমোদনের জন্য অপেক্ষমান!" : "Pending Admin Approval!"}
          </div>
        ) : !showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isBoosting || userBalance < totalPrice}
            className="w-full h-14 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.98]"
          >
             <Rocket className="w-5 h-5" />
             <span className="text-[16px]">{language === "bn" ? "প্রমোট করুন" : "Boost Now"}</span>
          </button>
        ) : null}
      </div>
    </motion.div>
  );
};

