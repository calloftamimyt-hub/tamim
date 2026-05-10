import React, { useState, useEffect } from 'react';
import { ToolHero } from './ToolHero';
import { ShieldCheck, ArrowLeft, Check, X, ShieldAlert, Key } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const PassCheckerTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [password, setPassword] = useState('');
  
  const rules = [
    { id: 'length', text: { bn: 'অন্তত ৮টি অক্ষর', en: 'At least 8 characters' }, check: (p: string) => p.length >= 8 },
    { id: 'upper', text: { bn: 'বড় হাতের অক্ষর (A-Z)', en: 'Uppercase letter (A-Z)' }, check: (p: string) => /[A-Z]/.test(p) },
    { id: 'lower', text: { bn: 'ছোট হাতের অক্ষর (a-z)', en: 'Lowercase letter (a-z)' }, check: (p: string) => /[a-z]/.test(p) },
    { id: 'number', text: { bn: 'সংখ্যা (0-9)', en: 'Number (0-9)' }, check: (p: string) => /[0-9]/.test(p) },
    { id: 'special', text: { bn: 'বিশেষ চিহ্ন (@$!%*?&)', en: 'Special character (@$!%*?&)' }, check: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const getStrength = () => {
    if (!password) return { text: '', color: 'bg-slate-200 dark:bg-slate-800', width: 'w-0', score: 0 };
    
    let score = 0;
    rules.forEach(rule => {
      if (rule.check(password)) score++;
    });

    if (password.length > 12 && score >= 4) score++; // bonus

    if (score <= 2) return { text: language === 'bn' ? 'খুব দুর্বল' : 'Very Weak', color: 'bg-rose-500', width: 'w-1/4', score };
    if (score === 3) return { text: language === 'bn' ? 'দুর্বল' : 'Weak', color: 'bg-orange-500', width: 'w-2/4', score };
    if (score === 4) return { text: language === 'bn' ? 'মাঝারি' : 'Medium', color: 'bg-yellow-500', width: 'w-3/4', score };
    return { text: language === 'bn' ? 'শক্তিশালী' : 'Strong', color: 'bg-emerald-500', width: 'w-full', score };
  };

  const strength = getStrength();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'পাসওয়ার্ড চেকার', en: 'Password Checker' }} description={{ bn: 'আপনার পাসওয়ার্ডের শক্তি পরীক্ষা করুন', en: 'Test your password security strength' }} Icon={ShieldCheck} bgGradient="bg-gradient-to-br from-emerald-500 to-green-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col max-w-2xl mx-auto w-full">
          
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
           <div>
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                 <Key className="w-4 h-4 text-emerald-500" />
                 {language === 'bn' ? 'আপনার পাসওয়ার্ড দিন' : 'Enter your password'}
              </label>
              <input 
                 type="text" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-lg font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white font-mono"
                 placeholder="••••••••"
              />
           </div>

           {password && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500">{language === 'bn' ? 'পাসওয়ার্ডের শক্তি:' : 'Password Strength:'}</span>
                    <span className={cn(
                       "px-2.5 py-0.5 rounded-md text-white font-black",
                       strength.color
                    )}>
                       {strength.text}
                    </span>
                 </div>
                 <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <motion.div 
                       layout
                       className={cn("h-full transition-all duration-500", strength.color, strength.width)} 
                    />
                 </div>
              </motion.div>
           )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              {language === 'bn' ? 'নিরাপত্তা চেকলিস্ট' : 'Security Checklist'}
           </h3>
           <div className="space-y-3">
              {rules.map(rule => {
                const passed = rule.check(password);
                const isBlank = password === '';
                return (
                  <div key={rule.id} className="flex items-center gap-3">
                     <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        isBlank ? "bg-slate-100 dark:bg-slate-800 text-slate-400" :
                        passed ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                     )}>
                        {passed && !isBlank ? <Check className="w-3 h-3" strokeWidth={3} /> : <X className="w-3 h-3" strokeWidth={3} />}
                     </div>
                     <span className={cn(
                        "text-sm font-bold transition-colors",
                        isBlank ? "text-slate-500 dark:text-slate-400" :
                        passed ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400 leading-tight"
                     )}>
                        {language === 'bn' ? rule.text.bn : rule.text.en}
                     </span>
                  </div>
                )
              })}
           </div>
        </div>

      </div>
    </div>
  );
};
