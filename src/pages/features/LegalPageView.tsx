import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LegalPageViewProps {
  type: 'terms' | 'privacy';
  onBack: () => void;
}

export function LegalPageView({ type, onBack }: LegalPageViewProps) {
  const { language } = useLanguage();

  const content = type === 'terms' ? {
    title: language === 'bn' ? 'শর্তাবলি ও নীতিমালা' : 'Terms & Conditions',
    icon: FileText,
    color: 'text-blue-500',
    sections: [
      {
        title: language === 'bn' ? '১. সাধারণ শর্তাবলি' : '1. General Terms',
        text: language === 'bn' 
          ? 'আমাদের প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি আমাদের সকল শর্তাবলিতে সম্মত হচ্ছেন। এই অ্যাপটি শুধুমাত্র বৈধ আয়ের উদ্দেশ্যে ব্যবহার করা যাবে।' 
          : 'By using our platform, you agree to all our terms and conditions. This app should only be used for legitimate earning purposes.'
      },
      {
        title: language === 'bn' ? '২. কুইজ অ্যান্ড আর্ন (Quiz & Earn)' : '2. Quiz & Earn Rules',
        text: language === 'bn'
          ? 'কুইজে অংশগ্রহণ করার সময় কোনো প্রকার থার্ড-পার্টি অ্যাপ বা অটো-ক্লিকার ব্যবহার করা সম্পূর্ণ নিষিদ্ধ। সঠিক উত্তর দেওয়ার মাধ্যমেই শুধুমাত্র রিওয়ার্ড প্রদান করা হবে।'
          : 'Use of any third-party apps or auto-clickers while participating in quizzes is strictly prohibited. Rewards will only be granted for correct answers.'
      },
      {
        title: language === 'bn' ? '৩. মাইক্রো জব নীতিমালা' : '3. Micro Job Policies',
        text: language === 'bn'
          ? 'মাইক্রো জবে ভুল বা ভুয়া প্রমাণ (Fake Proof) জমা দিলে সাথে সাথে আপনার পেমেন্ট রিজেক্ট করা হবে। বারবার ভুয়া প্রমাণ জমা দিলে আপনার অ্যাকাউন্টটি স্থায়ীভাবে ব্যান করা হতে পারে।'
          : 'Submitting incorrect or fake proof in Micro Jobs will result in immediate payment rejection. Repeated fake submissions may lead to a permanent account ban.'
      },
      {
        title: language === 'bn' ? '৪. অ্যাড ভিউ আয়' : '4. Ad-View Earnings',
        text: language === 'bn'
          ? 'অ্যাডে ক্লিক করার ক্ষেত্রে সিস্টেমের নির্দেশনা মেনে চলতে হবে। ইনভ্যালিড ক্লিক বা বিজ্ঞাপনের নীতিমালা লঙ্ঘন করলে ওই সেশনের ইনকাম যোগ হবে না।'
          : 'When clicking on ads, system instructions must be followed. Invalid clicks or policy violations will result in earnings for that session not being added.'
      },
      {
        title: language === 'bn' ? '৫. পেমেন্ট ও উইথড্র' : '5. Payments & Withdrawals',
        text: language === 'bn'
          ? 'পেমেন্ট রিকোয়েস্ট করার পর ভেরিফিকেশন সাপেক্ষে ২৪-৭২ ঘণ্টার মধ্যে পেমেন্ট প্রসেস করা হবে। ভুল পেমেন্ট নম্বর বা মেথড নির্বাচনের জন্য কর্তৃপক্ষ দায়ী থাকবে না।'
          : 'Payment requests will be processed within 24-72 hours subject to verification. The authority will not be responsible for selecting incorrect payment numbers or methods.'
      },
      {
        title: language === 'bn' ? '৬. কামিং সুন (Coming Soon) ক্যাটাগরি' : '6. Coming Soon Categories',
        text: language === 'bn'
          ? 'আমাদের কামিং সুন সার্ভিসগুলো (যেমন: Reselling, Brand Job, Course) লঞ্চ হওয়ার পর সেগুলোর জন্য আলাদা নীতিমালা এবং গাইডলাইন প্রদান করা হবে।'
          : 'Separate policies and guidelines will be provided for our Coming Soon services (e.g., Reselling, Brand Job, Course) once they are launched.'
      },
      {
        title: language === 'bn' ? '৭. নিষিদ্ধ কার্যক্রম' : '7. Prohibited Activities',
        text: language === 'bn'
          ? 'ভিপিএন (VPN), মাল্টিপল অ্যাকাউন্ট (Multiple Accounts), এবং হ্যাকিংয়ের চেষ্টা করা কঠোরভাবে নিষিদ্ধ। এ ধরনের কার্যক্রম ধরা পড়লে অ্যাকাউন্ট স্থায়ীভাবে ডিলিট করা হবে।'
          : 'VPN usage, creating multiple accounts, and attempting to hack are strictly prohibited. Such activities will lead to permanent account deletion.'
      }
    ]
  } : {
    title: language === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy',
    icon: Shield,
    color: 'text-emerald-500',
    sections: [
      {
        title: language === 'bn' ? 'তথ্য সংগ্রহ' : 'Information Collection',
        text: language === 'bn'
          ? 'অ্যাপ ব্যবহারের সময় আমরা আপনার নাম, ইমেইল এবং পেমেন্ট সংক্রান্ত তথ্য সংগ্রহ করি যাতে আপনাকে উন্নত সেবা এবং পেমেন্ট প্রদান করা সম্ভব হয়।'
          : 'We collect your name, email, and payment-related information during app usage to provide better service and facilitate payments.'
      },
      {
        title: language === 'bn' ? 'তথ্যের সুরক্ষা' : 'Data Security',
        text: language === 'bn'
          ? 'আপনার ব্যক্তিগত তথ্যের সুরক্ষা নিশ্চিত করতে আমরা আধুনিক নিরাপত্তা ব্যবস্থা ব্যবহার করি। কোনো অবস্থাতেই তৃতীয় কোনো পক্ষের কাছে আপনার তথ্য শেয়ার করা হয় না।'
          : 'We use modern security measures to ensure the safety of your personal information. We do not share your data with any third parties under any circumstances.'
      },
      {
        title: language === 'bn' ? 'ডিভাইস ইনফরমেশন' : 'Device Information',
        text: language === 'bn'
          ? 'সিকিউরিটি এবং মাল্টিপল অ্যাকাউন্ট চেক করার জন্য আমরা আপনার ডিভাইস আইডি এবং আইপি অ্যাড্রেস ট্র্যাক করে থাকি।'
          : 'We track your device ID and IP address for security purposes and to check for multiple account violations.'
      },
      {
        title: language === 'bn' ? 'বিজ্ঞাপন ও ট্র্যাকিং' : 'Ads & Tracking',
        text: language === 'bn'
          ? 'আমাদের অ্যাপে গুগল অ্যাডমব (AdMob) ব্যবহার করা হয়, যা আপনার পছন্দের ভিত্তিতে বিজ্ঞাপন দেখানোর জন্য নির্দিষ্ট ডাটা ব্যবহার করতে পারে।'
          : 'Our app uses Google AdMob, which may use certain data to show personalized ads based on your preferences.'
      }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col pt-safe overflow-hidden"
    >
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div className="flex items-center gap-2">
          <content.icon className={cn("w-5 h-5", content.color)} />
          <h1 className="text-lg font-black text-slate-900 dark:text-white">
            {content.title}
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Welcome Message */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2">
            <h2 className={cn("text-xl font-black mb-2", content.color)}>
              {language === 'bn' ? 'Halal Circle আর্নিং নীতিমালা' : 'Halal Circle Earning Policy'}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {language === 'bn' 
                ? 'সঠিকভাবে আয় করতে এবং আপনার অ্যাকাউন্ট নিরাপদ রাখতে নিম্নলিখিত নীতিমালাগুলো মনোযোগ সহকারে পড়ুন।' 
                : 'Read the following policies carefully to earn correctly and keep your account safe.'}
            </p>
          </div>

          {/* Policy Sections as thin cards */}
          {content.sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900 px-5 py-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex gap-3">
                <div className={cn("shrink-0 p-2 rounded-lg bg-opacity-10", 
                  type === 'terms' ? "bg-blue-500" : "bg-emerald-500"
                )}>
                  {type === 'terms' ? (
                    <FileText className={cn("w-4 h-4", content.color)} />
                  ) : (
                    <CheckCircle2 className={cn("w-4 h-4", content.color)} />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    {section.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Warnings */}
          <div className="bg-amber-50 dark:bg-amber-500/5 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30 mt-8 mb-10">
            <div className="flex gap-4">
              <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-sm font-black text-amber-900 dark:text-amber-400 mb-1">
                  {language === 'bn' ? 'সতর্কতা' : 'Security Warning'}
                </h4>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-500/80 leading-relaxed">
                  {language === 'bn' 
                    ? 'যেকোনো ধরনের অসাধুপন্থা অবলম্বন করলে আপনার কষ্টার্জিত টাকা বাতিল হবে এবং অ্যাকাউন্টটি ব্লক করে দেওয়া হবে। আমরা স্বচ্ছল কমিউনিটি গড়তে বদ্ধপরিকর।' 
                    : 'Any unfair means used will result in cancellation of your hard-earned money and account suspension. We are determined to build a fair community.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
