import React, { useState, useEffect } from 'react';
import { ToolHero } from './ToolHero';
import { Coins, ArrowLeft, Receipt, Users, Calculator } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const TipCalcTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [bill, setBill] = useState<string>('');
  const [tipPct, setTipPct] = useState<number>(15);
  const [split, setSplit] = useState<number>(1);

  const parsedBill = parseFloat(bill) || 0;
  const tipAmount = parsedBill * (tipPct / 100);
  const total = parsedBill + tipAmount;
  const perPerson = split > 0 ? total / split : 0;

  const tipPresets = [10, 15, 20, 25];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'টিপ ক্যালকুলেটর', en: 'Tip Calculator' }} description={{ bn: 'সহজেই টিপ ও বিল ভাগ করুন', en: 'Calculate tips & split bills easily' }} Icon={Coins} bgGradient="bg-gradient-to-br from-yellow-500 to-amber-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Results Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-yellow-500/20 relative overflow-hidden">
           <Calculator className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
           <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <span className="text-amber-100 text-sm font-bold block mb-1">
                 {language === 'bn' ? 'জনপ্রতি দিতে হবে' : 'Per Person'}
              </span>
              <span className="text-5xl font-black tracking-tight mb-6">
                 ${perPerson.toFixed(2)}
              </span>
           </div>
           
           <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-amber-400/30 pt-4 mt-2">
              <div className="text-center">
                 <span className="text-amber-100 text-xs font-bold block mb-1">{language === 'bn' ? 'টিপের পরিমাণ' : 'Tip Amount'}</span>
                 <span className="text-xl font-bold">${tipAmount.toFixed(2)}</span>
              </div>
              <div className="text-center border-l border-amber-400/30">
                 <span className="text-amber-100 text-xs font-bold block mb-1">{language === 'bn' ? 'মোট বিল' : 'Total Bill'}</span>
                 <span className="text-xl font-bold">${total.toFixed(2)}</span>
              </div>
           </div>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
           {/* Bill Input */}
           <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                 <Receipt className="w-4 h-4 text-amber-500" />
                 {language === 'bn' ? 'মূল বিল' : 'Bill Amount'}
              </label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                 <input 
                   type="number" 
                   value={bill}
                   onChange={(e) => setBill(e.target.value)}
                   placeholder="0.00"
                   className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 text-lg font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white"
                 />
              </div>
           </div>

           {/* Tip % */}
           <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    {language === 'bn' ? 'টিপ পারসেন্টেজ' : 'Tip %'}
                 </label>
                 <span className="font-bold text-amber-600 dark:text-amber-400">{tipPct}%</span>
              </div>
              <div className="flex gap-2">
                 {tipPresets.map(pct => (
                   <button
                     key={pct}
                     onClick={() => setTipPct(pct)}
                     className={cn(
                       "flex-1 py-2 rounded-xl text-sm font-bold transition-all border-2",
                       tipPct === pct 
                         ? "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" 
                         : "border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400"
                     )}
                   >
                     {pct}%
                   </button>
                 ))}
              </div>
              <input 
                 type="range" 
                 min="0" max="50" step="1"
                 value={tipPct} 
                 onChange={(e) => setTipPct(Number(e.target.value))}
                 className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer mt-4"
              />
           </div>

           {/* Split */}
           <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-500" />
                    {language === 'bn' ? 'কতজন ভাগ করবেন?' : 'Split Between'}
                 </label>
                 <span className="font-bold text-amber-600 dark:text-amber-400">{split} {language === 'bn' ? 'জন' : 'Person'}</span>
              </div>
              <input 
                 type="range" 
                 min="1" max="20" step="1"
                 value={split} 
                 onChange={(e) => setSplit(Number(e.target.value))}
                 className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
           </div>

        </div>

      </div>
    </div>
  );
};
