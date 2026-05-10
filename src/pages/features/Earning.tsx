import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Smartphone,
  Zap,
  ShoppingBag,
  Tag,
  Keyboard,
  MousePointer2,
  Trophy,
  Eye,
  FileText,
  Mail,
  Facebook,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Wallet,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  LogIn,
  ShieldAlert,
  Menu,
  X,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  DollarSign,
  Loader2,
  Bell,
  Send,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  BookOpen,
  Lightbulb,
  Cpu,
  ShieldCheck,
  Moon,
  Star,
  ChevronDown,
  ChevronUp,
  Timer,
  Lock,
  Phone,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  Gamepad2,
  PlayCircle,
} from "lucide-react";
import { cn, getApiUrl } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { MobileRechargeView } from "./MobileRechargeView";
import { DriveOfferView } from "./DriveOfferView";
import { TypingJobView } from "./TypingJobView";
import { MicroJobView } from "./MicroJobView";
import { JobPostView } from "./JobPostView";
import { QuizJobView } from "./QuizJobView";
import { AdJobView } from "./AdJobView";
import { DepositView } from "./DepositView";
import { WithdrawView } from "./WithdrawView";
import { AccountVerificationView } from "./AccountVerificationView";
import { LegalPageView } from "./LegalPageView";
import { QuizView, ALL_QUIZZES, UnifiedQuiz, useQuizProgress } from "./Quiz";
import { SudokuGame } from "./SudokuGame";
import { CreatorStudioView } from "./CreatorStudioView";
import { showInterstitialAd } from "@/lib/admob";
import { earningService, EarningHistory } from "@/services/earningService";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  setDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
  clearIndexedDbPersistence,
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "@/lib/firebase";

import { Capacitor } from "@capacitor/core";

import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ReferAndEarn } from "@/components/ReferAndEarn";

interface EarningViewProps {
  onBack: () => void;
  setActiveTab?: (tab: string) => void;
}

interface UserBalance {
  totalEarned: number;
  currentBalance: number;
  depositBalance?: number;
}

const EARNING_CATEGORIES = [
  {
    id: "creator-studio",
    icon: PlayCircle,
    color: "text-white",
    bg: "bg-gradient-to-br from-red-500 to-rose-600",
  },
  {
    id: "mobile-recharge",
    icon: Smartphone,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-400 to-blue-600",
  },
  {
    id: "drive-offer",
    icon: Zap,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  {
    id: "reselling",
    icon: ShoppingBag,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-400 to-teal-600",
    comingSoon: true,
  },
  {
    id: "brand-job",
    icon: Tag,
    color: "text-white",
    bg: "bg-gradient-to-br from-purple-400 to-indigo-600",
    comingSoon: true,
  },
  {
    id: "typing-job",
    icon: Keyboard,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-400 to-pink-600",
  },
  {
    id: "micro-job",
    icon: MousePointer2,
    color: "text-white",
    bg: "bg-gradient-to-br from-indigo-400 to-blue-600",
  },
  {
    id: "quiz",
    icon: Trophy,
    color: "text-white",
    bg: "bg-gradient-to-br from-yellow-400 to-orange-500",
  },
  {
    id: "ad-view",
    icon: Eye,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-400 to-blue-500",
  },
  {
    id: "job-post",
    icon: FileText,
    color: "text-white",
    bg: "bg-gradient-to-br from-orange-400 to-red-500",
  },
  {
    id: "course",
    icon: BookOpen,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-500 to-indigo-700",
    comingSoon: true,
  },
  {
    id: "skill",
    icon: Lightbulb,
    color: "text-white",
    bg: "bg-gradient-to-br from-yellow-400 to-amber-600",
    comingSoon: true,
  },
  {
    id: "it-service",
    icon: Cpu,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-500 to-blue-700",
    comingSoon: true,
  },
];

function IslamicScene() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-10">
      <div className="absolute bottom-0 left-0 w-full h-full">
        <svg
          viewBox="0 0 800 200"
          className="w-full h-full absolute bottom-0"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 L0,150 C100,80 200,180 300,140 C400,100 500,180 600,130 C700,80 800,160 800,160 L800,200 Z"
            fill="currentColor"
          />
        </svg>
        <div className="absolute bottom-4 left-10">
          <Moon className="w-12 h-12 text-white rotate-12" />
        </div>
        <div className="absolute bottom-8 right-20">
          <Star className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function EarningView({ onBack }: EarningViewProps) {
  const { t, language } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [history, setHistory] = useState<EarningHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hotJobs, setHotJobs] = useState<any[]>([]);
  const [loadingHotJobs, setLoadingHotJobs] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [showBalance, setShowBalance] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<
    {
      id: string | number;
      title: string;
      image: string;
      redirectLink?: string;
    }[]
  >([]);

  useEffect(() => {
    const q = query(
      collection(db, "ads"),
      where("active", "==", true),
      where("category", "in", ["earning", "all"]),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedBanners = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      if (fetchedBanners.length > 0) {
        setBanners(
          fetchedBanners.map((b) => ({
            id: b.id,
            title:
              b.title || (language === "bn" ? "বিশেষ অফার" : "Special Offer"),
            image: b.imageUrl,
            redirectLink: b.redirectLink,
          })),
        );
      } else {
        setBanners([
          {
            id: 1,
            title:
              language === "bn"
                ? "প্রতিদিন কুইজ খেলুন এবং জিতে নিন আকর্ষণীয় পুরস্কার!"
                : "Play daily quiz and win attractive rewards!",
            image: "https://picsum.photos/seed/promo1/900/300",
          },
          {
            id: 2,
            title:
              language === "bn"
                ? "বন্ধুদের রেফার করুন এবং বোনাস আয় করুন!"
                : "Refer friends and earn bonus rewards!",
            image: "https://picsum.photos/seed/promo2/900/300",
          },
          {
            id: 3,
            title:
              language === "bn"
                ? "নতুন মাইক্রো জবস এখন লাইভ - কাজ শুরু করুন!"
                : "New Micro Jobs are now live - Start working!",
            image: "https://picsum.photos/seed/promo3/900/300",
          },
          {
            id: 4,
            title:
              language === "bn"
                ? "আপনার ব্যালেন্স বিকাশ বা নগদে উইথড্র করুন সহজ উপায়ে"
                : "Withdraw your balance easily via bKash or Nagad",
            image: "https://picsum.photos/seed/promo4/900/300",
          },
        ]);
      }
    });
    return () => unsub();
  }, [language]);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleAdClick = (redirectLink?: string) => {
    if (!redirectLink) return;

    // Special handling for WhatsApp and Phone
    if (
      redirectLink.startsWith("https://wa.me/") ||
      redirectLink.startsWith("tel:")
    ) {
      window.location.href = redirectLink;
    } else if (redirectLink.match(/^\d+$/)) {
      // Just a number, treat as phone
      window.location.href = `tel:${redirectLink}`;
    } else {
      // Regular URL
      window.open(
        redirectLink.startsWith("http")
          ? redirectLink
          : `https://${redirectLink}`,
        "_blank",
      );
    }
  };

  const [selectedPlayQuiz, setSelectedPlayQuiz] = useState<UnifiedQuiz | null>(
    null,
  );

  const { progress, markQuizPlayed } = useQuizProgress();
  const [now, setNow] = useState(Date.now());
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const availableQuizzes = useMemo(() => {
    return ALL_QUIZZES.filter((q) => !progress.playedQuizzes[q.id]);
  }, [progress.playedQuizzes]);

  // Handle answering
  const handleAnswer = (idx: number) => {
    if (isAnswered || !selectedPlayQuiz) return;
    setIsAnswered(true);
    setSelectedOption(idx);

    // Auto close and mark after a short delay
    setTimeout(() => {
      markQuizPlayed(selectedPlayQuiz.id);
      setSelectedPlayQuiz(null);
      setIsAnswered(false);
      setSelectedOption(null);
    }, 1500);
  };

  // Listen for auth changes
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Fetch Verification Status
  useEffect(() => {
    if (!currentUser) {
      setIsVerified(undefined);
      return;
    }
    // Listen to users collection as the master record for verification (controllable via admin panel)
    const unsub = onSnapshot(doc(db, "users", currentUser.uid), async (userSnap) => {
      if (userSnap.exists()) {
        const verified = userSnap.data()?.isVerified || false;
        setIsVerified(verified);

        // If the admin un-verified the user (verified is false),
        // we must sync this down to the account_verifications document
        if (!verified) {
          try {
            const avRef = doc(db, "account_verifications", currentUser.uid);
            const avDoc = await getDoc(avRef);
            if (avDoc.exists() && (avDoc.data().isVerified || avDoc.data().adsWatched > 0)) {
              await updateDoc(avRef, {
                isVerified: false,
                adsWatched: 0,
                adsWatchedThisSession: 0,
                updatedAt: serverTimestamp(),
              });
            }
          } catch (err) {
            console.error("Error syncing un-verification to account_verifications:", err);
          }
        }
      } else {
        setIsVerified(false);
      }
    });
    return () => unsub();
  }, [currentUser]);

  // Fetch Balance & History
  useEffect(() => {
    if (!currentUser) return;

    // Real-time balance with metadata tracking to catch server sync
    const unsubBalance = onSnapshot(
      doc(db, "user_balances", currentUser.uid),
      { includeMetadataChanges: true },
      async (docSnap: any) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserBalance;
          setBalance(data);

          if (docSnap.metadata.fromCache) {
            console.log(
              "Balance loaded from cache, waiting for server sync...",
            );
          }
        } else if (!docSnap.metadata.fromCache) {
          // Initialize balance document in Firestore ONLY if we're sure it's not even on server
          try {
            const initialBalance = {
              userId: currentUser.uid,
              totalEarned: 0,
              currentBalance: 0,
              depositBalance: 0,
              updatedAt: serverTimestamp(),
            };
            await setDoc(
              doc(db, "user_balances", currentUser.uid),
              initialBalance,
            );
            setBalance(initialBalance as any);
          } catch (err) {
            console.error("Error initializing balance:", err);
            setBalance({
              totalEarned: 0,
              currentBalance: 0,
              depositBalance: 0,
            });
          }
        }
      },
      (error) => {
        console.error("Balance listener error:", error);
      },
    );

    // Optimized history (uses local cache)
    const fetchHistory = async () => {
      try {
        const data = await earningService.getEarningHistory();
        setHistory(data);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();

    // Fetch Hot Jobs (latest 10 active micro jobs)
    const fetchHotJobs = async () => {
      try {
        // Removed orderBy to avoid composite index requirement
        const q = query(
          collection(db, "micro_jobs"),
          where("status", "==", "active"),
          limit(50), // Fetch a bit more to sort client-side
        );
        const snapshot = await getDocs(q);
        const jobs: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          jobs.push({ id: doc.id, ...data });
        });

        // Sort client-side by createdAt descending
        const sortedJobs = jobs
          .sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          })
          .slice(0, 10);

        setHotJobs(sortedJobs);
      } catch (error) {
        console.error("Error fetching hot jobs:", error);
      } finally {
        setLoadingHotJobs(false);
      }
    };
    fetchHotJobs();

    return () => unsubBalance();
  }, [currentUser]);

  const handleCategoryClick = (id: string) => {
    setActiveSubView(id);
    window.history.pushState({ view: id }, "");
  };

  const handleDepositClick = () => {
    setActiveSubView("deposit");
    window.history.pushState({ view: "deposit" }, "");
  };

  const handleWithdrawClick = () => {
    setActiveSubView("withdraw");
    window.history.pushState({ view: "withdraw" }, "");
  };

  // Hardware Back Button Support
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (
        state &&
        state.view &&
        [
          "mobile-recharge",
          "drive-offer",
          "typing-job",
          "micro-job",
          "job-post",
          "quiz-job",
          "ad-view",
          "deposit",
          "withdraw",
          "account-verification",
          "terms",
          "privacy",
        ].includes(state.view)
      ) {
        setActiveSubView(state.view);
      } else if (
        state &&
        state.view &&
        (state.view.endsWith("-history") ||
          state.view.endsWith("-sell") ||
          state.view === "micro-job-detail")
      ) {
        // Let child components handle their own sub-views
      } else if (isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (activeSubView) {
        setActiveSubView(null);
      } else {
        onBack();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeSubView, isSidebarOpen, onBack]);

  if (activeSubView === "mobile-recharge") {
    return <MobileRechargeView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "drive-offer") {
    return <DriveOfferView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "typing-job") {
    return <TypingJobView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "micro-job") {
    return <MicroJobView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "job-post") {
    return <JobPostView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "quiz-job") {
    return <QuizJobView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "quiz") {
    return <QuizView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "ad-view") {
    return <AdJobView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "withdraw") {
    return <WithdrawView />;
  }

  if (activeSubView === "deposit") {
    return <DepositView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "account-verification") {
    return <AccountVerificationView onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "terms") {
    return <LegalPageView type="terms" onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "privacy") {
    return (
      <LegalPageView type="privacy" onBack={() => setActiveSubView(null)} />
    );
  }

  if (activeSubView === "creator-studio") {
    return <CreatorStudioView onBack={() => setActiveSubView(null)} onNavigate={(v) => setActiveSubView(v)} />;
  }

  if (activeSubView === "sudoku") {
    return <SudokuGame onBack={() => setActiveSubView(null)} />;
  }

  const handleRefresh = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await clearIndexedDbPersistence(db);
        window.location.reload();
      } else {
        window.location.reload();
      }
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans relative pb-0">
      {/* Hero Section (Green Background) */}
      <div className="relative bg-primary dark:bg-primary-dark pt-safe pt-4 pb-24 px-4 overflow-hidden">
        <IslamicScene />

        {/* Hero Header */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => {
              setIsSidebarOpen(true);
              window.history.pushState({ view: "sidebar" }, "");
            }}
            className="p-1.5 text-white active:scale-95 transition-transform"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-xl font-black text-white flex-1">
            {t("earning")}
          </h1>

          <button
            onClick={() => {
              showInterstitialAd(() => {
                window.dispatchEvent(
                  new CustomEvent("navigate", { detail: "earning-history" }),
                );
              });
            }}
            className="p-2 rounded-full text-white active:scale-90 transition-transform relative"
          >
            <History className="w-5 h-5" />
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-full text-white active:scale-90 transition-transform relative"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="-mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-900 w-full rounded-t-xl shadow-xl shadow-black/5 overflow-hidden border-t border-slate-100 dark:border-slate-800 pb-0">
          {/* User Account Header inside Card */}
          <div className="p-4 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center p-0.5 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-primary/5">
                {currentUser?.photoURL ||
                (currentUser as any)?.user_metadata?.avatar_url ||
                (currentUser as any)?.user_metadata?.picture ? (
                  <img
                    src={
                      (currentUser?.photoURL?.startsWith("/")
                        ? getApiUrl(currentUser.photoURL)
                        : currentUser?.photoURL) ||
                      ((
                        currentUser as any
                      )?.user_metadata?.avatar_url?.startsWith("/")
                        ? getApiUrl(
                            (currentUser as any).user_metadata.avatar_url,
                          )
                        : (currentUser as any)?.user_metadata?.avatar_url) ||
                      (currentUser as any)?.user_metadata?.picture
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary dark:text-primary-light font-bold text-xl">
                    {currentUser?.displayName
                      ? currentUser.displayName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2 truncate">
                {currentUser?.displayName ||
                  (language === "bn" ? "ইউজার" : "User")}
                <VerifiedBadge
                  isVerified={isVerified}
                  isOwner={true}
                  size={16}
                />
              </h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 py-0.5 px-2 bg-primary/10 rounded-full">
                  <DollarSign className="w-3 h-3 text-primary font-black" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                    {language === "bn" ? "ব্যালেন্স" : "Balance"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tap to Reveal Balance */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBalance(!showBalance)}
              className="px-3 py-1.5 bg-slate-50/30 dark:bg-slate-800/20 border border-slate-100 dark:border-white/5 rounded-xl flex flex-col items-center justify-center min-w-[110px] border-dashed"
            >
              <AnimatePresence mode="wait">
                {showBalance ? (
                  <motion.span
                    key="amt"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs font-black text-primary"
                  >
                    ৳{Number(balance?.currentBalance || 0).toFixed(2)}
                  </motion.span>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">
                      {language === "bn"
                        ? "ট্যাপ টু ব্যালেন্স"
                        : "Tap to Balance"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          {/* Categories Section */}
          <div className="-mt-1">
            {/* Internal Header */}
            <div className="flex justify-between items-center px-6 py-2">
              <h3 className="text-[14px] font-black text-primary dark:text-primary-light uppercase tracking-wider">
                {t("earning-categories" as any) || "আর্নিং ক্যাটাগরি"}
              </h3>
              <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>

            <div className="px-6 pb-4 relative">
              <div
                className={cn(
                  "grid grid-cols-4 gap-y-4 gap-x-2 transition-all duration-500 overflow-hidden",
                  !isCategoriesExpanded ? "max-h-[220px]" : "max-h-[1000px]",
                )}
              >
                {EARNING_CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex flex-col items-center justify-center group active:scale-95 transition-transform py-1"
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-1.5 transition-all duration-300 relative">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                          cat.bg,
                          cat.color,
                        )}
                      >
                        <cat.icon className="w-5 h-5 stroke-[2.5px]" />
                      </div>
                      {cat.comingSoon && (
                        <div className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[6px] font-black px-1 py-0.5 rounded-full shadow-sm border border-white/20 animate-pulse uppercase tracking-tighter z-10">
                          {language === "bn" ? "শীঘ্রই" : "Soon"}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight group-hover:text-primary transition-colors line-clamp-2 px-0.5">
                      {t(cat.id as any)}
                    </span>
                  </button>
                ))}
              </div>

              {!isCategoriesExpanded && EARNING_CATEGORIES.length > 8 && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 dark:from-slate-900 dark:via-slate-900/95 to-transparent flex items-end justify-center z-10 pointer-events-none pb-4">
                  <button
                    onClick={() => setIsCategoriesExpanded(true)}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-black text-primary hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all pointer-events-auto"
                  >
                    {language === "bn" ? "আরও দেখুন" : "Show More"}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              )}

              {isCategoriesExpanded && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setIsCategoriesExpanded(false)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 shadow-sm transition-all"
                  >
                    {language === "bn" ? "বন্ধ করুন" : "Show Less"}
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Promotional Banner - bKash Style Slider */}
          <div className="px-3 pb-4">
            <div className="w-full relative rounded-xl overflow-hidden shadow-sm aspect-[3/1] bg-slate-100 dark:bg-slate-800 group">
              <AnimatePresence mode="wait">
                {banners.length > 0 && banners[currentBanner] && (
                  <motion.div
                    key={banners[currentBanner].id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() =>
                      handleAdClick(banners[currentBanner].redirectLink)
                    }
                  >
                    <img
                      src={banners[currentBanner].image}
                      alt="Promotion"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center px-6">
                      <div className="max-w-[70%]">
                        <motion.h4
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-white text-xs sm:text-sm font-black drop-shadow-md leading-tight"
                        >
                          {banners[currentBanner].title}
                        </motion.h4>
                        <button className="mt-2 bg-white text-primary text-[9px] font-black px-3 py-1 rounded-full shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 leading-none">
                          {banners[currentBanner].redirectLink?.startsWith(
                            "tel:",
                          ) ||
                          banners[currentBanner].redirectLink?.startsWith(
                            "https://wa.me/",
                          )
                            ? language === "bn"
                              ? "যোগাযোগ করুন"
                              : "Contact Now"
                            : language === "bn"
                              ? "ট্যাপ করুন"
                              : "Tap Now"}
                          {banners[currentBanner].redirectLink?.startsWith(
                            "https://wa.me/",
                          ) ? (
                            <MessageCircle className="w-2.5 h-2.5" />
                          ) : banners[currentBanner].redirectLink?.startsWith(
                              "tel:",
                            ) ? (
                            <Phone className="w-2.5 h-2.5" />
                          ) : (
                            <ExternalLink className="w-2.5 h-2.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Slider Dots */}
              <div className="absolute bottom-2 right-4 flex gap-1 z-20">
                {banners.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      idx === currentBanner
                        ? "w-4 bg-white"
                        : "w-1 bg-white/40",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Hot Jobs Section */}
          {(loadingHotJobs || hotJobs.length > 0) && (
            <div className="px-6 pb-6 pt-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-rose-500 rounded-full" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    {language === "bn" ? "হট জব" : "Hot Jobs"}
                    <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </h3>
                </div>
                <button
                  onClick={() => handleCategoryClick("micro-job")}
                  className="text-xs font-bold text-primary hover:underline flex items-center"
                >
                  {language === "bn" ? "সি অল" : "See All"}
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              {loadingHotJobs ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 content-start">
                  {hotJobs.map((job, idx) => (
                    <div
                      key={job.id}
                      className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-none flex flex-col hover:border-primary/30 transition-colors"
                    >
                      <div className="mb-2">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 mb-1.5">
                          {job.title}
                        </h3>
                        <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-900/50 px-1.5 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                          <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                            {job.reward.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto mb-3">
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{job.timeEstimate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
                          <Users className="w-3 h-3" />
                          <span>
                            {job.completedWorkers}/{job.totalWorkers}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <button
                          onClick={() => handleCategoryClick("micro-job")}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          {language === "bn" ? "ভিউ করুন" : "View"}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quiz & Earn Section */}
          <div className="px-6 pb-0 pt-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  {language === "bn" ? "কুইজ ও আর্ন" : "Quiz & Earn"}
                  <Trophy className="w-4 h-4 text-primary fill-primary" />
                </h3>
              </div>
              <button
                onClick={() => handleCategoryClick("quiz")}
                className="text-xs font-bold text-primary hover:underline flex items-center"
              >
                {language === "bn" ? "সি অল" : "See All"}
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="flex overflow-x-auto gap-3 content-start px-6 -mx-6 pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {availableQuizzes.slice(0, 10).map((quiz, idx) => {
                const isLocked = !!(
                  progress.breakUntil && progress.breakUntil > now
                );
                // Extract base color names for soft backgrounds if possible, mapping via idx for distinct colors
                const CARD_COLORS = [
                  "bg-blue-50/80 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30",
                  "bg-rose-50/80 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30",
                  "bg-amber-50/80 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30",
                  "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30",
                  "bg-purple-50/80 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30",
                  "bg-cyan-50/80 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/30",
                  "bg-orange-50/80 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30",
                ];
                const cardColor = CARD_COLORS[idx % CARD_COLORS.length];

                return (
                  <div
                    key={quiz.id}
                    className={cn(
                      "rounded-xl p-4 min-h-[120px] border flex flex-col hover:opacity-90 transition-opacity shrink-0 w-[160px] snap-center",
                      cardColor,
                    )}
                  >
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          className={cn(
                            "w-5 h-5 rounded flex items-center justify-center bg-white/60 dark:bg-black/20",
                            quiz.color,
                          )}
                        >
                          <quiz.icon className="w-3 h-3" />
                        </div>
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase tracking-wider truncate",
                            quiz.color,
                          )}
                        >
                          {quiz.categoryTitle}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                        {quiz.question}
                      </h3>
                    </div>
                    <div className="mt-auto pt-2">
                      <button
                        onClick={() => !isLocked && setSelectedPlayQuiz(quiz)}
                        disabled={isLocked}
                        className={cn(
                          "w-full px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1",
                          isLocked
                            ? "bg-white/40 dark:bg-slate-900/40 text-slate-500 border border-transparent cursor-not-allowed"
                            : "bg-white dark:bg-slate-900 border border-white/50 dark:border-slate-700 hover:border-primary/50 text-slate-700 dark:text-slate-300 active:scale-95 shadow-sm",
                        )}
                      >
                        {isLocked
                          ? language === "bn"
                            ? "লকড"
                            : "Locked"
                          : language === "bn"
                            ? "খেলুন"
                            : "Play"}
                        {isLocked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
              {availableQuizzes.length === 0 && (
                <div className="w-full text-center py-6 opacity-60">
                  <p className="text-xs font-bold text-slate-500">
                    {language === "bn"
                      ? "আজকের সব কুইজ সম্পন্ন হয়েছে!"
                      : "All quizzes completed for today!"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Refer & Earn Section */}
          <div className="px-6 pb-6 pt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-orange-500 rounded-full" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                {language === "bn" ? "রেফার এন্ড আর্ন" : "Refer And Earn"}
              </h3>
            </div>
            <ReferAndEarn />
          </div>

          {/* Community Section */}
          <div className="px-6 pb-6 pt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-yellow-500 rounded-full" />
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                Community |{" "}
                {language === "bn" ? "প্রতিদিন 🪙 জিতুন" : "Win 🪙 daily"}
              </h3>
            </div>

            {/* Banner Card */}
            <div
              className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group cursor-pointer border border-yellow-200 dark:border-yellow-700/50 shadow-sm aspect-video"
              onClick={() => setActiveSubView("sudoku")}
            >
              {/* Background gradient/decorations */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-300/40 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none group-hover:bg-yellow-300/60 transition-colors" />
              <div className="absolute top-4 right-4 text-6xl opacity-40 drop-shadow-md rotate-12 transition-transform group-hover:rotate-6 group-hover:scale-110">
                🧩
              </div>

              <div className="relative z-10 flex flex-col gap-2 max-w-[65%]">
                <div className="flex items-center gap-1.5 mb-1 text-slate-800 dark:text-slate-200 font-bold text-[10px] uppercase tracking-wider">
                  <Gamepad2 className="w-3 h-3" /> Community
                </div>
                <div>
                  <h4 className="text-slate-700 dark:text-slate-300 font-medium text-xs mb-0.5">
                    {language === "bn" ? "খেলুন" : "Play"}
                  </h4>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-wider">
                    Sudoku
                    <br />
                    <span className="text-orange-600 dark:text-orange-500">
                      Pro
                    </span>
                  </h3>
                </div>
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-200 mt-2 bg-yellow-200/80 dark:bg-yellow-700/50 py-1.5 px-2.5 rounded-md self-start inline-flex items-center gap-1.5 border border-yellow-300 dark:border-yellow-600/50 shadow-sm">
                  {language === "bn" ? "প্রতিদিন জিতে নিন" : "Win daily"}{" "}
                  <span className="bg-orange-500 text-white rounded px-1.5 py-0.5 ml-1 inline-flex shadow-[0_2px_4px_rgb(249,115,22,0.3)]">
                    ১০০০ কয়েন
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSubView("sudoku");
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-1.5 shadow-orange-500/30 uppercase tracking-widest"
                >
                  {language === "bn" ? "প্লে নাউ" : "Play Now"}{" "}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Bottom Sheet Popup */}
      <AnimatePresence>
        {selectedPlayQuiz && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayQuiz(null)}
              className="fixed inset-0 bg-slate-950/60 z-[9998] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 rounded-t-2xl z-[9999] overflow-hidden shadow-2xl"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="px-6 pb-safe pt-2 pb-8 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        selectedPlayQuiz.bg,
                        selectedPlayQuiz.color,
                      )}
                    >
                      <selectedPlayQuiz.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {selectedPlayQuiz.categoryTitle}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {language === "bn" ? "কুইজ প্রশ্ন" : "Quiz Question"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlayQuiz(null)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 mb-6 text-center shadow-sm">
                  <h4 className="text-base font-black text-slate-800 dark:text-slate-200 leading-snug">
                    {selectedPlayQuiz.question}
                  </h4>
                </div>

                <div className="space-y-3">
                  {selectedPlayQuiz.options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === selectedPlayQuiz.correctAnswer;

                    return (
                      <button
                        key={i}
                        disabled={isAnswered}
                        onClick={() => handleAnswer(i)}
                        className={cn(
                          "w-full text-left p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-between relative overflow-hidden",
                          !isAnswered &&
                            "hover:border-primary/50 hover:bg-slate-50 text-slate-700 dark:text-slate-300",
                          isAnswered &&
                            isCorrect &&
                            "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black",
                          isAnswered &&
                            isSelected &&
                            !isCorrect &&
                            "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400",
                          isAnswered &&
                            !isSelected &&
                            !isCorrect &&
                            "opacity-50 border-slate-100 bg-white",
                        )}
                      >
                        {isAnswered && isCorrect && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 opacity-50 z-0"
                          />
                        )}
                        <span className="relative z-10">{opt}</span>
                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 relative z-10" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-500 relative z-10" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebars and Overlays */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[110] bg-slate-950/50"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
              className="fixed top-0 left-0 bottom-0 w-[240px] z-[120] bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 rounded-r-2xl overflow-hidden will-change-transform"
            >
              {/* Sidebar Header */}
              <div className="p-6 pt-safe mt-2 flex flex-col items-center border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
                {/* Profile Section */}
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 p-1 shadow-lg shadow-primary/20">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                      {currentUser?.photoURL ? (
                        <img
                          src={
                            currentUser.photoURL.startsWith("/")
                              ? getApiUrl(currentUser.photoURL)
                              : currentUser.photoURL
                          }
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full" />
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-0.5 text-center line-clamp-1 w-full px-2 flex items-center justify-center gap-1.5">
                  {currentUser?.displayName ||
                    (language === "bn" ? "ইউজার" : "User")}
                  <VerifiedBadge
                    isVerified={isVerified}
                    isOwner={true}
                    size={20}
                  />
                </h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 text-center line-clamp-1 w-full px-2">
                  {currentUser?.email || "user@example.com"}
                </p>

                {/* Balance Display - Side by Side */}
                <div className="w-full flex gap-2">
                  <div className="flex-1 flex flex-col items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet className="w-3 h-3 text-primary" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        {language === "bn" ? "আর্নিং" : "Earning"}
                      </span>
                    </div>
                    <span className="text-sm font-black text-primary leading-none">
                      ৳{Number(balance?.currentBalance || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                        {language === "bn" ? "ডিপোজিট" : "Deposit"}
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-500 leading-none">
                      ৳{Number(balance?.depositBalance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto py-4">
                {/* Sidebar Actions */}
                <div className="px-4 space-y-1.5">
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      handleWithdrawClick();
                    }}
                    className="w-full py-3 px-4 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all rounded-2xl border border-transparent active:border-slate-100 dark:active:border-slate-800"
                  >
                    <ArrowUpCircle className="w-6 h-6 text-primary" />
                    <span className="text-base">
                      {language === "bn" ? "উইথড্র" : "Withdraw"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      handleDepositClick();
                    }}
                    className="w-full py-3 px-4 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all rounded-2xl border border-transparent active:border-slate-100 dark:active:border-slate-800"
                  >
                    <ArrowDownCircle className="w-6 h-6 text-emerald-500" />
                    <span className="text-base">
                      {language === "bn" ? "ডিপোজিট" : "Deposit"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      handleCategoryClick("account-verification");
                    }}
                    className="w-full py-3 px-4 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all rounded-2xl border border-transparent active:border-slate-100 dark:active:border-slate-800"
                  >
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    <span className="text-base">
                      {language === "bn"
                        ? "অ্যাকাউন্ট ভেরিফাই"
                        : "Account Verify"}
                    </span>
                  </button>
                </div>

                {/* Social Links */}
                <div className="px-4 pt-4 space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {language === "bn"
                        ? "আমাদের সাথে যুক্ত হন"
                        : "Connect With Us"}
                    </p>
                  </div>

                  <a
                    href="https://www.facebook.com/profile.php?id=61572344710256"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all rounded-2xl"
                  >
                    <Facebook className="w-6 h-6 text-[#1877F2] fill-[#1877F2]" />
                    <span className="text-sm">
                      {language === "bn" ? "ফেসবুক পেজ" : "Facebook Page"}
                    </span>
                  </a>

                  <a
                    href="https://www.facebook.com/share/g/1bVV59fCs4/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all rounded-2xl"
                  >
                    <Users className="w-6 h-6 text-[#1877F2] fill-[#1877F2]" />
                    <span className="text-sm">
                      {language === "bn" ? "ফেসবুক গ্রুপ" : "Facebook Group"}
                    </span>
                  </a>

                  <a
                    href="https://t.me/muslimsathiearning"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all rounded-2xl"
                  >
                    <Send className="w-6 h-6 text-[#229ED9] fill-[#229ED9]" />
                    <span className="text-sm">
                      {language === "bn"
                        ? "টেলিগ্রাম চ্যানেল"
                        : "Telegram Channel"}
                    </span>
                  </a>
                </div>

                {/* Legal Links */}
                <div className="px-4 pt-4 pb-4 space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {language === "bn"
                        ? "পলিসি ও শর্তাবলি"
                        : "Legal & Policy"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setActiveSubView("terms");
                      window.history.pushState({ view: "terms" }, "");
                    }}
                    className="w-full py-2.5 px-4 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all rounded-2xl"
                  >
                    <FileText className="w-6 h-6 text-slate-400" />
                    <span className="text-sm">
                      {language === "bn"
                        ? "শর্তাবলি (T&C)"
                        : "Terms & Conditions"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setActiveSubView("privacy");
                      window.history.pushState({ view: "privacy" }, "");
                    }}
                    className="w-full py-2.5 px-4 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-4 active:bg-slate-50 dark:active:bg-slate-800/50 transition-all rounded-2xl"
                  >
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <span className="text-sm">
                      {language === "bn" ? "প্রাইভেসি পলিসি" : "Privacy Policy"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-slate-400">
                  <ShieldAlert className="w-5 h-5" />
                  <span className="text-xs font-bold">
                    Secure Wallet System
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login / Offline Banner Overlay (Bottom) */}
      <AnimatePresence>
        {!isOnline ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[100] md:pl-20 lg:pl-64 pointer-events-none"
          >
            <div className="bg-red-50 dark:bg-slate-900 border-t border-red-100 dark:border-red-900/30 flex items-center justify-between gap-2 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pointer-events-auto w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-red-700 dark:text-red-400 font-bold text-xs">
                    {language === "bn" ? "অফলাইন মোড" : "Offline Mode"}
                  </h3>
                  <p className="text-red-600/80 dark:text-red-400/80 text-[10px] leading-tight mt-0.5">
                    {language === "bn"
                      ? "কাজ করতে ইন্টারনেট কানেকশন চালু করুন"
                      : "Turn on internet connection to work"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : !currentUser ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-[100] md:pl-20 lg:pl-64 pointer-events-none"
          >
            <div className="bg-slate-900 dark:bg-black border-t border-slate-800 flex items-center justify-between gap-2 px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] pointer-events-auto w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs">
                    {language === "bn" ? "লগইন প্রয়োজন" : "Login Required"}
                  </h3>
                  <p className="text-slate-400 text-[9px] leading-tight mt-0.5">
                    {language === "bn"
                      ? "আর্নিং ক্যাটাগরিতে কাজ করতে লগইন করুন"
                      : "Login to access earning categories"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("navigate", { detail: "auth" }),
                    )
                  }
                  className="px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-md active:scale-95 transition-transform"
                >
                  {language === "bn" ? "সাইন আপ" : "Sign Up"}
                </button>
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("navigate", { detail: "auth" }),
                    )
                  }
                  className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-md active:scale-95 transition-transform"
                >
                  {language === "bn" ? "লগইন" : "Login"}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
