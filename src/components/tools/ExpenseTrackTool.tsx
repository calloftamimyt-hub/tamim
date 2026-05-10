import React, { useState, useEffect } from 'react';
import { ToolHero } from './ToolHero';
import { Receipt, ArrowLeft, Plus, TrendingDown, TrendingUp, MinusCircle, Wallet } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type Transaction = {
  id: string;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  date: number;
};

export const ExpenseTrackTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('expenses_app_data');
    if (saved) {
      try { setTransactions(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('expenses_app_data', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) return;
    
    const newTx: Transaction = {
      id: Date.now().toString(),
      desc: desc.trim(),
      amount: parseFloat(amount),
      type,
      date: Date.now()
    };
    
    setTransactions(prev => [newTx, ...prev]);
    setDesc('');
    setAmount('');
  };

  const deleteTx = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expense;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'খরচ ট্র্যাকার', en: 'Expense Tracker' }} description={{ bn: 'আপনার আয়-ব্যয় হিসাব রাখুন', en: 'Manage your income & expenses' }} Icon={Receipt} bgGradient="bg-gradient-to-br from-teal-400 to-emerald-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-teal-500/20 relative overflow-hidden">
           <Wallet className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
           <p className="text-teal-100 text-sm font-bold mb-1">{language === 'bn' ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}</p>
           <h3 className="text-4xl font-black mb-6 tracking-tight flex items-center">
             <span className="text-xl mr-1 opacity-80">$</span>{balance.toLocaleString()}
           </h3>
           
           <div className="flex gap-4">
              <div className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/20">
                 <p className="text-teal-100 text-xs font-bold mb-1 flex items-center gap-1">
                   <TrendingUp className="w-3 h-3" /> {language === 'bn' ? 'আয়' : 'Income'}
                 </p>
                 <p className="font-black text-lg">${income.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/20">
                 <p className="text-teal-100 text-xs font-bold mb-1 flex items-center gap-1">
                   <TrendingDown className="w-3 h-3 text-rose-200" /> {language === 'bn' ? 'ব্যয়' : 'Expense'}
                 </p>
                 <p className="font-black text-lg">${expense.toLocaleString()}</p>
              </div>
           </div>
        </div>

        {/* Add Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl">
             <button
               onClick={() => setType('expense')}
               className={cn(
                 "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                 type === 'expense' ? "bg-white dark:bg-slate-700 shadow text-rose-600" : "text-slate-500"
               )}
             >
               {language === 'bn' ? 'খরচ (Expense)' : 'Expense'}
             </button>
             <button
               onClick={() => setType('income')}
               className={cn(
                 "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                 type === 'income' ? "bg-white dark:bg-slate-700 shadow text-emerald-600" : "text-slate-500"
               )}
             >
               {language === 'bn' ? 'আয় (Income)' : 'Income'}
             </button>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
             <input
                type="text"
                placeholder={language === 'bn' ? 'বিবরণ (যেমন: বাজার)' : 'Desc (e.g. Groceries)'}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
             />
             <input
                type="number"
                placeholder="Amount (e.g. 50)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
             />
             <button
               onClick={addTransaction}
               className="bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95"
             >
               <Plus className="w-5 h-5" /> {language === 'bn' ? 'যোগ করুন' : 'Add'}
             </button>
           </div>
        </div>

        {/* History List */}
        <div>
           <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-3 ml-1">
             {language === 'bn' ? 'সাম্প্রতিক ইতিহাস' : 'Recent History'}
           </h3>
           <div className="space-y-2">
             <AnimatePresence>
                {transactions.length === 0 && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 text-slate-400 font-bold text-sm">
                      {language === 'bn' ? 'কোনো লেনদেন নেই' : 'No transactions yet.'}
                   </motion.div>
                )}
                {transactions.map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                       <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          t.type === 'income' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                       )}>
                          {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                       </div>
                       <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{t.desc}</p>
                          <p className="text-xs font-bold text-slate-400 opacity-70">
                            {new Date(t.date).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={cn(
                          "font-black tracking-tight",
                          t.type === 'income' ? "text-emerald-500" : "text-slate-800 dark:text-slate-200"
                       )}>
                          {t.type === 'income' ? '+' : '-'}${t.amount}
                       </span>
                       <button onClick={() => deleteTx(t.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <MinusCircle className="w-4 h-4" />
                       </button>
                    </div>
                  </motion.div>
                ))}
             </AnimatePresence>
           </div>
        </div>

      </div>
    </div>
  );
};
