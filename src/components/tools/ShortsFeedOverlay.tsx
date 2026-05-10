import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Share2, Flag, Plus, ArrowLeft, Check, AlertTriangle, Bookmark, Download, X, Star, Send } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import { auth, db } from "@/lib/firebase";
import { cn, formatCount, getApiUrl } from "@/lib/utils";
import { ReportModal } from "@/components/tools/ReportModal";
import { useOfflineMedia } from "@/hooks/useOfflineMedia";

export const isPostVideo = (p: any): boolean => {
  const hasVideoType = p.type === "video" || p.content?.type === "video";
  const isJSONVideo = typeof p.content === "string" && p.content.includes("\"type\":\"video\"");
  return hasVideoType || isJSONVideo;
};

// --- Offline Caching Helper ---
const cacheVideoForOffline = async (videoUrl: string, maxVideos = 100) => {
  try {
    if (!("caches" in window)) return;
    const cache = await caches.open("offline-videos");
    const keys = await cache.keys();
    
    // Check if we already have it
    const match = await cache.match(videoUrl);
    if (match) return;

    // Cache if under the limit
    if (keys.length < maxVideos) {
      // Fetch and add to cache
      await cache.add(videoUrl);
    }
  } catch (err) {
    // Ignore fetch errors during offline caching
    console.debug("Offline video caching skipped or failed", err);
  }
};

export const ShortsFeedOverlay = ({ 
  posts, 
  initialPost, 
  onClose,
  isOverlayOpen 
}: { 
  posts: any[]; 
  initialPost: any; 
  onClose: () => void;
  isOverlayOpen: boolean;
}) => {
  const { language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [hasScrolledToInitial, setHasScrolledToInitial] = useState(false);
  
  useEffect(() => {
    if (containerRef.current && initialPost && !hasScrolledToInitial) {
      const index = posts.findIndex(p => p.id === initialPost.id);
      if (index !== -1) {
        const itemHeight = containerRef.current.clientHeight;
        containerRef.current.scrollTop = index * itemHeight;
        setHasScrolledToInitial(true);
      }
    }
  }, [initialPost, posts, hasScrolledToInitial]);

  // Handle hardware back
  useEffect(() => {
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[500] bg-black"
    >
      <div className="absolute top-safe left-4 z-10 p-2">
        <button
          onClick={() => window.history.back()}
          className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
      >
        {posts.map((post) => (
          <ShortVideoPlayer 
            key={post.id} 
            post={post} 
            isOverlayOpen={isOverlayOpen}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const ShortVideoPlayer = ({ post, isOverlayOpen }: { post: any; isOverlayOpen: boolean }) => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlaying = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.reactionsCount || post.likes || 0);
  const [isVerified, setIsVerified] = useState(false);
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [hasBeenNearScreen, setHasBeenNearScreen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isMediaError, setIsMediaError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isVideoSaved, setIsVideoSaved] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "success" | "error">("idle");
  const [showGiftSheet, setShowGiftSheet] = useState(false);
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [isSendingGift, setIsSendingGift] = useState(false);

  // Fetch user inventory when gift sheet opens
  useEffect(() => {
    let unsub: any;
    if (showGiftSheet && auth.currentUser) {
      const fetchInv = async () => {
        const { collection, onSnapshot } = await import("firebase/firestore");
        const { handleFirestoreError, OperationType } = await import("@/lib/firebase");
        const invPath = `users/${auth.currentUser!.uid}/inventory`;
        const invRef = collection(db, invPath);
        unsub = onSnapshot(invRef, 
          (snap: any) => {
            const items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
              .filter((item: any) => item.quantity > 0);
            setUserInventory(items);
          },
          (error: any) => {
            console.error("Inventory Listener Error:", error);
            handleFirestoreError(error, OperationType.LIST, invPath);
          }
        );
      };
      fetchInv();
    }
    return () => { if (unsub) unsub(); };
  }, [showGiftSheet]);

  const handleSendGift = async (gift: any) => {
    if (!auth.currentUser || isSendingGift) return;
    setIsSendingGift(true);
    try {
      const { doc, runTransaction, serverTimestamp, increment, collection } = await import("firebase/firestore");
      
      await runTransaction(db, async (transaction) => {
        // 1. Check user inventory
        const inventoryRef = doc(db, `users/${auth.currentUser!.uid}/inventory`, gift.id);
        const invDoc = await transaction.get(inventoryRef);
        
        if (!invDoc.exists() || invDoc.data().quantity <= 0) {
          throw new Error("Insufficient gift quantity");
        }
        
        // 2. Subtract from user inventory
        transaction.update(inventoryRef, {
          quantity: increment(-1),
          updatedAt: serverTimestamp()
        });
        
        // 3. Add to creator's balance
        const creatorBalanceRef = doc(db, "user_balances", post.authorUid);
        const creatorDoc = await transaction.get(creatorBalanceRef);
        
        if (creatorDoc.exists()) {
          transaction.update(creatorBalanceRef, {
            totalEarned: increment(gift.price),
            giftsEarned: increment(gift.price),
            updatedAt: serverTimestamp()
          });
        } else {
          transaction.set(creatorBalanceRef, {
            userId: post.authorUid,
            totalEarned: gift.price,
            giftsEarned: gift.price,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        // 4. Record history for creator
        const historyRef = doc(collection(db, `users/${post.authorUid}/earning_history`));
        transaction.set(historyRef, {
          userId: post.authorUid,
          type: `Received Gift: ${gift.name_en}`,
          amount: gift.price,
          status: 'approved',
          fromUserId: auth.currentUser!.uid,
          fromUserName: auth.currentUser!.displayName || 'User',
          postId: post.id,
          createdAt: serverTimestamp()
        });
      });
      
      // Success feedback could be added here (e.g. animation)
      const successMsg = language === 'bn' ? 'গিফট পাঠানো সফল হয়েছে!' : 'Gift sent successfully!';
      alert(successMsg);
      setShowGiftSheet(false);
    } catch (e: any) {
      console.error(e);
      alert(language === 'bn' ? 'গিফট পাঠাতে ব্যর্থ হয়েছে' : 'Failed to send gift');
    } finally {
      setIsSendingGift(false);
    }
  };

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
           setHasBeenNearScreen(true);
        }
      });
    }, { rootMargin: "400px 0px" });
    
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch author data
  useEffect(() => {
    let isMounted = true;
    const fetchAuthorData = async () => {
      try {
        const { doc, getDoc, collection, query, where, getCountFromServer } = await import("firebase/firestore");
        const userDoc = await getDoc(doc(db, "users", post.authorUid));
        if (isMounted && userDoc.exists()) {
          setIsVerified(userDoc.data().isVerified === true);
          setAuthorAvatar(userDoc.data().photoUrl || userDoc.data().photoURL || "");
        }
        const followersQuery = query(collection(db, "follows"), where("following_id", "==", post.authorUid));
        const followersSnapshot = await getCountFromServer(followersQuery);
        if (isMounted) setFollowerCount(followersSnapshot.data().count);
        
        if (auth.currentUser && auth.currentUser.uid !== post.authorUid) {
          const { getDocs } = await import("firebase/firestore");
          const followingQuery = query(
            collection(db, "follows"),
            where("follower_id", "==", auth.currentUser.uid),
            where("following_id", "==", post.authorUid)
          );
          const isFollowingSnapshot = await getDocs(followingQuery);
          if (isMounted) setIsFollowing(!isFollowingSnapshot.empty);
        }
      } catch (e) {}
    };
    fetchAuthorData();
    return () => { isMounted = false; };
  }, [post.authorUid]);

  // Check if liked and saved
  useEffect(() => {
    if (auth.currentUser && post.id) {
       let unsubscribeLike: any;
       const checkStatus = async () => {
         const { doc, onSnapshot } = await import("firebase/firestore");
         
         const userLikeRef = doc(db, `posts/${post.id}/likes`, auth.currentUser!.uid);
         unsubscribeLike = onSnapshot(userLikeRef, (docSnap) => {
           setIsLiked(docSnap.exists());
         }, (err) => {
             console.error("Like Snapshot Error:", err);
         });

         // Check local storage for saved status
         const savedVideos = JSON.parse(localStorage.getItem('muslim_sathi_saved_posts') || '[]');
         setIsVideoSaved(savedVideos.some((v: any) => v.id === post.id));
       };
       checkStatus();
       return () => {
           if(unsubscribeLike) unsubscribeLike();
       };
    }
  }, [post.id]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isOverlayOpen && !showReportModal) {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
            isPlaying.current = true;
            // Record view
            import("firebase/firestore").then(({ doc, increment, updateDoc }) => {
               const postRef = doc(db, "posts", post.id);
               updateDoc(postRef, { views: increment(1) }).catch(() => {});
            });
          } else {
            if (videoRef.current) {
              videoRef.current.pause();
            }
            isPlaying.current = false;
          }
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [isOverlayOpen, showReportModal, post.id, hasBeenNearScreen]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(l => newIsLiked ? l + 1 : Math.max(0, l - 1));
    try {
      const { doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } = await import("firebase/firestore");
      const userLikeRef = doc(db, `posts/${post.id}/likes`, auth.currentUser.uid);
      const postRef = doc(db, "posts", post.id);
      if (newIsLiked) {
        await setDoc(userLikeRef, { uid: auth.currentUser.uid, createdAt: serverTimestamp() });
        await updateDoc(postRef, { reactionsCount: increment(1) });
      } else {
        await deleteDoc(userLikeRef);
        await updateDoc(postRef, { reactionsCount: increment(-1) });
      }
    } catch (e) {
      setIsLiked(!newIsLiked);
      setLikes(l => newIsLiked ? Math.max(0, l - 1) : l + 1);
    }
  };

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) {
      alert(language === "bn" ? "ফলো করতে লগইন করুন" : "Please login to follow");
      return;
    }
    if (auth.currentUser.uid === post.authorUid) return;

    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);
    setFollowerCount((prev) => newIsFollowing ? prev + 1 : Math.max(0, prev - 1));

    try {
      const { collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp } = await import("firebase/firestore");
      const followsRef = collection(db, "follows");

      if (!newIsFollowing) {
        const q = query(followsRef, where("follower_id", "==", auth.currentUser.uid), where("following_id", "==", post.authorUid));
        const snap = await getDocs(q);
        snap.forEach(async (docSnap) => {
          await deleteDoc(docSnap.ref);
        });
      } else {
        await addDoc(followsRef, {
          follower_id: auth.currentUser.uid,
          following_id: post.authorUid,
          created_at: serverTimestamp(),
        });
      }
    } catch (err) {
      setIsFollowing(!newIsFollowing);
      setFollowerCount((prev) => newIsFollowing ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MuslimFeed Short",
          text: post.content?.text || post.content || "",
          url: window.location.href,
        });
        const { doc, updateDoc, increment } = await import("firebase/firestore");
        await updateDoc(doc(db, "posts", post.id), { sharesCount: increment(1) });
      } catch (e) {}
    }
  };

  const handleSaveVideo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) {
      alert(language === "bn" ? "সেভ করতে লগইন করুন" : "Please login to save");
      return;
    }
    const newIsSaved = !isVideoSaved;
    setIsVideoSaved(newIsSaved);
    try {
      // Update local storage
      const savedVideos = JSON.parse(localStorage.getItem('muslim_sathi_saved_posts') || '[]');
      
      if (newIsSaved) {
        // Add to local storage if not exists
        if (!savedVideos.find((v: any) => v.id === post.id)) {
          savedVideos.push(post);
          localStorage.setItem('muslim_sathi_saved_posts', JSON.stringify(savedVideos));
        }
      } else {
        // Remove from local storage
        const filteredVideos = savedVideos.filter((v: any) => v.id !== post.id);
        localStorage.setItem('muslim_sathi_saved_posts', JSON.stringify(filteredVideos));
      }
    } catch (err) {
      console.error("Local storage error:", err);
      setIsVideoSaved(!newIsSaved);
    }
  };

  const handleDownloadVideo = async (quality: "HD" | "SD") => {
    setShowDownloadMenu(false);
    if (!finalFileId) return;

    setDownloadState("downloading");

    try {
      const videoUrl = getApiUrl(`/api/telegram/file/${finalFileId}`);
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      // Download name automatically contains 'Halal_Circle' as requested
      a.download = `Halal_Circle_Video_${post.id}_${quality}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setDownloadState("success");
      setTimeout(() => setDownloadState("idle"), 3000);
    } catch (err) {
      console.error(err);
      setDownloadState("error");
      setTimeout(() => setDownloadState("idle"), 3000);
    }
  };

  let displayContent = "";
  if (typeof post.content === "object" && post.content !== null) {
    displayContent = post.content.text || "";
  } else if (typeof post.content === "string") {
    displayContent = post.content;
    if (displayContent.startsWith("{")) {
       try { displayContent = JSON.parse(displayContent).text || displayContent; } catch(e) {}
    }
  }

  let finalFileId = post.fileId;
  if (typeof post.content === "object" && post.content?.fileId) finalFileId = post.content.fileId;

  // Trigger offline caching if post allows it
  useEffect(() => {
    if (post.allowOffline && finalFileId) {
       cacheVideoForOffline(getApiUrl(`/api/telegram/file/${finalFileId}`));
    }
  }, [post.allowOffline, finalFileId]);

  const videoSrc = useOfflineMedia(finalFileId, "video");

  return (
    <div ref={wrapperRef} className="h-full w-full snap-start snap-always relative flex flex-col items-center justify-center bg-black overflow-hidden">
      {!isMediaLoaded && !isMediaError && finalFileId && hasBeenNearScreen && (
        <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col justify-end p-4">
          <div className="absolute right-3 bottom-6 flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-slate-800 animate-pulse" />
          </div>
          <div className="space-y-3 mb-10 w-[70%]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse" />
              <div className="w-32 h-4 bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="w-full h-3 bg-slate-800 rounded animate-pulse" />
            <div className="w-2/3 h-3 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      )}
      {isMediaError && (
        <div className="absolute inset-0 bg-slate-900 z-30 flex flex-col items-center justify-center pointer-events-none">
            <AlertTriangle className="w-10 h-10 text-slate-500 opacity-50 mb-2" />
            <span className="text-xs text-slate-400 font-medium">{language === 'bn' ? 'ভিডিও লোড হতে সমস্যা হয়েছে' : 'Failed to load video'}</span>
        </div>
      )}
      {finalFileId && hasBeenNearScreen && (
        <video
          ref={videoRef}
          src={videoSrc}
          className={`h-full w-full object-contain transition-opacity duration-300 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
          preload="metadata"
          loop
          playsInline
          muted={isMuted}
          onLoadedData={() => setIsMediaLoaded(true)}
          onError={() => setIsMediaError(true)}
          onClick={() => {
            if (videoRef.current?.paused) {
              videoRef.current.play();
            } else {
              videoRef.current?.pause();
            }
          }}
        />
      )}

      {/* Download Notification */}
      <AnimatePresence>
        {downloadState !== "idle" && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 mx-auto w-max z-50 px-4 py-2 bg-black/80 backdrop-blur-md rounded-full text-white text-xs font-medium flex items-center gap-2 border border-white/20"
          >
            {downloadState === "downloading" && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {downloadState === "success" && <Check className="w-4 h-4 text-green-400" />}
            {downloadState === "error" && <AlertTriangle className="w-4 h-4 text-red-500" />}
            
            {downloadState === "downloading" && (language === "bn" ? "ডাউনলোড হচ্ছে... (Halal Circle)" : "Downloading... (Halal Circle)")}
            {downloadState === "success" && (language === "bn" ? "ডাউনলোড সফল হয়েছে!" : "Download Successful!")}
            {downloadState === "error" && (language === "bn" ? "ডাউনলোড ব্যর্থ হয়েছে" : "Download Failed")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Actions */}
      <div className="absolute right-3 bottom-6 flex flex-col items-center gap-5 z-20">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleLike}
            className={cn(
              "p-3 rounded-full backdrop-blur-xl transition-all active:scale-90",
              isLiked ? "text-rose-500 bg-rose-500/10" : "text-white bg-white/10"
            )}
          >
            <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
          </button>
          <span className="text-[11px] font-black text-white shadow-sm">{formatCount(likes)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowGiftSheet(true); }}
            className="p-3 rounded-full bg-yellow-400/20 backdrop-blur-xl text-yellow-400 active:scale-95 transition-transform"
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
          <span className="text-[11px] font-black text-white shadow-sm">{language === 'bn' ? 'উপহার' : 'Gift'}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-white/10 backdrop-blur-xl text-white active:scale-90"
          >
            <Share2 className="w-6 h-6" />
          </button>
          <span className="text-[11px] font-black text-white shadow-sm">{formatCount(post.sharesCount || 0)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button 
             onClick={handleSaveVideo}
             className={cn(
               "p-3 rounded-full backdrop-blur-xl transition-all active:scale-90",
               isVideoSaved ? "text-yellow-400 bg-yellow-400/20" : "text-white bg-white/10"
             )}
          >
            <Bookmark className={cn("w-6 h-6", isVideoSaved && "fill-current")} />
          </button>
        </div>

        <button 
           onClick={() => setShowReportModal(true)}
           className="p-3 rounded-full bg-white/10 backdrop-blur-xl text-white active:scale-90"
        >
          <Flag className="w-6 h-6" />
        </button>

        <div className="relative">
          <button 
             onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(!showDownloadMenu); }}
             className="p-3 rounded-full bg-white/10 backdrop-blur-xl text-white active:scale-90"
          >
            <Download className="w-6 h-6" />
          </button>
          
          <AnimatePresence>
            {showDownloadMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                className="absolute right-14 bottom-0 bg-black/80 backdrop-blur-xl rounded-xl border border-white/20 p-2 flex flex-col gap-1 w-32 origin-bottom-right"
              >
                <div className="text-[10px] text-white/50 px-2 py-1 uppercase font-bold tracking-wider">
                  {language === "bn" ? "ভিডিও ডাউনলোড" : "Download Video"}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownloadVideo("HD"); }}
                  className="text-white text-xs font-medium px-3 py-2 text-left hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>HD Quality</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30">Pro</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownloadVideo("SD"); }}
                  className="text-white text-xs font-medium px-3 py-2 text-left hover:bg-white/10 rounded-lg transition-colors"
                >
                  Standard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
             {authorAvatar ? (
               <img src={getApiUrl(authorAvatar)} className="w-11 h-11 rounded-full border-2 border-white shadow-lg" crossOrigin="anonymous" />
             ) : (
                <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl border-2 border-white">
                  {post.authorName?.charAt(0)}
                </div>
             )}
              {auth.currentUser?.uid !== post.authorUid && (
                <button 
                  onClick={handleToggleFollow}
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full p-0.5 text-white border-2 border-black transition-colors ${
                    isFollowing ? 'bg-slate-600' : 'bg-blue-600'
                  }`}
                >
                   {isFollowing ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </button>
              )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-black text-[15px] shadow-sm">{post.authorName}</span>
              <VerifiedBadge isVerified={isVerified} isOwner={false} size={14} className="text-blue-400" />
            </div>
            <p className="text-[11px] font-bold text-slate-300">
               {followerCount} {language === "bn" ? "ফলোয়ার" : "followers"}
            </p>
          </div>
        </div>
        <p className="text-sm text-white font-medium line-clamp-3 leading-relaxed shadow-sm pr-12">
          {displayContent}
        </p>
      </div>

      <AnimatePresence>
        {showReportModal && (
          <ReportModal post={post} onClose={() => setShowReportModal(false)} />
        )}
      </AnimatePresence>

      {/* Gift Inventory Sheet */}
      <AnimatePresence>
        {showGiftSheet && (
          <div className="fixed inset-0 z-[600] flex items-end justify-center px-4 pb-0 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGiftSheet(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] overflow-hidden pointer-events-auto relative pb-safe"
            >
              <div className="p-1 flex flex-col items-center">
                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full my-3" />
                
                <div className="w-full px-6 py-2 flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {language === 'bn' ? 'গিফট ইনভেন্টরি' : 'Gift Inventory'}
                  </h3>
                  <button 
                    onClick={() => setShowGiftSheet(false)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="w-full px-6 grid grid-cols-3 gap-4 mb-8 max-h-[400px] overflow-y-auto pt-2 pb-6">
                  {userInventory.length > 0 ? (
                    userInventory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSendGift(item)}
                        disabled={isSendingGift}
                        className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center border border-transparent hover:border-primary/30 transition-all active:scale-95"
                      >
                        <span className="text-3xl mb-2">{item.icon}</span>
                        <span className="text-[13px] font-bold text-slate-800 dark:text-white text-center line-clamp-1">
                          {language === 'bn' ? item.name_bn : item.name_en}
                        </span>
                        <div className="mt-1 bg-primary/10 px-2 py-0.5 rounded-full">
                          <span className="text-[10px] font-black text-primary">x{item.quantity}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-3 py-12 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Star className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium px-6">
                        {language === 'bn' 
                          ? 'আপনার কাছে কোনো গিফট নেই! শপ থেকে গিফট কিনুন।' 
                          : 'You don\'t have any gifts! Buy some from the shop.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
