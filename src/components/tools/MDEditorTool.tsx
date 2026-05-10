import React, { useState } from 'react';
import { ToolHero } from './ToolHero';
import { FileCode, ArrowLeft, Edit3, Eye } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MDEditorTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [content, setContent] = useState('# Hello Markdown\n\nWrite something awesome here!\n\n- Lists\n- **Bold** text\n- [Links](https://example.com)\n\n| Tables | Supported |\n| --- | --- |\n| Yes | Very much |');

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'মার্কডাউন এডিটর', en: 'MD Editor' }} description={{ bn: 'লাইভ প্রিভিউ মার্কডাউন', en: 'Write and preview Markdown' }} Icon={FileCode} bgGradient="bg-gradient-to-br from-purple-500 to-fuchsia-600" onBack={onBack} />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Write Pane */}
        <div className={cn(
             "h-full w-full md:w-1/2 flex flex-col overflow-hidden absolute md:static inset-0 bg-slate-50 dark:bg-slate-950 transition-transform duration-300",
             tab === 'write' ? "translate-x-0" : "-translate-x-full md:translate-x-0"
         )}
        >
           <div className="p-4 md:p-6 flex-1 flex flex-col">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                 <FileCode className="w-4 h-4 text-fuchsia-500" />
                 {language === 'bn' ? 'মার্কডাউন লিখুন' : 'Write Markdown'}
              </label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 text-sm font-mono focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 outline-none transition-all dark:text-slate-200 resize-none shadow-sm"
                spellCheck="false"
              />
           </div>
        </div>

        {/* Divider Desktop */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800" />

        {/* Preview Pane */}
        <div className={cn(
             "h-full w-full md:w-1/2 flex flex-col overflow-hidden absolute md:static inset-0 bg-white dark:bg-slate-950 transition-transform duration-300",
             tab === 'preview' ? "translate-x-0" : "translate-x-full md:translate-x-0"
         )}
        >
           <div className="p-4 md:p-6 flex-1 flex flex-col overflow-hidden">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                 <Eye className="w-4 h-4 text-fuchsia-500" />
                 {language === 'bn' ? 'প্রিভিউ' : 'Live Preview'}
              </label>
              <div className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 overflow-y-auto">
                 <div className="prose prose-slate dark:prose-invert max-w-none prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                       {content}
                    </ReactMarkdown>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
