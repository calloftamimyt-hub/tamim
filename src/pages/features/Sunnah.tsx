import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { DuaView, Dua, DuaSection } from './Dua';

const SUNNAH_DATA = [
  {
    id: 1,
    title: 'ঘুম থেকে ওঠার সুন্নাত',
    sections: [
      { type: 'text' as const, content: 'ঘুম থেকে উঠে দু’হাত দিয়ে মুখমণ্ডলের ঘুমের আমেজ মুছে ফেলা।' },
      { 
        type: 'dua' as const, 
        title: 'ঘুম থেকে ওঠার দোয়া',
        arabic: 'اَلْحَمْدُ لِلّٰهِ الَّذِیْ اَحْیَانَا بَعْدَ مَا اَمَاتَنَا وَاِلَیْہِ النُّشُوْرِ',
        translation: 'আলহামদুলিল্লাহিল্লাজি আহইয়ানা বা’দা মা আমাতানা ওয়া ইলাইহিন নুশুর (সকল প্রশংসা আল্লাহর জন্য, যিনি আমাদের মৃত্যুর পর জীবিত করেছেন এবং তাঁর কাছেই ফিরে যেতে হবে)।'
      },
      { type: 'text' as const, content: 'মিসওয়াক করা।' },
      { type: 'text' as const, content: 'নাকে পানি দিয়ে তিনবার ঝাড়া।' }
    ]
  },
  {
    id: 2,
    title: 'পোশাক পরিধানের সুন্নাত',
    sections: [
      { type: 'text' as const, content: 'ডান দিক দিয়ে পোশাক পরা শুরু করা।' },
      { 
        type: 'dua' as const, 
        title: 'পোশাক পরার দোয়া',
        arabic: 'اَلْحَمْدُ لِلّٰهِ الَّذِیْ كَسَانِیْ ھٰذَا الثَّوبَ وَرَزَقَنِیْہِ مِنْ غَیْرِ حَوْلٍ مِّنِّیْ وَلَا قُوَّةٍ',
        translation: 'আলহামদুলিল্লাহিল্লাজি কাসানি হাজাস সাওবা ওয়া রাজাকানিহি মিন গাইরি হাওলিম মিন্নি ওয়ালা কুওয়্যাহ (সকল প্রশংসা আল্লাহর জন্য, যিনি আমাকে এই পোশাক পরালেন এবং এটি দান করলেন আমার কোনো শক্তি বা ক্ষমতা ছাড়াই)।'
      },
      { type: 'text' as const, content: 'পোশাক খোলার সময় বাম দিক দিয়ে খোলা।' }
    ]
  },
  {
    id: 3,
    title: 'খাবার গ্রহণের সুন্নাত',
    sections: [
      { type: 'text' as const, content: 'খাবার শুরুর আগে বিসমিল্লাহ বলা।' },
      { type: 'text' as const, content: 'ডান হাত দিয়ে খাবার খাওয়া।' },
      { 
        type: 'dua' as const, 
        title: 'খাবার শেষে দোয়া',
        arabic: 'اَلْحَمْدُ لِلّٰهِ الَّذِیْ اَطْعَمَنَا وَ سَقَانَا وَ جَعَلَنَا مُسْلِمِیْن',
        translation: 'আলহামদুলিল্লাহিল্লাজি আতআমানা ওয়া সাকানা ওয়া জাআলানা মুসলিমিন (সকল প্রশংসা আল্লাহর জন্য, যিনি আমাদের আহার করিয়েছেন, পান করিয়েছেন এবং মুসলিম বানিয়েছেন)।'
      },
      { type: 'text' as const, content: 'খাবারের পর দুই হাত ধোয়া ও মুখ পরিষ্কার করা।' }
    ]
  },
  {
    id: 4,
    title: 'ঘরে প্রবেশ ও বের হওয়ার সুন্নাত',
    sections: [
      { type: 'text' as const, content: 'ঘরে প্রবেশের সময় বিসমিল্লাহ বলা এবং সালাম দেওয়া।' },
      { 
        type: 'dua' as const, 
        title: 'ঘর থেকে বের হওয়ার দোয়া',
        arabic: 'بِسْمِ اللّٰهِ تَوَكَّلْتُ عَلَى اللّٰهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ',
        translation: 'বিসমিল্লাহি তাওয়াক্কালতু আলাল্লাহি লা হাওলা ওয়ালা কুয়াতা ইল্লা বিল্লাহ (আল্লাহর নামে, আল্লাহর ওপর ভরসা করলাম। আল্লাহর সাহায্য ছাড়া কোনো ক্ষমতা বা শক্তি নেই)।'
      }
    ]
  },
  {
    id: 5,
    title: 'মসজিদে প্রবেশ ও বের হওয়ার সুন্নাত',
    sections: [
      { 
        type: 'dua' as const, 
        title: 'মসজিদে প্রবেশের দোয়া',
        arabic: 'اَللّٰهُمَّ افْتَحْ لِیْ اَبْوَابَ رَحْمَتِک',
        translation: 'আল্লাহুম্মাফ তাহলি আবওয়াবা রাহমাতিক (হে আল্লাহ! আমার জন্য আপনার রহমতের দরজাগুলো খুলে দিন)।'
      },
      { 
        type: 'dua' as const, 
        title: 'মসজিদ থেকে বের হওয়ার দোয়া',
        arabic: 'اَللّٰهُمَّ اِنِّیْ اَسْئَلُکَ مِنْ فَضْلِک',
        translation: 'আল্লাহুম্মা ইন্নি আসআলুকা মিন ফাদলিক (হে আল্লাহ! আমি আপনার অনুগ্রহ প্রার্থনা করছি)।'
      }
    ]
  },
  {
    id: 6,
    title: 'জুমআর দিনের সুন্নাত',
    sections: [
      { type: 'text' as const, content: 'গোসল করা।' },
      { type: 'text' as const, content: 'পরিষ্কার ও সুন্দর পোশাক পরা।' },
      { type: 'text' as const, content: 'সুগন্ধি ব্যবহার করা (পুরুষদের জন্য)।' },
      { type: 'text' as const, content: 'সূরা কাহাফ তিলাওয়াত করা।' },
      { type: 'text' as const, content: 'বেশি বেশি দরূদ পাঠ করা।' },
      { type: 'text' as const, content: 'আগে আগে মসজিদে যাওয়া।' }
    ]
  },
  {
    id: 7,
    title: 'পানির সুন্নাত',
    sections: [
      { type: 'text' as const, content: 'বসে পানি পান করা।' },
      { type: 'text' as const, content: 'ডান হাতে গ্লাস ধরা।' },
      { type: 'text' as const, content: 'পানি পানের আগে বিসমিল্লাহ বলা।' },
      { type: 'text' as const, content: 'তিন নিঃশ্বাসে পানি পান করা।' },
      { type: 'text' as const, content: 'পানির গ্লাসে নিঃশ্বাস না ছাড়া।' },
      { type: 'text' as const, content: 'শেষে আলহামদুলিল্লাহ বলা।' }
    ]
  }
];

export function SunnahView() {
  const { t } = useLanguage();

  const items: Dua[] = SUNNAH_DATA.map(item => ({
    id: item.id + 6000,
    title: item.title,
    sections: item.sections as DuaSection[],
  }));

  return (
    <DuaView 
      onBack={() => window.history.back()} 
      initialDuas={items} 
      title={t('sunnah') || 'দৈনন্দিন সুন্নাত'}
      itemLabel="সুন্নাত"
      searchPlaceholder="সুন্নাত খুঁজুন..."
      emptyText="তথ্য পাওয়া যায়নি"
    />
  );
}
