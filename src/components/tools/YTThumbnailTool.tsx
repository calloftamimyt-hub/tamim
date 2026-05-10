import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Youtube, ArrowLeft, Download, Search, Image, ExternalLink, AlertCircle, Loader2, Link } from 'lucide-react';

import { motion } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface YTThumbnailToolProps {
  onBack: () => void;
}

export const YTThumbnailTool: React.FC<YTThumbnailToolProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isFinding, setIsFinding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

  const extractVideoId = (input: string) => {
    try {
      if (!input.trim()) return null;
      
      // Standard YouTube URLs
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = input.match(regExp);
      if (match && match[7].length === 11) return match[7];
      
      // Shorts
      if (input.includes('youtube.com/shorts/')) {
        const parts = input.split('shorts/');
        const lastPart = parts[1]?.split('?')[0];
        if (lastPart?.length === 11) return lastPart;
      }
      
      // Handle bare IDs
      if (input.length === 11 && !input.includes('/') && !input.includes('.')) return input;
      
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleGetThumbnails = () => {
    setError(null);
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    
    setIsFinding(true);
    const id = extractVideoId(trimmedUrl);
    
    setTimeout(() => {
      if (id) {
        setVideoId(id);
      } else {
        setError(language === 'bn' ? 'সঠিক ইউটিউব লিংক প্রদান করুন' : 'Provide a valid YouTube link');
        setVideoId(null);
      }
      setIsFinding(false);
    }, 400);
  };

  const thumbnailOptions = videoId ? [
    { id: 'max', label: 'Maximum Resolution (HD)', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '1920x1080' },
    { id: 'sd', label: 'Standard Quality', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, size: '640x480' },
    { id: 'hq', label: 'High Quality', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, size: '480x360' },
    { id: 'mq', label: 'Medium Quality', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, size: '320x180' }
  ] : [];

  const downloadThumbnail = async (thumbnailUrl: string, label: string) => {
    if (downloadingUrl) return;
    setDownloadingUrl(thumbnailUrl);
    
    const fileName = `youtube_thumbnail_${videoId || 'yt'}_${label.toLowerCase().replace(/\s+/g, '_')}.jpg`;

    try {
      // First try fetching directly. On native (if CapacitorHttp is enabled) or if CORS allows, this works.
      let blob: Blob;
      try {
        const response = await fetch(thumbnailUrl);
        if (!response.ok) throw new Error('Direct fetch failed');
        blob = await response.blob();
      } catch (e) {
        // Fallback 1: corsproxy
        try {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(thumbnailUrl)}`;
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error('Proxy failed');
          blob = await response.blob();
        } catch (e2) {
          // Fallback 2: allorigins
          const secondaryProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(thumbnailUrl)}`;
          const response = await fetch(secondaryProxy);
          if (!response.ok) throw new Error('Secondary proxy failed');
          blob = await response.blob();
        }
      }

      if (Capacitor.isNativePlatform()) {
        // Native download using Filesystem
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1] || result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });

        // Use Share API to let user save to gallery
        await Share.share({
          title: 'Save or Share Thumbnail',
          url: savedFile.uri,
          dialogTitle: 'Save Thumbnail'
        });
      } else {
        // Web download
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(objectUrl);
      }
    } catch (err) {
      console.error("Download failed completely:", err);
      setError(language === 'bn' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed completely');
    } finally {
      setDownloadingUrl(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <ToolHero title={{ bn: 'থাম্বনেইল ডাউনলোড', en: 'YT Thumbnail Downloader' }} description={{ bn: 'কোয়ালিটি অনুযায়ী সেভ করুন', en: 'Save in different qualities' }} Icon={Youtube} bgGradient="bg-gradient-to-br from-red-500 to-rose-600" onBack={onBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
          {/* Input Card - Thinner vertically as requested */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Link className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={language === 'bn' ? 'লিংক এখানে পেস্ট করুন...' : 'Paste YouTube link here...'}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all dark:text-white"
                />
              </div>
              <button 
                onClick={handleGetThumbnails}
                disabled={isFinding || !url.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black px-8 py-3 rounded-lg shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-xs"
              >
                {isFinding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {language === 'bn' ? 'খুঁজুন' : 'Search'}
              </button>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 flex items-center gap-2 text-red-500 text-[11px] font-bold"
              >
                <AlertCircle className="w-3 h-3" />
                {error}
              </motion.div>
            )}
          </div>

          {/* Results section - Wide orientation as requested */}
          {videoId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {thumbnailOptions.map((opt, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                     <img 
                      src={opt.url} 
                      alt={opt.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement?.classList.add('hidden');
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded-md border border-white/10 text-[9px] font-black text-white px-2">
                      {opt.size}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-slate-900">
                     <div className="flex items-center justify-between mb-3 px-1">
                       <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{opt.label}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <button 
                         onClick={() => window.open(opt.url, '_blank')}
                         className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] font-black text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                       >
                         <ExternalLink className="w-3.5 h-3.5" />
                         VIEW
                       </button>
                       <button 
                         onClick={() => downloadThumbnail(opt.url, opt.label)}
                         disabled={downloadingUrl === opt.url}
                         className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black transition-all active:scale-95 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                       >
                         {downloadingUrl === opt.url ? (
                           <Loader2 className="w-3.5 h-3.5 animate-spin" />
                         ) : (
                           <Download className="w-3.5 h-3.5" />
                         )}
                         {downloadingUrl === opt.url ? (language === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'DOWNLOADING...') : 'DOWNLOAD'}
                       </button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            !isFinding && (
              <div className="text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white mb-1">
                  {language === 'bn' ? 'কোনো থাম্বনেইল নেই' : 'No Thumbnails to display'}
                </h3>
                <p className="text-[11px] text-slate-500 font-bold max-w-[200px] mx-auto">
                  {language === 'bn' ? 'ইউটিউব ভিডিওর লিংক দিন এবং ইমেজগুলো লোড করুন' : 'Enter a YouTube link above to fetch all available resolutions'}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
