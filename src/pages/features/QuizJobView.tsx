import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Star, CheckCircle2, XCircle, 
  PlayCircle, Loader2, Volume2, ShieldCheck, Moon, 
  Globe, Lightbulb, Calculator, ChevronRight, Clock,
  ArrowLeft, Zap, DollarSign, User, ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch, increment, serverTimestamp, collection, onSnapshot } from 'firebase/firestore';
import { earningService } from '@/services/earningService';
import { AdMob, RewardAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

import { initializeAdMob, showNativeAd, hideBanner, showRewardedAd, showInterstitialAd, showRewardedInterstitialAd } from '@/lib/admob';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface QuizJobViewProps {
  onBack: () => void;
}

const ADMOB_APP_ID = 'ca-app-pub-4288324218526190~7221934995';
const ADMOB_REWARD_ID = 'ca-app-pub-4288324218526190/8832383188';

// Set this to false to use Real Ads
const USE_TEST_ADS = false; 

const TEST_REWARD_ID = 'ca-app-pub-3940256099942544/5224354917';

const CATEGORIES = [
  { id: 'islamic', title: { bn: 'ইসলামিক কুইজ', en: 'Islamic Quiz' }, icon: Moon, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' }
];

const QUIZ_DATA: Record<string, any[]> = {
  islamic: [
  {
    "question": { "bn": "হযরত মুহাম্মদ (সা.) কোথায় জন্মগ্রহণ করেন?", "en": "Where was Prophet Muhammad (SAW) born?" },
    "options": [
      { "bn": "মক্কা", "en": "Makkah", "isCorrect": true },
      { "bn": "মদিনা", "en": "Madinah", "isCorrect": false },
      { "bn": "তায়েফ", "en": "Taif", "isCorrect": false },
      { "bn": "জেদ্দা", "en": "Jeddah", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "হযরত মুহাম্মদ (সা.) এর পিতার নাম কি?", "en": "What was the name of Prophet Muhammad's (SAW) father?" },
    "options": [
      { "bn": "আব্দুল্লাহ", "en": "Abdullah", "isCorrect": true },
      { "bn": "আবু তালিব", "en": "Abu Talib", "isCorrect": false },
      { "bn": "আব্দুল মুত্তালিব", "en": "Abdul Muttalib", "isCorrect": false },
      { "bn": "উমর", "en": "Umar", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "হযরত মুহাম্মদ (সা.) এর মাতার নাম কি?", "en": "What was the name of Prophet Muhammad's (SAW) mother?" },
    "options": [
      { "bn": "আমিনা", "en": "Amina", "isCorrect": true },
      { "bn": "খাদিজা", "en": "Khadija", "isCorrect": false },
      { "bn": "ফাতিমা", "en": "Fatima", "isCorrect": false },
      { "bn": "আয়েশা", "en": "Aisha", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "প্রথম ওহী কোথায় নাযিল হয়?", "en": "Where was the first revelation revealed?" },
    "options": [
      { "bn": "হেরা গুহা", "en": "Cave Hira", "isCorrect": true },
      { "bn": "মসজিদে নববী", "en": "Masjid Nabawi", "isCorrect": false },
      { "bn": "কাবা", "en": "Kaaba", "isCorrect": false },
      { "bn": "আরাফাত", "en": "Arafat", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "প্রথম ওহী কোন সূরার আয়াত ছিল?", "en": "From which Surah was the first revelation?" },
    "options": [
      { "bn": "সূরা আলাক", "en": "Surah Al-Alaq", "isCorrect": true },
      { "bn": "সূরা ফাতিহা", "en": "Surah Fatiha", "isCorrect": false },
      { "bn": "সূরা বাকারা", "en": "Surah Baqarah", "isCorrect": false },
      { "bn": "সূরা ইখলাস", "en": "Surah Ikhlas", "isCorrect": false }
    ]
  },

  {
    "question": { "bn": "ইসলামে প্রথম শহীদ কে?", "en": "Who was the first martyr in Islam?" },
    "options": [
      { "bn": "হযরত সুমাইয়া (রা.)", "en": "Sumayyah (RA)", "isCorrect": true },
      { "bn": "হযরত বিলাল (রা.)", "en": "Bilal (RA)", "isCorrect": false },
      { "bn": "হযরত হামজা (রা.)", "en": "Hamza (RA)", "isCorrect": false },
      { "bn": "হযরত উমর (রা.)", "en": "Umar (RA)", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "কুরআন কত বছরে নাযিল হয়েছে?", "en": "Over how many years was the Quran revealed?" },
    "options": [
      { "bn": "২৩ বছর", "en": "23 years", "isCorrect": true },
      { "bn": "২০ বছর", "en": "20 years", "isCorrect": false },
      { "bn": "২৫ বছর", "en": "25 years", "isCorrect": false },
      { "bn": "৩০ বছর", "en": "30 years", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "ইসলামে প্রথম মসজিদ কোনটি?", "en": "Which is the first mosque in Islam?" },
    "options": [
      { "bn": "মসজিদে কুবা", "en": "Masjid Quba", "isCorrect": true },
      { "bn": "মসজিদে হারাম", "en": "Masjid Haram", "isCorrect": false },
      { "bn": "মসজিদে নববী", "en": "Masjid Nabawi", "isCorrect": false },
      { "bn": "আল-আকসা", "en": "Al-Aqsa", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "ইসলামের দ্বিতীয় খলিফা কে?", "en": "Who was the second Caliph of Islam?" },
    "options": [
      { "bn": "হযরত উমর (রা.)", "en": "Umar (RA)", "isCorrect": true },
      { "bn": "হযরত আবু বকর (রা.)", "en": "Abu Bakr (RA)", "isCorrect": false },
      { "bn": "হযরত উসমান (রা.)", "en": "Uthman (RA)", "isCorrect": false },
      { "bn": "হযরত আলী (রা.)", "en": "Ali (RA)", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "ইসলামের তৃতীয় খলিফা কে?", "en": "Who was the third Caliph of Islam?" },"options": [
      { "bn": "হযরত উসমান (রা.)", "en": "Uthman (RA)", "isCorrect": true },
      { "bn": "হযরত উমর (রা.)", "en": "Umar (RA)", "isCorrect": false },
      { "bn": "হযরত আলী (রা.)", "en": "Ali (RA)", "isCorrect": false },
      { "bn": "হযরত আবু বকর (রা.)", "en": "Abu Bakr (RA)", "isCorrect": false }
    ]
  },

  {
    "question": { "bn": "ইসলামের চতুর্থ খলিফা কে?", "en": "Who was the fourth Caliph of Islam?" },
    "options": [
      { "bn": "হযরত আলী (রা.)", "en": "Ali (RA)", "isCorrect": true },
      { "bn": "হযরত উসমান (রা.)", "en": "Uthman (RA)", "isCorrect": false },
      { "bn": "হযরত উমর (রা.)", "en": "Umar (RA)", "isCorrect": false },
      { "bn": "হযরত আবু বকর (রা.)", "en": "Abu Bakr (RA)", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "ইসলামের প্রথম মহিলা কে ইসলাম গ্রহণ করেন?", "en": "Who was the first woman to accept Islam?" },
    "options": [
      { "bn": "হযরত খাদিজা (রা.)", "en": "Khadija (RA)", "isCorrect": true },
      { "bn": "হযরত আয়েশা (রা.)", "en": "Aisha (RA)", "isCorrect": false },
      { "bn": "হযরত ফাতিমা (রা.)", "en": "Fatima (RA)", "isCorrect": false },
      { "bn": "হযরত সুমাইয়া (রা.)", "en": "Sumayyah (RA)", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "কোন নবীকে 'খলিলুল্লাহ' বলা হয়?", "en": "Which Prophet is called 'Khalilullah'?" },
    "options": [
      { "bn": "হযরত ইবরাহিম (আ.)", "en": "Prophet Ibrahim (AS)", "isCorrect": true },
      { "bn": "হযরত মুসা (আ.)", "en": "Prophet Musa (AS)", "isCorrect": false },
      { "bn": "হযরত নূহ (আ.)", "en": "Prophet Nuh (AS)", "isCorrect": false },
      { "bn": "হযরত ঈসা (আ.)", "en": "Prophet Isa (AS)", "isCorrect": false }
    ]
  },
  {
    "question": { "bn": "কোন নবীকে 'কালিমুল্লাহ' বলা হয়?", "en": "Which Prophet is called 'Kalimulullah'?" },
    "options": [
      { "bn": "হযরত মুসা (আ.)", "en": "Prophet Musa (AS)", "isCorrect": true },
      { "bn": "হযরত ইবরাহিম (আ.)", "en": "Prophet Ibrahim (AS)", "isCorrect": false },
      { "bn": "হযরত নূহ (আ.)", "en": "Prophet Nuh (AS)", "isCorrect": false },
      { "bn": "হযরত ঈসা (আ.)", "en": "Prophet Isa (AS)", "isCorrect": false }
    ]
  },
  { question: { bn: 'কুরআন মাজিদে কতটি সূরা আছে?', en: 'How many Surahs are in the Quran?' }, options: [{ bn: '১১৪টি', en: '114', isCorrect: true }, { bn: '১১২টি', en: '112', isCorrect: false }, { bn: '১১৬টি', en: '116', isCorrect: false }, { bn: '১২০টি', en: '120', isCorrect: false }] },
    { question: { bn: 'ইসলামের প্রথম খলিফা কে ছিলেন?', en: 'Who was the first Caliph of Islam?' }, options: [{ bn: 'হযরত ওমর (রাঃ)', en: 'Hazrat Umar (RA)', isCorrect: false }, { bn: 'হযরত আলী (রাঃ)', en: 'Hazrat Ali (RA)', isCorrect: false }, { bn: 'হযরত আবু বকর (রাঃ)', en: 'Hazrat Abu Bakr (RA)', isCorrect: true }, { bn: 'হযরত ওসমান (রাঃ)', en: 'Hazrat Uthman (RA)', isCorrect: false }] },
    { question: { bn: 'নামাজ বেহেশতের কী?', en: 'What is prayer to heaven?' }, options: [{ bn: 'দরজা', en: 'Door', isCorrect: false }, { bn: 'চাবি', en: 'Key', isCorrect: true }, { bn: 'সিঁড়ি', en: 'Stairs', isCorrect: false }, { bn: 'আলো', en: 'Light', isCorrect: false }] },
    { question: { bn: 'ইসলামের মূল স্তম্ভ কয়টি?', en: 'How many pillars of Islam are there?' }, options: [{ bn: '৩টি', en: '3', isCorrect: false }, { bn: '৪টি', en: '4', isCorrect: false }, { bn: '৫টি', en: '5', isCorrect: true }, { bn: '৬টি', en: '6', isCorrect: false }] },
    { question: { bn: 'শেষ নবীর নাম কী?', en: 'What is the name of the last Prophet?' }, options: [{ bn: 'হযরত ঈসা (আঃ)', en: 'Hazrat Isa (AS)', isCorrect: false }, { bn: 'হযরত মুসা (আঃ)', en: 'Hazrat Musa (AS)', isCorrect: false }, { bn: 'হযরত ইব্রাহিম (আঃ)', en: 'Hazrat Ibrahim (AS)', isCorrect: false }, { bn: 'হযরত মুহাম্মদ (সাঃ)', en: 'Hazrat Muhammad (PBUH)', isCorrect: true }] }
  ]
};

export function QuizJobView({ onBack }: QuizJobViewProps) {
  const { language } = useLanguage();
  const [currentUser] = useState(auth.currentUser);
  const [balance, setBalance] = useState<any>(null);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>(() => {
    return [...QUIZ_DATA.islamic].sort(() => Math.random() - 0.5);
  });
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch Verification Status
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setIsVerified(docSnap.data().isVerified);
      }
    });
    return () => unsub();
  }, [currentUser]);

  // Fetch Balance
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'user_balances', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data());
      }
    });
    return () => unsub();
  }, [currentUser]);
  
  // Cooldown States
  const [lastQuizTimes, setLastQuizTimes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('last_quiz_times');
    return saved ? JSON.parse(saved) : {};
  });
  const [showBreakPopup, setShowBreakPopup] = useState(false);
  const [cooldownCategory, setCooldownCategory] = useState<string | null>(null);

  // Ad States
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [quizSettings, setQuizSettings] = useState({ 
    rewardAmount: 0.50,
    breakTimeMinutes: 1,
    questionsPerSession: 5
  });

  // Fetch Settings and User State
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        // Fetch Settings from Admin
        const settingsRef = doc(db, 'settings', 'earning');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setQuizSettings(prev => ({
            ...prev,
            rewardAmount: Number(data.quizReward) || prev.rewardAmount
          }));
        }
      } catch (error) {
        console.error("Error fetching quiz data (insufficient permissions or other):", error);
        // Fallback already set in state
      }
    };
    fetchData();
  }, []);

  // Initialize AdMob
  useEffect(() => {
    const initAd = async () => {
      await initializeAdMob();
    };
    initAd();
    
    return () => {
      hideBanner();
    };
  }, []);

  // Handle mobile back button for sub-navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (selectedCategory) {
        setSelectedCategory(null);
        // Prevent default back navigation if we're just closing a category
        window.history.pushState({ category: null }, '', '');
      }
    };

    if (selectedCategory) {
      window.history.pushState({ category: selectedCategory }, '', '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedCategory]);

  const handleCategorySelect = async (categoryId: string) => {
    // Check if break time is active for this category
    const lastTime = lastQuizTimes[categoryId] || 0;
    const nowTime = Date.now();
    const breakTimeMs = quizSettings.breakTimeMinutes * 60 * 1000;
    
    if (nowTime - lastTime < breakTimeMs) {
      setCooldownCategory(categoryId);
      setShowBreakPopup(true);
      return;
    }

    // Ad Rotation Logic
    const quizPlayCount = parseInt(localStorage.getItem('quiz_play_count') || '0');
    const adType = quizPlayCount % 3; // 0, 1, 2 loop

    setIsAdLoading(true);

    const startQuiz = () => {
      setIsAdLoading(false);
      localStorage.setItem('quiz_play_count', (quizPlayCount + 1).toString());
      
      const categoryQuestions = [...QUIZ_DATA[categoryId]]
        .sort(() => Math.random() - 0.5)
        .slice(0, quizSettings.questionsPerSession);
        
      setQuestions(categoryQuestions);
      setSelectedCategory(categoryId);
      setCurrentQuestionIdx(0);
      setScore(0);
      setIsAnswered(false);
      setSelectedOptionIdx(null);
    };

    if (Capacitor.getPlatform() === 'web') {
      setTimeout(startQuiz, 1000);
      return;
    }

    try {
      if (adType === 0) {
        // 1st: Rewarded Ad
        await showRewardedAd(
          () => {}, // reward already handled if valid answer
          (err) => console.error('Rewarded ad error', err),
          () => startQuiz()
        );
      } else if (adType === 1) {
        // 2nd: Interstitial Ad
        await showInterstitialAd(
          () => startQuiz(),
          (err) => {
            console.error('Interstitial ad error', err);
            startQuiz();
          }
        );
      } else {
        // 3rd: Rewarded Interstitial Ad
        await showRewardedInterstitialAd(
          () => {},
          () => startQuiz(),
          (err) => {
            console.error('Rewarded Interstitial ad error', err);
            startQuiz();
          }
        );
      }
    } catch (error) {
      console.error('Ad rotation failed', error);
      startQuiz();
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    
    setSelectedOptionIdx(idx);
    setIsAnswered(true);
    
    const isCorrect = questions[currentQuestionIdx].options[idx].isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextClick = () => {
    // Show Ad then Give Reward after each question
    finishQuizSession();
  };

  const finishQuizSession = async () => {
    if (isAdLoading) return;
    
    if (Capacitor.getPlatform() === 'web') {
      // Skip ad on web for testing
      setIsAdLoading(true);
      setTimeout(() => {
        setIsAdLoading(false);
        giveReward();
      }, 1000);
      return;
    }
    
    setIsAdLoading(true);
    try {
      const options: RewardAdOptions = {
        adId: USE_TEST_ADS ? TEST_REWARD_ID : ADMOB_REWARD_ID,
        isTesting: USE_TEST_ADS
      };
      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    } catch (error) {
      console.error('AdMob error:', error);
      // Proceed even if ad fails to load/show
    } finally {
      setIsAdLoading(false);
    }

    giveReward();
  };

  const giveReward = async () => {
    const user = auth.currentUser;
    const isCorrect = selectedOptionIdx !== null && questions[currentQuestionIdx].options[selectedOptionIdx].isCorrect;
    const earnedAmount = isCorrect ? Number(quizSettings.rewardAmount.toFixed(2)) : 0;

    if (user && earnedAmount > 0) {
      try {
        await earningService.addEarningRecord({
          type: 'Quiz Reward',
          amount: earnedAmount,
          status: 'approved',
          description: `Completed Islamic Quiz (Correct Answer)`
        });
      } catch (error) {
        console.error('Error saving quiz completion:', error);
      }
    }
    
    // Prepare next question seamlessly
    setSelectedOptionIdx(null);
    setIsAnswered(false);
    
    setCurrentQuestionIdx(prev => {
      if (prev + 1 >= questions.length) {
        setQuestions(prevQ => [...prevQ].sort(() => Math.random() - 0.5));
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden"
    >
      {/* Header / Navigation */}
      <div className="relative z-30 px-4 pt-safe pb-4 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-20 flex-1 bg-white dark:bg-slate-900 rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.05)] border-t border-white/10 overflow-hidden flex flex-col">
        {/* Quiz Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col pb-10">
          {!selectedCategory ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
                  {language === 'bn' ? 'কুইজ ক্যাটাগরি' : 'Quiz Categories'}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  {language === 'bn' ? 'আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং আয় শুরু করুন' : 'Select your favorite category and start earning'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={cn(
                      "w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all",
                      cat.shadow
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br",
                        cat.color
                      )}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                          {language === 'bn' ? cat.title.bn : cat.title.en}
                        </h4>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                          {language === 'bn' ? '৫টি প্রশ্ন • ০.৫০৳ পুরস্কার' : '5 Questions • 0.50৳ Reward'}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Stats Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Trophy className="w-20 h-20" />
                </div>
                <div className="relative z-10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">
                    {language === 'bn' ? 'আপনার বর্তমান ব্যালেন্স' : 'Your Current Balance'}
                  </p>
                  <h4 className="text-2xl font-black mb-3">৳{Number(balance?.currentBalance || 0).toFixed(2)}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[9px] font-black">{score} Collected</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full"
            >
            {questions.length > 0 && questions[currentQuestionIdx] ? (
              <>
                {/* Internal Header */}
                <div className="flex justify-between items-center mb-4 pt-2">
                  <div className="flex flex-col">
                    <h3 className="text-[14px] font-black text-primary dark:text-primary-light uppercase tracking-wider">
                      {language === 'bn' ? 'ইসলামিক কুইজ' : 'Islamic Quiz'}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      {language === 'bn' ? 'সঠিক উত্তর দিন, পয়েন্ট পান' : 'Answer right, get points'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                    <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="text-[11px] font-black text-primary">
                      {currentQuestionIdx + 1}/{questions.length}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                  />
                </div>

                {/* Question Card - Redesigned to be Slender */}
                <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-4 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 dark:text-white leading-snug">
                      {language === 'bn' ? questions[currentQuestionIdx].question.bn : questions[currentQuestionIdx].question.en}
                    </h2>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-2.5 flex-1">
                  {questions[currentQuestionIdx].options.map((option: any, idx: number) => {
                    const isSelected = selectedOptionIdx === idx;
                    const showCorrect = isAnswered && option.isCorrect;
                    const showWrong = isAnswered && isSelected && !option.isCorrect;

                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => handleOptionSelect(idx)}
                        className={cn(
                          "w-full px-4 py-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group",
                          !isAnswered ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]" : "",
                          showCorrect ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 scale-[1.01] shadow-lg shadow-emerald-500/5" : "",
                          showWrong ? "bg-red-50 dark:bg-red-500/10 border-red-500" : "",
                          isAnswered && !showCorrect && !showWrong ? "opacity-40" : ""
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] border transition-colors",
                            !isAnswered ? "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400" :
                            showCorrect ? "bg-emerald-500 border-emerald-500 text-white" :
                            showWrong ? "bg-red-500 border-red-500 text-white" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400"
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className={cn(
                            "text-sm font-bold",
                            showCorrect ? "text-emerald-700 dark:text-emerald-400" : 
                            showWrong ? "text-red-700 dark:text-red-400" : 
                            "text-slate-700 dark:text-slate-300"
                          )}>
                            {language === 'bn' ? option.bn : option.en}
                          </span>
                        </div>
                        
                        {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {showWrong && <XCircle className="w-4 h-4 text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {/* Status Indicator */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex flex-col gap-4"
                    >
                      <button
                        onClick={handleNextClick}
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-primary/25 active:scale-95 transition-all"
                      >
                        {language === 'bn' ? 'পরবর্তী প্রশ্ন' : 'Next Question'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="text-slate-500 font-black text-sm uppercase tracking-widest">
                  {language === 'bn' ? 'কুইজ লোড হচ্ছে...' : 'Loading quiz...'}
                </p>
              </div>
            )}
          </motion.div>
        )}
        </div>
      </div>

      {/* Ad Loading Overlay */}
      <AnimatePresence>
        {isAdLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-1">
              {language === 'bn' ? 'অ্যাড লোড হচ্ছে...' : 'Loading Ad...'}
            </h3>
            <p className="text-sm font-bold text-slate-500">
              {language === 'bn' ? 'দয়া করে অপেক্ষা করুন' : 'Please wait'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
