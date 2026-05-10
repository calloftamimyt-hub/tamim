import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const MASNOON_DUAS = [
  {
    "id": 1001,
    "name": "ঘুম থেকে উঠার দোয়া",
    "arabic": "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    "pronunciation": "আলহামদুলিল্লাহিল্লাজী আহইয়ানা বা'দামা আমাতানা ওয়া ইলাইহিন নুশুর।",
    "meaning": "সমস্ত প্রশংসা সেই আল্লাহর জন্য যিনি মৃত্যুর (ঘুমের) পর আমাদের জীবন দান করেছেন এবং তাঁরই দিকে আমাদের ফিরে যেতে হবে।"
  },
  {
    "id": 1002,
    "name": "ঘুমানোর দোয়া",
    "arabic": "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    "pronunciation": "বিসমিকা আল্লাহুম্মা আমুতু ওয়া আহ্ইয়া।",
    "meaning": "হে আল্লাহ, আপনার নাম নিয়েই আমি মৃত্যুবরণ করছি (ঘুমাচ্ছি) এবং আপনার নাম নিয়েই আমি জীবিত (জাগ্রত) হবো।"
  },
  {
    "id": 1003,
    "name": "খাওয়ার শুরুর দোয়া",
    "arabic": "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
    "pronunciation": "বিসমিল্লাহি ওয়া আলা বারাকাতিল্লাহ।",
    "meaning": "আল্লাহর নামে এবং আল্লাহর বরকতের উপর ভিত্তি করে (খাওয়া শুরু করছি)।"
  }
];

export function MasnoonDuaView() {
  const { t } = useLanguage();

  const duaItems: Dua[] = MASNOON_DUAS.map(dua => ({
    id: dua.id,
    title: dua.name,
    arabic: dua.arabic,
    translation: `উচ্চারণ: ${dua.pronunciation}\n\nঅর্থ: ${dua.meaning}`,
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={duaItems} 
      title={t('masnoon-dua') || 'মাসনুন দোয়া'} 
    />
  );
}
