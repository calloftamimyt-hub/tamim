import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const DAROODS = [
  {
    "id": 1,
    "name": "ছোট দরূদ",
    "arabic": "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّم",
    "pronunciation": "সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম।",
    "meaning": "আল্লাহ তাঁর (নবীজির) উপর রহমত ও শান্তি বর্ষণ করুন।"
  },
  {
    "id": 2,
    "name": "দরূদে ইব্রাহিম (নামাজে পঠিত)",
    "arabic": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    "pronunciation": "আল্লাহুম্মা সাল্লি আলা মুহাম্মাদিও ওয়া আলা আলি মুহাম্মাদিন কামা সাল্লাইতা আলা ইব্রাহীমা ওয়া আলা আলি ইব্রাহীমা ইন্নাকা হামীদুম মাজীদ।",
    "meaning": "হে আল্লাহ! আপনি হযরত মুহাম্মদ (সাঃ) ও তাঁর বংশধরদের উপর রহমত বর্ষণ করুন, যেমন আপনি রহমত বর্ষণ করেছিলেন হযরত ইব্রাহিম (আঃ) ও তাঁর বংশধরদের উপর। নিশ্চয়ই আপনি প্রশংসিত ও সম্মানিত।"
  }
];

export function DaroodView() {
  const { t } = useLanguage();

  const items: Dua[] = DAROODS.map(item => ({
    id: item.id + 2000,
    title: item.name,
    arabic: item.arabic,
    translation: `উচ্চারণ: ${item.pronunciation}\n\nঅর্থ: ${item.meaning}`,
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('darood') || 'দরূদ'}
      itemLabel="দরূদ"
      searchPlaceholder="দরূদ খুঁজুন..."
      emptyText="কোনো দরূদ পাওয়া যায়নি"
    />
  );
}
