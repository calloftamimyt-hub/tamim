const fs = require('fs');
const path = require('path');

const commonImports = `import React, { useState } from 'react';
import { ArrowLeft, Copy, Share2, Check, Quote as QuoteIcon, BookOpen } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
`;

const getDuaTemplate = (name, key, dataVar, dataArray) => `${commonImports}
const ${dataVar} = ${JSON.stringify(dataArray, null, 2)};

export function ${name}() {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (item: typeof ${dataVar}[0]) => {
    const textToCopy = \`\${item.name}\\n\\nআরবি:\\n\${item.arabic}\\n\\nউচ্চারণ:\\n\${item.pronunciation}\\n\\nঅর্থ:\\n\${item.meaning}\`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (item: typeof ${dataVar}[0]) => {
    const shareText = \`\${item.name}\\n\\nআরবি:\\n\${item.arabic}\\n\\nউচ্চারণ:\\n\${item.pronunciation}\\n\\nঅর্থ:\\n\${item.meaning}\\n\\n- মুসলিম সাথী অ্যাপ থেকে\`;
    if (navigator.share) {
      try { await navigator.share({ title: item.name, text: shareText }); } 
      catch (error) { console.error('Error sharing:', error); }
    } else { handleCopy(item); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <header className="px-4 pt-safe pb-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-20">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('${key}')}</h1>
      </header>

      <div className="flex-grow p-4 pb-20 overflow-y-auto">
        <div className="flex flex-col gap-5 max-w-2xl mx-auto">
          {${dataVar}.map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_15px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                <h2 className="text-sm font-black text-slate-800 dark:text-slate-200">{item.name}</h2>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleCopy(item)} className={cn("p-2 rounded-xl transition-all duration-300", copiedId === item.id ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700")}>
                    {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleShare(item)} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-all duration-300">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="mb-6 flex justify-end">
                  <p className="font-arabic text-3xl leading-[1.8] text-right text-slate-900 dark:text-white" dir="rtl">{item.arabic}</p>
                </div>
                <div className="space-y-4 text-[13px] sm:text-sm">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <p className="font-bold text-primary dark:text-primary-light mb-1">উচ্চারণ:</p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{item.pronunciation}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">অর্থ:</p>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{item.meaning}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

const getQuoteTemplate = (name, key, dataVar, dataArray) => `${commonImports}
const ${dataVar} = ${JSON.stringify(dataArray, null, 2)};

export function ${name}() {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (item: typeof ${dataVar}[0]) => {
    const textToCopy = \`"\${item.quote}"\\n\\n- \${item.author}\\n(\${item.reference})\`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (item: typeof ${dataVar}[0]) => {
    const shareText = \`"\${item.quote}"\\n\\n- \${item.author}\\n(\${item.reference})\\n\\n- মুসলিম সাথী অ্যাপ থেকে\`;
    if (navigator.share) {
      try { await navigator.share({ title: 'ইসলামিক উক্তি', text: shareText }); } 
      catch (error) { console.error('Error sharing:', error); }
    } else { handleCopy(item); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <header className="px-4 pt-safe pb-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-20">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('${key}')}</h1>
      </header>

      <div className="flex-grow p-4 pb-20 overflow-y-auto">
        <div className="flex flex-col gap-5 max-w-2xl mx-auto">
          {${dataVar}.map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_15px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden relative">
              <div className="absolute top-4 right-5 flex items-center gap-1.5 z-10">
                <button onClick={() => handleCopy(item)} className={cn("p-2 rounded-full transition-all duration-300", copiedId === item.id ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700")}>
                  {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => handleShare(item)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-all duration-300">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 pt-10">
                <QuoteIcon className="w-10 h-10 text-emerald-500/20 absolute top-4 left-4" />
                <p className="text-[17px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-6 mt-2">
                  "{item.quote}"
                </p>
                <div className="flex flex-col gap-1 text-[13px] border-t border-slate-100 dark:border-slate-800 pt-4">
                  <p className="font-black text-emerald-600 dark:text-emerald-400">{item.author}</p>
                  <p className="text-slate-500 dark:text-slate-400">রেফারেন্স: {item.reference}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

const getArticleTemplate = (name, key, dataVar, dataArray) => `${commonImports}
const ${dataVar} = ${JSON.stringify(dataArray, null, 2)};

export function ${name}() {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (item: typeof ${dataVar}[0]) => {
    const textToCopy = \`\${item.title}\\n\\n\${item.content}\`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (item: typeof ${dataVar}[0]) => {
    const shareText = \`\${item.title}\\n\\n\${item.content}\\n\\n- মুসলিম সাথী অ্যাপ থেকে\`;
    if (navigator.share) {
      try { await navigator.share({ title: item.title, text: shareText }); } 
      catch (error) { console.error('Error sharing:', error); }
    } else { handleCopy(item); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <header className="px-4 pt-safe pb-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-20">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('${key}')}</h1>
      </header>

      <div className="flex-grow p-4 pb-20 overflow-y-auto">
        <div className="flex flex-col gap-5 max-w-2xl mx-auto">
          {${dataVar}.map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_2px_15px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-200">{item.title}</h2>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleCopy(item)} className={cn("p-2 rounded-full transition-all duration-300", copiedId === item.id ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700")}>
                    {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleShare(item)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-all duration-300">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm md:text-[15px] text-justify">
                  {item.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

const FILES = [
  {
    file: 'MasnoonDua.tsx', name: 'MasnoonDuaView', key: 'masnoon-dua', type: 'dua', dataVar: 'MASNOON_DUAS',
    data: [
        {id: 1, name: 'ঘুম থেকে উঠার দোয়া', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', pronunciation: 'আলহামদুলিল্লাহিল্লাজী আহইয়ানা বা\'দামা আমাতানা ওয়া ইলাইহিন নুশুর।', meaning: 'সমস্ত প্রশংসা সেই আল্লাহর জন্য যিনি মৃত্যুর (ঘুমের) পর আমাদের জীবন দান করেছেন এবং তাঁরই দিকে আমাদের ফিরে যেতে হবে।'},
        {id: 2, name: 'ঘুমানোর দোয়া', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', pronunciation: 'বিসমিকা আল্লাহুম্মা আমুতু ওয়া আহ্ইয়া।', meaning: 'হে আল্লাহ, আপনার নাম নিয়েই আমি মৃত্যুবরণ করছি (ঘুমাচ্ছি) এবং আপনার নাম নিয়েই আমি জীবিত (জাগ্রত) হবো।'},
        {id: 3, name: 'খাওয়ার শুরুর দোয়া', arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ', pronunciation: 'বিসমিল্লাহি ওয়া আলা বারাকাতিল্লাহ।', meaning: 'আল্লাহর নামে এবং আল্লাহর বরকতের উপর ভিত্তি করে (খাওয়া শুরু করছি)।'}
    ]
  },
  {
    file: 'Roza.tsx', name: 'RozaView', key: 'roza', type: 'dua', dataVar: 'ROZA_STEPS',
    data: [
      {id:1, name: 'রোজার নিয়ত', arabic: 'نَوَيْتُ اَنْ اَصُوْمَ غَدًا مِّنْ شَهْرِ رَمَضَانَ الْمُبَارَكِ فَرْضَا لَكَ يَا اَللهُ فَتَقَبَّل مِنِّى اِنَّكَ اَنْتَ السَّمِيْعُ الْعَلِيْم', pronunciation: 'নাওয়াইতু আন আছুমা গাদাম মিন শাহরি রমাদ্বানাল মুবারাকি ফারদাল্লাকা, ইয়া আল্লাহু ফাতাকাব্বাল মিন্নি ইন্নিকা আনতাস সামিউল আলিম।', meaning: 'হে আল্লাহ! আমি আগামীকাল পবিত্র রমজান মাসের ফরজ রোজা রাখার নিয়ত করছি। অতএব, আপনি আমার পক্ষ থেকে তা কবুল করুন, নিশ্চয়ই আপনি সর্বশ্রোতা ও সর্বজ্ঞানী।'},
      {id:2, name: 'ইফতারের দোয়া', arabic: 'اَللَّهُمَّ لَكَ صُمْتُ وَ عَلَى رِزْقِكَ اَفْطَرْتُ', pronunciation: 'আল্লাহুম্মা লাকা ছুমতু ওয়া আলা রিযক্বিকা আফতারতু।', meaning: 'হে আল্লাহ! আমি আপনারই সন্তুষ্টির জন্য রোজা রেখেছি এবং আপনারই দেয়া রিযিক দিয়ে ইফতার করছি।'}
    ]
  },
  {
    file: 'Darood.tsx', name: 'DaroodView', key: 'darood', type: 'dua', dataVar: 'DAROODS',
    data: [
      {id:1, name: 'ছোট দরূদ', arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّم', pronunciation: 'সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম।', meaning: 'আল্লাহ তাঁর (নবীজির) উপর রহমত ও শান্তি বর্ষণ করুন।'},
      {id:2, name: 'দরূদে ইব্রাহিম (নামাজে পঠিত)', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ', pronunciation: 'আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিও ওয়া আলা আলি মুহাম্মাদিন কামা সাল্লাইতা আলা ইব্রাহীমা ওয়া আলা আলি ইব্রাহীমা ইন্নাকা হামীদুম মাজীদ।', meaning: 'হে আল্লাহ! আপনি হযরত মুহাম্মদ (সাঃ) ও তাঁর বংশধরদের উপর রহমত বর্ষণ করুন, যেমন আপনি রহমত বর্ষণ করেছিলেন হযরত ইব্রাহিম (আঃ) ও তাঁর বংশধরদের উপর। নিশ্চয়ই আপনি প্রশংসিত ও সম্মানিত।'}
    ]
  },
  {
    file: 'Azkar.tsx', name: 'AzkarView', key: 'azkar', type: 'dua', dataVar: 'AZKAR',
    data: [
      {id:1, name: 'সুবহানাল্লাহ', arabic: 'سُبْحَانَ ٱللَّٰهِ', pronunciation: 'সুবহানাল্লাহ', meaning: 'আল্লাহ পবিত্র ও মহিমাময়।'},
      {id:2, name: 'আলহামদুলিল্লাহ', arabic: 'ٱلْحَمْدُ لِلَّٰهِ', pronunciation: 'আলহামদুলিল্লাহ', meaning: 'সকল প্রশংসা আল্লাহর জন্য।'},
      {id:3, name: 'আল্লাহু আকবার', arabic: 'ٱللَّٰهُ أَكْبَرُ', pronunciation: 'আল্লাহু আকবার', meaning: 'আল্লাহ সর্বশ্রেষ্ঠ।'},
      {id:4, name: 'ইস্তিগফার', arabic: 'أَسْتَغْفِرُ اللَّهَ', pronunciation: 'আস্তাগফিরুল্লাহ', meaning: 'আমি আল্লাহর কাছে ক্ষমা চাই।'},
      {id:5, name: 'লা ইলাহা ইল্লাল্লাহ', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', pronunciation: 'লা ইলাহা ইল্লাল্লাহ', meaning: 'আল্লাহ ছাড়া কোনো উপাস্য নেই।'}
    ]
  },
  {
    file: 'IslamicQuotes.tsx', name: 'IslamicQuotesView', key: 'islamic-quotes', type: 'quote', dataVar: 'QUOTES',
    data: [
      {id:1, author: 'হযরত মুহাম্মদ (সাঃ)', quote: 'তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে কুরআন শেখে এবং অন্যকে শেখায়।', reference: 'সহীহ বুখারী: ৫০২৭'},
      {id:2, author: 'হযরত উমর ইবনুল খাত্তাব (রাঃ)', quote: 'যে নিজের সম্পর্কে চিন্তা করে, তার অন্যের দোষ খোঁজার সময় থাকে না।', reference: 'ঐতিহাসিক উক্তি'},
      {id:3, author: 'হযরত আলী (রাঃ)', quote: 'বিপদ যখন চরম সীমায় পৌঁছায়, তখন মুক্তির পথ দেখা যায়।', reference: 'ঐতিহাসিক উক্তি'}
    ]
  },
  {
    file: 'Seerah.tsx', name: 'SeerahView', key: 'seerah', type: 'article', dataVar: 'SEERAH',
    data: [
      {id:1, title: 'হযরত আদম (আঃ)', content: 'হযরত আদম (আঃ) হলেন পৃথিবীর প্রথম মানব ও আদি পিতা। আল্লাহ তায়ালা তাকে মাটি থেকে সৃষ্টি করেছেন এবং তার স্ত্রী হাওয়া (আঃ)-কে তার পাঁজর থেকে সৃষ্টি করেছেন। তাদেরকে জান্নাতে রাখা হয়েছিল কিন্তু পরে দুনিয়ায় পাঠানো হয়।'},
      {id:2, title: 'হযরত নূহ (আঃ)', content: 'হযরত নূহ (আঃ) দীর্ঘ ৯৫০ বছর মানুষকে এক আল্লাহর দিকে ডাকেন। কিন্তু খুব অল্প মানুষই তার প্রতি ঈমান আনে। অবশেষে আল্লাহর নির্দেশে তিনি একটি বিশাল নৌকা তৈরি করেন এবং মহাপ্লাবন থেকে মুমিনদের রক্ষা করেন।'},
      {id:3, title: 'হযরত মুহাম্মদ (সাঃ)', content: 'সর্বশেষ ও সর্বশ্রেষ্ঠ নবী হযরত মুহাম্মদ (সাঃ) আরবের মক্কা নগরীতে ৫৭০ খ্রিস্টাব্দে জন্মগ্রহণ করেন। ৪০ বছর বয়সে তিনি নবুওয়াত লাভ করেন এবং পবিত্র কুরআন তার ওপর অবতীর্ণ হয়।'}
    ]
  },
  {
    file: 'Sahaba.tsx', name: 'SahabaView', key: 'sahaba', type: 'article', dataVar: 'SAHABA',
    data: [
      {id:1, title: 'হযরত আবু বকর সিদ্দিক (রাঃ)', content: 'তিনি ছিলেন মুসলমানদের প্রথম খলিফা এবং রাসুল (সাঃ)-এর সবচেয়ে ঘনিষ্ট বন্ধু। পুরুষদের মধ্যে তিনি সবার আগে ইসলাম গ্রহণ করেন এবং মিরাজের ঘটনা নিসন্দেহে বিশ্বাস করায় তাকে "সিদ্দিক" উপাধি দেওয়া হয়।'},
      {id:2, title: 'হযরত উমর ইবনুল খাত্তাব (রাঃ)', content: 'ইসলামের দ্বিতীয় খলিফা। তার শাসনামলে অর্ধ-পৃথিবীতে ইসলামের বিজয় পতাকা ওড়ে। তিনি ছিলেন অত্যন্ত ন্যায়পরায়ণ এবং রাসুল (সাঃ) তাকে "ফারুক" বা সত্য-মিথ্যার পার্থক্যকারী উপাধি দিয়েছিলেন।'}
    ]
  },
  {
    file: 'HalalHaram.tsx', name: 'HalalHaramView', key: 'halal-haram', type: 'article', dataVar: 'HALAL_HARAM',
    data: [
      {id:1, title: 'হালাল উপার্জনের গুরুত্ব', content: 'ইসলামে হালাল উপার্জনকে ইবাদত হিসেবে আখ্যায়িত করা হয়েছে। রাসুলুল্লাহ (সাঃ) বলেছেন, "হালাল রুজি অন্বেষণ করা ফরজ ইবাদতের পর আরও একটি ফরজ।" হালাল উপার্জনে বরকত থাকে এবং ইবাদত কবুল হওয়ার জন্য হালাল খাবার গ্রহণ করা শর্ত।'},
      {id:2, title: 'গীবত বা পরনিন্দা (হারাম)', content: 'গীবত বা কারো অনুপস্থিতিতে তার সমালোচনা করা ইসলামে চরমভাবে নিষিদ্ধ (হারাম)। কুরআনে একে মৃত ভাইয়ের গোশত খাওয়ার সমতুল্য বলা হয়েছে।'},
      {id:3, title: 'সুদ বা রিবা (হারাম)', content: 'ইসলামে সুদ কঠোরভাবে হারাম করা হয়েছে। আল্লাহ তায়ালা ব্যবসাকে হালাল করেছেন এবং সুদকে হারাম করেছেন। সুদের আদান-প্রদান সমাজ ধ্বংসের একটি মূল কারণ।'}
    ]
  }
];

const dir = path.join(__dirname, 'src/pages/features');

FILES.forEach(({ file, name, key, type, dataVar, data }) => {
  let content = '';
  if (type === 'dua') content = getDuaTemplate(name, key, dataVar, data);
  else if (type === 'quote') content = getQuoteTemplate(name, key, dataVar, data);
  else content = getArticleTemplate(name, key, dataVar, data);

  fs.writeFileSync(path.join(dir, file), content);
  console.log('Updated:', file);
});
