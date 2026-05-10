import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Play, Pause, SkipForward, SkipBack, 
  Volume2, List, Headphones, ChevronRight, Share2, Heart
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Surah {
  id: number;
  name: string;
  englishName: string;
  url: string;
  duration: string;
}

const SURAHS: Surah[] = [
  { id: 1, name: 'আল ফাতিহা', englishName: 'Al-Fatihah', url: 'https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/001.mp3', duration: '0:50' },
  { id: 2, name: 'আল বাক্বারাহ', englishName: 'Al-Baqarah', url: 'https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/002.mp3', duration: '120:00' },
  { id: 36, name: 'ইয়াসিন', englishName: 'Yaseen', url: 'https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/036.mp3', duration: '12:00' },
  { id: 55, name: 'আর-রাহমান', englishName: 'Ar-Rahman', url: 'https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/055.mp3', duration: '10:00' },
  { id: 67, name: 'আল-মূলক', englishName: 'Al-Mulk', url: 'https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/067.mp3', duration: '7:00' },
  { id: 112, name: 'আল-ইখলাস', englishName: 'Al-Ikhlas', url: 'https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/112.mp3', duration: '0:15' },
  { id: 113, name: 'আল-ফালাক্ব', englishName: 'Al-Falaq', url: 'https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/113.mp3', duration: '0:20' },
  { id: 114, name: 'আন-নাস', englishName: 'An-Nas', url: 'https://download.quranicaudio.com/quran/mishari_rashid_al-afasy/114.mp3', duration: '0:25' },
];

export function QuranAudioPlayer({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [currentSurahIndex, setCurrentSurahIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSurah = currentSurahIndex !== null ? SURAHS[currentSurahIndex] : null;

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log('Playback failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSurahIndex]);

  const togglePlay = (index: number) => {
    if (currentSurahIndex === index) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSurahIndex(index);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleEnded = () => {
    if (currentSurahIndex !== null && currentSurahIndex < SURAHS.length - 1) {
      setCurrentSurahIndex(currentSurahIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-md mx-auto flex flex-col bg-slate-50 dark:bg-slate-950 pb-safe">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 shadow-sm z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('quran-recitation')}</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Main Player Area (YouTube Style) */}
        <AnimatePresence mode="wait">
          {currentSurah ? (
            <motion.div 
              key={currentSurah.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 overflow-hidden shadow-xl"
            >
              <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl opacity-50" />
                <Headphones className="w-20 h-20 text-emerald-500/30 animate-pulse" />
                
                {/* Visualizer bars simulation */}
                <div className="absolute bottom-0 left-0 w-full h-12 flex items-end justify-center gap-1 px-4 mb-2">
                  {[...Array(20)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: isPlaying ? [8, 24, 12, 32, 10] : 4 }}
                      transition={{ duration: 0.5 + Math.random(), repeat: Infinity, delay: i * 0.05 }}
                      className="w-1 bg-emerald-500/40 rounded-full"
                    />
                  ))}
                </div>

                <audio 
                  ref={audioRef}
                  src={currentSurah.url}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                />
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{currentSurah.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">{currentSurah.englishName} • Recited by Mishary Rashid Alafasy</p>
                  </div>
                  <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500" 
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'tween' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>{t('play-now')}</span>
                    <span>{currentSurah.duration}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-8 py-2">
                   <button 
                     disabled={currentSurahIndex === 0}
                     onClick={() => setCurrentSurahIndex((prev) => (prev !== null ? prev - 1 : 0))}
                     className="text-slate-400 disabled:opacity-20 transition-opacity"
                   >
                     <SkipBack className="w-8 h-8 fill-current" />
                   </button>
                   <button 
                     onClick={() => setIsPlaying(!isPlaying)}
                     className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 active:scale-90 transition-transform"
                   >
                     {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-0.5" />}
                   </button>
                   <button 
                     disabled={currentSurahIndex === SURAHS.length - 1}
                     onClick={() => setCurrentSurahIndex((prev) => (prev !== null ? prev + 1 : SURAHS.length - 1))}
                     className="text-slate-400 disabled:opacity-20 transition-opacity"
                   >
                     <SkipForward className="w-8 h-8 fill-current" />
                   </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-6">
              <div className="aspect-video bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl mb-6">
                <Headphones className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-black uppercase tracking-widest">{t('listen-quran')}</h3>
                <p className="text-xs opacity-70 font-medium">Select a surah to start listening</p>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* surah List */}
        <div className="px-5 space-y-4 mt-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
             <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
               <List className="w-4 h-4 text-emerald-500" />
               {t('surahs')}
             </h3>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{SURAHS.length} Total</span>
          </div>

          <div className="space-y-3">
            {SURAHS.map((surah, index) => (
              <motion.button
                key={surah.id}
                onClick={() => togglePlay(index)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                  currentSurahIndex === index 
                    ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" 
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs",
                  currentSurahIndex === index 
                    ? "bg-emerald-500 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  {surah.id}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-black text-slate-900 dark:text-white text-sm">{surah.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{surah.englishName}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase">{surah.duration}</div>
                  {currentSurahIndex === index && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <motion.div animate={{ height: [2, 10, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-emerald-500" />
                      <motion.div animate={{ height: [10, 4, 8] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-0.5 bg-emerald-500" />
                      <motion.div animate={{ height: [4, 8, 2] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-emerald-500" />
                    </div>
                  ) : (
                    <Play className={cn("w-4 h-4", currentSurahIndex === index ? "text-emerald-500" : "text-slate-300")} />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
