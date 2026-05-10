import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { Percent, ArrowLeft, Calculator, ArrowDownRight } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export const DiscountCalcTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [price, setPrice] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [isFixed, setIsFixed] = useState(false);

  const priceNum = parseFloat(price) || 0;
  const discountNum = parseFloat(discount) || 0;

  let finalPrice = 0;
  let savedAmount = 0;

  if (isFixed) {
    savedAmount = Math.min(discountNum, priceNum);
    finalPrice = priceNum - savedAmount;
  } else {
    savedAmount = priceNum * (Math.min(discountNum, 100) / 100);
    finalPrice = priceNum - savedAmount;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'ডিসকাউন্ট ক্যালকুলেটর', en: 'Discount Calc' }} description={{ bn: 'ছাড় ও শেষ দাম হিসাব করুন', en: 'Calculate savings & final price' }} Icon={Percent} bgGradient="bg-gradient-to-br from-red-500 to-orange-500" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 flex flex-col md:flex-row gap-6 max-w-5xl mx-auto w-full items-start">
        
        {/* Input Card */}
        <div className="w-full md:w-1/2 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                    {language === 'bn' ? 'মূল দাম (Original Price)' : 'Original Price'}
                 </label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-4 py-3 text-lg font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                    />
                 </div>
              </div>

              <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                       <Percent className="w-4 h-4 text-orange-500" />
                       {language === 'bn' ? 'ডিসকাউন্ট / ছাড়' : 'Discount'}
                    </label>
                 </div>
                 <div className="relative flex items-center">
                    <input 
                      type="number" 
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-800 border fill-border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-lg px-4 py-3 text-lg font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                    />
                    <button 
                      onClick={() => setIsFixed(!isFixed)}
                      className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-r-lg px-4 py-3 text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors h-[52px] min-w-[60px]"
                    >
                      {isFixed ? '$' : '%'}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Output Card */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
           {/* Final Price Block */}
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-8 shadow-lg relative overflow-hidden flex flex-col items-center justify-center text-center text-white min-h-[160px]">
              <Calculator className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <p className="relative z-10 text-orange-100 text-sm font-bold mb-1">
                 {language === 'bn' ? 'আপনাকে দিতে হবে' : 'Final Price to Pay'}
              </p>
              <h3 className="relative z-10 text-5xl font-black tracking-tight drop-shadow-sm">
                 ${finalPrice.toFixed(2)}
              </h3>
           </motion.div>
           
           {/* Saved Block */}
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                    {language === 'bn' ? 'আপনার সঞ্চয় হলো' : 'You Saved'}
                 </p>
                 <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    ${savedAmount.toFixed(2)}
                 </span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                 <span className="text-xl font-black text-emerald-500">-</span>
              </div>
           </motion.div>
        </div>

      </div>
    </div>
  );
};
