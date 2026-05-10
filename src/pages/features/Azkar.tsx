import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const AZKAR = [
  {
    "id": 1,
    "name": "সুবহানাল্লাহ",
    "arabic": "سُبْحَانَ ٱللَّٰهِ",
    "pronunciation": "সুবহানাল্লাহ",
    "meaning": "আল্লাহ পবিত্র ও মহিমাময়।"
  },
  {
    "id": 2,
    "name": "আলহামদুলিল্লাহ",
    "arabic": "ٱلْحَمْدُ لِلَّٰهِ",
    "pronunciation": "আলহামদুলিল্লাহ",
    "meaning": "সকল প্রশংসা আল্লাহর জন্য।"
  },
  {
    "id": 3,
    "name": "আল্লাহু আকবার",
    "arabic": "ٱللَّٰهُ أَكْبَرُ",
    "pronunciation": "আল্লাহু আকবার",
    "meaning": "আল্লাহ সর্বশ্রেষ্ঠ।"
  },
  {
    "id": 4,
    "name": "ইস্তিগফার",
    "arabic": "أَسْتَغْفِرُ اللَّهَ",
    "pronunciation": "আস্তাগফিরুল্লাহ",
    "meaning": "আমি আল্লাহর কাছে ক্ষমা চাই।"
  },
  {
    "id": 5,
    "name": "লা ইলাহা ইল্লাল্লাহ",
    "arabic": "لَا إِلَٰهَ إِلَّا اللَّهُ",
    "pronunciation": "লা ইলাহা ইল্লাল্লাহ",
    "meaning": "আল্লাহ ছাড়া কোনো উপাস্য নেই।"
  }
];

export function AzkarView() {
  const { t } = useLanguage();

  const items: Dua[] = AZKAR.map(item => ({
    id: item.id + 2000,
    title: item.name,
    arabic: item.arabic,
    translation: `উচ্চারণ: ${item.pronunciation}\n\nঅর্থ: ${item.meaning}`,
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('azkar') || 'যিকির'}
      itemLabel="যিকির"
      searchPlaceholder="যিকির খুঁজুন..."
      emptyText="কোনো যিকির পাওয়া যায়নি"
    />
  );
}
