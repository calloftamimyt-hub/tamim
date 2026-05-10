import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const ROZA_STEPS = [
  {
    "id": 1,
    "name": "রোজার নিয়ত",
    "arabic": "نَوَيْتُ اَنْ اَصُوْمَ غَدًا مِّنْ شَهْرِ رَمَضَانَ الْمُبَارَكِ فَرْضَا لَكَ يَا اَللهُ فَتَقَبَّل مِنِّى اِنَّكَ اَنْتَ السَّمِيْعُ الْعَلِيْم",
    "pronunciation": "নাওয়াইতু আন আছুমা গাদাম মিন শাহরি রমাদ্বানাল মুবারাকি ফারদাল্লাকা, ইয়া আল্লাহু ফাতাকাব্বাল মিন্নি ইন্নিকা আনতাস সামিউল আলিম।",
    "meaning": "হে আল্লাহ! আমি আগামীকাল পবিত্র রমজান মাসের ফরজ রোজা রাখার নিয়ত করছি। অতএব, আপনি আমার পক্ষ থেকে তা কবুল করুন, নিশ্চয়ই আপনি সর্বশ্রোতা ও সর্বজ্ঞানী।"
  },
  {
    "id": 2,
    "name": "ইফতারের দোয়া",
    "arabic": "اَللَّهُمَّ لَكَ صُمْتُ وَ عَلَى رِزْقِكَ اَفْطَرْتُ",
    "pronunciation": "আল্লাহুম্মা লাকা ছুমতু ওয়া আলা রিযক্বিকা আফতারতু।",
    "meaning": "হে আল্লাহ! আমি আপনারই সন্তুষ্টির জন্য রোজা রেখেছি এবং আপনারই দেয়া রিযিক দিয়ে ইফতার করছি।"
  }
];

export function RozaView() {
  const { t } = useLanguage();

  const items: Dua[] = ROZA_STEPS.map(item => ({
    id: item.id + 2000,
    title: item.name,
    arabic: item.arabic,
    translation: `উচ্চারণ: ${item.pronunciation}\n\nঅর্থ: ${item.meaning}`,
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('roza') || 'রোজা'}
      itemLabel="রোজা"
      searchPlaceholder="রোজা সম্পর্কিত খুঁজুন..."
      emptyText="কোনো তথ্য পাওয়া যায়নি"
    />
  );
}
