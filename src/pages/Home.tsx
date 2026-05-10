import React, { useState, useEffect, memo } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useLocation } from "@/hooks/useLocation";
import {
  format,
  parse,
  isAfter,
  differenceInSeconds,
  addDays,
  addMinutes,
  subMinutes,
} from "date-fns";
import {
  MapPin,
  Bell,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  BookText,
  Compass,
  Calculator,
  Calendar,
  Star,
  Heart,
  HelpCircle,
  UserCheck,
  Plane,
  Tv,
  Headphones,
  Trophy,
  Book,
  Settings,
  Library,
  ArrowLeft,
  Image,
  Users,
  Notebook,
  Video,
  CircleDot,
  ShieldCheck,
  Phone,
  MessageCircle,
  ExternalLink,
  BookHeart,
  Quote,
  HeartHandshake,
  SunMedium,
  BookOpenText,
  UsersRound,
  Scale,
  Sparkles,
  Youtube,
} from "lucide-react";
import { openSystemAlarm } from "@/lib/alarmUtils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { LocationModal } from "@/components/LocationModal";
import { SlimBannerAd } from "@/components/AdSystem";
import { ReferAndEarn } from "@/components/ReferAndEarn";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotifications } from "../hooks/useNotifications";
import { Capacitor } from "@capacitor/core";
import { db } from "@/lib/firebase";
import { PullToRefresh } from "@/components/PullToRefresh";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  clearIndexedDbPersistence,
} from "firebase/firestore";

const PRAYERS_TO_SHOW = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

interface Scholar {
  id: string;
  name: string;
  description: string;
  phoneNumber: string;
  imageUrl: string;
  createdAt: any;
}

const formatNumber = (str: string | number, lang: string) => {
  if (lang !== "bn") return str.toString();
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str.toString().replace(/\d/g, (d) => bn[parseInt(d)]);
};

export const CATEGORIES = [
  {
    id: "quran",
    icon: BookOpen,
    color: "text-white",
    bg: "bg-gradient-to-br from-primary-light to-primary-dark",
  },
  {
    id: "hadith",
    icon: BookText,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-400 to-blue-600",
  },
  {
    id: "tasbih",
    icon: CircleDot,
    color: "text-white",
    bg: "bg-gradient-to-br from-purple-400 to-purple-600",
  },
  {
    id: "qibla",
    icon: Compass,
    color: "text-white",
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
  },
  {
    id: "dua",
    icon: Heart,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-400 to-rose-600",
  },
  {
    id: "names-of-allah",
    icon: Star,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-400 to-amber-600",
  },
  {
    id: "zakat",
    icon: Calculator,
    color: "text-white",
    bg: "bg-gradient-to-br from-teal-400 to-teal-600",
  },
  {
    id: "calendar",
    icon: Calendar,
    color: "text-white",
    bg: "bg-gradient-to-br from-indigo-400 to-indigo-600",
  },
  {
    id: "mosque",
    icon: MapPin,
    color: "text-white",
    bg: "bg-gradient-to-br from-primary to-primary-dark",
  },
  {
    id: "education",
    icon: Library,
    color: "text-white",
    bg: "bg-gradient-to-br from-indigo-500 to-indigo-700",
  },
  {
    id: "ramadan",
    icon: Moon,
    color: "text-white",
    bg: "bg-gradient-to-br from-purple-500 to-purple-700",
  },
  {
    id: "islamic-names",
    icon: Users,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    id: "namaz-shikkha",
    icon: UserCheck,
    color: "text-white",
    bg: "bg-gradient-to-br from-cyan-400 to-cyan-600",
  },
  {
    id: "hajj-umrah",
    icon: Plane,
    color: "text-white",
    bg: "bg-gradient-to-br from-sky-400 to-sky-600",
  },
  {
    id: "live-tv",
    icon: Tv,
    color: "text-white",
    bg: "bg-gradient-to-br from-red-400 to-red-600",
  },
  {
    id: "audio",
    icon: Headphones,
    color: "text-white",
    bg: "bg-gradient-to-br from-orange-500 to-orange-700",
  },
  {
    id: "quiz",
    icon: Trophy,
    color: "text-white",
    bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
  },
  {
    id: "notes",
    icon: Notebook,
    color: "text-white",
    bg: "bg-gradient-to-br from-fuchsia-400 to-fuchsia-600",
  },
  {
    id: "wallpaper",
    icon: Image,
    color: "text-white",
    bg: "bg-gradient-to-br from-teal-500 to-teal-700",
  },
  {
    id: "alarm-list",
    icon: Bell,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-500 to-rose-700",
  },
  {
    id: "kalima",
    icon: BookHeart,
    color: "text-white",
    bg: "bg-gradient-to-br from-green-500 to-green-700",
  },
  {
    id: "janaza",
    icon: Users,
    color: "text-white",
    bg: "bg-gradient-to-br from-slate-500 to-slate-700",
  },
  {
    id: "masnoon-dua",
    icon: Book,
    color: "text-white",
    bg: "bg-gradient-to-br from-red-500 to-red-700",
  },
  {
    id: "roza",
    icon: Sunset,
    color: "text-white",
    bg: "bg-gradient-to-br from-orange-400 to-orange-600",
  },
  {
    id: "islamic-quotes",
    icon: Quote,
    color: "text-white",
    bg: "bg-gradient-to-br from-purple-500 to-purple-800",
  },
  {
    id: "darood",
    icon: HeartHandshake,
    color: "text-white",
    bg: "bg-gradient-to-br from-rose-400 to-rose-600",
  },
  {
    id: "azkar",
    icon: SunMedium,
    color: "text-white",
    bg: "bg-gradient-to-br from-amber-400 to-amber-600",
  },
  {
    id: "seerah",
    icon: BookOpenText,
    color: "text-white",
    bg: "bg-gradient-to-br from-indigo-500 to-indigo-800",
  },
  {
    id: "sahaba",
    icon: UsersRound,
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-500 to-blue-800",
  },
  {
    id: "halal-haram",
    icon: Scale,
    color: "text-white",
    bg: "bg-gradient-to-br from-teal-500 to-teal-800",
  },
  {
    id: "sunnah",
    icon: Sparkles,
    color: "text-white",
    bg: "bg-gradient-to-br from-pink-400 to-pink-600",
  },
];

// removed misplaced import
export const CategoryButton = memo(
  ({ cat, idx, setActiveTab, latitude, longitude }: any) => {
    const { t } = useLanguage();
    return (
      <button
        key={cat.id}
        onClick={() => {
          if (cat.id === "mosque") {
            const url = `https://www.google.com/maps/search/mosque/@${latitude},${longitude},16z`;
            window.open(url, "_blank");
          } else if (cat.id === "alarm-list") {
            openSystemAlarm(setActiveTab);
          } else if ((cat as any).id) {
            setActiveTab((cat as any).id);
          }
        }}
        className="flex flex-col items-center justify-center group"
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-all duration-300 relative",
            "border border-slate-100 dark:border-slate-700",
            cat.bg,
            cat.color,
          )}
        >
          <cat.icon className="w-[18px] h-[18px] stroke-[2.5px]" />
        </div>
        <span className="text-[8px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
          {t(cat.id as any)}
        </span>
      </button>
    );
  },
);

export function Home({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) {
  const { t, language } = useLanguage();
  const { unreadCount } = useNotifications();
  const {
    latitude,
    longitude,
    country,
    city,
    loading: locLoading,
  } = useLocation(language);
  const {
    data,
    loading: prayerLoading,
    error: prayerError,
  } = usePrayerTimes(latitude, longitude);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    time: Date;
    remaining: string;
    progress: number;
    isForbidden?: boolean;
  } | null>(null);

  // Create a separate state for day-level changes
  const [todayStr, setTodayStr] = useState(() =>
    format(new Date(), "dd-MM-yyyy"),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (format(now, "dd-MM-yyyy") !== todayStr) {
        setTodayStr(format(now, "dd-MM-yyyy"));
      }
    }, 60000); // Check for day change once a minute
    return () => clearInterval(timer);
  }, [todayStr]);
  const [fastingInfo, setFastingInfo] = useState<{
    nextSehri: Date | null;
    nextIftar: Date | null;
    remaining: string;
    type: "sehri" | "iftar";
    progress: number;
  } | null>(null);
  const [showAllPrayers, setShowAllPrayers] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<
    {
      id: string | number;
      title?: string;
      image: string;
      redirectLink?: string;
    }[]
  >(() => {
    try {
      const cached = localStorage.getItem('cached_banners');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [scholars, setScholars] = useState<Scholar[]>(() => {
    try {
      const cached = localStorage.getItem('cached_scholars');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [scholarsLoading, setScholarsLoading] = useState(false);

  useEffect(() => {
    // Better listener for scholars with direct server fetch if needed
    const scholarsRef = collection(db, "scholars");
    const q = query(scholarsRef, orderBy("createdAt", "desc"), limit(10));

    const unsub = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Scholar[];

        if (data.length > 0 || !snapshot.metadata.fromCache) {
          setScholars(data);
          localStorage.setItem('cached_scholars', JSON.stringify(data));
        }

        // If we got data from cache and it's empty, but we're online, wait for server
        if (data.length === 0 && snapshot.metadata.fromCache) {
          console.log("Waiting for server data for scholars...");
        }
      },
      (error) => {
        console.error("Error fetching scholars:", error);
      },
    );

    return () => unsub();
  }, []);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  useEffect(() => {
    // Simplified query to avoid mandatory indexes, filtering is enough
    const adsRef = collection(db, "ads");
    const q = query(
      adsRef,
      where("active", "==", true),
      where("category", "in", ["home", "all"]),
    );

    const unsub = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const fetchedBanners = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        if (fetchedBanners.length > 0) {
          // Safe sort client-side
          const sorted = [...fetchedBanners].sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });

          const mappedBanners = sorted.map((b) => ({
            id: b.id,
            title:
              b.title ||
              (language === "bn" ? "আমাদের বিশেষ অফার" : "Our Special Offer"),
            image: b.imageUrl,
            redirectLink: b.redirectLink,
          }));
          setBanners(mappedBanners);
          localStorage.setItem('cached_banners', JSON.stringify(mappedBanners));
        } else if (!snapshot.metadata.fromCache) {
          // Only set fallbacks if server explicitly says there are no ads
          const fallbackBanners = [
            {
              id: "def1",
              title:
                language === "bn"
                  ? "মাহে রমজানের পবিত্রতা রক্ষা করুন এবং নিয়মিত ইবাদত করুন"
                  : "Maintain the holiness of Ramadan and pray regularly",
              image:
                "https://images.unsplash.com/photo-1519810755548-39cd217da494?q=80&w=800&auto=format&fit=crop",
            },
            {
              id: "def2",
              title:
                language === "bn"
                  ? "কুইজ খেলুন এবং আপনার ইসলামিক জ্ঞান যাচাই করুন"
                  : "Play quiz and verify your Islamic knowledge",
              image:
                "https://images.unsplash.com/photo-1584281723351-904c62d8544d?q=80&w=800&auto=format&fit=crop",
            },
          ];
          setBanners(fallbackBanners);
          localStorage.setItem('cached_banners', JSON.stringify(fallbackBanners));
        }
      },
      (error) => {
        console.error("Error fetching ads:", error);
      },
    );
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

  const [progressConfig, setProgressConfig] = useState({
    strokeDashoffset: 289.03,
  });

  useEffect(() => {
    if (!data) return;

    // Use a lightweight tick just to update the text/progress
    const tick = () => {
      const now = new Date();
      setCurrentTime(now);

      const todayStr = format(now, "dd-MM-yyyy");
      let todayData = data.find((d: any) => d.date.gregorian.date === todayStr);

      if (!todayData) return;
      const tomorrowStr = format(addDays(now, 1), "dd-MM-yyyy");
      let tomorrowData = data.find(
        (d: any) => d.date.gregorian.date === tomorrowStr,
      );

      const timings = todayData.timings;

      const parseTime = (timeStr: string | undefined, date: Date) => {
        if (!timeStr) return new Date(date);
        const parts = timeStr.split(" ");
        const timePart = parts[0] || "00:00";
        const [hours, minutes] = timePart.split(":");
        const d = new Date(date);
        d.setHours(parseInt(hours || "0"), parseInt(minutes || "0"), 0, 0);
        return d;
      };

      const fajrStart = parseTime(timings.Fajr, now);
      const sunrise = parseTime(timings.Sunrise, now);
      const sunriseEnd = addMinutes(sunrise, 15);
      const ishraqEnd = addMinutes(sunriseEnd, 30);
      const dhuhrStart = parseTime(timings.Dhuhr, now);
      const zenithStart = subMinutes(dhuhrStart, 10);
      const asrStart = parseTime(timings.Asr, now);
      const maghribStart = parseTime(timings.Maghrib, now);
      const sunsetStart = subMinutes(maghribStart, 15);
      const ishaStart = parseTime(timings.Isha, now);

      const tomorrowFajr = tomorrowData
        ? parseTime(tomorrowData.timings.Fajr, addDays(now, 1))
        : addDays(fajrStart, 1);

      let periodName = "";
      let periodEnd = new Date();
      let periodStart = new Date();
      let isForbidden = false;

      if (now < fajrStart) {
        periodName = "Isha";
        periodEnd = fajrStart;
        const yStr = format(addDays(now, -1), "dd-MM-yyyy");
        const yesterdayData = data.find(
          (d: any) => d.date.gregorian.date === yStr,
        );
        periodStart = yesterdayData
          ? parseTime(yesterdayData.timings.Isha, addDays(now, -1))
          : subMinutes(fajrStart, 360);
      } else if (now < sunrise) {
        periodName = "Fajr";
        periodEnd = sunrise;
        periodStart = fajrStart;
      } else if (now < sunriseEnd) {
        periodName = "Forbidden";
        periodEnd = sunriseEnd;
        periodStart = sunrise;
        isForbidden = true;
      } else if (now < ishraqEnd) {
        periodName = "Ishraq";
        periodEnd = ishraqEnd;
        periodStart = sunriseEnd;
      } else if (now < zenithStart) {
        periodName = "Duha";
        periodEnd = zenithStart;
        periodStart = ishraqEnd;
      } else if (now < dhuhrStart) {
        periodName = "Forbidden";
        periodEnd = dhuhrStart;
        periodStart = zenithStart;
        isForbidden = true;
      } else if (now < asrStart) {
        periodName = now.getDay() === 5 ? "Jumuah" : "Dhuhr";
        periodEnd = asrStart;
        periodStart = dhuhrStart;
      } else if (now < sunsetStart) {
        periodName = "Asr";
        periodEnd = sunsetStart;
        periodStart = asrStart;
      } else if (now < maghribStart) {
        periodName = "Forbidden";
        periodEnd = maghribStart;
        periodStart = sunsetStart;
        isForbidden = true;
      } else if (now < ishaStart) {
        periodName = "Maghrib";
        periodEnd = ishaStart;
        periodStart = maghribStart;
      } else {
        periodName = "Isha";
        periodEnd = tomorrowFajr;
        periodStart = ishaStart;
      }

      const totalDurationMs = periodEnd.getTime() - periodStart.getTime();
      const elapsedMs = now.getTime() - periodStart.getTime();
      const progress = Math.max(
        0,
        Math.min(100, (elapsedMs / totalDurationMs) * 100),
      );
      setProgressConfig({
        strokeDashoffset: Math.max(0, 289.03 - (289.03 * progress) / 100),
      });

      const diffMs = Math.max(0, periodEnd.getTime() - now.getTime());
      const totalSeconds = Math.ceil(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const remaining = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      setNextPrayer({
        name: periodName,
        time: periodEnd,
        remaining,
        progress,
        isForbidden,
      });

      const imsakTime = parse(
        (timings.Imsak || "00:00").split(" ")[0],
        "HH:mm",
        now,
      );
      const maghribTime = parse(
        (timings.Maghrib || "00:00").split(" ")[0],
        "HH:mm",
        now,
      );

      let fType: "sehri" | "iftar" = "sehri";
      let targetTime = imsakTime;
      let nextSehri = imsakTime;
      let nextIftar = maghribTime;
      let fProgress = 0;

      if (isAfter(now, imsakTime) && !isAfter(now, maghribTime)) {
        fType = "iftar";
        targetTime = maghribTime;
        const total = differenceInSeconds(maghribTime, imsakTime);
        const elapsed = differenceInSeconds(now, imsakTime);
        fProgress = Math.max(0, Math.min(100, (elapsed / total) * 100));
        if (tomorrowData)
          nextSehri = parse(
            (tomorrowData.timings.Imsak || "00:00").split(" ")[0],
            "HH:mm",
            addDays(now, 1),
          );
      } else if (isAfter(now, maghribTime)) {
        fType = "sehri";
        if (tomorrowData) {
          targetTime = parse(
            (tomorrowData.timings.Imsak || "00:00").split(" ")[0],
            "HH:mm",
            addDays(now, 1),
          );
          nextSehri = targetTime;
          nextIftar = parse(
            (tomorrowData.timings.Maghrib || "00:00").split(" ")[0],
            "HH:mm",
            addDays(now, 1),
          );
          const total = differenceInSeconds(targetTime, maghribTime);
          const elapsed = differenceInSeconds(now, maghribTime);
          fProgress = Math.max(0, Math.min(100, (elapsed / total) * 100));
        }
      } else {
        fType = "sehri";
        targetTime = imsakTime;
        const yStr = format(addDays(now, -1), "dd-MM-yyyy");
        const yesterdayData = data.find(
          (d: any) => d.date.gregorian.date === yStr,
        );
        const prevIftar = yesterdayData
          ? parse(
              (yesterdayData.timings.Maghrib || "00:00").split(" ")[0],
              "HH:mm",
              addDays(now, -1),
            )
          : subMinutes(imsakTime, 600);
        const total = differenceInSeconds(imsakTime, prevIftar);
        const elapsed = differenceInSeconds(now, prevIftar);
        fProgress = Math.max(0, Math.min(100, (elapsed / total) * 100));
      }

      const fDiffMs = Math.max(0, targetTime.getTime() - now.getTime());
      const fTotalSeconds = Math.ceil(fDiffMs / 1000);
      const fHours = Math.floor(fTotalSeconds / 3600);
      const fMinutes = Math.floor((fTotalSeconds % 3600) / 60);
      const fSeconds = fTotalSeconds % 60;
      const fRemaining = `${fHours.toString().padStart(2, "0")}:${fMinutes.toString().padStart(2, "0")}:${fSeconds.toString().padStart(2, "0")}`;

      setFastingInfo({
        nextSehri,
        nextIftar,
        remaining: fRemaining,
        type: fType,
        progress: fProgress,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const todayData = data?.find((d: any) => d.date.gregorian.date === todayStr);
  const hijriDate = todayData?.date.hijri;

  const memoizedForbiddenTimes = React.useMemo(() => {
    if (!todayData || !todayData.timings) return null;
    const now = new Date();
    // Parse using start of day so we only calculate time strings once a day reliably
    const timeToDate = (timeStr: string) => {
      const [hm] = timeStr.split(" ");
      const [h, m] = hm.split(":");
      const d = new Date(now);
      d.setHours(Number(h), Number(m), 0, 0);
      return d;
    };

    const sunriseTime = timeToDate(todayData.timings.Sunrise || "00:00");
    const dhuhrTime = timeToDate(todayData.timings.Dhuhr || "00:00");
    const sunsetTime = timeToDate(todayData.timings.Sunset || "00:00");

    return [
      {
        id: "sunrise",
        label: t("sunrise"),
        start: sunriseTime,
        end: addMinutes(sunriseTime, 15),
        icon: Sunrise,
        color: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/10",
      },
      {
        id: "zenith",
        label: t("zenith"),
        start: subMinutes(dhuhrTime, 10),
        end: dhuhrTime,
        icon: Sun,
        color: "text-orange-500 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-500/10",
      },
      {
        id: "sunset",
        label: t("sunset"),
        start: subMinutes(sunsetTime, 15),
        end: sunsetTime,
        icon: Sunset,
        color: "text-red-500 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-500/10",
      },
    ];
  }, [todayData, t]);

  const handleRefresh = async () => {
    // Show the text animation for a short duration
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      // Force clear Firestore persistence on native platforms if we suspect a hang
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

  useEffect(() => {
    // Hidden "shake to refresh" or just logic to handle deep sync
    const handleSyncEvent = () => handleRefresh();
    window.addEventListener("firestore-sync" as any, handleSyncEvent);
    return () =>
      window.removeEventListener("firestore-sync" as any, handleSyncEvent);
  }, []);

  if (prayerError) {
    return <div className="p-6 text-center text-red-500">{prayerError}</div>;
  }

  let forbiddenTimes = null;
  if (memoizedForbiddenTimes) {
    forbiddenTimes = memoizedForbiddenTimes.map((ft) => ({
      ...ft,
      isActive: isAfter(currentTime, ft.start) && !isAfter(currentTime, ft.end),
    }));
  }

  const isFriday = new Date().getDay() === 5;
  const PRAYERS_TO_SHOW_DYNAMIC = [
    "Fajr",
    "Ishraq",
    "Duha",
    isFriday ? "Jumuah" : "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
  ];

  let visiblePrayers = PRAYERS_TO_SHOW_DYNAMIC;
  if (nextPrayer) {
    if (!showAllPrayers) {
      const nextIdx = PRAYERS_TO_SHOW_DYNAMIC.indexOf(nextPrayer.name);
      // In compact view, show current and next upcoming starting from next (or current)
      const reordered = [
        ...PRAYERS_TO_SHOW_DYNAMIC.slice(nextIdx),
        ...PRAYERS_TO_SHOW_DYNAMIC.slice(0, nextIdx),
      ];
      visiblePrayers = reordered.slice(0, 2);
    } else {
      // When showing all, keep chronological order
      visiblePrayers = PRAYERS_TO_SHOW_DYNAMIC;
    }
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="relative isolate min-h-[100dvh] bg-slate-50 dark:bg-slate-950 font-sans flex flex-col">
        {/* Fake Status Bar Header */}
        <div className="fixed top-0 inset-x-0 h-safe bg-white dark:bg-slate-900 z-[200]" />

      {/* Top Background Bleed (Hero Color) */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-white dark:bg-slate-900 pointer-events-none overflow-hidden -z-10">
        {/* Soft Ambient Glows for White Theme */}
        <div className="absolute -top-32 -right-10 w-[120%] h-[150%] bg-primary/5 dark:bg-primary-dark/10 rounded-full blur-[120px] opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50/50 dark:bg-teal-900/5 rounded-full blur-3xl"></div>
      </div>

      {/* Unified Section (Hero + Fasting) */}
      <div className="relative z-10 transition-colors duration-500 pt-safe pt-4 pb-2">
        <div className="relative text-slate-800 dark:text-white px-4 pb-2">
          {/* Header Top Bar */}
          <div className="relative z-10 flex justify-between items-start mb-1">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="text-left group hover:opacity-80 transition-opacity focus:outline-none"
            >
              <div className="flex items-center text-slate-600 dark:text-slate-300 mb-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
                <span className="text-[13px] font-semibold tracking-wide border-b border-dashed border-slate-300 dark:border-slate-600 group-hover:border-primary transition-colors">
                  {city || t("unknown-location")}
                </span>
                <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {formatNumber(format(currentTime, "dd MMMM, yyyy"), language)}
              </div>
              {hijriDate && (
                <div className="text-[10px] text-primary/80 dark:text-primary/80 mt-0.5 font-medium">
                  {formatNumber(hijriDate.day, language)} {hijriDate.month.ar},{" "}
                  {formatNumber(hijriDate.year, language)}
                </div>
              )}
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("notifications")}
                className="p-2 hover:opacity-80 transition-opacity relative"
              >
                <Bell className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Circular Progress & Next Prayer */}
          <div className="relative z-10 flex justify-center items-center mt-0 mb-0">
            {/* Sunrise/Sunset Indicators */}
            <div className="absolute left-0 flex flex-col items-center text-slate-400 dark:text-slate-500">
              <Sunrise className="w-4 h-4 mb-0.5 text-amber-500/80" />
              <span className="text-[10px] font-semibold tracking-wider">
                {todayData?.timings?.Sunrise
                  ? formatNumber(
                      format(
                        parse(
                          todayData.timings.Sunrise.split(" ")[0],
                          "HH:mm",
                          currentTime,
                        ),
                        "hh:mm a",
                      )
                        .replace("AM", language === "bn" ? "এএম" : "AM")
                        .replace("PM", language === "bn" ? "পিএম" : "PM"),
                      language,
                    )
                  : "--:--"}
              </span>
            </div>
            <div className="absolute right-0 flex flex-col items-center text-slate-400 dark:text-slate-500">
              <Sunset className="w-4 h-4 mb-0.5 text-orange-500/80" />
              <span className="text-[10px] font-semibold tracking-wider">
                {todayData?.timings?.Sunset
                  ? formatNumber(
                      format(
                        parse(
                          todayData.timings.Sunset.split(" ")[0],
                          "HH:mm",
                          currentTime,
                        ),
                        "hh:mm a",
                      )
                        .replace("AM", language === "bn" ? "এএম" : "AM")
                        .replace("PM", language === "bn" ? "পিএম" : "PM"),
                      language,
                    )
                  : "--:--"}
              </span>
            </div>

            {/* Main Circle - Clean & Premium White (Compact) */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer soft shadow ring */}
              <div className="absolute inset-1.5 rounded-full shadow-[inset_0_0_15px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_0_15px_rgba(0,0,0,0.2)]"></div>

              <svg
                className="absolute inset-0 w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient
                    id="ring-gradient-light"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop
                      offset="100%"
                      stopColor="var(--color-primary-light)"
                    />
                  </linearGradient>
                  <filter
                    id="soft-shadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="3"
                      stdDeviation="3"
                      floodOpacity="0.15"
                      floodColor="var(--color-primary)"
                    />
                  </filter>
                </defs>
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="2"
                />
                {/* Progress Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke={
                    nextPrayer?.isForbidden
                      ? "#ef4444"
                      : "url(#ring-gradient-light)"
                  }
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter={
                    nextPrayer?.isForbidden ? "none" : "url(#soft-shadow)"
                  }
                  strokeDasharray="289.03"
                  strokeDashoffset={progressConfig.strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>

              <div className="text-center z-10 flex flex-col items-center justify-center mt-0.5">
                <p
                  className={cn(
                    "text-[9px] font-bold mb-0.5 tracking-widest uppercase",
                    nextPrayer?.isForbidden
                      ? "text-red-500"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {nextPrayer?.isForbidden
                    ? t("now-forbidden")
                    : t("prayer-times")}
                </p>
                <h2
                  className={cn(
                    "text-2xl font-extrabold mb-0 tracking-tight",
                    nextPrayer?.isForbidden
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-800 dark:text-white",
                  )}
                >
                  {nextPrayer ? t(nextPrayer.name.toLowerCase() as any) : "..."}
                </h2>
                <div
                  className={cn(
                    "text-lg font-bold tracking-widest leading-none mt-1",
                    nextPrayer?.isForbidden
                      ? "text-red-600 dark:text-red-400"
                      : "text-primary dark:text-primary-light",
                  )}
                >
                  {formatNumber(nextPrayer?.remaining || "00:00:00", language)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fasting Info Section - Now inside the card */}
        <div className="px-3 pb-2 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex justify-between items-center divide-x divide-slate-100 dark:divide-slate-800 mb-2 pt-2">
            <div className="flex-1 text-center px-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">
                {t("next-sehri")}
              </p>
              <p className="text-base font-black text-slate-800 dark:text-slate-100">
                {fastingInfo?.nextSehri
                  ? formatNumber(
                      format(fastingInfo.nextSehri, "hh:mm a")
                        .replace("AM", language === "bn" ? "এএম" : "AM")
                        .replace("PM", language === "bn" ? "পিএম" : "PM"),
                      language,
                    )
                  : "--:--"}
              </p>
            </div>
            <div className="flex-1 text-center px-1">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">
                {t("next-iftar")}
              </p>
              <p className="text-base font-black text-slate-800 dark:text-slate-100">
                {fastingInfo?.nextIftar
                  ? formatNumber(
                      format(fastingInfo.nextIftar, "hh:mm a")
                        .replace("AM", language === "bn" ? "এএম" : "AM")
                        .replace("PM", language === "bn" ? "পিএম" : "PM"),
                      language,
                    )
                  : "--:--"}
              </p>
            </div>
            <div className="flex-1 text-center px-1">
              <p className="text-[10px] font-black text-primary dark:text-primary-light mb-1 uppercase tracking-widest">
                {fastingInfo?.type === "sehri"
                  ? t("sehri-remaining")
                  : t("iftar-remaining")}
              </p>
              <p className="text-base font-black text-primary dark:text-primary-light">
                {formatNumber(fastingInfo?.remaining || "00:00:00", language)}
              </p>
            </div>
          </div>

          {/* Fasting Progress Bar */}
          <div className="space-y-1.5 mb-2 px-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-400 dark:text-slate-500">
                {fastingInfo?.type === "iftar"
                  ? t("fasting-progress")
                  : t("sehri-wait")}
              </span>
              <span className="text-primary dark:text-primary-light">
                {formatNumber(Math.round(fastingInfo?.progress || 0), language)}
                %
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${fastingInfo?.progress || 0}%`,
                  transition: "width 1s linear",
                }}
                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
              />
            </div>
          </div>

          {/* Banner Slider inside the top section */}
          <div className="w-full relative rounded-xl overflow-hidden shadow-inner aspect-[2.8/1] bg-slate-100 dark:bg-slate-800/80 group mt-2">
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
                    <div className="max-w-[75%]">
                      <motion.h4
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-white text-[11px] sm:text-xs font-black drop-shadow-md leading-tight uppercase tracking-wide"
                      >
                        {banners[currentBanner].title}
                      </motion.h4>
                      <button className="mt-2 bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg active:scale-95 transition-transform uppercase tracking-widest flex items-center gap-1.5">
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
                            ? "বিস্তারিত"
                            : "Details"}
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
                    idx === currentBanner ? "w-4 bg-white" : "w-1 bg-white/40",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Section (Prayer Times + Categories + Scholars) */}
      <div className="bg-white dark:bg-slate-900 transition-all duration-500 pb-4 flex-1">
        <div className="px-6 pt-0 pb-0">
          <SlimBannerAd category="home" />
        </div>

        {/* Prayer Times List */}
        <div className="relative">
          <div className="flex justify-between items-center px-6 py-1">
            <h3 className="text-[14px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t("prayer-times")}
            </h3>
            <button
              onClick={() => openSystemAlarm(setActiveTab)}
              className="px-3 py-1 bg-primary/5 dark:bg-primary/10 rounded-full text-[10px] font-black text-primary dark:text-primary-light uppercase tracking-widest flex items-center hover:bg-primary/10 transition-colors"
            >
              {t("set-alarm")} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div
            className={cn(
              "px-6 pb-1 overflow-hidden transition-all duration-500",
              !showAllPrayers ? "max-h-[160px]" : "max-h-[600px]",
            )}
          >
            {todayData &&
              todayData.timings &&
              visiblePrayers.map((prayer, index) => {
                const timingKey = prayer === "Jumuah" ? "Dhuhr" : prayer;
                let timing =
                  todayData.timings[
                    timingKey as keyof typeof todayData.timings
                  ];

                const now = new Date();
                const timeToDate = (timeStr: string) => {
                  const [hm] = timeStr.split(" ");
                  const [h, m] = hm.split(":");
                  const d = new Date(now);
                  d.setHours(Number(h), Number(m), 0, 0);
                  return d;
                };

                if (prayer === "Ishraq" || prayer === "Duha") {
                  const sunriseDate = timeToDate(
                    todayData.timings.Sunrise || "00:00",
                  );
                  const sunriseEnd = addMinutes(sunriseDate, 15);
                  const ishraqEnd = addMinutes(sunriseEnd, 30);
                  const targetTime =
                    prayer === "Ishraq" ? sunriseEnd : ishraqEnd;
                  timing = `${targetTime.getHours().toString().padStart(2, "0")}:${targetTime.getMinutes().toString().padStart(2, "0")}`;
                }

                if (!timing) return null;
                const timeStr = timing.split(" ")[0];
                const [hours, minutes] = timeStr.split(":");
                const prayerTime = new Date(now);
                prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                const isNext = nextPrayer?.name === prayer;
                const isPassed = now.getTime() > prayerTime.getTime();

                let Icon = Sun;
                if (prayer === "Fajr") Icon = Sunrise;
                if (prayer === "Maghrib" || prayer === "Isha") Icon = Moon;
                if (prayer === "Ishraq" || prayer === "Duha") Icon = Sun;

                return (
                  <div
                    key={prayer}
                    className={cn(
                      "flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/30 last:border-0 transition-opacity duration-300",
                      isPassed && !isNext ? "opacity-40" : "",
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-6 h-6 flex items-center justify-center transition-all duration-300",
                          isNext
                            ? "text-primary dark:text-primary-light"
                            : "text-slate-400 dark:text-slate-500",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4
                        className={cn(
                          "font-black text-[13px] uppercase tracking-wide",
                          isNext
                            ? "text-primary dark:text-primary-light"
                            : "text-slate-700 dark:text-slate-300",
                        )}
                      >
                        {t(prayer.toLowerCase() as any)}
                      </h4>
                    </div>

                    <div className="text-right">
                      <p
                        className={cn(
                          "font-black text-[13px]",
                          isNext
                            ? "text-primary dark:text-primary-light"
                            : "text-slate-700 dark:text-slate-300",
                        )}
                      >
                        {formatNumber(
                          format(prayerTime, "hh:mm a")
                            .replace("AM", language === "bn" ? "এএম" : "AM")
                            .replace("PM", language === "bn" ? "পিএম" : "PM"),
                          language,
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {!showAllPrayers && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 dark:from-slate-900 dark:via-slate-900/80 to-transparent flex items-end justify-center z-10 pointer-events-none pb-4">
              <button
                onClick={() => setShowAllPrayers(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-black text-primary hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all pointer-events-auto"
              >
                {t("show-all")}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {showAllPrayers && (
            <div className="flex justify-center pb-4">
              <button
                onClick={() => setShowAllPrayers(false)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 shadow-sm transition-all"
              >
                {t("collapse")}
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-0">
          <div className="flex justify-between items-center px-6 py-1">
            <h3 className="text-[14px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t("categories")}
            </h3>
            <button
              onClick={() => setActiveTab("categories")}
              className="px-3 py-1 bg-primary/5 dark:bg-primary/10 rounded-full text-[10px] font-black text-primary dark:text-primary-light uppercase tracking-widest flex items-center hover:bg-primary/10 transition-colors"
            >
              {language === "bn" ? "সবগুলো" : "See All"}{" "}
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="px-6 pb-2">
            <div className="grid grid-cols-4 gap-y-3 gap-x-2">
              {[
                ...CATEGORIES.filter((c) =>
                  [
                    "quran",
                    "hadith",
                    "education",
                    "namaz-shikkha",
                    "qibla",
                    "tasbih",
                    "zakat",
                    "calendar",
                    "dua",
                    "names-of-allah",
                    "ramadan",
                    "islamic-names",
                  ].includes(c.id),
                ),
              ].map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => {
                    if (cat.id === "zakat") {
                      setActiveTab("zakat");
                    } else {
                      setActiveTab(cat.id);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 relative",
                      "border border-slate-50 dark:border-slate-800 shadow-sm group-active:scale-90",
                      cat.bg,
                      cat.color,
                    )}
                  >
                    <cat.icon className="w-5 h-5 stroke-[2.5px]" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors px-1">
                    {t(cat.id as any)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scholars Section (Q&A) */}
        {(scholars.length > 0 || scholarsLoading) && (
        <div className="mt-0">
          <div className="flex justify-between items-center px-6 py-1">
            <h3 className="text-[14px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {language === "bn" ? "মাসাআলা (Q&A)" : "Masalah (Q&A)"}
            </h3>
            <button
              onClick={() => setActiveTab("scholars")}
              className="px-3 py-1 bg-primary/5 dark:bg-primary/10 rounded-full text-[10px] font-black text-primary dark:text-primary-light uppercase tracking-widest flex items-center hover:bg-primary/10 transition-colors"
            >
              {language === "bn" ? "সবগুলো" : "See All"}{" "}
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="px-4 pb-2 overflow-x-auto no-scrollbar flex space-x-4 snap-x">
            {scholarsLoading && scholars.length === 0 ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex-shrink-0 w-32 bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden border border-slate-100/50 dark:border-slate-800 shadow-sm snap-center">
                  <div className="h-32 w-full shimmer"></div>
                  <div className="p-2 space-y-2">
                    <div className="h-2 w-3/4 shimmer rounded"></div>
                    <div className="h-2 w-full shimmer rounded opacity-50"></div>
                    <div className="h-6 w-full shimmer rounded-md mt-2"></div>
                  </div>
                </div>
              ))
            ) : (
              scholars.map((scholar, idx) => (
                <motion.div
                  key={scholar.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex-shrink-0 w-32 bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden border border-slate-100/50 dark:border-slate-800 shadow-sm snap-center group"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={scholar.imageUrl}
                      alt={scholar.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-2">
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate mb-0.5">
                      {scholar.name}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 line-clamp-1 mb-2">
                      {scholar.description}
                    </p>
                    <button
                      onClick={() => handleCall(scholar.phoneNumber)}
                      className="w-full py-1.5 bg-primary text-white rounded-md shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-2.5 h-2.5 fill-white/20" />
                      <span className="text-[8px] font-black uppercase tracking-wider">
                        {language === "bn" ? "কল করুন" : "Call Now"}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
        )}

        {/* Forbidden Prayer Times Section */}
        {forbiddenTimes && (
          <div className="mt-1 border-t border-slate-50 dark:border-slate-800/50">
            <div className="flex justify-between items-center px-6 py-1">
              <h3 className="text-[14px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                {t("forbidden-times")}
              </h3>
              <ShieldCheck className="w-4 h-4 text-red-500 opacity-50" />
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-50 dark:divide-slate-800/50">
              {forbiddenTimes.map((time, idx) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={time.id}
                  className={cn(
                    "p-5 text-center flex flex-col items-center justify-center relative",
                    (time as any).isActive && "bg-red-50/20 dark:bg-red-900/5",
                  )}
                >
                  {(time as any).isActive && (
                    <div className="absolute top-2 right-2">
                      <span className="flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-transform duration-300",
                      time.bg,
                      time.color,
                      (time as any).isActive &&
                        "scale-110 shadow-lg shadow-red-500/10",
                    )}
                  >
                    <time.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 mb-1 uppercase tracking-wide leading-tight">
                    {time.label}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 leading-tight">
                    {formatNumber(
                      format(time.start, "hh:mm a")
                        .replace("AM", language === "bn" ? "এএম" : "AM")
                        .replace("PM", language === "bn" ? "পিএম" : "PM"),
                      language,
                    )}
                    <br />
                    <span className="text-[8px] opacity-40 py-0.5 block">
                      {language === "bn" ? "থেকে" : "to"}
                    </span>
                    {formatNumber(
                      format(time.end, "hh:mm a")
                        .replace("AM", language === "bn" ? "এএম" : "AM")
                        .replace("PM", language === "bn" ? "পিএম" : "PM"),
                      language,
                    )}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentCountry={country}
        currentCity={city}
        currentLat={latitude}
        currentLon={longitude}
      />
      </div>
    </PullToRefresh>
  );
}
