import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Clock, PlayCircle, Loader2, Award, Upload, BadgeCheck } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase';

export const CreatorStudioView = ({ onBack, onNavigate }: { onBack: () => void, onNavigate: (path: string) => void }) => {
  const [userData, setUserData] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const path = `users/${user.uid}`;
    
    // Fetch followers
    import('firebase/firestore').then(({ getCountFromServer, collection, query, where }) => {
      const followersQuery = query(collection(db, 'follows'), where('following_id', '==', user.uid));
      getCountFromServer(followersQuery).then(snapshot => {
        setFollowerCount(snapshot.data().count);
      }).catch(console.error);
    });

    const unsub = onSnapshot(doc(db, 'users', user.uid), 
      (snap) => {

        if (snap.exists()) {
          setUserData(snap.data());
        }
        setLoading(false);
      },
      (error) => {
        console.error("CreatorStudio Listener Error:", error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const watchSeconds = userData?.watchTimeSeconds || 0;
  const watchHours = (watchSeconds / 3600).toFixed(1);
  const isMonetized = userData?.isMonetized || false;

  const GOAL_FOLLOWERS = 2000;
  const GOAL_WATCH_HOURS = 5000;

  const followerProgress = Math.min((followerCount / GOAL_FOLLOWERS) * 100, 100);
  const watchTimeProgress = Math.min((Number(watchHours) / GOAL_WATCH_HOURS) * 100, 100);

  const canApply = followerCount >= GOAL_FOLLOWERS && Number(watchHours) >= GOAL_WATCH_HOURS;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-[100dvh] flex flex-col font-sans">
      <div className="pt-safe pb-4 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[17px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Creator Studio</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Monetization Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative shrink-0">
            {auth.currentUser?.photoURL ? (
              <img src={auth.currentUser.photoURL} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xl">
                {auth.currentUser?.email?.[0].toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
               {auth.currentUser?.displayName || "Creator User"}
               {isMonetized && <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />}
             </h2>
             <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <Users className="w-4 h-4 text-slate-400"/> <span className="font-bold text-slate-700 dark:text-slate-300">{followerCount}</span> Followers
                <span className="mx-1 text-slate-300 dark:text-slate-600">|</span>
                <Clock className="w-4 h-4 text-slate-400"/> <span className="font-bold text-slate-700 dark:text-slate-300">{watchHours}</span> Watch Hours
             </p>
          </div>
        </div>

        {/* Monetization Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
           <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
             <Award className="w-5 h-5 text-amber-500" />
             Partner Program Eligibility
           </h3>
           <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
             Grow with us and earn money from ads shown on your videos. Meet the strict requirements below to apply.
           </p>

           <div className="space-y-6">
              
              {/* Follower Progress */}
              <div>
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Followers</span>
                    <span className="text-sm font-medium text-slate-500">{followerCount} / {GOAL_FOLLOWERS}</span>
                 </div>
                 <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${followerProgress}%` }}
                       className="h-full bg-blue-500 rounded-full"
                    />
                 </div>
                 {followerCount >= GOAL_FOLLOWERS && (
                   <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><BadgeCheck className="w-3 h-3"/> Follower goal reached</p>
                 )}
              </div>

              {/* Watch Time Progress */}
              <div>
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Public Watch Hours</span>
                    <span className="text-sm font-medium text-slate-500">{watchHours} / {GOAL_WATCH_HOURS}</span>
                 </div>
                 <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${watchTimeProgress}%` }}
                       className="h-full bg-amber-500 rounded-full"
                    />
                 </div>
                 <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 leading-tight">
                   <Clock className="w-3 h-3 shrink-0"/> Fast-forwarded or repeat views are strictly filtered. Screen must be active.
                 </p>
              </div>

           </div>

           <div className="mt-8">
             <button 
               disabled={!canApply || isMonetized}
               className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                 isMonetized ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                 canApply ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
               }`}
             >
               {isMonetized ? (
                 <> <BadgeCheck className="w-5 h-5"/> You are a Partner </>
               ) : canApply ? (
                 <> Apply Now </>
               ) : (
                 <> Meet requirements to apply </>
               )}
             </button>
           </div>
        </div>

        {/* Setup video section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Your Videos</h3>
            <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                <Upload className="w-8 h-8 text-slate-400 mb-3" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No videos uploaded</h4>
                <p className="text-xs text-slate-500 mb-4">Upload your first video to start gaining followers and watch time.</p>
                <button 
                  onClick={() => alert("Upload feature coming soon!")}
                  className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  Upload Video
                </button>
            </div>
            
            <button 
               onClick={() => {
                 // Trigger global navigation to tools/feed
                 window.dispatchEvent(new CustomEvent('navigate', { detail: 'tools' }));
                 onBack();
               }}
               className="mt-4 w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold flex flex-col items-center justify-center border border-blue-100 dark:border-blue-900/30"
            >
               <PlayCircle className="w-6 h-6 mb-1"/>
               Go to Video Feed
               <span className="text-xs font-normal opacity-80 mt-1">Watch and increase others' watch time</span>
            </button>
        </div>

      </div>
    </div>
  );
};
