import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 80;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
}) => {
  const { language } = useLanguage();
  const appName = language === "bn" ? "Halal Circle" : "Muslim Companion";

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh if we are at the top of the page
    if (window.scrollY <= 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && window.scrollY <= 0) {
      // It's a pull down from the top
      // We don't preventDefault here because it can break scrolling bugs on some browsers,
      // but we do update the distance
      setPullDistance(Math.min(distance * 0.4, PULL_THRESHOLD * 1.5));
    } else if (distance < 0 || window.scrollY > 0) {
      // User is scrolling down the page normally, or scrolling back up slightly
      // Stop tracking pull to refresh
      setPullDistance(0);
      setStartY(0);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            className="fixed top-0 inset-x-0 w-full flex items-center justify-center overflow-hidden z-50 pointer-events-none"
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: isRefreshing ? PULL_THRESHOLD : pullDistance,
              opacity: (pullDistance / PULL_THRESHOLD) || 1
             }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className={`flex space-x-0.5 mt-8 items-center ${isRefreshing ? '' : 'opacity-70'}`}>
              {appName.split("").map((char, index) => (
                <motion.span
                  key={index}
                  className="font-bold text-xl drop-shadow-sm text-primary dark:text-blue-400"
                  animate={
                    isRefreshing
                      ? {
                          y: [0, -8, 0],
                          opacity: [0.5, 1, 0.5],
                          textShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 4px 8px rgba(0,0,0,0.2)", "0px 0px 0px rgba(0,0,0,0)"]
                        }
                      : { y: 0, opacity: 1 }
                  }
                  transition={
                    isRefreshing
                      ? {
                          duration: 1.2,
                          repeat: Infinity,
                          delay: index * 0.08,
                          ease: "easeInOut"
                        }
                      : {}
                  }
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          y: isRefreshing ? PULL_THRESHOLD : pullDistance,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="w-full h-full min-h-[100dvh]"
      >
        {children}
      </motion.div>
    </div>
  );
};
