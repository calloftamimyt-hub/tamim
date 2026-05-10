import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Eye, Clock, BarChart2, TrendingUp, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { getApiUrl } from "@/lib/utils";

export const VideoAnalyticsOverlay = ({
  post,
  isOpen,
  onClose,
}: {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { language } = useLanguage();

  if (!isOpen || !post) return null;

  // Fake analytics data calculation based on actual stats + randomness for demo
  const views = post.views || 0;
  const likes = post.reactionsCount || post.likes || 0;
  const shares = post.shares || 0;
  const reports = post.reportsCount || 0;
  
  const estimatedWatchTimeMins = Math.round(views * 0.45);
  const avgWatchTimeSeconds = views > 0 ? Math.round(30 + Math.random() * 40) : 0; // fake avg 30-70s
  
  const engagementRate = views > 0 ? (((likes + shares) / views) * 100).toFixed(1) : "0.0";

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
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[500] bg-white dark:bg-slate-950 flex flex-col pt-safe"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <span className="font-bold text-[17px] text-slate-900 dark:text-white flex items-center gap-1.5">
          <BarChart2 className="w-5 h-5 text-blue-500" />
          {language === "bn" ? "অ্যানালিটিক্স" : "Analytics"}
        </span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Post Summary */}
        <div className="p-4 flex gap-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-24 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden shrink-0">
            {fallbackFileId && (
              fallbackType === "video" ? (
                <video src={getApiUrl(`/api/telegram/file/${fallbackFileId}`)} className="w-full h-full object-cover" muted />
              ) : (
                <img src={getApiUrl(`/api/telegram/file/${fallbackFileId}`)} className="w-full h-full object-cover" />
              )
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug">
              {displayContent || (language === "bn" ? "পোস্ট" : "Post")}
            </h3>
            <span className="text-xs text-slate-500 mt-1">
              {post.createdAt?.seconds ? (
                formatDistanceToNow(post.createdAt.seconds * 1000, {
                  addSuffix: true,
                  locale: language === "bn" ? bn : undefined,
                })
              ) : (
                language === "bn" ? "কিছুক্ষণ আগে" : "Just now"
              )}
            </span>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{language === "bn" ? "কন্টেন্ট ভিউজ" : "Views"}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {views.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{language === "bn" ? "ওয়াচ টাইম" : "Watch Time"}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-end gap-1">
              {estimatedWatchTimeMins.toLocaleString()} <span className="text-sm font-semibold mb-1 text-slate-400">min</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="px-4 pb-6">
          <h4 className="font-bold text-slate-900 dark:text-white mb-3 mt-2">
            {language === "bn" ? "এনগেজমেন্ট বিস্তারিত" : "Engagement Details"}
          </h4>
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-900/50">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4" /> {language === "bn" ? "এনগেজমেন্ট রেট" : "Engagement Rate"}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{engagementRate}%</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-900/50">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {language === "bn" ? "লাইকস" : "Likes"}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-900/50">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {language === "bn" ? "রিপোর্টস" : "Reports"}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{reports.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {language === "bn" ? "শেয়ার" : "Shares"}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{shares.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Retention / Audience Discovery */}
        <div className="px-4 pb-8">
          <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-emerald-500" />
            {language === "bn" ? "ট্রাফিক সোর্স" : "Traffic Sources"}
          </h4>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
            
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{language === "bn" ? "আপনার প্রোফাইল" : "Your Profile"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">65%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[65%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{language === "bn" ? "ভাইরাল ফিড" : "For You Feed"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">25%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[25%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{language === "bn" ? "অন্যান্য" : "Other"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">10%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full w-[10%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
