import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const HALAL_HARAM = [
  {
    "id": 1,
    "title": "হালাল উপার্জনের গুরুত্ব",
    "content": "ইসলামে হালাল উপার্জনকে ইবাদত হিসেবে আখ্যায়িত করা হয়েছে। রাসুলুল্লাহ (সাঃ) বলেছেন, \"হালাল রুজি অন্বেষণ করা ফরজ ইবাদতের পর আরও একটি ফরজ।\" হালাল উপার্জনে বরকত থাকে এবং ইবাদত কবুল হওয়ার জন্য হালাল খাবার গ্রহণ করা শর্ত।"
  },
  {
    "id": 2,
    "title": "গীবত বা পরনিন্দা (হারাম)",
    "content": "গীবত বা কারো অনুপস্থিতিতে তার সমালোচনা করা ইসলামে চরমভাবে নিষিদ্ধ (হারাম)। কুরআনে একে মৃত ভাইয়ের গোশত খাওয়ার সমতুল্য বলা হয়েছে।"
  },
  {
    "id": 3,
    "title": "সুদ বা রিবা (হারাম)",
    "content": "ইসলামে সুদ কঠোরভাবে হারাম করা হয়েছে। আল্লাহ তায়ালা ব্যবসাকে হালাল করেছেন এবং সুদকে হারাম করেছেন। সুদের আদান-প্রদান সমাজ ধ্বংসের একটি মূল কারণ।"
  }
];

export function HalalHaramView() {
  const { t } = useLanguage();

  const items: Dua[] = HALAL_HARAM.map(item => ({
    id: item.id + 4000,
    title: item.title,
    sections: [
      { type: 'text', content: item.content }
    ]
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('halal-haram') || 'হালাল ও হারাম'}
      itemLabel="হালাল ও হারাম"
      searchPlaceholder="বিষয় খুঁজুন..."
      emptyText="কোনো বিষয় পাওয়া যায়নি"
    />
  );
}
