import React, { useState, useRef } from 'react';
import { ToolHero } from './ToolHero';
import { QrCode, ArrowLeft, Download, Type, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const QRMakerTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [text, setText] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const svgRef = useRef<SVGSVGElement>(null);

  const colors = [
    '#000000', // Black
    '#2563eb', // Blue
    '#16a34a', // Green
    '#dc2626', // Red
    '#9333ea', // Purple
  ];

  const handleDownload = () => {
    if (!svgRef.current || !text) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const a = document.createElement("a");
      a.download = `QR_${Date.now()}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'কিউআর মেকার', en: 'QR Maker' }} description={{ bn: 'যেকোনো টেক্সট থেকে QR Code বানান', en: 'Create QR codes from any text' }} Icon={QrCode} bgGradient="bg-gradient-to-br from-cyan-500 to-blue-600" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6 flex flex-col">
        
        {/* QR Display Area */}
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[320px] relative overflow-hidden">
           {text ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100"
              >
                 <QRCodeSVG 
                    value={text} 
                    size={200}
                    fgColor={fgColor}
                    ref={svgRef}
                    level="H"
                 />
              </motion.div>
           ) : (
              <div className="flex flex-col items-center text-slate-300 dark:text-slate-700">
                 <QrCode className="w-24 h-24 mb-4 opacity-50" />
                 <p className="text-sm font-bold">{language === 'bn' ? 'টেক্সট বা লিংক দিন' : 'Enter text or link'}</p>
              </div>
           )}
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
           <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                 <Type className="w-4 h-4 text-cyan-500" />
                 {language === 'bn' ? 'ইউআরএল বা টেক্সট' : 'URL or Text'}
              </label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all dark:text-white min-h-[100px] resize-none"
              />
           </div>

           <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">
                 {language === 'bn' ? 'কিউআর কালার' : 'QR Color'}
              </label>
              <div className="flex items-center gap-3">
                 {colors.map(c => (
                    <button
                       key={c}
                       onClick={() => setFgColor(c)}
                       className={cn(
                          "w-10 h-10 rounded-full border-2 transition-transform",
                          fgColor === c ? "border-cyan-500 scale-110" : "border-transparent"
                       )}
                       style={{ backgroundColor: c }}
                    />
                 ))}
              </div>
           </div>

           <button 
              onClick={handleDownload}
              disabled={!text}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
           >
              <Download className="w-5 h-5" />
              {language === 'bn' ? 'কিউআর সেভ করুন' : 'Save QR Code'}
           </button>
        </div>

      </div>
    </div>
  );
};
