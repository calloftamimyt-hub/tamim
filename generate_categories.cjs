const fs = require('fs');
const path = require('path');

const categories = [
  { file: 'Kalima.tsx', name: 'KalimaView', key: 'kalima' },
  { file: 'Janaza.tsx', name: 'JanazaView', key: 'janaza' },
  { file: 'MasnoonDua.tsx', name: 'MasnoonDuaView', key: 'masnoon-dua' },
  { file: 'Roza.tsx', name: 'RozaView', key: 'roza' },
  { file: 'IslamicQuotes.tsx', name: 'IslamicQuotesView', key: 'islamic-quotes' },
  { file: 'Darood.tsx', name: 'DaroodView', key: 'darood' },
  { file: 'Azkar.tsx', name: 'AzkarView', key: 'azkar' },
  { file: 'Seerah.tsx', name: 'SeerahView', key: 'seerah' },
  { file: 'Sahaba.tsx', name: 'SahabaView', key: 'sahaba' },
  { file: 'HalalHaram.tsx', name: 'HalalHaramView', key: 'halal-haram' }
];

const template = (name, key) => `import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function ${name}() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Header */}
      <header className="px-4 pt-safe pb-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-10">
        <button 
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('${key}')}</h1>
      </header>

      {/* Content Area - Ready for future updates */}
      <div className="flex-grow p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center justify-center min-h-[40vh] text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t('${key}')} কনটেন্ট খুব শীঘ্রই যোগ করা হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
`;

const dir = path.join(__dirname, 'src/pages/features');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

categories.forEach(({ file, name, key }) => {
  const fullPath = path.join(dir, file);
  fs.writeFileSync(fullPath, template(name, key));
  console.log('Created:', file);
});
