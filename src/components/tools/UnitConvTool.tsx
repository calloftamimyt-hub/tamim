import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { ArrowRightLeft, ArrowLeft, Ruler, Weight, Thermometer } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type CatType = 'length' | 'weight' | 'temp';

const UNITS: Record<CatType, Record<string, { name: string, factor: number }>> = {
  length: {
    m: { name: 'Meter', factor: 1 },
    km: { name: 'Kilometer', factor: 1000 },
    cm: { name: 'Centimeter', factor: 0.01 },
    mm: { name: 'Millimeter', factor: 0.001 },
    in: { name: 'Inch', factor: 0.0254 },
    ft: { name: 'Foot', factor: 0.3048 },
    yd: { name: 'Yard', factor: 0.9144 },
    mi: { name: 'Mile', factor: 1609.34 }
  },
  weight: {
    kg: { name: 'Kilogram', factor: 1 },
    g: { name: 'Gram', factor: 0.001 },
    mg: { name: 'Milligram', factor: 0.000001 },
    lb: { name: 'Pound', factor: 0.453592 },
    oz: { name: 'Ounce', factor: 0.0283495 }
  },
  temp: {
    c: { name: 'Celsius', factor: 1 },
    f: { name: 'Fahrenheit', factor: 1 },
    k: { name: 'Kelvin', factor: 1 }
  }
};

export const UnitConvTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [category, setCategory] = useState<CatType>('length');
  const [val, setVal] = useState<string>('1');
  
  // Defaults based on category
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');

  // Change category handler
  const handleCatChange = (cat: CatType) => {
    setCategory(cat);
    const keys = Object.keys(UNITS[cat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
    setVal('1');
  };

  const calculate = () => {
    const input = parseFloat(val);
    if (isNaN(input)) return '';

    if (category === 'temp') {
      let cTemp = input;
      // Convert to Celsius first
      if (fromUnit === 'f') cTemp = (input - 32) * 5/9;
      if (fromUnit === 'k') cTemp = input - 273.15;

      // Convert from Celsius to Target
      let res = cTemp;
      if (toUnit === 'f') res = (cTemp * 9/5) + 32;
      if (toUnit === 'k') res = cTemp + 273.15;
      
      return res.toFixed(4).replace(/\.?0+$/, '');
    } else {
      const catUnits = UNITS[category] as Record<string, { factor: number }>;
      const fromF = catUnits[fromUnit]?.factor || 1;
      const toF = catUnits[toUnit]?.factor || 1;
      
      // Convert to base, then to target
      const baseVal = input * fromF;
      const res = baseVal / toF;
      return parseFloat(res.toFixed(6)).toString(); // Remove trailing zeros nicely formatting
    }
  };

  const result = calculate();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'ইউনিট কনভার্টার', en: 'Unit Converter' }} description={{ bn: 'যেকোনো পরিমাপ রূপান্তর করুন', en: 'Convert any measurements easily' }} Icon={ArrowRightLeft} bgGradient="bg-gradient-to-br from-violet-500 to-purple-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Category Tabs */}
        <div className="flex gap-2 justify-center">
            {[
              { id: 'length', icon: Ruler, label: {en: 'Length', bn: 'দৈর্ঘ্য'} },
              { id: 'weight', icon: Weight, label: {en: 'Weight', bn: 'ওজন'} },
              { id: 'temp', icon: Thermometer, label: {en: 'Temp', bn: 'তাপমাত্রা'} },
            ].map(cat => {
              const active = category === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCatChange(cat.id as CatType)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all border-2",
                    active 
                      ? "bg-violet-50 dark:bg-violet-500/10 border-violet-500 text-violet-600 dark:text-violet-400"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold">{language === 'bn' ? cat.label.bn : cat.label.en}</span>
                </button>
              )
            })}
        </div>

        {/* Converter Area */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative">
           
           <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
             {/* From Group */}
             <div className="space-y-4">
                <input 
                  type="number"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-full text-3xl font-black text-center bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-violet-500 outline-none pb-2 text-slate-800 dark:text-white"
                />
                <select 
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm font-bold text-center text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {Object.entries(UNITS[category]).map(([key, u]) => (
                    <option key={key} value={key}>{(u as {name: string}).name} ({key})</option>
                  ))}
                </select>
             </div>

             <div className="flex flex-col items-center justify-center pt-2">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center shrink-0">
                   <ArrowRightLeft className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
             </div>

             {/* To Group */}
             <div className="space-y-4">
                <input 
                  type="text"
                  readOnly
                  value={result}
                  className="w-full text-3xl font-black text-center bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-violet-500 outline-none pb-2 text-violet-600 dark:text-violet-400"
                />
                <select 
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-sm font-bold text-center text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {Object.entries(UNITS[category]).map(([key, u]) => (
                    <option key={key} value={key}>{(u as {name: string}).name} ({key})</option>
                  ))}
                </select>
             </div>
           </div>

           <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800">
             <span className="text-sm font-black text-slate-700 dark:text-slate-300">
               {val || '0'} {(UNITS[category] as Record<string, {name: string, factor: number}>)[fromUnit]?.name} = <span className="text-violet-600 dark:text-violet-400">{result || '0'} {(UNITS[category] as Record<string, {name: string, factor: number}>)[toUnit]?.name}</span>
             </span>
           </div>

        </div>

      </div>
    </div>
  );
};
