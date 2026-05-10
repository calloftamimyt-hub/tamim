import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Film, 
  Camera,
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  MapPin,
  Download,
  ChevronRight,
  ChevronDown,
  Navigation,
  Scissors,
  Hash,
  MonitorPlay,
  Globe,
  Lock,
  Users,
  MessageCircle,
  Settings,
  Settings2,
  Zap,
  Timer
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn, getApiUrl } from "@/lib/utils";
import axios from "axios";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface PostContentOverlayProps {
  onClose: () => void;
  initialFile?: File | null;
  initialFileType?: "video" | "photo" | null;
}

export const PostContentOverlay: React.FC<PostContentOverlayProps> = ({ 
  onClose, 
  initialFile, 
  initialFileType 
}) => {
  const { language } = useLanguage();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [fileType, setFileType] = useState<"video" | "photo" | null>(initialFileType || null);
  const [category, setCategory] = useState("turkey");
  const [isPosting, setIsPosting] = useState(false);
  const [location, setLocation] = useState("");
  const [saveToAlbumEnabled, setSaveToAlbumEnabled] = useState(false);
  const [allowOffline, setAllowOffline] = useState(false);
  const [quality, setQuality] = useState<"low" | "high" | "hd">("high");
  const [privacy, setPrivacy] = useState<"public" | "private" | "friends">("public");
  const [compressData, setCompressData] = useState(true);
  const [ephemeralPost, setEphemeralPost] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  
  // Hashtag State
  const [isHashtagModalOpen, setIsHashtagModalOpen] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [customHashtag, setCustomHashtag] = useState("");
  const predefinedHashtags = ["#viral", "#foryou", "#boost", "#muslimsathi", "#calloftamim"];

  // Video Editing Flow State
  const [isVideoEditing, setIsVideoEditing] = useState(initialFileType === 'video' && !!initialFile);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const isDraggingStart = useRef(false);
  const isDraggingEnd = useRef(false);
  const trimTrackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent, type: 'start' | 'end') => {
      e.currentTarget.setPointerCapture(e.pointerId);
      if (type === 'start') isDraggingStart.current = true;
      else isDraggingEnd.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDraggingStart.current && !isDraggingEnd.current) return;
      if (!trimTrackRef.current) return;
      
      const rect = trimTrackRef.current.getBoundingClientRect();
      let percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      
      if (isDraggingStart.current) {
          setTrimStart(Math.min(percent, 100 - trimEnd - 5));
      } else if (isDraggingEnd.current) {
          setTrimEnd(100 - Math.max(percent, trimStart + 5));
      }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      isDraggingStart.current = false;
      isDraggingEnd.current = false;
  };

  const categories = [
    { id: 'turkey', label: { bn: 'তুরস্ক', en: 'Turkey' } },
    { id: 'news', label: { bn: 'খবর', en: 'News' } },
    { id: 'islamic', label: { bn: 'ইসলামিক', en: 'Islamic' } },
    { id: 'shorts', label: { bn: 'শর্টস', en: 'Shorts' } },
    { id: 'movies', label: { bn: 'মুভি', en: 'Movies' } },
    { id: 'mix', label: { bn: 'মিক্স', en: 'Mix' } }
  ];

  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('set-nav-visibility', { detail: false }));
    return () => {
      window.dispatchEvent(new CustomEvent('set-nav-visibility', { detail: true }));
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "photo") => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileType(type);
      setStatus("idle");
      setError(null);
      if (type === 'video') {
          setIsVideoEditing(true);
      }
    }
  };

  const handlePost = async () => {
    if (!file || !fileType) return;
    
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const MAX_PHOTO_SIZE = 20 * 1024 * 1024; // 20MB
    
    if (fileType === 'video' && file.size > MAX_VIDEO_SIZE) {
        setStatus("error");
        setError(language === 'bn' ? 'ভিডিও ফাইল সাইজ ৫০ এমবির বেশি হতে পারবে না।' : 'Video size must be less than 50MB telegram bot limit.');
        return;
    }
    if (fileType === 'photo' && file.size > MAX_PHOTO_SIZE) {
        setStatus("error");
        setError(language === 'bn' ? 'ছবির সাইজ ২০ এমবির বেশি হতে পারবে না।' : 'Photo size must be less than 20MB telegram bot limit.');
        return;
    }

    setIsPosting(true);
    setStatus("idle");
    setError(null);
    setUploadProgress(0);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Check for strikes restriction
      const { getDoc, doc: firestoreDoc } = await import("firebase/firestore");
      const userDoc = await getDoc(firestoreDoc(db, "users", user.uid));
      if (userDoc.exists() && (userDoc.data().strikes >= 3)) {
          setStatus("error");
          setError(language === 'bn' ? 'আপনার অ্যাকাউন্টে ৩টি স্ট্রাইক থাকায় আপনি পোস্ট করতে পারবেন না।' : 'You cannot post because your account has 3 community strikes.');
          setIsPosting(false);
          return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("type", fileType);
      formData.append("category", category);
      formData.append("location", location);
      formData.append("saveToAlbum", String(saveToAlbumEnabled));
      formData.append("quality", quality);
      formData.append("compressData", String(compressData));
      formData.append("ephemeralPost", String(ephemeralPost));
      formData.append("privacy", privacy);
      // You could append trimStart and trimEnd here if the backend supports cutting
      // formData.append("trimStart", String(trimStart));
      // formData.append("trimEnd", String(trimEnd));
      
      formData.append("authorName", user?.displayName || user?.email || (language === 'bn' ? 'ইউজার' : 'User'));
      formData.append("authorUid", user?.uid || "guest-uid");
      
      const appUrl = window.location.origin;
      formData.append("appUrl", appUrl);

      // Check if it contains viral hashtags
      const isViral = selectedHashtags.some(tag => predefinedHashtags.slice(0, 3).includes(tag.toLowerCase()));
      
      // Remove all hashtags from the title string so they are not saved in Firebase
      const cleanTitle = title.replace(/#[a-zA-Z0-9_]+/g, '').trim();

      const postsCollection = collection(db, "posts");
      const postRef = await addDoc(postsCollection, {
          content: cleanTitle,
          isBoosted: isViral,
          type: fileType,
          category: category,
          location: location,
          saveToAlbumEnabled: saveToAlbumEnabled,
          allowOffline: allowOffline,
          quality: quality,
          compressData: compressData,
          ephemeralPost: ephemeralPost,
          privacy: privacy,
          fileId: "",
          authorName: user?.displayName || user?.email || (language === 'bn' ? 'ইউজার' : 'User'),
          authorUid: user?.uid || "guest-uid",
          authorAvatarUrl: user?.photoURL || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E",
          likes: 0,
          shares: 0,
          views: 0,
          reactionsCount: 0,
          reportsCount: 0,
          hasMedia: true,
          mediaType: fileType,
          createdAt: serverTimestamp(),
          status: 'pending' // will be approved by admin
      });
      formData.append("postId", postRef.id);

      const response = await axios.post(getApiUrl("/api/telegram/upload"), formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response.data.success) {
        const fileId = response.data.fileId;
        const { updateDoc, doc } = await import("firebase/firestore");
        await updateDoc(doc(db, "posts", postRef.id), {
            fileId: fileId
        });

        // "Save Album" functionality
        if (saveToAlbumEnabled && file) {
          try {
            if (fileType === "photo") {
              const imageBitmap = await createImageBitmap(file);
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (ctx) {
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;
                ctx.drawImage(imageBitmap, 0, 0);
                
                // Add "Halal Circle" watermark
                const fontSize = Math.max(30, Math.floor(canvas.width * 0.04));
                ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.textAlign = "left";
                ctx.textBaseline = "bottom";
                
                // Shadow for visibility
                ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                const padding = fontSize;
                ctx.fillText("@Halal Circle", padding, canvas.height - padding);

                canvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `HalalCircle_${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, 100);
                  }
                }, "image/png", 1.0);
              }
            } else if (fileType === "video") {
              const url = URL.createObjectURL(file);
              const a = document.createElement("a");
              a.href = url;
              a.download = `HalalCircle_${Date.now()}.mp4`;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
              }, 100);
            }
          } catch (e) {
            console.error("Failed to save to album:", e);
          }
        }

        setStatus("success");
        setTitle("");
        setFile(null);
        setFileType(null);
      }
    } catch (err: any) {
      console.error("Post Error:", err);
      setStatus("error");
      const errorMsg = err.response?.data?.details 
        ? (typeof err.response.data.details === 'object' ? JSON.stringify(err.response.data.details) : err.response.data.details)
        : (err.response?.data?.error || (language === 'bn' ? 'পোস্ট করা সম্ভব হয়নি' : "Something went wrong. Please try again."));
      setError(errorMsg);
    } finally {
      setIsPosting(false);
    }
  };

  // ----- Video Editor View -----
  if (isVideoEditing && file) {
    return (
        <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[300] bg-black text-white flex flex-col"
        >
            {/* Full Screen Video Preview */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden pt-safe">
                <video 
                    src={previewUrl || ""} 
                    className="w-full h-full object-contain pointer-events-none"
                    playsInline
                    autoPlay
                    muted
                    loop
                />
                
                {/* Top Controls */}
                <div className="absolute top-0 inset-x-0 p-4 pt-[max(env(safe-area-inset-top,1rem),1rem)] flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                    <button 
                        onClick={() => {
                            setFile(null);
                            setFileType(null);
                            setIsVideoEditing(false);
                        }}
                        className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => setIsVideoEditing(false)}
                        className="px-5 py-2 bg-rose-500 rounded-full font-bold active:scale-95 transition-transform shadow-lg shadow-rose-500/20"
                    >
                        {language === 'bn' ? 'নেক্সট' : 'Next'}
                    </button>
                </div>
            </div>

            {/* Bottom Trim Bar */}
            <div className="bg-black/90 p-6 pb-10 border-t border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <Scissors className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-sm">
                        {language === 'bn' ? 'ভিডিও কাটুন' : 'Trim Video'}
                    </span>
                </div>
                
                {/* Fake Dual Thumb Slider for UI */}
                <div 
                    ref={trimTrackRef}
                    className="relative h-16 bg-white/10 rounded-xl overflow-hidden mb-safe touch-none"
                    onPointerMove={handlePointerMove}
                >
                    {/* Darkened out areas */}
                    <div className="absolute inset-y-0 left-0 bg-black/60 z-10 pointer-events-none" style={{ width: `${trimStart}%` }} />
                    <div className="absolute inset-y-0 right-0 bg-black/60 z-10 pointer-events-none" style={{ width: `${100 - trimEnd}%` }} />
                    
                    {/* The "Video Frames" track (simulated) */}
                    <div className="absolute inset-0 flex pointer-events-none">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="flex-1 bg-white/5 border-r border-white/10" />
                        ))}
                    </div>

                    {/* Left Handle */}
                    <button 
                        onPointerDown={(e) => handlePointerDown(e, 'start')}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className="absolute inset-y-0 w-8 -ml-4 bg-transparent z-20 flex items-center justify-center cursor-ew-resize group"
                        style={{ left: `${trimStart}%` }}
                    >
                        <div className="w-4 h-full bg-white rounded-l flex items-center justify-center group-active:bg-gray-200 shadow-[2px_0_4px_rgba(0,0,0,0.5)]">
                           <div className="w-1 h-6 bg-black/50 rounded-full" />
                        </div>
                    </button>
                    
                    {/* Right Handle */}
                    <button 
                        onPointerDown={(e) => handlePointerDown(e, 'end')}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        className="absolute inset-y-0 w-8 -mr-4 bg-transparent z-20 flex items-center justify-center cursor-ew-resize group"
                        style={{ right: `${100 - trimEnd}%` }}
                    >
                        <div className="w-4 h-full bg-white rounded-r flex items-center justify-center group-active:bg-gray-200 shadow-[-2px_0_4px_rgba(0,0,0,0.5)]">
                           <div className="w-1 h-6 bg-black/50 rounded-full" />
                        </div>
                    </button>
                    
                    {/* Border box representing the selected range */}
                    <div 
                        className="absolute inset-y-0 border-y-4 border-white z-10 pointer-events-none"
                        style={{ left: `${trimStart}%`, right: `${100 - trimEnd}%` }}
                    />
                </div>
            </div>
        </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[300] bg-white dark:bg-slate-950 flex flex-col"
    >
      {/* Header */}
      <header className="px-4 pt-[max(env(safe-area-inset-top,1rem),1rem)] pb-3 flex flex-col relative z-20 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-gray-900 shadow-sm">
        <div className="flex items-center justify-between">
            <button 
                onClick={onClose}
                className="p-2 -ml-2 rounded-full active:scale-95 transition-transform text-gray-900 dark:text-white"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
                {language === 'bn' ? 'পোস্ট তৈরি করুন' : 'New Post'}
            </h1>
            <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative bg-white dark:bg-slate-950 pb-safe">
        
        {/* Caption and Preview Section */}
        <div className="flex p-4 gap-4 border-b border-gray-100 dark:border-gray-900">
            <div className="flex-1">
                <textarea 
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 20))}
                    placeholder={language === 'bn' ? 'পোস্ট টাইটেল যোগ করুন...' : 'Add a title...'}
                    className="w-full bg-transparent text-gray-900 dark:text-white text-[15px] resize-none focus:outline-none placeholder:text-gray-400 min-h-[80px]"
                />
                
                {selectedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedHashtags.map(tag => (
                      <span key={tag} className="text-blue-500 font-medium text-[13px]">{tag}</span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setIsHashtagModalOpen(true)}
                    className="text-xs font-medium px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-300 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Hash className="w-3.5 h-3.5" /> <span>Hashtags</span>
                  </button>
                  <div className="text-right text-xs text-gray-400 font-medium">
                      {title.length}/20
                  </div>
                </div>
            </div>
            
            {/* Media Thumbnail */}
            <div className="w-24 h-32 shrink-0 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden relative" onClick={() => {
                if (fileType === 'video') setIsVideoEditing(true);
            }}>
                {file ? (
                    <>
                        {fileType === "photo" ? (
                            <img 
                                src={previewUrl || ""} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <video 
                                src={previewUrl || ""}
                                className="w-full h-full object-cover"
                                playsInline
                                muted
                                preload="metadata"
                                onLoadedData={(e) => {
                                    e.currentTarget.currentTime = 0;
                                }}
                            />
                        )}
                        <div className="absolute inset-0 bg-black/10 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                             <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">Edit</div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2" onClick={() => photoInputRef.current?.click()}>
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                        <span className="text-[10px] text-gray-400 font-medium">Select</span>
                    </div>
                )}
            </div>
        </div>

        {/* Options List */}
        <div className="flex flex-col mt-2">
            
            {/* Location Selector */}
            <div className="px-4 py-3 flex items-center gap-3 active:bg-gray-50 dark:active:bg-gray-900 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-900/50">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                    <input 
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={language === 'bn' ? 'লোকেশন যোগ করুন' : 'Add location'}
                        className="w-full bg-transparent text-[15px] font-medium text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none"
                    />
                </div>
                {location && (
                    <button onClick={() => setLocation("")} className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                    </button>
                )}
                {!location && <Navigation className="w-4 h-4 text-gray-400" />}
            </div>
            
            {/* Save Album Toggle */}
            <div className="px-4 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Download className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                    </div>
                    <span className="text-[15px] font-medium text-gray-900 dark:text-white">
                        {language === 'bn' ? 'সেভ অ্যালবাম' : 'Save Album (with Halal Circle Logo)'}
                    </span>
                </div>
                <button 
                    onClick={() => setSaveToAlbumEnabled(!saveToAlbumEnabled)}
                    className={cn(
                        "w-12 h-6.5 rounded-full p-1 transition-colors relative",
                        saveToAlbumEnabled ? "bg-slate-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                    )}
                >
                    <motion.div 
                        initial={false}
                        animate={{ x: saveToAlbumEnabled ? 22 : 0 }}
                        className={cn("w-5 h-5 rounded-full shadow-sm", saveToAlbumEnabled ? "bg-white dark:bg-slate-900" : "bg-white")}
                    />
                </button>
            </div>

            {/* Offline Mode Toggle */}
            <div className="px-4 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Film className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                        <span className="text-[15px] font-medium text-gray-900 dark:text-white block">
                            {language === 'bn' ? 'অফলাইন মোড' : 'Offline Mode'}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">
                            {language === 'bn' ? 'ইউজাররা অফলাইনে দেখতে পারবে' : 'Users can view this offline'}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setAllowOffline(!allowOffline)}
                    className={cn(
                        "w-12 h-6.5 rounded-full p-1 transition-colors relative",
                        allowOffline ? "bg-slate-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                    )}
                >
                    <motion.div 
                        initial={false}
                        animate={{ x: allowOffline ? 22 : 0 }}
                        className={cn("w-5 h-5 rounded-full shadow-sm", allowOffline ? "bg-white dark:bg-slate-900" : "bg-white")}
                    />
                </button>
            </div>

            {/* Compress Video Toggle */}
            {fileType === "video" && (
                <div className="px-4 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                        </div>
                        <div>
                            <span className="text-[15px] font-medium text-gray-900 dark:text-white block">
                                {language === 'bn' ? 'ডাটা সেভার (কম্প্রেস)' : 'Data Saver (Compress)'}
                            </span>
                            <span className="text-xs text-gray-500 font-normal">
                                {language === 'bn' ? 'অল্প ডাটা খরচ করে দ্রুত আপলোড করুন' : 'Saves data and uploads faster'}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setCompressData(!compressData)}
                        className={cn(
                            "w-12 h-6.5 rounded-full p-1 transition-colors relative",
                            compressData ? "bg-slate-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                        )}
                    >
                        <motion.div 
                            initial={false}
                            animate={{ x: compressData ? 22 : 0 }}
                            className={cn("w-5 h-5 rounded-full shadow-sm", compressData ? "bg-white dark:bg-slate-900" : "bg-white")}
                        />
                    </button>
                </div>
            )}

            {/* Ephemeral Post Toggle */}
            <div className="px-4 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                        <span className="text-[15px] font-medium text-gray-900 dark:text-white block">
                            {language === 'bn' ? '২৪ ঘণ্টা পর ডিলিট' : 'Delete After 24h'}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">
                            {language === 'bn' ? 'এই পোস্ট ২৪ ঘণ্টা পর অটোমেটিক ডিলিট হবে' : 'Automatically delete this post after 24h'}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setEphemeralPost(!ephemeralPost)}
                    className={cn(
                        "w-12 h-6.5 rounded-full p-1 transition-colors relative",
                        ephemeralPost ? "bg-slate-900 dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
                    )}
                >
                    <motion.div 
                        initial={false}
                        animate={{ x: ephemeralPost ? 22 : 0 }}
                        className={cn("w-5 h-5 rounded-full shadow-sm", ephemeralPost ? "bg-white dark:bg-slate-900" : "bg-white")}
                    />
                </button>
            </div>

            {/* Category Dropdown */}
            <div className="px-4 py-4 border-b border-gray-50 dark:border-gray-900/50">
                <div 
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Hash className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                        </div>
                        <div>
                            <div className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5">
                                {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                            </div>
                            <div className="text-xs text-slate-900 dark:text-slate-400 font-bold uppercase tracking-wider">
                                {categories.find(c => c.id === category)?.label[language] || 'Select'}
                            </div>
                        </div>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isCategoryOpen && "rotate-180")} />
                </div>
                
                <AnimatePresence>
                    {isCategoryOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3"
                        >
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setCategory(cat.id);
                                            setIsCategoryOpen(false);
                                        }}
                                        className={cn(
                                            "px-4 py-2.5 rounded-sm text-sm font-bold transition-all border",
                                            category === cat.id
                                                ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md"
                                                : "bg-white dark:bg-slate-900 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        {cat.label[language]}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Video Quality Selection */}
            {fileType === "video" && (
                <div className="px-4 py-4 border-b border-gray-50 dark:border-gray-900/50">
                    <div 
                        onClick={() => setIsQualityOpen(!isQualityOpen)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Settings2 className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                            </div>
                            <div>
                                <div className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5">
                                    {language === 'bn' ? 'ভিডিও কোয়ালিটি' : 'Video Quality'}
                                </div>
                                <div className="text-xs text-slate-900 dark:text-slate-400 font-bold uppercase tracking-wider">
                                    {quality === 'low' ? (language === 'bn' ? 'লো' : 'Low') : 
                                     quality === 'high' ? (language === 'bn' ? 'হাই' : 'High') : 
                                     (language === 'bn' ? 'এইচডি' : 'HD')}
                                </div>
                            </div>
                        </div>
                        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isQualityOpen && "rotate-180")} />
                    </div>
                    
                    <AnimatePresence>
                        {isQualityOpen && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-3"
                            >
                                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    {[
                                        { id: 'low', label: { bn: 'লো', en: 'Low' } },
                                        { id: 'high', label: { bn: 'হাই', en: 'High' } },
                                        { id: 'hd', label: { bn: 'এইচডি', en: 'HD' } }
                                    ].map(q => (
                                        <button
                                            key={q.id}
                                            onClick={() => {
                                                setQuality(q.id as any);
                                                setIsQualityOpen(false);
                                            }}
                                            className={cn(
                                                "flex-1 px-4 py-2 rounded-sm text-[13px] font-bold transition-all border",
                                                quality === q.id
                                                    ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md"
                                                    : "bg-white dark:bg-slate-900 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                                            )}
                                        >
                                            {q.label[language]}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Privacy Settings */}
            <div className="px-4 py-4 border-b border-gray-50 dark:border-gray-900/50">
                <div 
                    onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                    className="flex items-center justify-between cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            {privacy === 'public' ? <Globe className="w-4 h-4 text-slate-900 dark:text-slate-100" /> : <Lock className="w-4 h-4 text-slate-900 dark:text-slate-100" />}
                        </div>
                        <div>
                            <div className="text-[15px] font-bold text-gray-900 dark:text-white mb-0.5">
                                {language === 'bn' ? 'প্রাইভেসি' : 'Who can see this'}
                            </div>
                            <div className="text-xs text-slate-900 dark:text-slate-400 font-bold uppercase tracking-wider">
                                {privacy === 'public' ? (language === 'bn' ? 'পাবলিক' : 'Public') : 
                                 privacy === 'friends' ? (language === 'bn' ? 'ফ্রেন্ডস' : 'Friends') : 
                                 (language === 'bn' ? 'প্রাইভেট' : 'Private')}
                            </div>
                        </div>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isPrivacyOpen && "rotate-180")} />
                </div>
                
                <AnimatePresence>
                    {isPrivacyOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3"
                        >
                            <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                                {[
                                    { id: 'public', label: { bn: 'পাবলিক (সবাই দেখতে পাবে)', en: 'Public (Everyone can see)' }, icon: Globe },
                                    { id: 'friends', label: { bn: 'ফ্রেন্ডস (শুধুমাত্র আপনার বন্ধুরাই)', en: 'Friends (Only your friends)' }, icon: Users },
                                    { id: 'private', label: { bn: 'প্রাইভেট (শুধুমাত্র আপনি)', en: 'Private (Only you)' }, icon: Lock }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setPrivacy(p.id as any);
                                            setIsPrivacyOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-between w-full p-4 rounded-sm text-[14px] font-bold transition-all border-2 mb-1",
                                            privacy === p.id
                                                ? "bg-slate-50 dark:bg-slate-800/50 border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100"
                                                : "bg-white dark:bg-slate-900 border-transparent text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <p.icon className="w-5 h-5" />
                                            {p.label[language]}
                                        </div>
                                        {privacy === p.id && <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
        </div>
      </div>

      {/* Footer / Post Button Area */}
      <div className="p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-900 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <button 
                onClick={handlePost}
                disabled={!file || !title || isPosting}
                className={cn(
                    "w-full h-14 rounded-2xl font-black text-[17px] transition-all flex items-center justify-center gap-3 tracking-wide",
                    file && title && !isPosting 
                        ? "bg-rose-500 text-white active:scale-[0.98] shadow-2xl shadow-rose-500/30" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                )}
            >
                {isPosting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        {language === 'bn' ? 'পোস্ট করুন' : 'Post Now'}
                    </>
                )}
            </button>
        </div>

        {/* Status Modals */}
        <AnimatePresence>
            {isPosting && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-[300px] shadow-2xl flex flex-col items-center gap-4 border border-slate-100 dark:border-slate-800"
                    >
                        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
                        <div className="text-center">
                             <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                                {fileType === "video" ? (language === 'bn' ? 'ভিডিও আপলোড হচ্ছে...' : 'Uploading Video...') : (language === 'bn' ? 'পোস্ট আপলোড হচ্ছে...' : 'Uploading Post...')}
                             </h4>
                             <p className="text-3xl font-black text-rose-500">{uploadProgress}%</p>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadProgress}%` }}
                                className="h-full bg-rose-500 rounded-full"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {status === "success" && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-[320px] shadow-2xl flex flex-col items-center gap-4 text-center border border-slate-100 dark:border-slate-800"
                    >
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 dark:text-white mb-2">
                                {language === 'bn' ? 'অভিনন্দন!' : 'Congratulations!'}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                {language === 'bn' 
                                    ? 'আপনার আপলোড সফলভাবে সম্পূর্ণ হয়েছে। অ্যাডমিন অ্যাপ্রুভ করার পর পোস্টটি সবার জন্য উন্মুক্ত করা হবে।' 
                                    : 'Your upload is complete. The post will be public after admin approval.'}
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                setStatus("idle");
                                onClose();
                            }}
                            className="mt-4 px-8 py-3 bg-rose-500 hover:bg-rose-600 rounded-2xl text-white font-bold transition-colors w-full active:scale-95 shadow-lg shadow-rose-500/20"
                        >
                            {language === 'bn' ? 'ঠিক আছে' : 'OK'}
                        </button>
                    </motion.div>
                </motion.div>
            )}

            {status === "error" && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-[320px] shadow-2xl flex flex-col items-center gap-4 text-center border border-slate-100 dark:border-slate-800"
                    >
                        <AlertCircle className="w-16 h-16 text-rose-500" />
                        <div>
                            <h3 className="font-black text-2xl text-slate-800 dark:text-white mb-2">
                                {language === 'bn' ? 'ভুল হয়েছে' : 'Error'}
                            </h3>
                            <p className="text-sm font-bold text-rose-500 leading-relaxed opacity-90">
                                {error}
                            </p>
                        </div>
                        <button 
                            onClick={() => setStatus("idle")}
                            className="mt-4 px-8 py-3 bg-rose-500 hover:bg-rose-600 rounded-2xl text-white font-bold transition-colors w-full active:scale-95"
                        >
                            Try Again
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

      <input 
        type="file" 
        accept="image/*"
        ref={photoInputRef} 
        className="hidden" 
        onChange={(e) => {
            handleFileChange(e, "photo");
            e.target.value = "";
        }}
      />
      <input 
        type="file" 
        accept="video/*"
        ref={videoInputRef} 
        className="hidden" 
        onChange={(e) => {
            handleFileChange(e, "video");
            e.target.value = "";
        }}
      />
      <input 
        type="file" 
        accept="video/*"
        capture="environment"
        ref={cameraInputRef} 
        className="hidden" 
        onChange={(e) => {
            handleFileChange(e, "video");
            e.target.value = "";
        }}
      />
      
      {/* Hashtag Modal */}
      <AnimatePresence>
        {isHashtagModalOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[400] bg-white dark:bg-slate-950 flex flex-col pt-safe"
          >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-900">
                  <button onClick={() => setIsHashtagModalOpen(false)}>
                      <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                  </button>
                  <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
                      {language === 'bn' ? 'হ্যাশট্যাগ নির্বাচন' : 'Select Hashtags'}
                  </h2>
                  <div className="w-6" />
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                  <div className="flex gap-2 mb-6">
                    <input 
                        value={customHashtag}
                        onChange={(e) => setCustomHashtag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        placeholder={language === 'bn' ? 'কাস্টম হ্যাশট্যাগ...' : 'Custom hashtag...'}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-900 rounded-xl focus:outline-none text-[15px] font-medium placeholder:font-normal"
                    />
                    <button 
                        onClick={() => {
                            if (customHashtag) {
                                const tag = "#" + customHashtag;
                                if (!selectedHashtags.includes(tag)) {
                                    setSelectedHashtags([...selectedHashtags, tag]);
                                }
                                setCustomHashtag("");
                            }
                        }}
                        className="px-5 bg-blue-500 rounded-xl font-bold text-white active:scale-95 transition-transform"
                    >
                        {language === 'bn' ? 'যোগ' : 'Add'}
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-4 font-medium">
                      {language === 'bn' ? 'ভাইরাল হতে হ্যাশট্যাগগুলো নির্বাচন করুন' : 'Select hashtags to boost your post'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2.5">
                     {predefinedHashtags.map(tag => {
                        const isSelected = selectedHashtags.includes(tag);
                        return (
                           <button
                              key={tag}
                              onClick={() => {
                                  if (isSelected) {
                                      setSelectedHashtags(selectedHashtags.filter(t => t !== tag));
                                  } else {
                                      setSelectedHashtags([...selectedHashtags, tag]);
                                  }
                              }}
                              className={cn(
                                  "px-4 py-2 rounded-full font-medium transition-all text-sm border",
                                  isSelected 
                                      ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20" 
                                      : "bg-white dark:bg-slate-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                              )}
                           >
                              {tag}
                           </button>
                        );
                     })}
                  </div>
                  
                  {/* Selected Custom ones not in predefined */}
                  {selectedHashtags.filter(t => !predefinedHashtags.includes(t)).length > 0 && (
                     <div className="mt-8">
                        <p className="text-sm text-gray-400 mb-3 font-medium">
                            {language === 'bn' ? 'আপনার হ্যাশট্যাগ' : 'Your Hashtags'}
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            {selectedHashtags.filter(t => !predefinedHashtags.includes(t)).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        setSelectedHashtags(selectedHashtags.filter(t => t !== tag));
                                    }}
                                    className="px-4 py-2 rounded-full font-medium transition-all text-sm border bg-blue-500 border-blue-500 text-white flex items-center gap-2"
                                >
                                    {tag} <X className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>
                     </div>
                  )}

              </div>
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-900 pb-safe">
                  <button
                      onClick={() => setIsHashtagModalOpen(false)}
                      className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 active:scale-[0.98] transition-all font-bold rounded-xl"
                  >
                      {language === 'bn' ? 'সম্পন্ন' : 'Done'}
                  </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
