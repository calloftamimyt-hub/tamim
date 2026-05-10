import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ToolHeroProps {
  title: { bn: string; en: string };
  description: { bn: string; en: string };
  Icon: React.ElementType;
  bgGradient: string;
  onBack?: () => void; // Kept as optional to satisfy existing tool components
}

export const ToolHero = ({ title, description, Icon, bgGradient }: ToolHeroProps) => {
  const { language } = useLanguage();
  
  return (
    <div className={cn("relative overflow-hidden shrink-0 pt-10 pb-6 px-4 sm:px-6 z-10 shadow-[0_2px_20px_rgba(0,0,0,0.06)] rounded-b-3xl mx-[-1px] mt-[-1px]", bgGradient)}>
      <div className="absolute inset-0 bg-black/[0.08] dark:bg-black/20" />
      <div className="absolute -right-6 -top-6 opacity-[0.15] transform rotate-12 pointer-events-none mix-blend-overlay">
        <Icon className="w-48 h-48 text-white" strokeWidth={1} />
      </div>
      <div className="relative flex items-center gap-4 max-w-5xl mx-auto">
        <div className="flex-1 min-w-0">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm truncate"
          >
             {language === 'bn' ? title.bn : title.en}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[11px] sm:text-xs text-white/90 font-bold mt-1 drop-shadow-sm max-w-[90%] truncate"
          >
            {language === 'bn' ? description.bn : description.en}
          </motion.p>
        </div>
      </div>
    </div>
  );
};
