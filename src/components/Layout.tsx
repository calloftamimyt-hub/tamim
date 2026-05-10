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
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useLanguage } from "../contexts/LanguageContext";
import { OfflineImage } from "./OfflineImage";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [user, setUser] = useState<any>(null);
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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

  const tabs = [
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

                // Colors based on theme
                const activeColor = "text-primary dark:text-primary-light";
                const inactiveColor =
                  "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300";

                const iconClassName = cn("w-6 h-6 transition-all");
                const labelClassName = cn(
                  "text-[10px] font-medium transition-all",
                );

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                      isActive ? activeColor : inactiveColor,
                    )}
                  >
                    {tab.id === "profile" &&
                    user &&
                    (user.photoURL ||
                      user.user_metadata?.avatar_url ||
                      user.user_metadata?.picture) ? (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full overflow-hidden border",
                          isActive
                            ? "border-primary"
                            : "border-slate-300 dark:border-slate-700",
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
                      <Icon className={iconClassName} />
                    )}
                    <span className={labelClassName}>{tab.label}</span>
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
                      "flex items-center space-x-3 px-3 py-3 rounded-xl transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    {tab.id === "profile" &&
                    user &&
                    (user.photoURL ||
                      user.user_metadata?.avatar_url ||
                      user.user_metadata?.picture) ? (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full overflow-hidden border flex-shrink-0",
                          isActive
                            ? "border-primary"
                            : "border-slate-300 dark:border-slate-700",
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
                      <Icon className="w-6 h-6 flex-shrink-0" />
                    )}
                    <span className="hidden lg:block font-medium">
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
