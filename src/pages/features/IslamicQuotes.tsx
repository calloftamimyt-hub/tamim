import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua } from './Dua';

const QUOTES = [
  {
    "id": 1,
    "author": "হযরত মুহাম্মদ (সাঃ)",
    "quote": "তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে কুরআন শেখে এবং অন্যকে শেখায়।",
    "reference": "সহীহ বুখারী: ৫০২৭"
  },
  {
    "id": 2,
    "author": "হযরত উমর ইবনুল খাত্তাব (রাঃ)",
    "quote": "যে নিজের সম্পর্কে চিন্তা করে, তার অন্যের দোষ খোঁজার সময় থাকে না।",
    "reference": "ঐতিহাসিক উক্তি"
  },
  {
    "id": 3,
    "author": "হযরত আলী (রাঃ)",
    "quote": "বিপদ যখন চরম সীমায় পৌঁছায়, তখন মুক্তির পথ দেখা যায়।",
    "reference": "ঐতিহাসিক উক্তি"
  }
];

export function IslamicQuotesView() {
  const { t } = useLanguage();

  const items: Dua[] = QUOTES.map(item => ({
    id: item.id + 3000,
    title: item.author,
    sections: [
      { type: 'text', content: `"${item.quote}"` },
      { type: 'subheading', title: `রেফারেন্স: ${item.reference}` }
    ]
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('islamic-quotes') || 'উক্তি'}
      itemLabel="উক্তি"
      searchPlaceholder="উক্তি বা লেখক খুঁজুন..."
      emptyText="কোনো উক্তি পাওয়া যায়নি"
    />
  );
}
