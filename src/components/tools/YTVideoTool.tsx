import React, { useState } from 'react';
import { Youtube, ArrowLeft, Download, Search, Image, ExternalLink, AlertCircle, Loader2, Link, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { useLanguage } from '@/contexts/LanguageContext';
import { cn, getApiUrl } from '@/lib/utils';
import { ToolHero } from './ToolHero';

interface YTFormat {
  quality: string;
  url: string;
  mimeType: string;
}

interface YTVideoInfo {
  title: string;
  thumbnail: string;
  formats: YTFormat[];
}

interface YTVideoToolProps {
  onBack: () => void;
}

export const YTVideoTool: React.FC<YTVideoToolProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<YTVideoInfo | null>(null);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

  const extractVideo = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    // Basic standard youtube/youtu.be checks (the backend also validates)
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError(language === 'bn' ? 'সঠিক ইউটিউব লিংক প্রদান করুন' : 'Provide a valid YouTube link');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/tools/yt-video'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video');
      }

      setVideoInfo(data);
    } catch (err: any) {
      console.error(err);
      setError(language === 'bn' ? 'ভিডিও পাওয়া যায়নি। লিংকটি সঠিক কিনা নিশ্চিত করুন।' : err.message || 'Could not find the video.');
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = async (videoUrl: string, quality: string) => {
    if (downloadingUrl) return;
    setDownloadingUrl(videoUrl);

    const fileName = `yt_video_${quality.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.mp4`;

    try {
      if (Capacitor.isNativePlatform()) {
        const savedFile = await Filesystem.downloadFile({
          url: videoUrl,
          path: fileName,
          directory: Directory.Documents,
        });

        const uriInfo = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Documents,
        });

        await Share.share({
          title: 'Save or Share YT Video',
          url: uriInfo.uri,
          dialogTitle: 'Save YT Video'
        });
      } else {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Download failed:", err);
      if (!Capacitor.isNativePlatform()) {
        window.open(videoUrl, '_blank');
      } else {
        setError(language === 'bn' ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Download failed completely');
      }
    } finally {
      setDownloadingUrl(null);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 flex flex-col font-sans">
      <ToolHero 
        title={{ bn: 'ইউটিউব ভিডিও ডাউনলোড', en: 'YT Video Downloader' }} 
        description={{ bn: 'ইউটিউব ভিডিও ডাউনলোড করুন', en: 'Download YouTube video quickly' }} 
        Icon={Youtube} 
        bgGradient="bg-gradient-to-br from-red-600 to-rose-700" 
        onBack={onBack} 
      />

      <div className="flex-1 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto w-full -mt-6 sm:-mt-8 md:-mt-12 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 md:p-6 lg:p-8">
          
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">
                {language === 'bn' ? 'ইউটিউব লিংক' : 'YouTube Link'}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && extractVideo()}
                    placeholder={language === 'bn' ? 'লিংক এখানে পেস্ট করুন...' : 'Paste YouTube link here...'}
                    className="block w-full pl-10 pr-20 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                  />
                  <div className="absolute inset-y-0 right-1.5 flex items-center">
                    <button
                      onClick={handlePaste}
                      className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all shadow-sm"
                    >
                      {language === 'bn' ? 'পেস্ট' : 'Paste'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={extractVideo}
                  disabled={loading || !url.trim()}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex gap-3 text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-[14px] font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-12 flex flex-col items-center justify-center text-slate-400"
          >
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-red-500" />
            <p className="font-medium animate-pulse">
              {language === 'bn' ? 'ভিডিও খোঁজা হচ্ছে...' : 'Searching for video...'}
            </p>
          </motion.div>
        )}

        {videoInfo && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 sm:mt-8 space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
              
              <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6">
                
                <div className="w-full md:w-1/3 shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video relative group">
                  {videoInfo.thumbnail ? (
                    <img 
                      src={videoInfo.thumbnail} 
                      alt={videoInfo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                      <Play className="w-6 h-6 ml-1" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-wider mb-2 w-fit">
                    <Youtube className="w-3.5 h-3.5" />
                    YouTube Video
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {videoInfo.title}
                  </h3>
                </div>

              </div>

              <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {videoInfo.formats.length > 0 ? (
                    videoInfo.formats.map((format, idx) => (
                      <button
                        key={idx}
                        onClick={() => downloadVideo(format.url, format.quality)}
                        disabled={downloadingUrl === format.url}
                        className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-300 dark:hover:border-red-500/30 hover:shadow-md transition-all group active:scale-[0.98] disabled:opacity-70 disabled:hover:border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:bg-red-50 dark:group-hover:bg-red-500/10 transition-colors">
                            {downloadingUrl === format.url ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Download className="w-5 h-5" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200 leading-none mb-1">
                              {format.quality}
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              MP4 <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span> Video + Audio
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full p-4 flex gap-3 text-amber-600 bg-amber-50 rounded-2xl">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-[14px] font-medium">No downloadable formats found with both video and audio. The video might be restricted or require decryption that is not fully supported.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
