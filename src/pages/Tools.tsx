import React, { useState, useEffect, useRef, useMemo } from "react";
import { OfflineImage } from "@/components/OfflineImage";
import { motion, AnimatePresence } from "motion/react";
import {
  Film,
  Send,
  CheckCircle2,
  UserPlus,
  UserMinus,
  Edit2,
  Home,
  Eye,
  Heart,
  BarChart3,
  ChevronUp,
  ChevronDown,
  User,
  Book,
  PlaySquare,
  Image as ImageIcon,
  Download,
  Hash,
  Type,
  FileText,
  Calculator,
  Edit3,
  TrendingUp,
  TrendingDown,
  Youtube,
  Facebook,
  Wrench,
  Play,
  Star,
  Video,
  Camera,
  Sparkles,
  Zap,
  PenTool,
  Calendar,
  Search,
  Brush,
  Mic,
  Volume2,
  AlignLeft,
  BarChart,
  Key,
  CalendarDays,
  Activity,
  Shield,
  Timer,
  Palette,
  QrCode,
  Braces,
  ArrowRightLeft,
  Receipt,
  Binary,
  AlignJustify,
  Percent,
  Coins,
  Clock,
  ListTodo,
  CalendarClock,
  Dices,
  Fingerprint,
  Code,
  Link,
  ShieldCheck,
  Terminal,
  FileCode,
  Smartphone,
  Banknote,
  RefreshCcw,
  Shuffle,
  LockKeyhole,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Settings,
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Share2,
  Flag,
  Trash2,
  Menu,
  X,
  LayoutGrid,
  ShieldAlert,
  ChevronRight,
  Plus,
  SquarePen,
  BookOpen,
  Clapperboard,
  BadgeCheck,
  Lock,
  Bookmark,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Rss,
  VolumeX,
  Pause,
  Rocket,
  BarChart2,
  Loader2,
  Ban,
  Store,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, getApiUrl, formatCount } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  doc,
  updateDoc,
  increment,
  where,
} from "firebase/firestore";
import { TagsGenTool } from "@/components/tools/TagsGenTool";
import { TitleGenTool } from "@/components/tools/TitleGenTool";
import { EarnCalcTool } from "@/components/tools/EarnCalcTool";
import { WordCountTool } from "@/components/tools/WordCountTool";
import { SEOTesterTool } from "@/components/tools/SEOTesterTool";
import { ChannelAuditTool } from "@/components/tools/ChannelAuditTool";
import { KeywordResTool } from "@/components/tools/KeywordResTool";
import { AgeCalcTool } from "@/components/tools/AgeCalcTool";
import { BMICalcTool } from "@/components/tools/BMICalcTool";
import { PassGenTool } from "@/components/tools/PassGenTool";
import { StopwatchTool } from "@/components/tools/StopwatchTool";
import { QRMakerTool } from "@/components/tools/QRMakerTool";
import { JSONFormatTool } from "@/components/tools/JSONFormatTool";
import { UnitConvTool } from "@/components/tools/UnitConvTool";
import { ExpenseTrackTool } from "@/components/tools/ExpenseTrackTool";
import { Base64EncodeTool } from "@/components/tools/Base64EncodeTool";
import { TipCalcTool } from "@/components/tools/TipCalcTool";
import { PomodoroTool } from "@/components/tools/PomodoroTool";
import { TodoListTool } from "@/components/tools/TodoListTool";
import { DateCalcTool } from "@/components/tools/DateCalcTool";
import { UrlEncodeTool } from "@/components/tools/UrlEncodeTool";
import { PassCheckerTool } from "@/components/tools/PassCheckerTool";
import { RegexTestTool } from "@/components/tools/RegexTestTool";
import { MDEditorTool } from "@/components/tools/MDEditorTool";
import { RandomNumTool } from "@/components/tools/RandomNumTool";
import { TextCaseTool } from "@/components/tools/TextCaseTool";
import { ProfileStatusModal } from "@/components/ProfileStatusModal";
import { VideoAnalyticsOverlay } from "@/components/tools/VideoAnalyticsOverlay";
import { VideoBoostOverlay } from "@/components/tools/VideoBoostOverlay";
import { BoostCenterModal } from "@/components/tools/BoostCenterModal";
import { DepositView } from "@/pages/features/DepositView";
import { UUIDMakerTool } from "@/components/tools/UUIDMakerTool";
import { CodeFormatTool } from "@/components/tools/CodeFormatTool";
import { DeviceInfoTool } from "@/components/tools/DeviceInfoTool";
import { SalaryCalcTool } from "@/components/tools/SalaryCalcTool";
import { TextReverserTool } from "@/components/tools/TextReverserTool";
import { WordScramblerTool } from "@/components/tools/WordScramblerTool";
import { LoremGenTool } from "@/components/tools/LoremGenTool";
import { DiscountCalcTool } from "@/components/tools/DiscountCalcTool";
import { PercentageCalcTool } from "@/components/tools/PercentageCalcTool";
import { YTThumbnailTool } from "@/components/tools/YTThumbnailTool";
import { PostContentOverlay } from "@/components/tools/PostContentOverlay";
import { ReportModal } from "@/components/tools/ReportModal";
import { MonetizationModal } from "@/components/tools/MonetizationModal";
import { ShopModal } from "@/components/tools/ShopModal";
import { ShortsFeedOverlay, isPostVideo } from "@/components/tools/ShortsFeedOverlay";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MuslimBrowser } from "@/components/MuslimBrowser";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { HelpSupportModal } from "@/components/tools/HelpSupportModal";
import { useOfflineMedia, cacheMediaForOffline } from "@/hooks/useOfflineMedia";

export const isPostActivelyBoosted = (post: any) => {
  if (post.boostInfo?.status === "approved" || post.boostInfo?.isActive) {
    const boostedAt = post.boostInfo.boostedAt?.toMillis ? post.boostInfo.boostedAt.toMillis() : (post.createdAt?.seconds ? post.createdAt.seconds * 1000 : Date.now());
    const targetViews = post.boostInfo.targetViews || 1500;
    const daysMs = (post.boostInfo.days || 1) * 24 * 60 * 60 * 1000;
    const isTimeUp = (Date.now() - boostedAt) > daysMs;
    const isCompleted = isTimeUp || (post.views || 0) >= targetViews;
    const currentIsActive = post.boostInfo?.isActive ?? true;
    return currentIsActive && !isCompleted;
  }
  return false;
};

const SOCIAL_TOOLS = [
  {
    id: "yt-thumbnail",
    title: { bn: "থাম্বনেইল ডাউনলোড", en: "YT Thumbnail" },
    icon: Youtube,
    color: "text-white",
    bg: "bg-gradient-to-br from-red-500 to-rose-600",
    comingSoon: false,
  },
  {
    id: "tags-gen",
    title: { bn: "ট্যাগ জেনারেটর", en: "Tags Gen" },
    icon: Hash,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    comingSoon: false,
  },

  {
    id: "title-gen",
    title: { bn: "টাইটেল জেনারেটর", en: "Title Gen" },
    icon: Type,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    comingSoon: false,
  },
  {
    id: "earn-calc",
    title: { bn: "আর্নিং হিসাব", en: "Earn Calc" },
    icon: Calculator,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-400 to-blue-500",
    comingSoon: false,
  },
  {
    id: "char-count",
    title: { bn: "ওয়ার্ড কাউন্ট", en: "Word Count" },
    icon: Edit3,
    color: "text-white",
    bg: "bg-gradient-to-br from-pink-400 to-rose-500",
    comingSoon: false,
  },
  {
    id: "seo-check",
    title: { bn: "এসইও টেস্টার", en: "SEO Test" },
    icon: Zap,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-600 to-slate-800",
    comingSoon: false,
  },
  {
    id: "channel-audit",
    title: { bn: "চ্যানেল অডিট", en: "Channel Audit" },
    icon: BarChart,
    color: "text-white",
    bg: "bg-gradient-to-br from-fuchsia-400 to-pink-500",
    comingSoon: false,
  },
  {
    id: "keyword-res",
    title: { bn: "কিওয়ার্ড রিসার্চ", en: "Keyword Res" },
    icon: Key,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    comingSoon: false,
  },
  {
    id: "age-calc",
    title: { bn: "বয়স ক্যালকুলেটর", en: "Age Calc" },
    icon: CalendarDays,
    color: "text-white",
    bg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    comingSoon: false,
  },
  {
    id: "bmi-calc",
    title: { bn: "বিএমআই হিসাব", en: "BMI Calc" },
    icon: Activity,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-400 to-red-500",
    comingSoon: false,
  },
  {
    id: "pass-gen",
    title: { bn: "পাসওয়ার্ড জেনারেটর", en: "Pass Gen" },
    icon: Shield,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    comingSoon: false,
  },
  {
    id: "stopwatch",
    title: { bn: "স্টপওয়াচ", en: "Stopwatch" },
    icon: Timer,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-700 to-slate-900",
    comingSoon: false,
  },
  {
    id: "qr-gen",
    title: { bn: "কিউআর মেকার", en: "QR Maker" },
    icon: QrCode,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    comingSoon: false,
  },
  {
    id: "json-format",
    title: { bn: "জেসন ফরম্যাট", en: "JSON Format" },
    icon: Braces,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-500 to-yellow-600",
    comingSoon: false,
  },
  {
    id: "unit-conv",
    title: { bn: "ইউনিট কনভার্টার", en: "Unit Convert" },
    icon: ArrowRightLeft,
    color: "text-white",
    bg: "bg-gradient-to-br from-violet-500 to-purple-600",
    comingSoon: false,
  },
  {
    id: "expense-track",
    title: { bn: "খরচ ট্র্যাকার", en: "Expenses" },
    icon: Receipt,
    color: "text-white",
    bg: "bg-gradient-to-br from-teal-400 to-emerald-600",
    comingSoon: false,
  },
  {
    id: "base64-encode",
    title: { bn: "বেস৬৪ এনকোড", en: "Base64 Enc" },
    icon: Binary,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-500 to-slate-700",
    comingSoon: false,
  },
  {
    id: "lorem-gen",
    title: { bn: "লোরেম ইপসাম", en: "Lorem Gen" },
    icon: AlignJustify,
    color: "text-white",
    bg: "bg-gradient-to-br from-stone-400 to-stone-600",
    comingSoon: false,
  },
  {
    id: "discount-calc",
    title: { bn: "ডিসকাউন্ট হিসাব", en: "Discount Calc" },
    icon: Percent,
    color: "text-white",
    bg: "bg-gradient-to-br from-red-500 to-orange-500",
    comingSoon: false,
  },
  {
    id: "tip-calc",
    title: { bn: "টিপ ক্যালকুলেটর", en: "Tip Calc" },
    icon: Coins,
    color: "text-white",
    bg: "bg-gradient-to-br from-yellow-500 to-amber-600",
    comingSoon: false,
  },
  {
    id: "pomodoro",
    title: { bn: "পোমোডোরো ক্লক", en: "Pomodoro" },
    icon: Clock,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-500 to-pink-600",
    comingSoon: false,
  },
  {
    id: "todo-list",
    title: { bn: "টু-ডু লিস্ট", en: "To-Do List" },
    icon: ListTodo,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-400 to-indigo-500",
    comingSoon: false,
  },
  {
    id: "date-calc",
    title: { bn: "দিন গণনা", en: "Date Calc" },
    icon: CalendarClock,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    comingSoon: false,
  },
  {
    id: "random-num",
    title: { bn: "র‍্যান্ডম নাম্বার", en: "Random Num" },
    icon: Dices,
    color: "text-white",
    bg: "bg-gradient-to-br from-violet-500 to-purple-600",
    comingSoon: false,
  },
  {
    id: "text-case",
    title: { bn: "টেক্সট কেস", en: "Text Case" },
    icon: Type,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    comingSoon: false,
  },
  {
    id: "uuid-gen",
    title: { bn: "ইউইউআইডি মেকার", en: "UUID Maker" },
    icon: Fingerprint,
    color: "text-white",
    bg: "bg-gradient-to-br from-gray-600 to-gray-800",
    comingSoon: false,
  },
  {
    id: "code-format",
    title: { bn: "কোড ফরম্যাটার", en: "HTML/JS Formatter" },
    icon: Code,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    comingSoon: false,
  },
  {
    id: "url-encode",
    title: { bn: "ইউআরএল এনকোডার", en: "URL Encoder" },
    icon: Link,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-400 to-blue-500",
    comingSoon: false,
  },
  {
    id: "pass-checker",
    title: { bn: "পাসওয়ার্ড চেকার", en: "Pass Checker" },
    icon: ShieldCheck,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-500 to-green-600",
    comingSoon: false,
  },
  {
    id: "regex-test",
    title: { bn: "রেজেক্স টেস্টার", en: "Regex Tester" },
    icon: Terminal,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-600 to-slate-800",
    comingSoon: false,
  },
  {
    id: "md-editor",
    title: { bn: "মার্কডাউন এডিটর", en: "MD Editor" },
    icon: FileCode,
    color: "text-white",
    bg: "bg-gradient-to-br from-purple-500 to-fuchsia-600",
    comingSoon: false,
  },
  {
    id: "device-info",
    title: { bn: "ডিভাইস ইনফো", en: "Device Info" },
    icon: Smartphone,
    color: "text-white",
    bg: "bg-gradient-to-br from-gray-500 to-slate-600",
    comingSoon: false,
  },
];

// --- Components ---

const PostSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full shimmer bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="w-24 h-3 shimmer bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-16 h-2 shimmer bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="w-full h-3 shimmer bg-slate-100 dark:bg-slate-800 rounded" />
      <div className="w-3/4 h-3 shimmer bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
    <div className="aspect-video w-full shimmer bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    <div className="flex justify-between items-center py-2">
      <div className="w-20 h-8 shimmer bg-slate-100 dark:bg-slate-800 rounded-xl" />
      <div className="w-20 h-8 shimmer bg-slate-100 dark:bg-slate-800 rounded-xl" />
      <div className="w-20 h-8 shimmer bg-slate-100 dark:bg-slate-800 rounded-xl" />
    </div>
  </div>
);

const CategorySkeleton = () => (
  <div className="grid grid-cols-4 gap-x-2 gap-y-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-1.5">
        <div className="w-11 h-11 rounded-full shimmer bg-slate-200 dark:bg-slate-800" />
        <div className="w-12 h-2 shimmer bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    ))}
  </div>
);

const AnalyticsDashboard = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalViews: 0,
    totalFollowers: 0,
    totalComments: 0,
    totalShares: 0,
    lastPostDate: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Remove automatic setIsLoading(true) to avoid skeletons
    const q = query(
      collection(db, "posts"),
      where("authorUid", "==", auth.currentUser.uid),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let likes = 0;
      let views = 0;
      let comments = 0;
      let shares = 0;
      let latestPostTime = 0;

      const dayStats: Record<string, number> = {};
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return days[d.getDay()];
      }).reverse();

      last7Days.forEach((day) => (dayStats[day] = 0));

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const l = data.reactionsCount || data.likes || 0;
        const v = data.views || 0;
        const c = data.commentsCount || 0;
        const s = data.sharesCount || 0;

        likes += l;
        views += v;
        comments += c;
        shares += s;

        if (data.createdAt) {
          const t = data.createdAt.toMillis ? data.createdAt.toMillis() : data.createdAt.seconds * 1000;
          if (t > latestPostTime) latestPostTime = t;
          
          const date = data.createdAt.toDate();
          const dayName = days[date.getDay()];
          if (dayStats[dayName] !== undefined) {
            dayStats[dayName] += v;
          }
        }
      });

      const formattedChartData = last7Days.map((day) => ({
        name: day,
        views: dayStats[day],
      }));

      setChartData(formattedChartData);

      // Fetch followers
      const followersQuery = query(
        collection(db, "follows"),
        where("following_id", "==", auth.currentUser!.uid),
      );
      const { getCountFromServer } = await import("firebase/firestore");
      const followersSnapshot = await getCountFromServer(followersQuery);

      setStats({
        totalPosts: snapshot.size,
        totalLikes: likes,
        totalViews: views,
        totalFollowers: followersSnapshot.data().count,
        totalComments: comments,
        totalShares: shares,
        lastPostDate: latestPostTime,
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading)
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl"
            />
          ))}
        </div>
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );

  const isRecentPost = Date.now() - stats.lastPostDate < 4 * 24 * 60 * 60 * 1000;
  const trendPercent = isRecentPost ? "+12.5%" : "-8.3%";
  const trendColor = isRecentPost ? "text-emerald-500" : "text-rose-500";
  const trendBg = isRecentPost ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-rose-50 dark:bg-rose-500/10";
  const TrendIcon = isRecentPost ? TrendingUp : TrendingDown;

  const engagementRate = stats.totalViews > 0 
    ? (((stats.totalLikes + stats.totalComments + stats.totalShares) / stats.totalViews) * 100).toFixed(1) 
    : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 sm:p-6 space-y-6 pb-20 overflow-x-hidden"
    >
      {/* 1. Top Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: language === "bn" ? "ভিউ" : "Views",
            value: stats.totalViews,
            icon: Eye,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-500/10",
          },
          {
            label: language === "bn" ? "লাইক" : "Likes",
            value: stats.totalLikes,
            icon: Heart,
            color: "text-rose-500",
            bg: "bg-rose-50 dark:bg-rose-500/10",
          },
          {
            label: language === "bn" ? "কমেন্ট" : "Comments",
            value: stats.totalComments,
            icon: MessageCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
          },
          {
            label: language === "bn" ? "শেয়ার" : "Shares",
            value: stats.totalShares,
            icon: Share2,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-500/10",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center mb-2",
                item.bg,
              )}
            >
              <item.icon className={cn("w-4 h-4", item.color)} />
            </div>
            <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">
              {formatCount(item.value)}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Engagement Graph & Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === "bn" ? "পারফরম্যান্স ট্রেন্ড" : "Performance Trend"}
              </h3>
              <div className="mt-2 flex items-baseline gap-2">
                 <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                    {formatCount(stats.totalViews)}
                 </span>
                 <div className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold", trendBg, trendColor)}>
                    <TrendIcon className="w-3.5 h-3.5" />
                    <span>{trendPercent}</span>
                 </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                {language === "bn" ? "গত ৭ দিনের ভিউ" : "Views over last 7 days"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-500">
                  {language === "bn" ? "ভিউ" : "Views"}
                </span>
              </div>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-violet-500" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2">
            {language === "bn" ? "গড় এঙ্গেজমেন্ট রেট" : "Avg Engagement Rate"}
          </h3>
          <div className="mt-auto">
             <div className="text-4xl font-black text-violet-500 mb-2">{engagementRate}%</div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
               {language === "bn" 
                  ? "আপনার মোট ভিউ এর তুলনায় লাইক, কমেন্ট ও শেয়ারের গড় অনুপাত।" 
                  : "Average ratio of likes, comments, and shares to your total views."}
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 3. Audience Retention */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {language === "bn" ? "অডিয়েন্স রিটেনশন" : "Audience Retention"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {language === "bn" ? "ওয়াচ টাইম রিপোর্ট" : "Watch time report"}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">
                {language === "bn" ? "গড় ওয়াচ টাইম" : "Avg. Watch Time"}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                0:45s
              </span>
            </div>
            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>0%</span>
              <span>
                {language === "bn"
                  ? "৬৫% মানুষ পুরোটা দেখেছে"
                  : "65% watched full"}
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* 4. Performance Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {language === "bn"
                  ? "পারফরম্যান্স ইনসাইটস"
                  : "Performance Insights"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {language === "bn"
                  ? "রিয়েল-টাইম স্ট্যাটাস"
                  : "Real-time status"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-emerald-500" />
              <span className="text-lg font-black text-emerald-500">20%</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 leading-tight mb-1">
              {language === "bn"
                ? "এটি আপনার অন্যান্য ভিডিওর চেয়ে ২০% ভাল পারফর্ম করছে।"
                : "It is performing 20% better than your other videos."}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Tip Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white overflow-hidden relative group">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Zap className="w-32 h-32" />
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold mb-1">
              {language === "bn" ? "সফলতার টিপস" : "Success Tip"}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {stats.totalViews > 1000
                ? language === "bn"
                  ? "আপনার ভিডিওগুলো সবার হৃদয়ে জায়গা করে নিচ্ছে! নিয়মিত ভিডিও শেয়ার করুন।"
                  : "Your videos are finding a place in hearts! Keep sharing regularly."
                : language === "bn"
                  ? "বেশি ভিউ এবং ফলোয়ার পেতে নিয়মিত এবং কোয়ালিটি ভিডিও আপলোড করুন।"
                  : "Upload regular and quality videos to gain more views and followers."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const QuickPostShort = ({ post, onClick }: { post: any; onClick: () => void }) => {
  const [hasBeenNearScreen, setHasBeenNearScreen] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isMediaError, setIsMediaError] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setHasBeenNearScreen(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px 0px" });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  let fallbackFileId = post.fileId;
  if (typeof post.content === "object" && post.content !== null) {
     if (post.content.fileId) fallbackFileId = post.content.fileId;
  } else if (typeof post.content === "string" && post.content.startsWith("{")) {
    try {
      const parsed = JSON.parse(post.content);
      if (parsed.fileId) fallbackFileId = parsed.fileId;
    } catch (e) {}
  }

  const videoSrc = useOfflineMedia(fallbackFileId, "video");

  useEffect(() => {
    if (post.allowOffline && fallbackFileId) {
      cacheMediaForOffline(fallbackFileId, "video");
    }
  }, [post.allowOffline, fallbackFileId]);

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative aspect-[9/16] bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-slate-200 dark:border-slate-800"
    >
      {!isMediaLoaded && !isMediaError && fallbackFileId && hasBeenNearScreen && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-20" />
      )}
      {isMediaError && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 z-20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-slate-400 opacity-50" />
        </div>
      )}
      {fallbackFileId && hasBeenNearScreen && (
        <video
          src={videoSrc}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
          preload="metadata"
          onLoadedData={() => setIsMediaLoaded(true)}
          onError={() => setIsMediaError(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-white">
          <Play className="w-3 h-3 fill-current" />
          <span className="text-[10px] font-bold">{formatCount(post.views || 0)}</span>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
        <Play className="w-8 h-8 text-white fill-current" />
      </div>
    </motion.div>
  );
};


export const PostCard = ({
  post,
  isOverlayOpen,
  onBoostClick,
  onAnalyticsClick,
  onVideoClick,
}: {
  post: any;
  isOverlayOpen?: boolean;
  onBoostClick?: (post: any) => void;
  onAnalyticsClick?: (post: any) => void;
  onVideoClick?: (post: any) => void;
}) => {
  const { language } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.reactionsCount || post.likes || 0);

  // Author states
  const [isVerified, setIsVerified] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isMediaError, setIsMediaError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showOtherMenu, setShowOtherMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('muslim_sathi_saved_posts') || '[]');
    setIsSaved(saved.some((p: any) => p.id === post.id));
    const blocked = JSON.parse(localStorage.getItem('muslim_sathi_blocked_users') || '[]');
    setIsBlocked(blocked.includes(post.authorUid));
  }, [post.id, post.authorUid]);

  const handleSavePost = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('muslim_sathi_saved_posts') || '[]');
      if (isSaved) {
         const filtered = saved.filter((p: any) => p.id !== post.id);
         localStorage.setItem('muslim_sathi_saved_posts', JSON.stringify(filtered));
         setIsSaved(false);
      } else {
         saved.push(post);
         localStorage.setItem('muslim_sathi_saved_posts', JSON.stringify(saved));
         setIsSaved(true);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Fetch author details
  useEffect(() => {
    let isMounted = true;
    const fetchAuthorData = async () => {
      try {
        const {
          doc,
          getDoc,
          collection,
          query,
          where,
          getCountFromServer,
          getDocs,
        } = await import("firebase/firestore");

        // Fetch verification status & avatar
        const userDoc = await getDoc(doc(db, "users", post.authorUid));
        if (isMounted && userDoc.exists()) {
          setIsVerified(userDoc.data().isVerified === true);
          if (userDoc.data().photoUrl || userDoc.data().photoURL) {
            setAuthorAvatar(userDoc.data().photoUrl || userDoc.data().photoURL);
          }
        }

        // Fetch follower count
        const followersQuery = query(
          collection(db, "follows"),
          where("following_id", "==", post.authorUid),
        );
        const followersSnapshot = await getCountFromServer(followersQuery);
        if (isMounted) setFollowerCount(followersSnapshot.data().count);

        // Fetch if current user is following
        if (auth.currentUser && auth.currentUser.uid !== post.authorUid) {
          const followingQuery = query(
            collection(db, "follows"),
            where("follower_id", "==", auth.currentUser.uid),
            where("following_id", "==", post.authorUid),
          );
          const isFollowingSnapshot = await getDocs(followingQuery);
          if (isMounted) setIsFollowing(!isFollowingSnapshot.empty);
        }
      } catch (e) {
        console.error("Error fetching author details:", e);
      }
    };
    fetchAuthorData();
    return () => {
      isMounted = false;
    };
  }, [post.authorUid, auth.currentUser]);

  // Play/Pause video based on intersection and count views
  const [hasCountedView, setHasCountedView] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenNearScreen, setHasBeenNearScreen] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    const saved = localStorage.getItem('islamic_app_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed['auto-play-video'] !== false;
      } catch (e) {
        return true;
      }
    }
    return true;
  });

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
          if (entry.isIntersecting) {
            setHasBeenNearScreen(true);
          }
        });
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [post.fileId, post.id]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isIntersecting && !isOverlayOpen) {
      const shouldAutoPlay = post.authorUid === auth.currentUser?.uid ? autoPlayEnabled : true;
      if (shouldAutoPlay) {
        videoRef.current
          .play()
          .catch((e) => console.log("Autoplay prevented", e));
      }
    } else {
      videoRef.current.pause();
    }
  }, [isIntersecting, isOverlayOpen, post.id, autoPlayEnabled, post.authorUid, hasBeenNearScreen]);

  // --- SMART WATCH TIME TRACKING ---
  const lastTrackedTime = React.useRef(0);
  const sessionWatchTime = React.useRef(0);
  const isDocumentVisible = React.useRef(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisible.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !isDocumentVisible.current) return;
    const currentTime = videoRef.current.currentTime;
    const diff = currentTime - lastTrackedTime.current;

    // Strict Rule limit: Max 1.5 second difference allowed (ignores seeking)
    if (diff > 0 && diff <= 1.5) {
      sessionWatchTime.current += diff;
    }
    lastTrackedTime.current = currentTime;
  };

  const handleSeeked = () => {
    if (videoRef.current) {
      lastTrackedTime.current = videoRef.current.currentTime;
    }
  };

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (sessionWatchTime.current >= 10 && auth.currentUser) {
        const secondsToSave = Math.floor(sessionWatchTime.current);
        sessionWatchTime.current -= secondsToSave;

        // Make watch time accumulate much slower (Youtube-style watch time scaling, 50x slower)
        const scaledSecondsToSave = Number((secondsToSave * 0.02).toFixed(3));

        import("firebase/firestore").then(({ doc, increment, setDoc }) => {
          if (post.authorUid !== auth.currentUser?.uid) {
            const userRef = doc(db, 'users', post.authorUid);
            setDoc(userRef, { watchTimeSeconds: increment(scaledSecondsToSave) }, { merge: true }).catch(console.error);
          } else {
            // Penalty: Full penalty applied for self-watching
            const userRef = doc(db, 'users', post.authorUid);
            setDoc(userRef, { 
              pageReachScore: increment(-secondsToSave),
              selfWatchPenalty: increment(secondsToSave)
            }, { merge: true }).catch(console.error);
          }
        });
      }
    }, 10000);
    return () => clearInterval(syncInterval);
  }, [post.authorUid]);
  // --- END SMART WATCH TIME TRACKING ---

  // Check if current user has already liked
  useEffect(() => {
    let unsubscribe = () => {};
    if (auth.currentUser) {
      const checkLike = async () => {
        if (!post.id) return;
        try {
          const { doc, onSnapshot } = await import("firebase/firestore");
          const userLikeRef = doc(
            db,
            `posts/${post.id}/likes`,
            auth.currentUser!.uid,
          );
          unsubscribe = onSnapshot(userLikeRef, (docSnap) => {
            setIsLiked(docSnap.exists());
          });
        } catch (e) {
          console.error(e);
        }
      };
      checkLike();
    }
    return () => unsubscribe();
  }, [post.id]);

  // Try to parse content if it's JSON or an object (to fix existing broken posts)
  let displayContent = "";
  let fallbackFileId = post.fileId;
  let fallbackType = post.type;

  if (typeof post.content === "object" && post.content !== null) {
    // If it's already an object (Firestore sometimes does this)
    displayContent = post.content.text || "";
    if (post.content.fileId) fallbackFileId = post.content.fileId;
    if (post.content.type) fallbackType = post.content.type;
  } else if (typeof post.content === "string") {
    displayContent = post.content;
    if (displayContent.startsWith("{")) {
      try {
        const parsed = JSON.parse(displayContent);
        displayContent = parsed.text || displayContent;
        if (parsed.fileId && !fallbackFileId) fallbackFileId = parsed.fileId;
        if (parsed.type && !fallbackType) fallbackType = parsed.type;
      } catch (e) {
        // Not JSON or parse failed, use as is
      }
    }
  }

  const mediaSrc = useOfflineMedia(fallbackFileId, fallbackType as "video" | "photo");

  useEffect(() => {
    if (post.allowOffline && fallbackFileId) {
      cacheMediaForOffline(fallbackFileId, fallbackType as "video" | "photo");
    }
  }, [post.allowOffline, fallbackFileId, fallbackType]);

  const handleLike = async () => {
    if (!auth.currentUser || !post.id) {
      if (!auth.currentUser)
        alert(language === "bn" ? "লগইন করুন" : "Please login");
      return;
    }

    const newIsLiked = !isLiked;
    // Optimistic UI update
    setIsLiked(newIsLiked);
    setLikes((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const { doc, setDoc, deleteDoc } = await import("firebase/firestore");
      const userLikeRef = doc(
        db,
        `posts/${post.id}/likes`,
        auth.currentUser.uid,
      );
      const postRef = doc(db, "posts", post.id);
      if (newIsLiked) {
        await setDoc(userLikeRef, {
          uid: auth.currentUser.uid,
          createdAt: new Date(),
        });
        await updateDoc(postRef, {
          reactionsCount: increment(1),
        });
      } else {
        await deleteDoc(userLikeRef);
        await updateDoc(postRef, {
          reactionsCount: increment(-1),
        });
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikes((prev) => (newIsLiked ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleFollowToggle = async () => {
    if (!auth.currentUser) {
      alert(language === "bn" ? "লগইন করুন" : "Please login");
      return;
    }

    // Optimistic UI updates
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);
    setFollowerCount((prev) =>
      newIsFollowing ? prev + 1 : Math.max(0, prev - 1),
    );

    try {
      const {
        collection,
        query,
        where,
        getDocs,
        addDoc,
        deleteDoc,
        serverTimestamp,
      } = await import("firebase/firestore");
      const followsRef = collection(db, "follows");

      if (!newIsFollowing) {
        // Was following, now unfollowing
        const q = query(
          followsRef,
          where("follower_id", "==", auth.currentUser.uid),
          where("following_id", "==", post.authorUid),
        );
        const snap = await getDocs(q);
        snap.forEach(async (docSnap) => {
          await deleteDoc(docSnap.ref);
        });
      } else {
        // Follow
        await addDoc(followsRef, {
          follower_id: auth.currentUser.uid,
          following_id: post.authorUid,
          created_at: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Follow toggling error:", err);
      // Revert state on failure
      setIsFollowing(!newIsFollowing);
      setFollowerCount((prev) =>
        newIsFollowing ? Math.max(0, prev - 1) : prev + 1,
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!post.id) return;
    setIsDeletingModalOpen(false);
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "posts", post.id));
    } catch (err) {
      console.error(err);
      alert(language === "bn" ? "মোছা সম্ভব হয়নি" : "Failed to delete");
    }
  };

  const handleEditSave = async () => {
    if (!editContent.trim() || !post.id) return;
    try {
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "posts", post.id), {
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert(language === "bn" ? "এডিট করা সম্ভব হয়নি" : "Failed to edit");
    }
  };

  const canDelete = auth.currentUser && auth.currentUser.uid === post.authorUid;

  const handleDownload = async (withLogo: boolean) => {
    if (!fallbackFileId) return;
    setIsDownloading(true);
    setShowOtherMenu(false);
    try {
      const url = getApiUrl(`/api/telegram/file/${fallbackFileId}`);
      if (fallbackType === 'photo' && withLogo) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const fontSize = Math.max(30, Math.floor(canvas.width * 0.04));
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          const padding = fontSize;
          ctx.fillText("@Halal Circle", padding, canvas.height - padding);

          canvas.toBlob((blob) => {
            if (blob) {
              const u = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = u;
              a.download = `HalalCircle_${Date.now()}.png`;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(u);
              }, 100);
            }
          }, "image/png", 1.0);
        }
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = u;
        a.download = `HalalCircle_${Date.now()}${fallbackType === 'video' ? '.mp4' : '.png'}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(u);
        }, 100);
      }
    } catch(e) {
      console.error(e);
      alert(language === 'bn' ? "ডাউনলোড করতে সমস্যা হয়েছে" : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBlockUser = () => {
    try {
      const blocked = JSON.parse(localStorage.getItem('muslim_sathi_blocked_users') || '[]');
      if (!blocked.includes(post.authorUid)) {
         blocked.push(post.authorUid);
         localStorage.setItem('muslim_sathi_blocked_users', JSON.stringify(blocked));
         setIsBlocked(true);
      }
      setShowOtherMenu(false);
    } catch (e) {
      console.error(e);
    }
  };

  if (isBlocked) {
    return null;
  }

  let avatarSrc = authorAvatar
    ? authorAvatar
    : auth.currentUser?.uid === post.authorUid && auth.currentUser?.photoURL
      ? auth.currentUser.photoURL
      : post.authorAvatarUrl && !post.authorAvatarUrl.includes("dicebear")
        ? post.authorAvatarUrl
        : null;

  if (avatarSrc?.startsWith("/api")) {
    avatarSrc = getApiUrl(avatarSrc);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 overflow-hidden border-t border-slate-100 dark:border-slate-800 relative"
    >
      {fallbackFileId && !isMediaLoaded && hasBeenNearScreen && (
        <div className="absolute inset-0 z-20 bg-white dark:bg-slate-900 w-full h-full">
          <PostSkeleton />
        </div>
      )}
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-light/20 dark:bg-primary-dark/30 flex items-center justify-center text-primary dark:text-primary-light font-bold text-lg shrink-0">
              {post.authorName ? post.authorName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                {post.authorName}
              </h4>
              <VerifiedBadge
                isVerified={isVerified}
                isOwner={false}
                size={14}
              />
              {auth.currentUser && auth.currentUser.uid !== post.authorUid && (
                <button
                  onClick={handleFollowToggle}
                  className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-3 h-3" />
                      {language === "bn" ? "আনফলো" : "Unfollow"}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      {language === "bn" ? "ফলো" : "Follow"}
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <span>
                {(isPostActivelyBoosted(post) || (post.isBoosted && !post.boostInfo)) ? (
                  <span className="text-violet-600 dark:text-violet-400">
                    {language === "bn" ? "প্রমোটেড" : "Sponsored"}
                  </span>
                ) : post.createdAt?.toDate ? (
                  new Date(post.createdAt.toDate()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                ) : (
                  "Just now"
                )}
              </span>
              <span>•</span>
              <span>
                {followerCount > 0
                  ? `${followerCount} ${language === "bn" ? "ফলোয়ার" : "followers"}`
                  : language === "bn"
                    ? "পাবলিক"
                    : "Public"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 relative">
          {!canDelete && (
             <button
                onClick={handleSavePost}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isSaved ? "text-yellow-500" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
             >
                <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
             </button>
          )}

          <button
            onClick={() => canDelete ? setShowMenu(!showMenu) : setShowOtherMenu(!showOtherMenu)}
            className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {canDelete && (
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-10 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[100]"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                      setEditContent(post.content);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    {language === "bn" ? "এডিট" : "Edit"}
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsDeletingModalOpen(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {language === "bn" ? "ডিলিট" : "Delete"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {!canDelete && (
            <AnimatePresence>
              {showOtherMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-10 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[100]"
                >
                  <button
                    onClick={handleBlockUser}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    {language === "bn" ? "ব্লক ইউজার" : "Block User"}
                  </button>
                  {fallbackFileId && (
                    <>
                      <button
                        onClick={() => handleDownload(true)}
                        disabled={isDownloading}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 disabled:opacity-50"
                      >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {language === "bn" ? "ডাউনলোড" : "Download"}
                      </button>
                      <button
                        onClick={() => handleDownload(false)}
                        disabled={isDownloading}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 disabled:opacity-50"
                      >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {language === "bn" ? "ডাউনলোড এইচডি" : "Download HD"}
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
              placeholder={
                language === "bn"
                  ? "আপনার পোস্ট লিখুন..."
                  : "Write your post..."
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {language === "bn" ? "সেভ" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {displayContent}
          </p>
        )}
      </div>

      {/* Media Area */}
      {fallbackFileId && (
        <div 
          ref={wrapperRef}
          className="bg-white dark:bg-slate-900 border-y border-slate-50 dark:border-slate-800 relative group flex flex-col overflow-hidden"
        >
          {fallbackType === "video" ? (
            <div
              className="relative w-full cursor-pointer bg-black flex items-center justify-center min-h-[200px]"
              onClick={() => {
                if (onVideoClick) {
                  onVideoClick(post);
                } else {
                  togglePlay();
                }
              }}
            >
              {!isMediaLoaded && !isMediaError && hasBeenNearScreen && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-10 flex flex-col items-center justify-center">
                    <Video className="w-10 h-10 text-slate-400 opacity-50" />
                </div>
              )}
              {isMediaError && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 z-10 flex flex-col items-center justify-center pointer-events-none">
                    <AlertTriangle className="w-10 h-10 text-slate-400 opacity-50 mb-2" />
                    <span className="text-xs text-slate-500 font-medium">{language === 'bn' ? 'লোড হতে সমস্যা হয়েছে' : 'Failed to load media'}</span>
                </div>
              )}
              {hasBeenNearScreen ? (
                <video
                  ref={videoRef}
                  preload="metadata"
                  playsInline
                  loop
                  muted={isMuted}
                  src={mediaSrc}
                  onLoadedData={() => setIsMediaLoaded(true)}
                  onError={() => setIsMediaError(true)}
                  onPlay={() => {
                    setIsPlaying(true);
                    if (!hasCountedView) {
                      setHasCountedView(true);
                      import("firebase/firestore").then(({ doc, increment, updateDoc }) => {
                        if (post.id) {
                          const postRef = doc(db, "posts", post.id);
                          updateDoc(postRef, { views: increment(1) }).catch(console.error);
                        }
                      });
                    }
                  }}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onSeeked={handleSeeked}
                  className="w-full h-auto block max-h-[80vh] object-contain bg-black"
                />
              ) : (
                <div className="flex flex-col border border-slate-200 dark:border-slate-700 items-center justify-center w-full aspect-video bg-slate-200 dark:bg-slate-800">
                   <Video className="w-10 h-10 text-slate-400 mb-2 animate-pulse" />
                </div>
              )}

              <AnimatePresence>
                {!isPlaying && hasBeenNearScreen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-sm">
                      <Play className="w-8 h-8 ml-1" fill="currentColor" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mute/Unmute toggle */}
              <button
                onClick={toggleMute}
                className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white backdrop-blur-sm hover:bg-black/80 transition-colors z-[10]"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative min-h-[200px]">
              {!isMediaLoaded && !isMediaError && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse z-10" />
              )}
              {isMediaError && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 z-10 flex flex-col items-center justify-center pointer-events-none">
                    <AlertTriangle className="w-10 h-10 text-slate-400 opacity-50 mb-2" />
                    <span className="text-xs text-slate-500 font-medium">{language === 'bn' ? 'ছবি লোড হতে সমস্যা হয়েছে' : 'Failed to load photo'}</span>
                </div>
              )}
              <img
                src={mediaSrc}
                alt="Post media"
                className={`w-full h-auto object-contain transition-opacity duration-300 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => setIsMediaLoaded(true)}
                onError={() => setIsMediaError(true)}
              />
            </div>
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 border border-white dark:border-slate-900 flex items-center justify-center">
              <ThumbsUp className="w-2 h-2 text-white fill-current" />
            </div>
            <div className="w-4 h-4 rounded-full bg-red-500 border border-white dark:border-slate-900 flex items-center justify-center">
              <Star className="w-2 h-2 text-white fill-current" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 ml-1">
            {likes}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-slate-500">
            {post.shares || 0} {language === "bn" ? "শেয়ার" : "shares"}
          </span>
          {fallbackType === "video" && (
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              {formatCount(post.views || 0)}{" "}
              {language === "bn" ? "ভিউ" : "views"}
            </span>
          )}
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-1 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/50">
        <button
          onClick={handleLike}
          className={cn(
            "w-24 py-1.5 flex items-center justify-start gap-2 rounded-xl transition-all active:scale-95",
            isLiked
              ? "text-blue-600 font-bold"
              : "text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300",
          )}
        >
          <ThumbsUp
            className={cn("w-5 h-5", isLiked && "fill-current animate-bounce")}
          />
          <span className="text-xs">{language === "bn" ? "লাইক" : "Like"}</span>
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: post.authorName,
                text: post.content,
                url: window.location.href,
              });
            } else {
              alert(
                language === "bn" ? "লিঙ্ক কপি করা হয়েছে!" : "Link copied!",
              );
            }
          }}
          className="w-24 py-1.5 flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-all active:scale-95"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-xs">
            {language === "bn" ? "শেয়ার" : "Share"}
          </span>
        </button>
        <button
          onClick={() => setShowReportModal(true)}
          className="w-24 py-1.5 flex items-center justify-end gap-2 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-all active:scale-95"
        >
          <Flag className="w-5 h-5" />
          <span className="text-xs">
            {language === "bn" ? "রিপোর্ট" : "Report"}
          </span>
        </button>
      </div>

      {/* Author Tools (Boost & Analytics) */}
      {post.authorUid === auth.currentUser?.uid && (
        <div className="px-4 pb-2 pt-0.5 flex items-center gap-2">
          <button
            onClick={() => onBoostClick?.(post)}
            className="flex-1 py-1.5 flex items-center justify-center gap-1.5 text-white bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-all active:scale-95 text-[13px] shadow-sm"
          >
            <Rocket className="w-4 h-4" />
            {language === "bn" ? "প্রমোট" : "Boost"}
          </button>
          <button
            onClick={() => onAnalyticsClick?.(post)}
            className="flex-1 py-1.5 flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-lg transition-all active:scale-95 text-[13px]"
          >
            <BarChart2 className="w-4 h-4" />
            {language === "bn" ? "অ্যানালিটিক্স" : "Analytics"}
          </button>
        </div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <ReportModal post={post} onClose={() => setShowReportModal(false)} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeletingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {language === "bn" ? "মুছে ফেলতে চান?" : "Delete Post?"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                  {language === "bn"
                    ? "এই পোস্টটি চিরতরে মুছে ফেলা হবে। আপনি কি নিশ্চিত?"
                    : "This post will be permanently deleted. Are you sure?"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeletingModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    {language === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
                  >
                    {language === "bn" ? "মুছুন" : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ProfileView = ({
  onBoostClick,
  onAnalyticsClick,
  onVideoClick,
  isOverlayOpen,
}: {
  onBoostClick?: (post: any) => void;
  onAnalyticsClick?: (post: any) => void;
  onVideoClick?: (post: any) => void;
  isOverlayOpen?: boolean;
}) => {
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    followers: 0,
    following: 0,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!auth.currentUser) return;

    // Disabled explicitly to prevent skeleton
    setIsLoading(false);

    // Fetch User Data for avatar
    const fetchUserDoc = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const pUrl = data.photoUrl || data.photoURL;
          if (pUrl) {
            setCurrentUserAvatar(
              pUrl.startsWith("/api") ? getApiUrl(pUrl) : pUrl,
            );
          }
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    };
    fetchUserDoc();

    // Fetch User Posts
    const q = query(
      collection(db, "posts"),
      where("authorUid", "==", auth.currentUser.uid),
    );

    const unsubscribePosts = onSnapshot(q, async (snapshot) => {
      let postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Only show approved posts in the profile
      postsData = postsData.filter(
        (p: any) => p.status === "approved" || !p.status,
      );

      // Sort client-side to avoid needing a composite index
      postsData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setPosts(postsData);

      let likes = 0;
      postsData.forEach((p: any) => {
        likes += p.reactionsCount || p.likes || 0;
      });

      // Fetch followers and following
      const { getCountFromServer, collection, query, where } =
        await import("firebase/firestore");
      const followersQuery = query(
        collection(db, "follows"),
        where("following_id", "==", auth.currentUser!.uid),
      );
      const followingQuery = query(
        collection(db, "follows"),
        where("follower_id", "==", auth.currentUser!.uid),
      );

      const [followersSnapshot, followingSnapshot] = await Promise.all([
        getCountFromServer(followersQuery),
        getCountFromServer(followingQuery),
      ]);

      setStats({
        totalPosts: snapshot.size,
        totalLikes: likes,
        followers: followersSnapshot.data().count,
        following: followingSnapshot.data().count,
      });
      setIsLoading(false);
    });

    return () => unsubscribePosts();
  }, []);

  if (isLoading)
    return (
      <div className="p-6 space-y-6">
        <div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20"
    >
      {/* Profile Header Card */}
      <div className="p-4 sm:p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />

          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-indigo-600 mb-4 shadow-lg active:scale-95 transition-transform">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-1">
                {currentUserAvatar || auth.currentUser?.photoURL ? (
                  <OfflineImage
                    src={currentUserAvatar || auth.currentUser?.photoURL || ""}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">
              {auth.currentUser?.displayName ||
                (language === "bn" ? "ইউজার" : "User")}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-4 py-1 bg-slate-50 dark:bg-slate-800 rounded-full">
              {auth.currentUser?.email}
            </p>

            <div className="grid grid-cols-3 gap-8 w-full max-w-xs">
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                  {formatCount(stats.totalPosts)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {language === "bn" ? "পোস্ট" : "Posts"}
                </span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-100 dark:border-slate-800 px-4">
                <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                  {formatCount(stats.followers)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  {language === "bn" ? "ফলোয়ার" : "Followers"}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                  {formatCount(stats.following)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {language === "bn" ? "ফলোইং" : "Following"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="px-6 pb-2">
        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-blue-500" />
          {language === "bn" ? "আপনার পোস্টসমূহ" : "Your Posts"}
        </h3>
      </div>

      {/* Posts Feed for Profile */}
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                <PostCard 
                  post={post} 
                  onBoostClick={(p) => onBoostClick?.(p)}
                  onAnalyticsClick={(p) => onAnalyticsClick?.(p)}
                  onVideoClick={onVideoClick}
                  isOverlayOpen={isOverlayOpen}
                />
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                {language === "bn" ? "কোন পোস্ট পাওয়া যায়নি" : "No posts found"}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

let globalPreloadedPosts: any[] = [];
let globalLastVisiblePost: any = null;
let globalIsPreloadedPostsLoading = true;
const globalPreloadListeners: Set<() => void> = new Set();
const globalSessionSalt = Math.floor(Math.random() * 1000000);

function notifyGlobalPreloadListeners() {
  globalPreloadListeners.forEach((listener) => listener());
}

try {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(20),
  );
  onSnapshot(
    q,
    (snapshot) => {
      const approvedDocs = snapshot.docs.filter((doc) => {
        const p = doc.data() as any;
        return p.status === "approved" || !p.status;
      });

      if (approvedDocs.length > 0) {
        globalLastVisiblePost = approvedDocs[approvedDocs.length - 1];
      }

      const postsData = approvedDocs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));

      const normalPosts: any[] = [];
      const boostedPosts: any[] = [];

      postsData.forEach((p: any) => {
        if (isPostActivelyBoosted(p) || (p.isBoosted && !p.boostInfo)) {
          boostedPosts.push(p);
        } else {
          normalPosts.push(p);
        }
      });

      const getSortValue = (post: any) => {
        let hash = 0;
        for (let i = 0; i < post.id.length; i++) {
          hash = post.id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const time = post.createdAt?.seconds || 0;
        const randomBoost = Math.abs(hash + globalSessionSalt) % 259200;
        return time + randomBoost;
      };

      normalPosts.sort((a, b) => getSortValue(b) - getSortValue(a));
      boostedPosts.sort((a, b) => getSortValue(b) - getSortValue(a));

      const mergedPosts: any[] = [];
      let normalIndex = 0;
      let boostedIndex = 0;

      // Interleave: 1 boosted post followed by 3 normal posts
      for (let i = 0; i < postsData.length; i++) {
        if (i % 4 === 0 && boostedIndex < boostedPosts.length) {
          mergedPosts.push(boostedPosts[boostedIndex++]);
        } else if (normalIndex < normalPosts.length) {
          mergedPosts.push(normalPosts[normalIndex++]);
        } else if (boostedIndex < boostedPosts.length) {
          mergedPosts.push(boostedPosts[boostedIndex++]);
        }
      }

      globalPreloadedPosts = mergedPosts;
      globalIsPreloadedPostsLoading = false;
      notifyGlobalPreloadListeners();
    },
    (error) => {
      console.error("Global Preload Error:", error);
      globalIsPreloadedPostsLoading = false;
      notifyGlobalPreloadListeners();
    },
  );
} catch (error) {
  console.error("Failed to initialize global feed preloader", error);
}

const LoadMoreTrigger = ({ onLoadMore, hasMore, isLoadingMore }: { onLoadMore: () => void, hasMore: boolean, isLoadingMore: boolean }) => {
  const triggerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerRef.current || !hasMore || isLoadingMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
         onLoadMore();
      }
    }, { rootMargin: "400px" });
    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoadingMore]);

  if (!hasMore) return null;

  return (
    <div ref={triggerRef} className="py-8 flex justify-center items-center">
      {isLoadingMore ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : <div className="h-2" />}
    </div>
  );
};

const SavedPostsOverlay = ({ posts, onClose, onVideoClick }: { posts: any[], onClose: () => void, onVideoClick?: (post: any) => void }) => {
  const { language } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[250] bg-white dark:bg-slate-950 flex flex-col pt-safe overflow-hidden"
    >
      <header className="sticky top-0 z-[60] bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={onClose}
            className="p-2 -ml-2 mr-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg text-slate-900 dark:text-white">
            {language === 'bn' ? 'সেভ পোস্ট' : 'Saved Posts'}
          </h1>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto pb-safe">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500 h-full">
            <Bookmark className="w-12 h-12 mb-4 opacity-20" />
            <p>{language === 'bn' ? 'কোনো সেভ করা পোস্ট নেই' : 'No saved posts found'}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard
                key={`saved-${post.id}`}
                post={post}
                onVideoClick={onVideoClick}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ToolsView = ({
  onNavigate,
}: {
  onNavigate?: (tab: string) => void;
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    "feed" | "analytics" | "tools" | "profile" | "search"
  >("feed");
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  useEffect(() => {
    if (showSavedPosts) {
      try {
        const posts = JSON.parse(localStorage.getItem('muslim_sathi_saved_posts') || '[]');
        setSavedPosts(posts);
      } catch(e) {
        console.error("Error loading saved posts", e);
      }
    }
  }, [showSavedPosts]);

  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isPostingOpen, setIsPostingOpen] = useState(false);
  const [pendingPostFile, setPendingPostFile] = useState<File | null>(null);
  const [pendingPostFileType, setPendingPostFileType] = useState<
    "video" | "photo" | null
  >(null);
  const [posts, setPosts] = useState<any[]>(globalPreloadedPosts);
  const [lastVisible, setLastVisible] = useState<any>(globalLastVisiblePost);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedShortPost, setSelectedShortPost] = useState<any>(null);
  const [isShortsFeedOpen, setIsShortsFeedOpen] = useState(false);
  const shortsContainerRef = useRef<HTMLDivElement>(null);
  const [isProfileStatusModalOpen, setIsProfileStatusModalOpen] =
    useState(false);
  const [isHelpSupportOpen, setIsHelpSupportOpen] = useState(false);
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  
  // Analytics and Boost States
  const [selectedPostForBoost, setSelectedPostForBoost] = useState<any>(null);
  const [selectedPostForAnalytics, setSelectedPostForAnalytics] = useState<any>(null);
  const [isBoostCenterModalOpen, setIsBoostCenterModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);

  // Sidebar dynamic data
  const [sidebarStats, setSidebarStats] = useState({ followers: 0, posts: 0 });
  const [sidebarUser, setSidebarUser] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser || !isSidebarOpen) return;
    let isP = true;
    const fetchData = async () => {
      try {
        const { doc, getDoc, getCountFromServer, collection, query, where } =
          await import("firebase/firestore");
        const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
        if (userDoc.exists() && isP) {
          setSidebarUser(userDoc.data());
        }
        const followersQuery = query(
          collection(db, "follows"),
          where("following_id", "==", auth.currentUser!.uid),
        );
        const followersSnapshot = await getCountFromServer(followersQuery);
        const postsQuery = query(
          collection(db, "posts"),
          where("authorUid", "==", auth.currentUser!.uid),
        );
        const postsSnapshot = await getCountFromServer(postsQuery);
        if (isP) {
          setSidebarStats({
            followers: followersSnapshot.data().count,
            posts: postsSnapshot.data().count,
          });
        }
      } catch (e) {
        console.error("Sidebar stats error", e);
      }
    };
    fetchData();
    return () => {
      isP = false;
    };
  }, [isSidebarOpen]);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mixedInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const lastScrollY = useRef(0);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "video" | "camera" | "mixed",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingPostFile(file);
      let finalType: "photo" | "video" = type === "photo" ? "photo" : "video";
      if (type === "mixed") {
        finalType = file.type.startsWith("video/") ? "video" : "photo";
      }
      setPendingPostFileType(finalType);
      setIsUploadSheetOpen(false);
      setIsPostingOpen(true);
      window.history.pushState({ view: "posting" }, "");
    }
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      cameraInputRef.current?.click();
      window.history.back();
    } catch (err) {
      console.error("Camera/Mic Permission denied or error:", err);
      cameraInputRef.current?.click();
      window.history.back();
    }
  };

  const handlePhotoClick = () => {
    photoInputRef.current?.click();
    window.history.back();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
    window.history.back();
  };

  useEffect(() => {
    // Toggle global navigation visibility when modals are open
    const isAnyModalOpen = isUploadSheetOpen || !!selectedPostForBoost || !!selectedPostForAnalytics || isBoostCenterModalOpen || isProfileStatusModalOpen || isMonetizationOpen || isShopOpen;
    const event = new CustomEvent("set-nav-visibility", {
      detail: !isAnyModalOpen,
    });
    window.dispatchEvent(event);
  }, [isUploadSheetOpen, selectedPostForBoost, selectedPostForAnalytics, isBoostCenterModalOpen, isProfileStatusModalOpen, isMonetizationOpen, isShopOpen]);

  const categories = [
    { id: "all", label: { bn: "সব", en: "All" } },
    { id: "turkey", label: { bn: "তুরস্ক", en: "Turkey" } },
    { id: "news", label: { bn: "খবর", en: "News" } },
    { id: "islamic", label: { bn: "ইসলামিক", en: "Islamic" } },
    { id: "shorts", label: { bn: "স্পিড", en: "Speed" } },
    { id: "movies", label: { bn: "মুভি", en: "Movies" } },
    { id: "mix", label: { bn: "মিক্স", en: "Mix" } },
  ];

  useEffect(() => {
    if (auth.currentUser) {
      // First set to auth provider photo
      setCurrentUserAvatar(
        auth.currentUser.photoURL
          ? auth.currentUser.photoURL.startsWith("/api")
            ? getApiUrl(auth.currentUser.photoURL)
            : auth.currentUser.photoURL
          : null,
      );

      // Then fetch latest from Firestore if exists
      const fetchUserDoc = async () => {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const userDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const pUrl = data.photoUrl || data.photoURL;
            if (pUrl) {
              setCurrentUserAvatar(
                pUrl.startsWith("/api") ? getApiUrl(pUrl) : pUrl,
              );
            }
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      };
      fetchUserDoc();
    }
  }, [auth.currentUser]);

  const [isToolsTabLoading, setIsToolsTabLoading] = useState(false);

  // Fake loading for Tools tab
  useEffect(() => {
    // Removed loading simulation to show immediately
  }, [activeTab]);

  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const handleScroll = () => {
      const currentY = mainElement.scrollTop;
      setIsScrolled(currentY > 20);

      setIsHeaderVisible(true);
      lastScrollY.current = currentY;
    };
    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [activeToolId]);

  const sessionSalt = useMemo(() => globalSessionSalt, []);

  // Fetch Posts
  useEffect(() => {
    if (selectedCategory === "all") {
      setPosts(globalPreloadedPosts);
      setLastVisible(globalLastVisiblePost);
      setHasMore(true);
      setIsPostsLoading(globalIsPreloadedPostsLoading);

      const listener = () => {
        setPosts((prev) => {
           // We only want to auto-update if we haven't loaded more pages locally
           if (prev.length <= 25) { 
             setLastVisible(globalLastVisiblePost);
             return globalPreloadedPosts;
           }
           return prev; // keep local append state
        });
        setIsPostsLoading(globalIsPreloadedPostsLoading);
      };
      globalPreloadListeners.add(listener);

      return () => {
        globalPreloadListeners.delete(listener);
      };
    } else {
      setIsPostsLoading(true);
      setHasMore(true);
      setLastVisible(null);
      const q = query(
        collection(db, "posts"),
        where("category", "==", selectedCategory),
        orderBy("createdAt", "desc"),
        limit(20),
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const approvedDocs = snapshot.docs.filter((doc) => {
            const p = doc.data() as any;
            return p.status === "approved" || !p.status;
          });
          
          if (approvedDocs.length > 0) {
            setLastVisible(approvedDocs[approvedDocs.length - 1]);
          }

          const postsData = approvedDocs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));

          const normalPosts: any[] = [];
          const boostedPosts: any[] = [];

          postsData.forEach((p: any) => {
            if (isPostActivelyBoosted(p) || (p.isBoosted && !p.boostInfo)) {
              boostedPosts.push(p);
            } else {
              normalPosts.push(p);
            }
          });

          // Randomize feed except the absolute newest
          const getSortValue = (post: any) => {
            let hash = 0;
            for (let i = 0; i < post.id.length; i++) {
              hash = post.id.charCodeAt(i) + ((hash << 5) - hash);
            }
            const time = post.createdAt?.seconds || 0;
            // Add up to 3 days of variance to randomize the position
            const randomBoost = Math.abs(hash + sessionSalt) % 259200;
            return time + randomBoost;
          };

          normalPosts.sort((a, b) => getSortValue(b) - getSortValue(a));
          boostedPosts.sort((a, b) => getSortValue(b) - getSortValue(a));

          const mergedPosts: any[] = [];
          let normalIndex = 0;
          let boostedIndex = 0;

          // Interleave: 1 boosted post followed by 3 normal posts
          for (let i = 0; i < postsData.length; i++) {
            if (i % 4 === 0 && boostedIndex < boostedPosts.length) {
              mergedPosts.push(boostedPosts[boostedIndex++]);
            } else if (normalIndex < normalPosts.length) {
              mergedPosts.push(normalPosts[normalIndex++]);
            } else if (boostedIndex < boostedPosts.length) {
              mergedPosts.push(boostedPosts[boostedIndex++]);
            }
          }

          setPosts(mergedPosts);
          setIsPostsLoading(false);
        },
        (error) => {
          console.error("Firestore Error Fetching Posts:", error);
          setIsPostsLoading(false);
          // Optionally could handle the UI error feedback here
        },
      );
      return () => unsubscribe();
    }
  }, [selectedCategory, sessionSalt]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore || !lastVisible) return;
    setIsLoadingMore(true);

    try {
      const { collection, getDocs, limit, orderBy, query, startAfter, where } = await import("firebase/firestore");
      let q;
      if (selectedCategory === "all") {
        q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(20)
        );
      } else {
        q = query(
          collection(db, "posts"),
          where("category", "==", selectedCategory),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);
      const approvedDocs = snapshot.docs.filter((doc) => {
        const p = doc.data() as any;
        return p.status === "approved" || !p.status;
      });

      if (approvedDocs.length < 20) {
        setHasMore(false);
      }
      
      if (approvedDocs.length > 0) {
        setLastVisible(approvedDocs[approvedDocs.length - 1]);
        const postsData = approvedDocs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }));

        const normalPosts: any[] = [];
        const boostedPosts: any[] = [];

        postsData.forEach((p: any) => {
          if (isPostActivelyBoosted(p) || (p.isBoosted && !p.boostInfo)) {
            boostedPosts.push(p);
          } else {
            normalPosts.push(p);
          }
        });

        // Randomize
        const getSortValue = (post: any) => {
          let hash = 0;
          for (let i = 0; i < post.id.length; i++) {
            hash = post.id.charCodeAt(i) + ((hash << 5) - hash);
          }
          const time = post.createdAt?.seconds || 0;
          const randomBoost = Math.abs(hash + sessionSalt) % 259200;
          return time + randomBoost;
        };

        normalPosts.sort((a, b) => getSortValue(b) - getSortValue(a));
        boostedPosts.sort((a, b) => getSortValue(b) - getSortValue(a));

        const mergedPosts: any[] = [];
        let normalIndex = 0;
        let boostedIndex = 0;

        for (let i = 0; i < postsData.length; i++) {
          if (i % 4 === 0 && boostedIndex < boostedPosts.length) {
            mergedPosts.push(boostedPosts[boostedIndex++]);
          } else if (normalIndex < normalPosts.length) {
            mergedPosts.push(normalPosts[normalIndex++]);
          } else if (boostedIndex < boostedPosts.length) {
            mergedPosts.push(boostedPosts[boostedIndex++]);
          }
        }

        setPosts((prev) => {
           // Basic deduplication to avoid duplicating posts due to real-time sync mixing with batch sync
           const existingIds = new Set(prev.map(p => p.id));
           const newUnique = mergedPosts.filter(p => !existingIds.has(p.id));
           return [...prev, ...newUnique];
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle visibility of App Navigation
  useEffect(() => {
    if (isPostingOpen || activeToolId || isSidebarOpen || isShortsFeedOpen) {
      window.dispatchEvent(new CustomEvent("hide-nav", { detail: true }));
    } else {
      window.dispatchEvent(new CustomEvent("hide-nav", { detail: false }));
    }

    return () => {
      window.dispatchEvent(new CustomEvent("hide-nav", { detail: false }));
    };
  }, [isPostingOpen, activeToolId, isSidebarOpen, isShortsFeedOpen]);

  // Handle hardware back button
  useEffect(() => {
    const handlePopState = () => {
      if (activeToolId !== null) {
        setActiveToolId(null);
      } else if (isPostingOpen) {
        setIsPostingOpen(false);
      } else if (isUploadSheetOpen) {
        setIsUploadSheetOpen(false);
      } else if (isHelpSupportOpen) {
        setIsHelpSupportOpen(false);
      } else if (isProfileStatusModalOpen) {
        setIsProfileStatusModalOpen(false);
      } else if (isMonetizationOpen) {
        setIsMonetizationOpen(false);
      } else if (isShopOpen) {
        setIsShopOpen(false);
      } else if (isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (isShortsFeedOpen) {
        setIsShortsFeedOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    activeToolId,
    isPostingOpen,
    isSidebarOpen,
    isUploadSheetOpen,
    isProfileStatusModalOpen,
    isHelpSupportOpen,
    isMonetizationOpen,
    isShopOpen
  ]);

  const handleOpenSidebar = () => {
    window.history.pushState({ view: "sidebar" }, "");
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    if (isSidebarOpen) {
      window.history.back(); // Triggers popstate which sets isSidebarOpen to false
    }
  };

  const handleOpenTool = (id: string) => {
    window.history.pushState({ toolOpen: id }, "");
    setActiveToolId(id);
  };

  const handleCloseTool = () => {
    if (activeToolId) {
      window.history.back(); // Pops the state, triggering handlePopState to set activeToolId to null
    }
  };

  const handleSeeAll = () => {
    setActiveTab("tools");
  };

  const handleShowAllBack = () => {
    window.history.back();
  };

  const previewTools = SOCIAL_TOOLS.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
      {/* 1. Fake Status Bar Header - Persistent background that transitions to minimal state */}
      <div
        className={cn(
          "fixed top-0 inset-x-0 h-safe bg-white dark:bg-slate-900 z-[201] transition-all duration-300",
          !isHeaderVisible
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800"
            : "border-none",
        )}
      />

      {/* 2. Main Header - Fixed at top */}
      <header
        className={cn(
          "w-full bg-white dark:bg-slate-900 transition-all z-[140] fixed top-0 pt-safe duration-300",
          (!isHeaderVisible || activeToolId || isPostingOpen || !!selectedPostForBoost || !!selectedPostForAnalytics || isBoostCenterModalOpen || isShortsFeedOpen) && "-translate-y-full",
          activeToolId
            ? "inset-x-0 pb-3 shadow-sm border-b border-slate-100 dark:border-slate-800 z-[170] px-6"
            : "border-none",
        )}
      >
        {!activeToolId ? (
          <div className="flex flex-col w-full">
            {/* Top Row: Brand and Menu */}
            <div className="flex items-center justify-between pl-4 pr-6 h-[52px]">
              <h1 className="text-[26px] font-black text-blue-600 dark:text-blue-500 tracking-tighter">
                Halal Circle
              </h1>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    window.history.pushState({ view: "upload-sheet" }, "");
                    setIsUploadSheetOpen(true);
                  }}
                  className="w-[24px] h-[24px] flex items-center justify-center text-white dark:text-black transition-colors active:scale-95 rounded-full bg-black dark:bg-white shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenSidebar}
                  className="w-10 h-10 flex items-center justify-center text-slate-900 dark:text-white transition-colors hover:text-blue-600"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Bottom Row: Navigation Tabs */}
            <div className="flex items-center justify-around w-full border-t border-slate-50 dark:border-slate-800/40">
              <button
                onClick={() => setActiveTab("feed")}
                className="flex-1 flex flex-col items-center h-10 justify-center relative"
              >
                <Home
                  className={cn(
                    "w-[22px] h-[22px] transition-colors",
                    activeTab === "feed"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400",
                  )}
                />
                {activeTab === "feed" && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-0 h-[3px] w-full bg-blue-600 rounded-t-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className="flex-1 flex flex-col items-center h-10 justify-center relative"
              >
                <Activity
                  className={cn(
                    "w-[22px] h-[22px] transition-colors",
                    activeTab === "analytics"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400",
                  )}
                />
                {activeTab === "analytics" && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-0 h-[3px] w-full bg-blue-600 rounded-t-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className="flex-1 flex flex-col items-center h-10 justify-center relative"
              >
                <LayoutGrid
                  className={cn(
                    "w-[22px] h-[22px] transition-colors",
                    activeTab === "tools"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400",
                  )}
                />
                {activeTab === "tools" && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-0 h-[3px] w-full bg-blue-600 rounded-t-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className="flex-1 flex flex-col items-center h-10 justify-center relative"
              >
                <User
                  className={cn(
                    "w-[22px] h-[22px] transition-colors",
                    activeTab === "profile"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400",
                  )}
                />
                {activeTab === "profile" && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-0 h-[3px] w-full bg-blue-600 rounded-t-full"
                  />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full h-14">
            <button
              onClick={() => {
                if (activeToolId) {
                  handleCloseTool();
                }
              }}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-900 dark:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate flex-1 leading-none">
              {
                SOCIAL_TOOLS.find((t) => t.id === activeToolId)?.title[
                  language === "bn" ? "bn" : "en"
                ]
              }
            </h1>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {activeToolId === "yt-thumbnail" ? (
          <motion.div
            key="yt-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[145] bg-slate-50 dark:bg-slate-950"
          >
            <YTThumbnailTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "tags-gen" ? (
          <motion.div
            key="tags-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <TagsGenTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "title-gen" ? (
          <motion.div
            key="title-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <TitleGenTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "earn-calc" ? (
          <motion.div
            key="earn-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <EarnCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "char-count" ? (
          <motion.div
            key="word-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <WordCountTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "seo-check" ? (
          <motion.div
            key="seo-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <SEOTesterTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "channel-audit" ? (
          <motion.div
            key="channel-audit-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <ChannelAuditTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "keyword-res" ? (
          <motion.div
            key="keyword-res-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <KeywordResTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "age-calc" ? (
          <motion.div
            key="age-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <AgeCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "bmi-calc" ? (
          <motion.div
            key="bmi-tool-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <BMICalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "pass-gen" ? (
          <motion.div
            key="pass-gen-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <PassGenTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "stopwatch" ? (
          <motion.div
            key="stopwatch-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <StopwatchTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "qr-gen" ? (
          <motion.div
            key="qr-gen-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <QRMakerTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "json-format" ? (
          <motion.div
            key="json-format-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <JSONFormatTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "unit-conv" ? (
          <motion.div
            key="unit-conv-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <UnitConvTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "expense-track" ? (
          <motion.div
            key="expense-track-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <ExpenseTrackTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "base64-encode" ? (
          <motion.div
            key="base64-encode-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <Base64EncodeTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "tip-calc" ? (
          <motion.div
            key="tip-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <TipCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "pomodoro" ? (
          <motion.div
            key="pomodoro-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <PomodoroTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "todo-list" ? (
          <motion.div
            key="todo-list-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <TodoListTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "date-calc" ? (
          <motion.div
            key="date-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <DateCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "url-encode" ? (
          <motion.div
            key="url-encode-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <UrlEncodeTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "pass-checker" ? (
          <motion.div
            key="pass-checker-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <PassCheckerTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "regex-test" ? (
          <motion.div
            key="regex-test-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <RegexTestTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "md-editor" ? (
          <motion.div
            key="md-editor-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <MDEditorTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "random-num" ? (
          <motion.div
            key="random-num-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <RandomNumTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "text-case" ? (
          <motion.div
            key="text-case-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <TextCaseTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "uuid-gen" ? (
          <motion.div
            key="uuid-gen-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <UUIDMakerTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "code-format" ? (
          <motion.div
            key="code-format-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <CodeFormatTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "device-info" ? (
          <motion.div
            key="device-info-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <DeviceInfoTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "salary-calc" ? (
          <motion.div
            key="salary-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <SalaryCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "text-reverse" ? (
          <motion.div
            key="text-reverse-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <TextReverserTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "word-scramble" ? (
          <motion.div
            key="word-scramble-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <WordScramblerTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "lorem-gen" ? (
          <motion.div
            key="lorem-gen-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <LoremGenTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "discount-calc" ? (
          <motion.div
            key="discount-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950"
          >
            <DiscountCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : activeToolId === "percent-calc" ? (
          <motion.div
            key="percent-calc-view"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[145] bg-slate-50 dark:bg-slate-950"
          >
            <PercentageCalcTool onBack={handleCloseTool} />
          </motion.div>
        ) : (
          <motion.div
            key="tools-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-slate-50 dark:bg-slate-950"
          >
            <div className="flex flex-col w-full mx-auto max-w-2xl">
              <div className="pt-safe">
                <div className="transition-all duration-300 pt-[92px]">
                  {activeTab === "analytics" && !activeToolId ? (
                    <AnalyticsDashboard />
                  ) : activeTab === "profile" && !activeToolId ? (
                    <ProfileView 
                      onBoostClick={(p) => setSelectedPostForBoost(p)}
                      onAnalyticsClick={(p) => setSelectedPostForAnalytics(p)}
                      isOverlayOpen={
                        isShortsFeedOpen ||
                        isUploadSheetOpen ||
                        isPostingOpen ||
                        isSidebarOpen ||
                        isProfileStatusModalOpen ||
                        isHelpSupportOpen ||
                        activeToolId !== null ||
                        !!selectedPostForBoost ||
                         !!selectedPostForAnalytics
                      }
                      onVideoClick={(p) => {
                        if (isPostVideo(p)) {
                          setSelectedShortPost(p);
                          window.history.pushState({ view: "shorts" }, "");
                          setIsShortsFeedOpen(true);
                        }
                      }}
                    />
                  ) : activeTab === "search" && !activeToolId ? (
                    <MuslimBrowser
                      language={language}
                      onBack={() => setActiveTab("feed")}
                    />
                  ) : activeTab === "tools" && !activeToolId ? (
                    <div className="flex-1 p-4 pb-32">
                      <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                        {SOCIAL_TOOLS.map((tool) => (
                           <button
                             key={tool.id}
                             onClick={() => handleOpenTool(tool.id)}
                             className="relative flex flex-col items-center gap-1.5 group"
                           >
                             <div
                               className={cn(
                                 "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                                 tool.bg,
                                 "group-hover:scale-110 active:scale-95",
                               )}
                             >
                               <tool.icon className="w-5 h-5 text-white" />
                             </div>
                             <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight truncate w-full px-0.5">
                               {language === "bn"
                                 ? tool.title.bn
                                 : tool.title.en}
                             </span>
                           </button>
                         ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Attached "What's on your mind?" - Attached directly with border-t */}
                      <div className="bg-white dark:bg-slate-900 px-4 pt-3 pb-2">
                        <button
                          onClick={() => mixedInputRef.current?.click()}
                          className="w-full flex items-center gap-3 active:scale-95 transition-transform text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {currentUserAvatar ? (
                              <img
                                src={currentUserAvatar}
                                alt="Avatar"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-light/20 dark:bg-primary-dark/30 text-primary dark:text-primary-light font-bold text-lg">
                                {auth.currentUser?.displayName
                                  ? auth.currentUser.displayName
                                      .charAt(0)
                                      .toUpperCase()
                                  : "U"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-full py-2.5 px-4 text-slate-400 dark:text-slate-500 text-base font-medium border border-slate-100 dark:border-slate-800">
                            {language === "bn"
                              ? "আপনার মনে কি আছে?"
                              : "What's on your mind?"}
                          </div>
                          <div className="flex items-center justify-center w-10 h-10 shrink-0">
                            <ImageIcon className="w-6 h-6 text-emerald-500" />
                          </div>
                        </button>
                      </div>

                      {/* Categories Bar */}
                      <div className="w-full overflow-x-auto hide-scrollbar h-12 px-4 flex items-center gap-2 border-none bg-white dark:bg-slate-900 transition-all duration-300">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                              "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                              selectedCategory === cat.id
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700",
                            )}
                          >
                            {cat.label[language === "bn" ? "bn" : "en"]}
                          </button>
                        ))}
                      </div>

                      {/* Posts Feed Section */}
                      <div className="pb-0 flex flex-col border-t border-slate-100 dark:border-slate-800">
                        <AnimatePresence initial={false}>
                          {posts.length > 0 ? (
                            selectedCategory === "shorts" ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-950 min-h-[60vh] pb-24">
                                {posts
                                  .filter((p: any) => isPostVideo(p))
                                  .map((post) => (
                                    <QuickPostShort
                                      key={post.id}
                                      post={post}
                                      onClick={() => {
                                        setSelectedShortPost(post);
                                        window.history.pushState({ view: "shorts" }, "");
                                        setIsShortsFeedOpen(true);
                                      }}
                                    />
                                  ))}
                              </div>
                            ) : (
                              posts.map((post) => (
                                <div
                                  key={post.id}
                                  className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden"
                                >
                                  <PostCard
                                    post={post}
                                    onBoostClick={(p) => setSelectedPostForBoost(p)}
                                    onAnalyticsClick={(p) => setSelectedPostForAnalytics(p)}
                                    onVideoClick={(p) => {
                                      // Check if it's a video before overriding click behavior
                                      if (isPostVideo(p)) {
                                        setSelectedShortPost(p);
                                        window.history.pushState({ view: "shorts" }, "");
                                        setIsShortsFeedOpen(true);
                                      }
                                    }}
                                    isOverlayOpen={
                                      isShortsFeedOpen ||
                                      isUploadSheetOpen ||
                                      isPostingOpen ||
                                      isSidebarOpen ||
                                      isProfileStatusModalOpen ||
                                      isHelpSupportOpen ||
                                      activeToolId !== null ||
                                      selectedPostForBoost !== null ||
                                      selectedPostForAnalytics !== null ||
                                      isBoostCenterModalOpen ||
                                      isShortsFeedOpen
                                    }
                                  />
                                </div>
                              ))
                            )
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-white dark:bg-slate-900 p-12 text-center border-b border-slate-100 dark:border-slate-800"
                            >
                              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-slate-300" />
                              </div>
                              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">
                                {language === "bn"
                                  ? "কোন পোস্ট নেই"
                                  : "No posts yet"}
                              </h3>
                              <p className="text-xs font-medium text-slate-400">
                                {language === "bn"
                                  ? "প্রথম পোস্টটি আপনিই করুন!"
                                  : "Be the first to post something!"}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Pagination Trigger */}
                        {posts.length > 0 && (
                           <LoadMoreTrigger 
                              onLoadMore={loadMorePosts} 
                              hasMore={hasMore} 
                              isLoadingMore={isLoadingMore} 
                           />
                        )}
                        
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Sheet (Facebook Style Dropdown) */}
      <AnimatePresence>
        {isUploadSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (isUploadSheetOpen) window.history.back();
              }}
              className="fixed inset-0 bg-black/40 z-[300]"
            />
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: -10,
                transformOrigin: "top right",
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="fixed right-4 w-36 bg-white dark:bg-slate-900 z-[301] rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 overflow-hidden"
              style={{
                top: "calc(62px + env(safe-area-inset-top, 0px))",
              }}
            >
              <div className="flex flex-col py-2">
                <button
                  onClick={handleCameraClick}
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Camera className="w-4 h-4 text-black dark:text-white" />
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {language === "bn" ? "ক্যামেরা" : "Camera"}
                  </span>
                </button>

                <button
                  onClick={handlePhotoClick}
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-black dark:text-white" />
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {language === "bn" ? "ফটো" : "Photo"}
                  </span>
                </button>

                <button
                  onClick={handleVideoClick}
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Video className="w-4 h-4 text-black dark:text-white" />
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {language === "bn" ? "ভিডিও" : "Video"}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "camera")}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "photo")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "video")}
      />
      <input
        ref={mixedInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "mixed")}
      />

      <AnimatePresence>
        {isPostingOpen && (
          <PostContentOverlay
            initialFile={pendingPostFile}
            initialFileType={pendingPostFileType}
            onClose={() => {
              window.history.back();
              setIsPostingOpen(false);
              setPendingPostFile(null);
              setPendingPostFileType(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseSidebar}
              className="fixed inset-0 bg-black/50 z-[190]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-[200] shadow-2xl flex flex-col pt-safe overflow-hidden"
            >
              {/* Profile Header */}
              <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200 dark:border-slate-700">
                  {currentUserAvatar ||
                  sidebarUser?.photoURL ||
                  sidebarUser?.photoUrl ? (
                    <img
                      src={(() => {
                        const url =
                          currentUserAvatar ||
                          sidebarUser?.photoURL ||
                          sidebarUser?.photoUrl;
                        return url?.startsWith("/api") ? getApiUrl(url) : url;
                      })()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h2 className="font-bold text-lg leading-tight text-slate-900 dark:text-white truncate">
                    {sidebarUser?.username ||
                      sidebarUser?.displayName ||
                      auth.currentUser?.displayName ||
                      "MuslimFeed User"}
                  </h2>
                  {(sidebarUser?.isVerified || sidebarUser?.blueBadge) && (
                    <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sidebarStats.followers}
                    </span>
                    <span className="text-sm text-slate-500">
                      {language === "bn" ? "ফলোয়ার" : "Followers"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {sidebarStats.posts}
                    </span>
                    <span className="text-sm text-slate-500">
                      {language === "bn" ? "পোস্ট" : "Posts"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-1">
                {/* All Tools changed to generic button or keep? Let's just keep All Tools if they want. */}
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-3 mb-1 mt-2">
                  {language === "bn" ? "ম্যানেজমেন্ট" : "Management"}
                </h3>

                <button
                  onClick={() => {
                    handleCloseSidebar();
                    setTimeout(() => {
                      window.history.pushState({ view: "monetization" }, "");
                      setIsMonetizationOpen(true);
                    }, 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center relative">
                    <Coins className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200 flex-1">
                    {language === "bn" ? "মনিটাইজেশন" : "Monetization"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleCloseSidebar();
                    setTimeout(() => {
                      window.history.pushState({ view: "shop" }, "");
                      setIsShopOpen(true);
                    }, 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center relative">
                    <Store className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200 flex-1">
                    {language === "bn" ? "শপ" : "Shop"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleCloseSidebar();
                    setTimeout(() => {
                      window.history.pushState({ view: "profile-status" }, "");
                      setIsProfileStatusModalOpen(true);
                    }, 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200 flex-1">
                    {language === "bn"
                      ? "প্রোফাইল স্ট্যাটাস"
                      : "Profile Status"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleCloseSidebar();
                    setTimeout(() => {
                      setIsBoostCenterModalOpen(true);
                    }, 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-full bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200 flex-1">
                    {language === "bn"
                      ? "বুস্ট সেন্টার"
                      : "Boost Center"}
                  </span>
                </button>

                <div className="h-px w-full bg-slate-100 dark:bg-slate-800/60 my-2" />

                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-3 mb-1 mt-1">
                  {language === "bn" ? "অন্যান্য" : "More"}
                </h3>

                <button
                  onClick={() => {
                    handleCloseSidebar();
                    setTimeout(() => setShowSavedPosts(true), 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200 flex-1">
                    {language === "bn" ? "সেভ পোস্ট" : "Save post"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleCloseSidebar();
                    setTimeout(() => handleSeeAll(), 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200 flex-1">
                    {language === "bn" ? "সকল টুলস" : "All Tools"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleCloseSidebar();
                    setTimeout(() => onNavigate?.("settings"), 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200 flex-1">
                    {language === "bn" ? "সেটিংস" : "Settings"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleCloseSidebar();
                    setTimeout(() => {
                      window.history.pushState({ view: "help-support" }, "");
                      setIsHelpSupportOpen(true);
                    }, 50);
                  }}
                  className="w-full px-3 py-3 flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-200 flex-1">
                    {language === "bn" ? "সাহায্য ও সাপোর্ট" : "Help & Support"}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shorts/Speed Full Feed Overlay */}
      <AnimatePresence>
        {isShortsFeedOpen && (
          <ShortsFeedOverlay
            posts={posts.filter((p: any) => isPostVideo(p))}
            initialPost={selectedShortPost}
            onClose={() => setIsShortsFeedOpen(false)}
            isOverlayOpen={
              isUploadSheetOpen ||
              isPostingOpen ||
              isSidebarOpen ||
              isProfileStatusModalOpen ||
              isHelpSupportOpen ||
              activeToolId !== null ||
              selectedPostForBoost !== null ||
              selectedPostForAnalytics !== null ||
              isBoostCenterModalOpen ||
              isMonetizationOpen ||
              isShopOpen
            }
          />
        )}
      </AnimatePresence>

      <ProfileStatusModal
        isOpen={isProfileStatusModalOpen}
        onClose={() => {
          if (isProfileStatusModalOpen) window.history.back();
        }}
        userProfile={sidebarUser || auth.currentUser}
        onOpenSupport={() => {
          setIsProfileStatusModalOpen(false);
          setIsHelpSupportOpen(true);
        }}
      />

      <HelpSupportModal
        isOpen={isHelpSupportOpen}
        onClose={() => {
          if (isHelpSupportOpen) window.history.back();
        }}
      />
      
      <AnimatePresence>
        {selectedPostForBoost && (
          <VideoBoostOverlay
            post={selectedPostForBoost}
            isOpen={!!selectedPostForBoost}
            onClose={() => setSelectedPostForBoost(null)}
            onOpenDeposit={() => setIsDepositModalOpen(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPostForAnalytics && (
          <VideoAnalyticsOverlay
            post={selectedPostForAnalytics}
            isOpen={!!selectedPostForAnalytics}
            onClose={() => setSelectedPostForAnalytics(null)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isDepositModalOpen && (
           <DepositView 
              onBack={() => setIsDepositModalOpen(false)}
           />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBoostCenterModalOpen && (
          <BoostCenterModal
            isOpen={isBoostCenterModalOpen}
            onClose={() => setIsBoostCenterModalOpen(false)}
            onOpenAnalytics={(post) => setSelectedPostForAnalytics(post)}
            onOpenBoost={(post) => setSelectedPostForBoost(post)}
          />
        )}
      </AnimatePresence>

      <MonetizationModal 
        isOpen={isMonetizationOpen}
        onClose={() => {
            if (isMonetizationOpen) window.history.back();
        }}
      />

      <ShopModal 
        isOpen={isShopOpen}
        onClose={() => {
            if (isShopOpen) window.history.back();
        }}
      />

      <AnimatePresence>
        {showSavedPosts && (
          <SavedPostsOverlay
            posts={savedPosts}
            onClose={() => setShowSavedPosts(false)}
            onVideoClick={(post) => {
              setSelectedShortPost(post);
              setIsShortsFeedOpen(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
