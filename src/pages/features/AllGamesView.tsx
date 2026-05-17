import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Gamepad2, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AllGamesViewProps {
  onBack: () => void;
  onSelectGame: (game: string) => void;
}

export function AllGamesView({ onBack, onSelectGame }: AllGamesViewProps) {
  const { language } = useLanguage();

  const games = [
    {
      id: 'sudoku',
      name: language === 'bn' ? 'সুডোকু' : 'Sudoku',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-600 dark:text-yellow-500',
      icon: '🧩',
      isPro: true
    },
    {
      id: 'candy-crush',
      name: language === 'bn' ? 'ক্যান্ডি ম্যাচ' : 'Candy Match',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
      textColor: 'text-rose-600 dark:text-rose-500',
      icon: '🍬',
      isPro: false
    },
    {
      id: 'tic-tac-toe',
      name: language === 'bn' ? 'টিক ট্যাক টো' : 'Tic Tac Toe',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      textColor: 'text-cyan-600 dark:text-cyan-500',
      icon: '⭕',
      isPro: false
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-red-500/90 to-slate-50 dark:from-red-900/40 dark:to-slate-950 pt-safe hide-scrollbar">
      <header className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-white uppercase tracking-widest drop-shadow-md flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          {language === 'bn' ? 'সব গেমস' : 'All Games'}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      <div className="px-4 pb-20 pt-4">
        <p className="text-white/80 font-medium text-center mb-8 px-4 text-sm drop-shadow-sm">
          {language === 'bn' ? 'আপনার পছন্দের গেম বেছে নিন এবং মজা করুন!' : 'Choose your favorite game and have fun!'}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectGame(game.id)}
              className={`${game.bgColor} rounded-3xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer shadow-sm relative overflow-hidden group border border-white/20 dark:border-white/5 backdrop-blur-sm`}
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 dark:bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl pointer-events-none group-hover:bg-white/20 transition-colors" />

              <span className="text-5xl lg:text-6xl drop-shadow-md group-hover:scale-110 transition-transform">
                {game.icon}
              </span>
              
              <div className="text-center z-10 w-full mt-2">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                  {game.name}
                </h3>
                {game.isPro ? (
                  <span className="inline-block mt-1 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Pro
                  </span>
                ) : (
                  <span className="flex items-center justify-center mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <Play className="w-3 h-3 mr-1" />
                    Play
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
