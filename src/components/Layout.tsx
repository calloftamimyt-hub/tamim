import { ReactNode, useState, useEffect, useRef } from "react";
import {
  Home,
  BookOpen,
  CheckSquare,
  User,
  Users,
  ShieldCheck,
  Wallet,
  Trophy,
  Rss,
  Menu,
} from "lucide-react";
import { cn, getApiUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useLanguage } from "../contexts/LanguageContext";
import { OfflineImage } from "./OfflineImage";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [accountType, setAccountType] = useState<string>(() => localStorage.getItem("userAccountType") || "guardian");
  const { language, t } = useLanguage();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
      lastScrollY.current = 0;
      setIsVisible(true);
    }
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, "users", u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAccountType(docSnap.data().accountType || "guardian");
          }
        } catch (e) {
          console.error("Error fetching user data", e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const [navTheme, setNavTheme] = useState<"default" | "white">("default");
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // We no longer hide the navigation bar on scroll
    // The navigation bar will remain fixed at the bottom
  }, [activeTab]);

  useEffect(() => {
    const handleNavVisibility = (e: any) => {
      setIsVisible(e.detail);
    };
    window.addEventListener("set-nav-visibility", handleNavVisibility);
    return () =>
      window.removeEventListener("set-nav-visibility", handleNavVisibility);
  }, []);

  useEffect(() => {
    const handleThemeChange = (e: any) => setNavTheme(e.detail);
    const handleVisibilityChange = (e: any) => setIsVisible(!e.detail);

    window.addEventListener("nav-theme", handleThemeChange);
    window.addEventListener("hide-nav", handleVisibilityChange);

    return () => {
      window.removeEventListener("nav-theme", handleThemeChange);
      window.removeEventListener("hide-nav", handleVisibilityChange);
    };
  }, []);

  const allTabs = [
    { id: "home", label: t("home" as any) || "Home", icon: Home },
    { id: "tools", label: language === "bn" ? "ফিড" : "Feed", icon: Rss },
    { id: "earning", label: t("earning" as any) || "Earning", icon: Wallet },
    {
      id: "tracker",
      label: t("tracker" as any) || "Tracker",
      icon: CheckSquare,
    },
    {
      id: "profile",
      label:
        t("profile" as any) || (language === "bn" ? "প্রোফাইল" : "Profile"),
      icon: User,
    },
  ];

  const tabs = allTabs.filter(tab => {
    if (tab.id === 'earning' && accountType === 'child') return false;
    return true;
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 overflow-hidden">
      {/* Main Content Area */}
      <main
        ref={mainRef}
        className={cn(
          "flex-1 overflow-y-auto scrolling-touch overscroll-y-none",
          isVisible ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-20 lg:pl-64" : "md:pl-20 lg:pl-64",
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 border-t md:hidden z-[999] pb-safe transition-colors duration-300",
              navTheme === "white"
                ? "bg-white border-slate-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
            )}
          >
            <div className="flex justify-around items-center h-16">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex flex-col items-center justify-center w-full h-full group outline-none gap-0.5"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      animate={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="relative flex items-center justify-center w-[36px] h-[36px] z-20 rounded-full"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-bg"
                          className={cn(
                            "absolute inset-0 bg-primary shadow-lg shadow-primary/30 rounded-full border-[1px]",
                            navTheme === "white"
                              ? "border-white/50"
                              : "border-white/20 dark:border-slate-800"
                          )}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                          }}
                        />
                      )}

                      <div
                        className={cn(
                          "relative z-30 transition-colors duration-300",
                          isActive
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-primary group-hover:scale-110"
                        )}
                      >
                        {tab.id === "profile" &&
                        user &&
                        (user.photoURL ||
                          user.user_metadata?.avatar_url ||
                          user.user_metadata?.picture) ? (
                          <motion.div
                            initial={false}
                            animate={{ scale: isActive ? 1.15 : 1, rotate: isActive ? [0, -10, 10, -5, 5, 0] : 0 }}
                            transition={{ duration: 0.5 }}
                            className={cn(
                              "w-[26px] h-[26px] rounded-full overflow-hidden transition-all duration-300",
                              isActive
                                ? "border border-white shadow-sm"
                                : "border border-slate-300 dark:border-slate-700"
                            )}
                          >
                            <OfflineImage
                              src={
                                (user.photoURL?.startsWith("/")
                                  ? getApiUrl(user.photoURL)
                                  : user.photoURL) ||
                                ((
                                  user.user_metadata?.avatar_url as string
                                )?.startsWith("/")
                                  ? getApiUrl(
                                      user.user_metadata?.avatar_url as string
                                    )
                                  : user.user_metadata?.avatar_url) ||
                                user.user_metadata?.picture
                              }
                              alt="Profile"
                              className="w-full h-full object-cover rounded-full"
                              referrerPolicy="no-referrer"
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                             initial={false}
                             animate={isActive ? { 
                               scale: [1, 1.2, 0.9, 1.1, 1],
                               rotate: [0, -15, 15, -5, 0] 
                             } : { scale: 1, rotate: 0 }}
                             transition={{ duration: 0.6, ease: "easeInOut" }}
                             className="flex items-center justify-center relative w-[24px] h-[24px]"
                          >
                            <Icon
                              className="w-[24px] h-[24px]"
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                            {isActive && (
                              <motion.div
                                className="absolute -inset-2 rounded-full border-2 border-white opacity-0 pointer-events-none"
                                animate={{ scale: [0.8, 1.5], opacity: [0.8, 0] }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    <span
                      className={cn(
                        "text-[10px] font-medium transition-all duration-300 pointer-events-none mt-1",
                        isActive
                          ? "text-primary dark:text-primary-light opacity-100 font-bold"
                          : "text-slate-400 dark:text-slate-500 opacity-80"
                      )}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop) */}
      <AnimatePresence>
        {isVisible && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="hidden md:flex flex-col fixed top-0 left-0 h-[100dvh] w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[999]"
          >
            <div className="p-4 flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                M
              </div>
              <span className="hidden lg:block font-bold text-xl text-primary dark:text-primary-light">
                {t("app-name" as any) || "Halal Circle"}
              </span>
            </div>

            <div className="flex-1 py-6 flex flex-col gap-2 px-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex items-center space-x-3 px-3 py-3 rounded-xl transition-colors group",
                      isActive
                        ? "text-primary dark:text-primary-light"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-bg"
                        className="absolute inset-0 bg-primary/10 dark:bg-primary-dark/20 rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {tab.id === "profile" &&
                    user &&
                    (user.photoURL ||
                      user.user_metadata?.avatar_url ||
                      user.user_metadata?.picture) ? (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full overflow-hidden border flex-shrink-0 relative z-10 transition-all duration-300",
                          isActive
                            ? "border-primary scale-110"
                            : "border-slate-300 dark:border-slate-700 group-hover:scale-110"
                        )}
                      >
                        <OfflineImage
                          src={
                            (user.photoURL?.startsWith("/")
                              ? getApiUrl(user.photoURL)
                              : user.photoURL) ||
                            ((
                              user.user_metadata?.avatar_url as string
                            )?.startsWith("/")
                              ? getApiUrl(
                                  user.user_metadata?.avatar_url as string,
                                )
                              : user.user_metadata?.avatar_url) ||
                            user.user_metadata?.picture
                          }
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="relative z-10 flex items-center justify-center">
                        <Icon className={cn("w-[24px] h-[24px] flex-shrink-0 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                    )}
                    <span className="hidden lg:block font-medium relative z-10">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
