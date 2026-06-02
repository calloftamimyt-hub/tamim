import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Shield, X, Lock, Info, Check } from 'lucide-react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '@/contexts/LanguageContext';

export function HiddenGallery({ onBack }: { onBack: () => void }) {
  const [images, setImages] = useState<{ name: string, uri: string }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showManualDeleteWarning, setShowManualDeleteWarning] = useState(false);
  const { language } = useLanguage();

  const loadImages = async () => {
    try {
      // Ensure directory exists
      try {
        await Filesystem.mkdir({
          path: 'hidden_vault',
          directory: Directory.Data,
          recursive: false
        });
      } catch (e) {
        // Directory might already exist
      }

      const res = await Filesystem.readdir({
        path: 'hidden_vault',
        directory: Directory.Data
      });

      const loadedImages = await Promise.all(res.files.map(async (f) => {
        try {
          // If native, we can often just get the URI directly, 
          // but for Web compatibility and corrupted previous files, we handle it carefully.
          if (Capacitor.isNativePlatform()) {
             const fileStat = await Filesystem.getUri({
                path: `hidden_vault/${f.name}`,
                directory: Directory.Data
             });
             return { name: f.name, uri: Capacitor.convertFileSrc(fileStat.uri) };
          } else {
             // For web, read it back as base64
             const contents = await Filesystem.readFile({
                path: `hidden_vault/${f.name}`,
                directory: Directory.Data
             });
             
             let dataStr = contents.data as string;
             if (dataStr.startsWith('data:')) {
               return { name: f.name, uri: dataStr };
             }
             return { name: f.name, uri: `data:image/jpeg;base64,${dataStr}` };
          }
        } catch (e) {
          console.error("Error reading vault item", e);
          const fileStat = await Filesystem.getUri({
            path: `hidden_vault/${f.name}`,
            directory: Directory.Data
          });
          return { name: f.name, uri: Capacitor.convertFileSrc(fileStat.uri) };
        }
      }));

      setImages(loadedImages);
    } catch (e) {
      console.error("Error loading vault images", e);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handlePickImages = async () => {
    try {
      const result = await Camera.pickImages({
        quality: 100,
      });

      if (result.photos.length > 0) {
        setIsLoading(true);
        let showWarning = false;

        for (const photo of result.photos) {
          if (!photo.webPath) continue;

          // Read original file as base64
          const response = await fetch(photo.webPath);
          const blob = await response.blob();
          
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          
          await new Promise<void>((resolve, reject) => {
            reader.onloadend = async () => {
              try {
                let base64data = reader.result as string;
                // Strip the data URL prefix if it exists to make it pure base64 for Capacitor's filesystem
                if (base64data.includes(',')) {
                   base64data = base64data.split(',')[1];
                }
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
                
                await Filesystem.writeFile({
                  path: `hidden_vault/${fileName}`,
                  data: base64data,
                  directory: Directory.Data
                });
                
                // Attempt to delete original if a file path is provided and it is a file URI
                if (photo.path) {
                   try {
                     await Filesystem.deleteFile({
                        path: photo.path
                     });
                   } catch(e) {
                     console.log("Could not delete original file via Filesystem. This is expected on modern Android due to Scoped Storage.", e);
                     showWarning = true;
                   }
                }

                resolve();
              } catch (e) {
                reject(e);
              }
            };
            reader.onerror = reject;
          });
        }
        
        await loadImages();
        setIsLoading(false);
        
        if (Capacitor.getPlatform() === 'android') {
           setShowManualDeleteWarning(true);
        }
      }
    } catch (e) {
      console.error("Pick images failed", e);
      setIsLoading(false);
    }
  };

  const executeDelete = async (name: string) => {
    try {
      await Filesystem.deleteFile({
        path: `hidden_vault/${name}`,
        directory: Directory.Data
      });
      await loadImages();
      if (isFullscreen === name) setIsFullscreen(null);
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 pb-safe">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center px-4 h-14">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="ml-2 flex flex-col">
            <h1 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-500" />
              {language === 'bn' ? 'গোপন গ্যালারি' : 'Hidden Gallery'}
            </h1>
            <span className="text-xs text-slate-500">
               {language === 'bn' ? 'ছবিগুলো নিরাপদে সংরক্ষিত' : 'Secured locally'}
            </span>
          </div>
          <div className="ml-auto">
            <button 
              onClick={handlePickImages}
              disabled={isLoading}
              className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"
            >
              <Plus className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-2">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Lock className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-center px-6">
              {language === 'bn' 
                ? 'আপনার গোপন গ্যালারি খালি। ছবি যোগ করতে ওপরের (+) বাটনে ক্লিক করুন।'
                : 'Your secret vault is empty. Click the (+) button to add photos.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div 
                key={img.name} 
                className="aspect-square relative rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setIsFullscreen(img.name)}
              >
                <img 
                  src={img.uri} 
                  alt={img.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col">
          <div className="flex justify-between items-center p-4">
            <button onClick={() => setIsFullscreen(null)} className="p-2 text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-full">
              <X className="w-6 h-6" />
            </button>
            <button onClick={() => setShowDeleteConfirm(isFullscreen)} className="p-2 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-full">
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={images.find(img => img.name === isFullscreen)?.uri} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              alt="Fullscreen view"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {language === 'bn' ? 'ডিলিট করতে চান?' : 'Delete Photo?'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
              {language === 'bn' 
                ? 'এই ছবিটি আপনার গোপন গ্যালারি থেকে পাকাপাকিভাবে ডিলিট হয়ে যাবে। আপনি কি নিশ্চিত?' 
                : 'This photo will be permanently deleted from your hidden gallery. Are you sure?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => executeDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium"
              >
                {language === 'bn' ? 'ডিলিট' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Delete Warning Modal */}
      {showManualDeleteWarning && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-emerald-500/10 p-6 flex flex-col items-center border-b border-emerald-500/20">
               <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4">
                 <Check className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 text-center">
                 {language === 'bn' ? 'সফলভাবে সেভ হয়েছে!' : 'Saved successfully!'}
               </h3>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {language === 'bn' 
                    ? 'অ্যান্ড্রয়েডের নিজস্ব নিরাপত্তার কারণে, অরিজিনাল ছবিটি আপনার নরমাল গ্যালারি থেকে নিজে নিজে ডিলিট হবে না। ছবিগুলো পুরোপুরি গোপন রাখতে, অনুগ্রহ করে আপনার নরমাল গ্যালারি অ্যাপ থেকে অরিজিনাল ছবিগুলো নিজে ডিলিট করে দিন।'
                    : 'Due to Android security restrictions, the original photos cannot be automatically deleted from your phone\'s main gallery. To keep them completely hidden, please manually delete the original photos from your Gallery app.'}
                </p>
              </div>
              
              <button
                onClick={() => setShowManualDeleteWarning(false)}
                className="w-full px-4 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
              >
                {language === 'bn' ? 'বুঝতে পেরেছি' : 'I Understand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
