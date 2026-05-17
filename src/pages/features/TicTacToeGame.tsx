import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { showInterstitialAd } from '@/lib/admob';

export function TicTacToeGame({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const calculateWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  useEffect(() => {
    if (winner || isDraw) {
      setRoundsPlayed(prev => {
        const newRounds = prev + 1;
        if (newRounds % 5 === 0 && newRounds > 0) {
          setTimeout(() => showInterstitialAd(() => {}), 1000); // Small delay to let them see they won
        }
        return newRounds;
      });
    }
  }, [winner, isDraw]);

  let status;
  if (winner) {
    status = (language === 'bn' ? 'বিজয়ী: ' : 'Winner: ') + winner;
  } else if (isDraw) {
    status = language === 'bn' ? 'ড্র!' : 'Draw!';
  } else {
    status = (language === 'bn' ? 'পরবর্তী প্লেয়ার: ' : 'Next player: ') + (xIsNext ? 'X' : 'O');
  }

  const handleClick = (i: number) => {
    if (board[i] || winner) return;

    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(xIsNext ? 400 : 500, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="flex-1 w-full max-w-md mx-auto flex flex-col bg-slate-50 dark:bg-slate-950 h-full relative">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-200 to-slate-50 dark:from-blue-900/30 dark:to-slate-950 opacity-80 pointer-events-none z-0" />
      <div className="px-4 pt-safe pb-4 flex flex-col h-full relative z-10 w-full">
      <header className="flex items-center justify-between py-4">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {language === 'bn' ? 'টিক ট্যাক টো' : 'Tic Tac Toe'}
            </h1>
        </div>
        <button onClick={resetGame} className="p-2 text-slate-500 hover:text-blue-500 transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10">
         <p className="text-xs text-slate-500 mb-6 font-medium text-center">
             {status} <br/>
             {language === 'bn' ? 'কোনো কয়েন দেওয়া হবে না' : 'Just for fun, no coins awarded'}
         </p>
         
        <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
          {board.map((square, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(i)}
              className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl sm:text-5xl font-black rounded-xl
                ${!square ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700' : 
                  square === 'X' ? 'bg-blue-100 text-blue-500 dark:bg-blue-900/30' : 'bg-rose-100 text-rose-500 dark:bg-rose-900/30'
                } transition-colors`}
            >
              {square}
            </motion.button>
          ))}
        </div>
        
        {winner && (
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-8 text-2xl font-black text-emerald-500"
            >
                {winner} {language === 'bn' ? 'জিতেছে!' : 'Wins!'}
            </motion.div>
        )}
        {isDraw && (
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-8 text-2xl font-black text-slate-500"
            >
                {language === 'bn' ? 'ম্যাচ ড্র!' : 'Draw!'}
            </motion.div>
        )}
      </div>
    </div>
    </div>
  );
}
