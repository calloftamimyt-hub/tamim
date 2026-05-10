import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Phone, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Scholar {
  id: string;
  name: string;
  description: string;
  phoneNumber: string;
  imageUrl: string;
  createdAt: any;
}

export function Scholars({ onBack }: { onBack: () => void }) {
  const { t, language } = useLanguage();
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = collection(db, 'scholars');
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Scholar[];
      setScholars(data);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Scholars fetch error:", err);
      setError(err.message);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center pt-safe">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <h1 className="ml-2 text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {language === 'bn' ? 'আলেমদের সাথে পরামর্শ' : 'Consult with Scholars'}
        </h1>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              {language === 'bn' ? 'ডাটা লোড করতে সমস্যা হয়েছে' : 'Error loading data'}
            </p>
            <p className="text-[10px] text-red-400 mt-1 font-mono uppercase tracking-widest">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 h-48 shimmer" />
            ))}
          </div>
        ) : scholars.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {scholars.map((scholar, idx) => (
              <motion.div
                key={scholar.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center"
              >
                <img 
                  src={scholar.imageUrl} 
                  alt={scholar.name} 
                  className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-primary/10 mb-2"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 w-full min-w-0 flex flex-col">
                  <h3 className="text-[12px] font-black text-slate-900 dark:text-white truncate">
                    {scholar.name}
                  </h3>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 mb-2 leading-relaxed flex-1">
                    {scholar.description}
                  </p>
                  <button 
                    onClick={() => handleCall(scholar.phoneNumber)}
                    className="mt-auto flex items-center justify-center space-x-1.5 bg-primary text-white text-[9px] font-black py-1.5 rounded-lg shadow-md shadow-primary/20 active:scale-95 transition-transform uppercase tracking-wider w-full"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{language === 'bn' ? 'কল করুন' : 'Call'}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Info className="w-12 h-12 opacity-20 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">
              {language === 'bn' ? 'কোন আলেম পাওয়া যায়নি' : 'No scholars found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
