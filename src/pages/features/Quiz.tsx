import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Trophy, Timer, CheckCircle2, XCircle, RotateCcw, 
  ChevronRight, BookOpen, Star, HelpCircle, Home, Heart, 
  History, User, Zap, DollarSign, Bell, ChevronDown, X, Lock, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { auth, db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc, increment, updateDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { showInterstitialAd, showRewardedAd, showRewardedInterstitialAd, initializeAdMob } from '../../lib/admob';
import { Capacitor } from '@capacitor/core';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizCategory {
  id: string;
  title: string;
  icon: any;
  color: string;
  bg: string;
  questions: Question[];
}

export const QUIZ_DATA: QuizCategory[] = [
  {
    id: 'quran',
    title: 'আল কুরআন',
    icon: BookOpen,
    color: 'text-primary-600',
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    questions: [
      { id: 1, question: 'পবিত্র কুরআনের মোট সূরার সংখ্যা কত?', options: ['১১০টি', '১১৪টি', '১১৬টি', '১২০টি'], correctAnswer: 1 },
      { id: 2, question: 'কুরআনের দীর্ঘতম সূরার নাম কী?', options: ['সূরা বাকারা', 'সূরা নিসা', 'সূরা ইমরান', 'সূরা মায়েদা'], correctAnswer: 0 },
      { id: 3, question: 'কুরআনের ক্ষুদ্রতম সূরার নাম কী?', options: ['সূরা ইখলাস', 'সূরা নাস', 'সূরা কাউসার', 'সূরা ফালাক'], correctAnswer: 2 },
      { id: 4, question: 'কুরআনের প্রথম অবতীর্ণ সূরা কোনটি?', options: ['সূরা ফাতিহা', 'সূরা ইখলাস', 'সূরা আলাক', 'সূরা মুযযাম্মিল'], correctAnswer: 2 },
      { id: 5, question: 'কুরআনের কোন সূরায় বিসমিল্লাহ নেই?', options: ['সূরা তওবা', 'সূরা নামল', 'সূরা হুদ', 'সূরা ইউনুস'], correctAnswer: 0 },
      { id: 6, question: 'কুরআনের কোন সূরায় দুবার বিসমিল্লাহ আছে?', options: ['সূরা তওবা', 'সূরা নামল', 'সূরা হুদ', 'সূরা ইয়াসিন'], correctAnswer: 1 },
      { id: 7, question: 'কুরআনের মোট পারার সংখ্যা কত?', options: ['২০টি', '২৫টি', '৩০টি', '৩৫টি'], correctAnswer: 2 },
      { id: 8, question: 'কুরআনের মোট মানজিলের সংখ্যা কত?', options: ['৫টি', '৭টি', '৯টি', '১১টি'], correctAnswer: 1 },
      { id: 9, question: 'কুরআনের মোট রুকুর সংখ্যা কত?', options: ['৫৪০টি', '৫৫৬টি', '৫৮০টি', '৬০০টি'], correctAnswer: 1 },
      { id: 10, question: 'কুরআনের মোট সিজদার সংখ্যা কত?', options: ['১০টি', '১২টি', '১৪টি', '১৬টি'], correctAnswer: 2 },
      { id: 11, question: 'কুরআনের কোন সূরায় দুইবার সিজদা আছে?', options: ['সূরা হাজ্জ', 'সূরা নামল', 'সূরা সাজদাহ', 'সূরা আলাক'], correctAnswer: 0 },
      { id: 12, question: 'কুরআনের কোন সূরাকে কুরআনের জননী বলা হয়?', options: ['সূরা বাকারা', 'সূরা ইয়াসিন', 'সূরা ফাতিহা', 'সূরা ইখলাস'], correctAnswer: 2 },
      { id: 13, question: 'কুরআনের কোন সূরাকে কুরআনের হৃদয় বলা হয়?', options: ['সূরা ইয়াসিন', 'সূরা আর-রাহমান', 'সূরা ইখলাস', 'সূরা মুলক'], correctAnswer: 0 },
      { id: 14, question: 'কুরআনের কোন সূরাকে কুরআনের অলংকার বলা হয়?', options: ['সূরা আর-রাহমান', 'সূরা ইয়াসিন', 'সূরা ওয়াকিআ', 'সূরা মুলক'], correctAnswer: 0 },
      { id: 15, question: 'কুরআনের কোন সূরায় সবচেয়ে বেশি হুকুম-আহকাম বর্ণিত হয়েছে?', options: ['সূরা বাকারা', 'সূরা নিসা', 'সূরা মায়েদা', 'সূরা আনআম'], correctAnswer: 0 },
      { id: 16, question: 'কুরআনের কোন সূরায় মীরাস বা উত্তরাধিকার আইন বর্ণিত হয়েছে?', options: ['সূরা বাকারা', 'সূরা নিসা', 'সূরা ইমরান', 'সূরা নূর'], correctAnswer: 1 },
      { id: 17, question: 'কুরআনের কোন সূরায় পর্দার বিধান বর্ণিত হয়েছে?', options: ['সূরা নূর ও আহযাব', 'সূরা নিসা', 'সূরা বাকারা', 'সূরা মায়েদা'], correctAnswer: 0 },
      { id: 18, question: 'কুরআনের কোন সূরায় ওযুর বিধান বর্ণিত হয়েছে?', options: ['সূরা মায়েদা', 'সূরা বাকারা', 'সূরা নিসা', 'সূরা ইমরান'], correctAnswer: 0 },
      { id: 19, question: 'কুরআনের কোন সূরায় রোজার বিধান বর্ণিত হয়েছে?', options: ['সূরা বাকারা', 'সূরা ইমরান', 'সূরা নিসা', 'সূরা মায়েদা'], correctAnswer: 0 },
      { id: 20, question: 'কুরআনের কোন সূরায় হজ্জের বিধান বর্ণিত হয়েছে?', options: ['সূরা হাজ্জ ও বাকারা', 'সূরা ইমরান', 'সূরা নিসা', 'সূরা মায়েদা'], correctAnswer: 0 },
    ]
  },
  {
    id: 'seerah',
    title: 'সীরাতুন্নবী (সা.)',
    icon: Heart,
    color: 'text-rose-600',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    questions: [
      { id: 1, question: 'রাসূলুল্লাহ (সা.) কত সালে জন্মগ্রহণ করেন?', options: ['৫৭০ খ্রিস্টাব্দে', '৫৭১ খ্রিস্টাব্দে', '৫৭২ খ্রিস্টাব্দে', '৫৭৫ খ্রিস্টাব্দে'], correctAnswer: 1 },
      { id: 2, question: 'রাসূলুল্লাহ (সা.)-এর পিতার নাম কী?', options: ['আবদুল মুত্তালিব', 'আবদুল্লাহ', 'আবু তালিব', 'হামজা'], correctAnswer: 1 },
      { id: 3, question: 'রাসূলুল্লাহ (সা.)-এর মাতার নাম কী?', options: ['হালিমা', 'আমিনা', 'খাদিজা', 'ফাতিমা'], correctAnswer: 1 },
      { id: 4, question: 'রাসূলুল্লাহ (সা.)-এর দুধমাতার নাম কী?', options: ['আমিনা', 'হালিমা', 'সাফিয়া', 'ফাতিমা'], correctAnswer: 1 },
      { id: 5, question: 'রাসূলুল্লাহ (সা.) কত বছর বয়সে নবুওয়াত লাভ করেন?', options: ['২৫ বছর', '৩০ বছর', '৩৫ বছর', '৪০ বছর'], correctAnswer: 3 },
      { id: 6, question: 'রাসূলুল্লাহ (সা.)-এর প্রথম স্ত্রীর নাম কী?', options: ['আয়েশা (রা.)', 'খাদিজা (রা.)', 'সাউদা (রা.)', 'হাফসা (রা.)'], correctAnswer: 1 },
      { id: 7, question: 'রাসূলুল্লাহ (সা.) কত বছর বয়সে ইন্তেকাল করেন?', options: ['৬০ বছর', '৬২ বছর', '৬৩ বছর', '৬৫ বছর'], correctAnswer: 2 },
      { id: 8, question: 'রাসূলুল্লাহ (সা.) কোন গুহায় ধ্যানমগ্ন থাকতেন?', options: ['হেরা গুহা', 'সওর গুহা', 'উহুদ গুহা', 'বদর গুহা'], correctAnswer: 0 },
      { id: 9, question: 'রাসূলুল্লাহ (সা.)-এর প্রিয় সাহাবী ও প্রথম খলিফা কে ছিলেন?', options: ['উমর (রা.)', 'উসমান (রা.)', 'আবু বকর (রা.)', 'আলী (রা.)'], correctAnswer: 2 },
      { id: 10, question: 'রাসূলুল্লাহ (সা.)-এর হিজরতের সাথী কে ছিলেন?', options: ['আলী (রা.)', 'আবু বকর (রা.)', 'উমর (রা.)', 'উসমান (রা.)'], correctAnswer: 1 },
      { id: 11, question: 'রাসূলুল্লাহ (সা.)-এর কনিষ্ঠ কন্যার নাম কী?', options: ['যয়নব', 'রুকাইয়া', 'উম্মে কুলসুম', 'ফাতিমা'], correctAnswer: 3 },
      { id: 12, question: 'রাসূলুল্লাহ (সা.)-এর কতজন পুত্র সন্তান ছিল?', options: ['১ জন', '২ জন', '৩ জন', '৪ জন'], correctAnswer: 2 },
      { id: 13, question: 'রাসূলুল্লাহ (সা.)-এর কতজন কন্যা সন্তান ছিল?', options: ['২ জন', '৩ জন', '৪ জন', '৫ জন'], correctAnswer: 2 },
      { id: 14, question: 'রাসূলুল্লাহ (সা.) মক্কা থেকে কোথায় হিজরত করেছিলেন?', options: ['মদীনা', 'হাবশা', 'তায়েফ', 'সিরিয়া'], correctAnswer: 0 }
    ]
  },
  {
    id: 'history',
    title: 'ইসলামের ইতিহাস',
    icon: History,
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    questions: [
      { id: 1, question: 'ইসলামের প্রথম যুদ্ধের নাম কী?', options: ['বদর যুদ্ধ', 'উহুদ যুদ্ধ', 'খন্দক যুদ্ধ', 'খায়বার যুদ্ধ'], correctAnswer: 0 },
      { id: 2, question: 'বদর যুদ্ধ কত হিজরীতে সংঘটিত হয়?', options: ['১ হিজরী', '২ হিজরী', '৩ হিজরী', '৪ হিজরী'], correctAnswer: 1 },
      { id: 3, question: 'উহুদ যুদ্ধ কত হিজরীতে সংঘটিত হয়?', options: ['২ হিজরী', '৩ হিজরী', '৪ হিজরী', '৫ হিজরী'], correctAnswer: 1 },
      { id: 4, question: 'খন্দক যুদ্ধের অপর নাম কী?', options: ['আহযাব যুদ্ধ', 'বদর যুদ্ধ', 'উহুদ যুদ্ধ', 'তাবুক যুদ্ধ'], correctAnswer: 0 },
      { id: 5, question: 'মক্কা বিজয় কত হিজরীতে হয়?', options: ['৬ হিজরী', '৭ হিজরী', '৮ হিজরী', '৯ হিজরী'], correctAnswer: 2 }
    ]
  },
  {
    id: 'general',
    title: 'ইসলামি সাধারণ জ্ঞান',
    icon: HelpCircle,
    color: 'text-sky-600',
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    questions: [
      { id: 1, question: "বদর যুদ্ধ কত হিজরিতে সংঘটিত হয়?", options: ["২ হিজরি", "১ হিজরি", "৩ হিজরি", "৫ হিজরি"], correctAnswer: 0 },
      { id: 2, question: "উহুদ যুদ্ধের সময় মুসলিমদের কতজন শহীদ হন?", options: ["৭০ জন", "৫০ জন", "৩০ জন", "১০০ জন"], correctAnswer: 0 },
      { id: 3, question: "হুদাইবিয়ার সন্ধি কত হিজরিতে হয়?", options: ["৬ হিজরি", "৫ হিজরি", "৭ হিজরি", "৮ হিজরি"], correctAnswer: 0 },
      { id: 4, question: "মক্কা বিজয় কত হিজরিতে হয়?", options: ["৮ হিজরি", "৭ হিজরি", "৬ হিজরি", "৯ হিজরি"], correctAnswer: 0 },
      { id: 5, question: "ইসলামের প্রথম যুদ্ধ কোনটি?", options: ["বদর যুদ্ধ", "উহুদ যুদ্ধ", "খন্দক যুদ্ধ", "হুনাইন যুদ্ধ"], correctAnswer: 0 },

      { id: 6, question: "কোন সাহাবীকে 'আসাদুল্লাহ' বলা হয়?", options: ["হযরত হামজা (রা.)", "হযরত আলী (রা.)", "হযরত উমর (রা.)", "হযরত খালিদ (রা.)"], correctAnswer: 0 },
      { id: 7, question: "কোন সাহাবীকে 'সাইফুল্লাহ' বলা হয়?", options: ["হযরত খালিদ ইবনে ওয়ালিদ (রা.)", "হযরত হামজা (রা.)", "হযরত আলী (রা.)", "হযরত উসমান (রা.)"], correctAnswer: 0 },
      { id: 8, question: "কোন সাহাবী সবচেয়ে বেশি হাদিস বর্ণনা করেছেন?", options: ["হযরত আবু হুরায়রা (রা.)", "হযরত উমর (রা.)", "হযরত আলী (রা.)", "হযরত আবু বকর (রা.)"], correctAnswer: 0 },
      { id: 9, question: "কোন সাহাবীকে ‘যুন নূরাইন’ বলা হয়?", options: ["হযরত উসমান (রা.)", "হযরত আলী (রা.)", "হযরত উমর (রা.)", "হযরত আবু বকর (রা.)"], correctAnswer: 0 },
      { id: 10, question: "কোন সাহাবী ইসলাম গ্রহণের আগে ‘ফারুক’ উপাধি পান?", options: ["হযরত উমর (রা.)", "হযরত আলী (রা.)", "হযরত হামজা (রা.)", "হযরত বিলাল (রা.)"], correctAnswer: 0 },

      { id: 11, question: "হাদিসের সবচেয়ে সহিহ গ্রন্থ কোনটি?", options: ["সহিহ বুখারি", "সহিহ মুসলিম", "তিরমিজি", "আবু দাউদ"], correctAnswer: 0 },
      { id: 12, question: "সহিহ মুসলিম কার সংকলন?", options: ["ইমাম মুসলিম (রহ.)", "ইমাম বুখারি (রহ.)", "ইমাম তিরমিজি (রহ.)", "ইমাম আবু দাউদ (রহ.)"], correctAnswer: 0 },
      { id: 13, question: "ইমাম বুখারি (রহ.) কোথায় জন্মগ্রহণ করেন?", options: ["বুখারা", "মক্কা", "মদিনা", "কুফা"], correctAnswer: 0 },
      { id: 14, question: "হাদিসের ছয়টি প্রধান গ্রন্থকে কি বলা হয়?", options: ["সিহাহ সিত্তাহ", "কুতুবুস সিত্তাহ", "আহাদিস", "ফিকহ"], correctAnswer: 1 },
      { id: 15, question: "ইসলামের প্রথম মসজিদ কোথায় নির্মিত হয়?", options: ["মদিনা", "মক্কা", "তায়েফ", "জেরুজালেম"], correctAnswer: 0 },

      { id: 16, question: "কোন নবী মাছের পেটে ছিলেন?", options: ["হযরত ইউনুস (আ.)", "হযরত নূহ (আ.)", "হযরত মুসা (আ.)", "হযরত ঈসা (আ.)"], correctAnswer: 0 },
      { id: 17, question: "কোন নবী লাঠি দিয়ে সাগর ভাগ করেন?", options: ["হযরত মুসা (আ.)", "হযরত ইবরাহিম (আ.)", "হযরত নূহ (আ.)", "হযরত ইউনুস (আ.)"], correctAnswer: 0 },
      { id: 18, question: "কোন নবীকে আগুনে নিক্ষেপ করা হয়েছিল?", options: ["হযরত ইবরাহিম (আ.)", "হযরত মুসা (আ.)", "হযরত নূহ (আ.)", "হযরত ঈসা (আ.)"], correctAnswer: 0 },
      { id: 19, question: "কোন নবী নৌকা তৈরি করেন?", options: ["হযরত নূহ (আ.)", "হযরত মুসা (আ.)", "হযরত ইউনুস (আ.)", "হযরত ইবরাহিম (আ.)"], correctAnswer: 0 },
      { id: 20, question: "কোন নবীকে আসমানে উঠানো হয়েছে?", options: ["হযরত ঈসা (আ.)", "হযরত মুসা (আ.)", "হযরত ইবরাহিম (আ.)", "হযরত নূহ (আ.)"], correctAnswer: 0 },
      { id: 21, question: "কিবলা পরিবর্তন কখন হয়?", options: ["২ হিজরি", "১ হিজরি", "৩ হিজরি", "৫ হিজরি"], correctAnswer: 0 },
      { id: 22, question: "প্রথমে মুসলমানরা কোন দিকে মুখ করে নামাজ পড়তেন?", options: ["বায়তুল মুকাদ্দাস", "কাবা", "মদিনা", "তায়েফ"], correctAnswer: 0 },
      { id: 23, question: "জুমার নামাজ সপ্তাহে কতবার পড়া হয়?", options: ["১ বার", "২ বার", "৫ বার", "৭ বার"], correctAnswer: 0 },
      { id: 24, question: "আজান শব্দের অর্থ কি?", options: ["ঘোষণা", "নামাজ", "ডাক", "ইবাদত"], correctAnswer: 0 },
      { id: 25, question: "ইকামত কিসের আগে দেওয়া হয়?", options: ["নামাজ", "রোজা", "হজ", "যাকাত"], correctAnswer: 0 },

      { id: 26, question: "সালাত শব্দের অর্থ কি?", options: ["দোয়া", "নামাজ", "রোজা", "যিকির"], correctAnswer: 1 },
      { id: 27, question: "যে ব্যক্তি নামাজ পড়ায় তাকে কি বলা হয়?", options: ["ইমাম", "মুয়াজ্জিন", "খতিব", "মুসল্লি"], correctAnswer: 0 },
      { id: 28, question: "যে ব্যক্তি আজান দেয় তাকে কি বলা হয়?", options: ["মুয়াজ্জিন", "ইমাম", "খতিব", "হাফেজ"], correctAnswer: 0 },
      { id: 29, question: "ওজুতে কয়টি অঙ্গ ধোয়া ফরজ?", options: ["৪টি", "৩টি", "৫টি", "৬টি"], correctAnswer: 0 },
      { id: 30, question: "তায়াম্মুম কিসের পরিবর্তে করা হয়?", options: ["ওজু", "রোজা", "হজ", "যাকাত"], correctAnswer: 0 },

      { id: 31, question: "রমজানের পর কোন ঈদ আসে?", options: ["ঈদুল ফিতর", "ঈদুল আজহা", "শবে বরাত", "মিলাদ"], correctAnswer: 0 },
      { id: 32, question: "কুরবানি কোন মাসে করা হয়?", options: ["জিলহজ্জ", "রমজান", "মুহাররম", "শাবান"], correctAnswer: 0 },
      { id: 33, question: "হজের সময় আরাফাতে অবস্থানকে কি বলা হয়?", options: ["ওকুফ", "তাওয়াফ", "সাঈ", "রমি"], correctAnswer: 0 },
      { id: 34, question: "সাফা-মারওয়া পাহাড়ের মধ্যে চলাচলকে কি বলা হয়?", options: ["সাঈ", "তাওয়াফ", "ওকুফ", "ইহরাম"], correctAnswer: 0 },
      { id: 35, question: "কাবা ঘর প্রদক্ষিণকে কি বলা হয়?", options: ["তাওয়াফ", "সাঈ", "রমি", "ওকুফ"], correctAnswer: 0 },

      { id: 36, question: "রমি কিসের সাথে সম্পর্কিত?", options: ["শয়তানকে পাথর নিক্ষেপ", "তাওয়াফ", "সাঈ", "নামাজ"], correctAnswer: 0 },
      { id: 37, question: "ইহরাম কি?", options: ["হজের পোশাক", "নামাজ", "রোজা", "যাকাত"], correctAnswer: 0 },
      { id: 38, question: "যাকাতের নির্দিষ্ট হার কত?", options: ["২.৫%", "৫%", "১০%", "১%"], correctAnswer: 0 },
      { id: 39, question: "ফিতরা কখন আদায় করতে হয়?", options: ["ঈদের আগে", "ঈদের পরে", "রমজানের শুরুতে", "হজের সময়"], correctAnswer: 0 },
      { id: 40, question: "কুরআনে মোট কতটি পারা আছে?", options: ["৩০টি", "২০টি", "৪০টি", "৫০টি"], correctAnswer: 0 },
      { id: 41, question: "কোন সাহাবী কুরআন একত্রিত করার কাজে নেতৃত্ব দেন?", options: ["হযরত আবু বকর (রা.)", "হযরত উমর (রা.)", "হযরত উসমান (রা.)", "হযরত আলী (রা.)"], correctAnswer: 0 },
      { id: 42, question: "কুরআন মানক কপি আকারে সংকলন করেন কোন খলিফা?", options: ["হযরত উসমান (রা.)", "হযরত আবু বকর (রা.)", "হযরত উমর (রা.)", "হযরত আলী (রা.)"], correctAnswer: 0 },
      { id: 43, question: "হিজরত শব্দের অর্থ কি?", options: ["স্থান ত্যাগ করা", "নামাজ পড়া", "যুদ্ধ করা", "দান করা"], correctAnswer: 0 },
      { id: 44, question: "মদিনার পুরাতন নাম কি ছিল?", options: ["ইয়াসরিব", "তায়েফ", "জেদ্দা", "কুফা"], correctAnswer: 0 },
      { id: 45, question: "মক্কা থেকে মদিনায় হিজরত করতে কত দিন লেগেছিল?", options: ["৮ দিন", "৫ দিন", "১০ দিন", "১২ দিন"], correctAnswer: 0 },

      { id: 46, question: "কোন নবীকে 'সবরের প্রতীক' বলা হয়?", options: ["হযরত আইয়ুব (আ.)", "হযরত ইউনুস (আ.)", "হযরত নূহ (আ.)", "হযরত মুসা (আ.)"], correctAnswer: 0 },
      { id: 47, question: "কোন নবীকে 'সুন্দর্যের প্রতীক' বলা হয়?", options: ["হযরত ইউসুফ (আ.)", "হযরত দাউদ (আ.)", "হযরত সুলাইমান (আ.)", "হযরত ইবরাহিম (আ.)"], correctAnswer: 0 },
      { id: 48, question: "কোন নবী পাখির ভাষা বুঝতেন?", options: ["হযরত সুলাইমান (আ.)", "হযরত দাউদ (আ.)", "হযরত মুসা (আ.)", "হযরত নূহ (আ.)"], correctAnswer: 0 },
      { id: 49, question: "কোন নবীকে লোহার কাজ শেখানো হয়েছিল?", options: ["হযরত দাউদ (আ.)", "হযরত সুলাইমান (আ.)", "হযরত মুসা (আ.)", "হযরত ইবরাহিম (আ.)"], correctAnswer: 0 },
      { id: 50, question: "কোন নবী জিনদের উপর শাসন করতেন?", options: ["হযরত সুলাইমান (আ.)", "হযরত দাউদ (আ.)", "হযরত মুসা (আ.)", "হযরত নূহ (আ.)"], correctAnswer: 0 },

      { id: 51, question: "কোন সূরাকে 'কুরআনের হৃদয়' বলা হয়?", options: ["সূরা ইয়াসিন", "সূরা ফাতিহা", "সূরা বাকারা", "সূরা ইখলাস"], correctAnswer: 0 },
      { id: 52, question: "কোন সূরায় বিসমিল্লাহ দুইবার এসেছে?", options: ["সূরা নামল", "সূরা ফাতিহা", "সূরা ইখলাস", "সূরা নাস"], correctAnswer: 0 },
      { id: 53, question: "কোন সূরায় সিজদার আয়াত আছে?", options: ["সূরা আলাক", "সূরা ইখলাস", "সূরা কাওসার", "সূরা নাস"], correctAnswer: 0 },
      { id: 54, question: "কুরআনের প্রথম নাযিলকৃত শব্দ কি?", options: ["ইকরা", "আল্লাহ", "রহমান", "বিসমিল্লাহ"], correctAnswer: 0 },
      { id: 55, question: "কোন সূরা পড়লে কবরের আজাব কমে বলে হাদিসে আছে?", options: ["সূরা মুলক", "সূরা ইয়াসিন", "সূরা ইখলাস", "সূরা নাস"], correctAnswer: 0 },

      { id: 56, question: "ইসলামে সুদকে কি বলা হয়?", options: ["রিবা", "যাকাত", "সদকা", "ফিতরা"], correctAnswer: 0 },
      { id: 57, question: "হালাল শব্দের অর্থ কি?", options: ["বৈধ", "অবৈধ", "নিষিদ্ধ", "অপছন্দনীয়"], correctAnswer: 0 },
      { id: 58, question: "হারাম শব্দের অর্থ কি?", options: ["নিষিদ্ধ", "বৈধ", "পছন্দনীয়", "সুন্নত"], correctAnswer: 0 },
      { id: 59, question: "সুন্নত বলতে কি বোঝায়?", options: ["নবীর অনুসরণ", "ফরজ কাজ", "নিষিদ্ধ কাজ", "শুধু দোয়া"], correctAnswer: 0 },
      { id: 60, question: "ফরজ কাজ না করলে কি হয়?", options: ["গুনাহ হয়", "কোন সমস্যা নেই", "সওয়াব হয়", "মাকরুহ হয়"], correctAnswer: 0 }
    ]
  }
];

export interface UnifiedQuiz {
  id: string;
  categoryId: string;
  categoryTitle: string;
  icon: any;
  color: string;
  bg: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const ALL_QUIZZES: UnifiedQuiz[] = QUIZ_DATA.flatMap(category => 
  category.questions.map(q => ({
    id: `${category.id}-${q.id}`,
    categoryId: category.id,
    categoryTitle: category.title,
    icon: category.icon,
    color: category.color,
    bg: category.bg,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer
  }))
);

type QuizState = 'selection' | 'playing' | 'results';

// Helper to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function useQuizProgress() {
  const [progress, setProgress] = useState<{ playedQuizzes: Record<string, number>, sessionPlayedCount: number, breakUntil: number | null }>({ playedQuizzes: {}, sessionPlayedCount: 0, breakUntil: null });

  useEffect(() => {
    const saved = localStorage.getItem('quiz_progress');
    const now = Date.now();
    if (saved) {
      const parsed = JSON.parse(saved);
      const newPlayedQuizzes: Record<string, number> = {};
      Object.keys(parsed.playedQuizzes || {}).forEach(k => {
        if (now - parsed.playedQuizzes[k] < 24 * 60 * 60 * 1000) {
          newPlayedQuizzes[k] = parsed.playedQuizzes[k];
        }
      });
      
      let breakUntil = parsed.breakUntil;
      let sessionCount = parsed.sessionPlayedCount || 0;
      if (breakUntil && now > breakUntil) {
        breakUntil = null;
        sessionCount = 0;
      }

      setProgress({
        playedQuizzes: newPlayedQuizzes,
        sessionPlayedCount: sessionCount,
        breakUntil: breakUntil
      });
    }
  }, []);

  const markQuizPlayed = (quizId: string) => {
    setProgress(prev => {
      const now = Date.now();
      const newPlayed = { ...prev.playedQuizzes, [quizId]: now };
      let newSessionCount = prev.sessionPlayedCount + 1;
      let newBreakUntil = prev.breakUntil;

      if (newSessionCount >= 10) {
        newBreakUntil = now + 10 * 60 * 1000;
      }

      const newState = {
        playedQuizzes: newPlayed,
        sessionPlayedCount: newSessionCount,
        breakUntil: newBreakUntil
      };
      localStorage.setItem('quiz_progress', JSON.stringify(newState));
      return newState;
    });
  };

  return { progress, markQuizPlayed };
}

export function QuizView({ onBack }: { onBack: () => void }) {
  const { language, t } = useLanguage();
  const { progress, markQuizPlayed } = useQuizProgress();
  const [selectedPlayQuiz, setSelectedPlayQuiz] = useState<UnifiedQuiz | null>(null);
  
  // Update current time continuously for break timer
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [isAdLoading, setIsAdLoading] = useState(false);

  useEffect(() => {
    initializeAdMob();
  }, []);

  // Available quizzes filter based on progress (exclude the first 10 shown in Earning tab)
  const availableQuizzes = useMemo(() => {
    return ALL_QUIZZES.filter(q => !progress.playedQuizzes[q.id]).slice(10);
  }, [progress.playedQuizzes]);

  const handlePlayClick = async (quiz: UnifiedQuiz) => {
    if (progress.breakUntil && progress.breakUntil > now) return;
    
    // Ad Rotation Logic
    const mainQuizPlayCount = parseInt(localStorage.getItem('main_quiz_play_count') || '0');
    const adType = mainQuizPlayCount % 3; // 0, 1, 2 loop

    setIsAdLoading(true);

    const startQuiz = () => {
      setIsAdLoading(false);
      localStorage.setItem('main_quiz_play_count', (mainQuizPlayCount + 1).toString());
      setSelectedPlayQuiz(quiz);
    };

    if (Capacitor.getPlatform() === 'web') {
      setTimeout(startQuiz, 1000);
      return;
    }

    try {
      if (adType === 0) {
        await showRewardedAd(
          () => {}, 
          (err) => console.error('Rewarded ad error', err),
          () => startQuiz()
        );
      } else if (adType === 1) {
        await showInterstitialAd(
          () => startQuiz(),
          (err) => {
            console.error('Interstitial ad error', err);
            startQuiz();
          }
        );
      } else {
        await showRewardedInterstitialAd(
          () => {},
          () => startQuiz(),
          (err) => {
            console.error('Rewarded Interstitial ad error', err);
            startQuiz();
          }
        );
      }
    } catch (error) {
      console.error('Ad rotation failed', error);
      startQuiz();
    }
  };

  // Handle answering
  const handleAnswer = (idx: number) => {
    if (isAnswered || !selectedPlayQuiz) return;
    setIsAnswered(true);
    setSelectedOption(idx);
    
    // Auto close and mark after a short delay
    setTimeout(async () => {
      markQuizPlayed(selectedPlayQuiz.id);

      // Add rewards to user_balances
      if (currentUser) {
        try {
          const rewardAmount = quizConfig ? (10 * quizConfig.amount) / quizConfig.points : 0.05; 
          
          const userRef = doc(db, 'user_balances', currentUser.uid);
          const balanceSnap = await getDoc(userRef);
          
          if (balanceSnap.exists()) {
            await updateDoc(userRef, { 
              currentBalance: increment(rewardAmount),
              totalEarned: increment(rewardAmount),
              updatedAt: serverTimestamp()
            });
          } else {
            await setDoc(userRef, {
              userId: currentUser.uid,
              currentBalance: rewardAmount,
              totalEarned: rewardAmount,
              updatedAt: serverTimestamp()
            });
          }

          // Add to history
          const historyRef = doc(collection(db, 'earning_history'));
          await setDoc(historyRef, {
            userId: currentUser.uid,
            type: 'quiz',
            amount: rewardAmount,
            status: 'approved',
            description: language === 'bn' ? 'কুইজ পুরস্কার' : 'Quiz Reward',
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error("Failed to add reward", e);
        }
      }

      setSelectedPlayQuiz(null);
      setIsAnswered(false);
      setSelectedOption(null);
    }, 1500);
  };


  // User Data state
  const [currentUser] = useState(auth.currentUser);
  const [balance, setBalance] = useState<any>(null);
  const [quizConfig, setQuizConfig] = useState<{ points: number, amount: number } | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch Quiz Config (Conversion Rate)
    const fetchConfig = async () => {
      try {
        const configRef = doc(db, 'global_settings', 'quiz_config');
        const snap = await getDoc(configRef);
        if (snap.exists()) {
          setQuizConfig(snap.data() as { points: number, amount: number });
        } else {
          // Fallback if not set by admin
          setQuizConfig({ points: 100, amount: 0.5 });
        }
      } catch (err) {
        console.error("Failed to fetch quiz config:", err);
        setQuizConfig({ points: 100, amount: 0.5 });
      }
    };
    fetchConfig();

    const unsubBalance = onSnapshot(doc(db, 'user_balances', currentUser.uid), (snap) => {
      if (snap.exists()) setBalance(snap.data());
    });
    const unsubVerification = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) setIsVerified(snap.data().isVerified);
    });
    return () => {
      unsubBalance();
      unsubVerification();
    };
  }, [currentUser]);

  // End of cleanup

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Hero Section (Redesigned White / Minimal) */}
      <div className="relative bg-white dark:bg-slate-900 px-6 pt-safe pb-8 overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full w-fit">
              <Trophy className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-[11px] font-black text-primary uppercase tracking-wider">
                {language === 'bn' ? 'শিক্ষুন এবং উপার্জন করুন' : 'Learn & Earn'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {language === 'bn' ? 'ইসলামিক কুইজ খেলুন' : 'Play Islamic Quiz'}
              <br />
              <span className="text-primary">{language === 'bn' ? 'প্রতিদিন পুরস্কার জিতুন' : 'Win Rewards Daily'}</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-t-2xl relative z-20 overflow-y-auto custom-scrollbar pb-24 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
        <AnimatePresence mode="wait">
            <motion.div 
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col pt-4"
            >
              <div className="px-5 space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 px-5 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 rounded-[10px] shrink-0 text-emerald-600">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">আপনার জ্ঞান যাচাই করুন</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold">প্রতিদিন কুইজ খেলুন এবং রিওয়ার্ড জিতুন</p>
                    </div>
                  </div>
                  
                  {progress.breakUntil && progress.breakUntil > now && (
                    <div className="mt-4 mb-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl px-4 py-3 border border-pink-200 dark:border-pink-800/50 flex flex-row items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <Timer className="w-6 h-6 text-pink-500 animate-pulse" />
                        <div>
                          <h3 className="text-xs font-black text-pink-700 dark:text-pink-400 leading-tight">
                            {language === 'bn' ? 'ব্রেক টাইম চলছে!' : 'Break Time!'}
                          </h3>
                          <p className="text-[10px] font-bold text-pink-600/70 dark:text-pink-500/70">
                            {language === 'bn' ? 'নতুন কুইজ পেতে অপেক্ষা করুন' : 'Wait for new quizzes'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 font-mono text-base font-black px-3 py-1 rounded-lg">
                        {Math.floor((progress.breakUntil - now) / 60000)}:
                        {String(Math.floor(((progress.breakUntil - now) % 60000) / 1000)).padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pb-6">
                  {availableQuizzes.map((quiz, idx) => {
                    const isLocked = !!(progress.breakUntil && progress.breakUntil > now);
                    // Distinct pastel backgrounds
                    const CARD_COLORS = [
                      'bg-blue-50/80 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30',
                      'bg-rose-50/80 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/30',
                      'bg-amber-50/80 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30',
                      'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30',
                      'bg-purple-50/80 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30',
                      'bg-cyan-50/80 dark:bg-cyan-900/20 border-cyan-100 dark:border-cyan-800/30',
                      'bg-orange-50/80 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30'
                    ];
                    const cardColor = CARD_COLORS[idx % CARD_COLORS.length];

                    return (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (idx % 10) * 0.05 }}
                      className={cn(
                        "rounded-xl p-4 min-h-[120px] border flex flex-col hover:opacity-90 transition-opacity",
                        cardColor
                      )}
                    >
                      <div className="mb-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={cn("w-5 h-5 rounded flex items-center justify-center bg-white/60 dark:bg-black/20", quiz.color)}>
                            <quiz.icon className="w-3 h-3" />
                          </div>
                          <span className={cn("text-[9px] font-black uppercase tracking-wider truncate", quiz.color)}>
                            {quiz.categoryTitle}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                          {quiz.question}
                        </h3>
                      </div>
                      <div className="mt-auto pt-2">
                        <button
                          onClick={() => handlePlayClick(quiz)}
                          disabled={isLocked}
                          className={cn(
                            "w-full px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1",
                            isLocked
                              ? "bg-white/40 dark:bg-slate-900/40 text-slate-500 border border-transparent cursor-not-allowed"
                              : "bg-white dark:bg-slate-900 border border-white/50 dark:border-slate-700 hover:border-primary/50 text-slate-700 dark:text-slate-300 active:scale-95 shadow-sm"
                          )}
                        >
                          {isLocked ? (language === 'bn' ? 'লকড' : 'Locked') : (language === 'bn' ? 'খেলুন' : 'Play')}
                          {isLocked ? <Lock className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </div>
                    </motion.div>
                  )})}
                  {availableQuizzes.length === 0 && (
                     <div className="col-span-2 text-center py-10 opacity-60">
                       <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                       <p className="text-xs font-bold text-slate-500">{language === 'bn' ? 'আজকের সব কুইজ সম্পন্ন হয়েছে!' : 'All quizzes completed for today!'}</p>
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Quiz Bottom Sheet Popup */}
      <AnimatePresence>
        {selectedPlayQuiz && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlayQuiz(null)}
              className="fixed inset-0 bg-slate-950/60 z-[9998] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 rounded-t-2xl z-[9999] overflow-hidden shadow-2xl"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="px-6 pb-safe pt-2 pb-8 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", selectedPlayQuiz.bg, selectedPlayQuiz.color)}>
                      <selectedPlayQuiz.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{selectedPlayQuiz.categoryTitle}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{language === 'bn' ? 'কুইজ প্রশ্ন' : 'Quiz Question'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPlayQuiz(null)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-4 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-black text-slate-800 dark:text-white leading-snug">
                      {selectedPlayQuiz.question}
                    </h2>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {selectedPlayQuiz.options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === selectedPlayQuiz.correctAnswer;
                    
                    return (
                      <button
                        key={i}
                        disabled={isAnswered}
                        onClick={() => handleAnswer(i)}
                        className={cn(
                          "w-full text-left px-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-between relative overflow-hidden",
                          !isAnswered && "hover:border-primary/50 hover:bg-slate-50 text-slate-700 dark:text-slate-300 active:scale-[0.98]",
                          isAnswered && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black",
                          isAnswered && isSelected && !isCorrect && "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400",
                          isAnswered && !isSelected && !isCorrect && "opacity-50 border-slate-100 bg-white"
                        )}
                      >
                        {isAnswered && isCorrect && (
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '100%' }} 
                            className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 opacity-50 z-0" 
                          />
                        )}
                        <span className="relative z-10">{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 relative z-10" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 relative z-10" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Ad Loading Overlay */}
      <AnimatePresence>
        {isAdLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800">
              <div className="animate-spin text-primary">
                <RotateCcw className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-1">
              {language === 'bn' ? 'অ্যাড লোড হচ্ছে...' : 'Loading Ad...'}
            </h3>
            <p className="text-sm font-bold text-slate-500">
              {language === 'bn' ? 'দয়া করে অপেক্ষা করুন' : 'Please wait'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
