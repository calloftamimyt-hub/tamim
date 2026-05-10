import React, { useState, useEffect, useCallback } from 'react';
import { ToolHero } from './ToolHero';
import { Shield, ArrowLeft, Copy, Check, RefreshCcw, ShieldCheck, ShieldAlert } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const PassGenTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      setPassword('');
      return;
    }

    let result = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    setPassword(result);
    setCopied(false);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getStrength = () => {
    let score = 0;
    if (length > 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    const typesCount = Object.values(options).filter(Boolean).length;
    score += typesCount - 1;

    if (score <= 2) return { text: language === 'bn' ? 'দুর্বল' : 'Weak', color: 'text-rose-500', bar: 'bg-rose-500', width: 'w-1/3' };
    if (score <= 4) return { text: language === 'bn' ? 'মাঝারি' : 'Medium', color: 'text-amber-500', bar: 'bg-amber-500', width: 'w-2/3' };
    return { text: language === 'bn' ? 'শক্তিশালী' : 'Strong', color: 'text-emerald-500', bar: 'bg-emerald-500', width: 'w-full' };
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // Prevent unchecking the last option
      if (!Object.values(next).includes(true)) return prev;
      return next;
    });
  };

  const strength = getStrength();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'পাসওয়ার্ড জেনারেটর', en: 'Password Generator' }} description={{ bn: 'নিরাপদ পাসওয়ার্ড তৈরি করুন', en: 'Create highly secure passwords' }} Icon={Shield} bgGradient="bg-gradient-to-br from-emerald-500 to-teal-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Output Display */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
          
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-emerald-100 flex items-center gap-2 mb-4">
              {strength.text === (language === 'bn' ? 'শক্তিশালী' : 'Strong') ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
               {language === 'bn' ? 'আপনার পাসওয়ার্ড:' : 'Your Password:'}
            </h3>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/20">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-wider break-all font-mono">
                {password || '---'}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={generatePassword}
                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors active:scale-95"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleCopy}
                  className={cn(
                    "p-2.5 rounded-xl text-emerald-700 transition-all active:scale-95",
                    copied ? "bg-white" : "bg-emerald-50 hover:bg-white"
                  )}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mt-4">
               <div className="flex justify-between items-center text-xs font-bold text-emerald-100 mb-1.5">
                  <span>{language === 'bn' ? 'নিরাপত্তা' : 'Strength'}</span>
                  <span>{strength.text}</span>
               </div>
               <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                     layout
                     className={cn("h-full rounded-full bg-white", strength.width)} 
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
           <div>
              <div className="flex justify-between items-center mb-4">
                 <label className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {language === 'bn' ? 'পাসওয়ার্ডের দৈর্ঘ্য' : 'Password Length'}
                 </label>
                 <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-black rounded-lg text-sm">
                    {length}
                 </span>
              </div>
              <input 
                 type="range" 
                 min="8" max="32" 
                 value={length} 
                 onChange={(e) => setLength(Number(e.target.value))}
                 className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                 { id: 'uppercase', label: { bn: 'বড় হাতের অক্ষর (A-Z)', en: 'Uppercase (A-Z)' } },
                 { id: 'lowercase', label: { bn: 'ছোট হাতের অক্ষর (a-z)', en: 'Lowercase (a-z)' } },
                 { id: 'numbers', label: { bn: 'সংখ্যা (0-9)', en: 'Numbers (0-9)' } },
                 { id: 'symbols', label: { bn: 'চিহ্ন (!@#$)', en: 'Symbols (!@#$)' } }
              ].map((opt) => (
                 <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id as keyof typeof options)}
                    className={cn(
                       "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                       options[opt.id as keyof typeof options] 
                         ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                         : "border-slate-100 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400"
                    )}
                 >
                    <span className="text-sm font-bold">{language === 'bn' ? opt.label.bn : opt.label.en}</span>
                    <div className={cn(
                       "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                       options[opt.id as keyof typeof options]
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600"
                    )}>
                       {options[opt.id as keyof typeof options] && <Check className="w-3 h-3" />}
                    </div>
                 </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
