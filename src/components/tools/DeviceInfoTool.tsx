import React, { useState, useEffect } from 'react';
import { ToolHero } from './ToolHero';
import { Smartphone, ArrowLeft, Monitor, Info, Wifi, Cpu, Globe } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const DeviceInfoTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [deviceData, setDeviceData] = useState<{ label: { en: string, bn: string }, value: string, icon: React.ElementType }[]>([]);

  useEffect(() => {
    // Only run on client side
    const getData = () => {
      const nav = window.navigator as any;
      const screen = window.screen;
      
      let os = 'Unknown OS';
      if (nav.userAgent.indexOf("Win") !== -1) os = "Windows";
      if (nav.userAgent.indexOf("Mac") !== -1) os = "MacOS";
      if (nav.userAgent.indexOf("X11") !== -1) os = "UNIX";
      if (nav.userAgent.indexOf("Linux") !== -1) os = "Linux";
      if (/Android/.test(nav.userAgent)) os = "Android";
      if (/iPhone|iPad|iPod/.test(nav.userAgent)) os = "iOS";

      let browserName = "Unknown Browser";
      if (nav.userAgent.indexOf("Firefox") !== -1) browserName = "Firefox";
      else if (nav.userAgent.indexOf("Opera") !== -1 || nav.userAgent.indexOf("OPR") !== -1) browserName = "Opera";
      else if (nav.userAgent.indexOf("Trident") !== -1) browserName = "IE";
      else if (nav.userAgent.indexOf("Edge") !== -1) browserName = "Edge";
      else if (nav.userAgent.indexOf("Chrome") !== -1) browserName = "Chrome";
      else if (nav.userAgent.indexOf("Safari") !== -1) browserName = "Safari";

      setDeviceData([
        {
           label: { en: 'Operating System', bn: 'অপারেটিং সিস্টেম' },
           value: os,
           icon: Cpu
        },
        {
           label: { en: 'Browser', bn: 'ব্রাউজার' },
           value: browserName,
           icon: Globe
        },
        {
           label: { en: 'Screen Resolution', bn: 'স্ক্রিন রেজোলিউশন' },
           value: `${screen.width} x ${screen.height}`,
           icon: Monitor
        },
        {
           label: { en: 'Color Depth', bn: 'কালার ডেপথ' },
           value: `${screen.colorDepth}-bit`,
           icon: Info
        },
        {
           label: { en: 'Language', bn: 'ভাষা' },
           value: nav.language || 'Unknown',
           icon: Globe
        },
        {
           label: { en: 'Network Status', bn: 'নেটওয়ার্ক' },
           value: nav.onLine ? 'Online' : 'Offline',
           icon: Wifi
        },
        {
           label: { en: 'User Agent', bn: 'ইউজার এজেন্ট' },
           value: nav.userAgent,
           icon: Smartphone
        }
      ]);
    };
    
    getData();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'ডিভাইস ইনফো', en: 'Device Info' }} description={{ bn: 'আপনার বর্তমান ডিভাইসের বিস্তারিত তথ্য', en: 'Browser & System information details' }} Icon={Smartphone} bgGradient="bg-gradient-to-br from-gray-500 to-slate-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 max-w-3xl mx-auto w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {deviceData.map((item, idx) => {
             const Icon = item.icon;
             return (
               <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-start gap-4",
                    idx === deviceData.length - 1 ? "md:col-span-2" : ""
                  )}
               >
                 <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 mb-1">
                      {language === 'bn' ? item.label.bn : item.label.en}
                    </p>
                    <p className={cn("font-black text-slate-800 dark:text-slate-200 break-words", idx === deviceData.length - 1 ? "text-sm font-mono leading-relaxed" : "text-lg")}>
                      {item.value}
                    </p>
                 </div>
               </motion.div>
             )
           })}
        </div>

      </div>
    </div>
  );
};
