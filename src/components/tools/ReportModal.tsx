import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, ShieldBan, MessageSquareWarning, FileWarning, ImageOff, Ghost } from 'lucide-react';
import { doc, updateDoc, increment, arrayUnion, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { getApiUrl } from '@/lib/utils';

interface ReportModalProps {
  post: any;
  onClose: () => void;
}

const REPORT_REASONS = [
  {
    id: 'anti_islamic',
    icon: ShieldBan,
    bn: 'ইসলাম বিরোধী কন্টেন্ট',
    en: 'Anti-Islamic Content',
    descBn: 'কুরআন, সুন্নাহ বা ইসলামের মূল নীতির বিরুদ্ধে যায় এমন লেখা বা ছবি।',
    descEn: 'Content that goes against the Quran, Sunnah, or basic Islamic principles.'
  },
  {
    id: 'hate_speech',
    icon: MessageSquareWarning,
    bn: 'ঘৃণামূলক বা উসকানিমূলক বক্তব্য',
    en: 'Hate Speech or Provocative Content',
    descBn: 'কোনো ব্যক্তি বা গোষ্ঠীর প্রতি বিদ্বেষ ছড়ানো বা গালিগালাজ করা।',
    descEn: 'Spreading hate or using abusive language against individuals or groups.'
  },
  {
    id: 'false_info',
    icon: FileWarning,
    bn: 'ভুল বা বিভ্রান্তিকর তথ্য',
    en: 'False or Misleading Information',
    descBn: 'মিথ্যা তথ্য, ফেক নিউজ বা মনগড়া ফতোয়া দেওয়া।',
    descEn: 'Fake news, false claims, or fabricated religious rulings (Fatwas).'
  },
  {
    id: 'inappropriate_content',
    icon: ImageOff,
    bn: 'অশ্লীল বা অনুপযুক্ত ছবি/ভিডিও',
    en: 'Obscene or Inappropriate Content',
    descBn: 'যৌন উত্তেজক, অশোভন বা শালীনতাহীন কন্টেন্ট যা দেখা গুনাহ।',
    descEn: 'Sexually explicit, indecent, or immodest content.'
  },
  {
    id: 'scam_spam',
    icon: Ghost,
    bn: 'স্ক্যাম বা স্প্যাম',
    en: 'Scam or Spam',
    descBn: 'প্রতারণামূলক লিঙ্ক, ভিত্তিহীন বিজ্ঞাপন বা বারবার একই মেসেজ দেওয়া।',
    descEn: 'Fraudulent links, baseless ads, or repetitive spam messages.'
  }
];

export const ReportModal = ({ post, onClose }: ReportModalProps) => {
  const { language } = useLanguage();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmitReport = async () => {
    if (!selectedReason || !auth.currentUser || !post.id) return;
    setIsSubmitting(true);

    try {
      const reasonObj = REPORT_REASONS.find(r => r.id === selectedReason);
      const reasonTextEn = reasonObj?.en || selectedReason;
      const reasonTextBn = reasonObj?.bn || selectedReason;

      // 1. Add to reports collection
      await addDoc(collection(db, "reports"), {
        postId: post.id,
        userUid: auth.currentUser.uid,
        reason: selectedReason,
        createdAt: serverTimestamp(),
      });

      // 2. Increment report count on post
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        reportsCount: increment(1),
        reports: arrayUnion(selectedReason)
      });

      // 3. Send Telegram Notification
      const currentReports = (post.reportsCount || 0) + 1;
      const allReasons = post.reports || [];
      if (!allReasons.includes(selectedReason)) {
          allReasons.push(selectedReason);
      }

      await fetch(getApiUrl(`/api/telegram/report`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          authorName: post.authorName,
          content: post.content,
          reasonEn: reasonTextEn,
          reasonBn: reasonTextBn,
          reporterUid: auth.currentUser.uid,
          currentReports,
          hasMedia: !!post.fileId || !!post.mediaUrl || post.type === 'video',
          allReasons
        })
      }).catch(err => console.error("Telegram api error:", err));

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
      alert(language === 'bn' ? 'রিপোর্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to submit report. Try again.');
      setIsSubmitting(false);
    }
  };

  return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full bg-white dark:bg-slate-900 rounded-t-3xl min-h-[60vh] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              {language === 'bn' ? 'রিপোর্ট করুন' : 'Report Post'}
            </h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {!isSuccess ? (
            <>
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 px-6 no-scrollbar">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
                  {language === 'bn' 
                    ? 'এই পোস্টটি কেন রিপোর্ট করতে চান তা নিচে থেকে নির্বাচন করুন। আপনার রিপোর্টটি আমরা দ্রুত তদন্ত করব।' 
                    : 'Select a reason for reporting this post below. We will investigate your report shortly.'}
                </p>

                <div className="space-y-3">
                  {REPORT_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason.id;
                    const Icon = reason.icon;
                    return (
                      <button
                        key={reason.id}
                        onClick={() => setSelectedReason(reason.id)}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-red-500 bg-red-50 dark:bg-red-500/10' 
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-300'
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-red-500' : 'text-slate-400'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-base font-bold mb-1 ${isSelected ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                            {language === 'bn' ? reason.bn : reason.en}
                          </h4>
                          <p className={`text-xs font-medium leading-relaxed ${isSelected ? 'text-red-600/80 dark:text-red-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            {language === 'bn' ? reason.descBn : reason.descEn}
                          </p>
                        </div>
                        <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'border-red-500 bg-red-500' 
                            : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 pb-safe">
                <button
                  disabled={!selectedReason || isSubmitting}
                  onClick={handleSubmitReport}
                  className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all ${
                    selectedReason 
                      ? 'bg-red-600 hover:bg-red-700 active:scale-[0.98]' 
                      : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isSubmitting 
                    ? (language === 'bn' ? 'সাবমিট হচ্ছে...' : 'Submitting...') 
                    : (language === 'bn' ? 'রিপোর্ট সাবমিট করুন' : 'Submit Report')}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pb-safe">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {language === 'bn' 
                  ? 'আপনার রিপোর্টটি সফলভাবে গ্রহণ করা হয়েছে। আমরা এটি পর্যালোচনা করব।' 
                  : 'Your report has been successfully submitted. We will review it shortly.'}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
  );
}
