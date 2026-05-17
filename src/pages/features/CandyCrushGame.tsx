import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { showInterstitialAd } from '@/lib/admob';

const CANDIES = ['🍎', '🍊', '🍇', '🍉', '🍌', '🥝'];
const GRID_SIZE = 8;

export function CandyCrushGame({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const [grid, setGrid] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const playSound = (type: 'correct' | 'wrong') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      console.warn("Audio not supported or failed", e);
    }
  };

  const createBoard = () => {
    const randomGrid: string[] = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const randomCandy = CANDIES[Math.floor(Math.random() * CANDIES.length)];
        randomGrid.push(randomCandy);
    }
    setGrid(randomGrid);
    setScore(0);
    
    // AdMob logic (wait until grid changes to consider it a round)
    if (grid.length > 0) {
      setRoundsPlayed(prev => {
        const newRounds = prev + 1;
        if (newRounds % 5 === 0 && newRounds > 0) {
          showInterstitialAd(() => {});
        }
        return newRounds;
      });
    }
  };

  useEffect(() => {
    createBoard();
  }, []);

  const checkForMatches = useCallback((currentGrid: string[]) => {
    const matchedIndices = new Set<number>();

    // Check rows
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const isRightEdge1 = (i + 1) % GRID_SIZE === 0;
      const isRightEdge2 = (i + 2) % GRID_SIZE === 0;
      if (isRightEdge1 || isRightEdge2) continue;

      if (
        currentGrid[i] && currentGrid[i] !== '' &&
        currentGrid[i] === currentGrid[i + 1] &&
        currentGrid[i] === currentGrid[i + 2]
      ) {
        matchedIndices.add(i);
        matchedIndices.add(i + 1);
        matchedIndices.add(i + 2);
      }
    }

    // Check columns
    for (let i = 0; i < GRID_SIZE * (GRID_SIZE - 2); i++) {
      if (
        currentGrid[i] && currentGrid[i] !== '' &&
        currentGrid[i] === currentGrid[i + GRID_SIZE] &&
        currentGrid[i] === currentGrid[i + GRID_SIZE * 2]
      ) {
        matchedIndices.add(i);
        matchedIndices.add(i + GRID_SIZE);
        matchedIndices.add(i + GRID_SIZE * 2);
      }
    }

    return matchedIndices;
  }, []);

  const processMatches = useCallback(async (currentGrid: string[], chainScore = 0) => {
    let tempGrid = [...currentGrid];
    let matches = checkForMatches(tempGrid);

    if (matches.size > 0) {
      setIsProcessing(true);
      playSound('correct');
      setScore(s => s + matches.size * 10);
      
      // Clear matches
      matches.forEach(idx => {
        tempGrid[idx] = '';
      });
      setGrid([...tempGrid]);

      // Wait a bit to show cleared spaces
      await new Promise(res => setTimeout(res, 200));

      // Drop candies
      for (let i = tempGrid.length - 1; i >= 0; i--) {
        if (tempGrid[i] === '') {
           let above = i - GRID_SIZE;
           while(above >= 0 && tempGrid[above] === '') {
             above -= GRID_SIZE;
           }
           if (above >= 0) {
              tempGrid[i] = tempGrid[above];
              tempGrid[above] = '';
           } else {
              tempGrid[i] = CANDIES[Math.floor(Math.random() * CANDIES.length)];
           }
        }
      }
      setGrid([...tempGrid]);

      await new Promise(res => setTimeout(res, 200));
      // Re-trigger
      processMatches(tempGrid, chainScore + 1);
    } else {
      setIsProcessing(false);
    }
  }, [checkForMatches]);


  useEffect(() => {
    // Initial check
    if (grid.length > 0 && !isProcessing) {
       const initialMatches = checkForMatches(grid);
       if (initialMatches.size > 0) {
         processMatches(grid);
       }
    }
  }, [grid, isProcessing, checkForMatches, processMatches]);


  const isValidMove = (idx1: number, idx2: number) => {
    const isAdjacent = 
      idx1 === idx2 - 1 || 
      idx1 === idx2 + 1 || 
      idx1 === idx2 - GRID_SIZE || 
      idx1 === idx2 + GRID_SIZE;
      
    // Prevent wrapping row edges
    if (idx1 % GRID_SIZE === 0 && idx2 === idx1 - 1) return false;
    if ((idx1 + 1) % GRID_SIZE === 0 && idx2 === idx1 + 1) return false;
      
    return isAdjacent;
  };

  const handleCellClick = (idx: number) => {
    if (isProcessing) return;

    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      if (selectedIdx === idx) {
        setSelectedIdx(null);
        return;
      }
      performSwap(selectedIdx, idx);
    }
  };

  const performSwap = (idx1: number, idx2: number) => {
    if (!isValidMove(idx1, idx2)) {
      setSelectedIdx(idx2);
      return;
    }
    
    const newGrid = [...grid];
    const temp = newGrid[idx1];
    newGrid[idx1] = newGrid[idx2];
    newGrid[idx2] = temp;
    setGrid(newGrid);
    setSelectedIdx(null);
    setIsProcessing(true);

    const matches = checkForMatches(newGrid);
    if (matches.size > 0) {
       processMatches(newGrid);
    } else {
       playSound('wrong');
       setTimeout(() => {
         const revertedGrid = [...newGrid];
         revertedGrid[idx2] = revertedGrid[idx1];
         revertedGrid[idx1] = temp;
         setGrid(revertedGrid);
         setIsProcessing(false);
       }, 400);
    }
  };

  const dragStartInfo = React.useRef<{idx: number, x: number, y: number} | null>(null);

  const handlePointerDown = (idx: number, e: React.PointerEvent) => {
    if (isProcessing) return;
    dragStartInfo.current = { idx, x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartInfo.current || isProcessing) {
      dragStartInfo.current = null;
      return;
    }
    
    const { idx, x, y } = dragStartInfo.current;
    dragStartInfo.current = null;
    
    const deltaX = e.clientX - x;
    const deltaY = e.clientY - y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < 20 && absY < 20) {
      handleCellClick(idx);
      return;
    }

    let targetIdx = idx;
    if (absX > absY) {
      if (deltaX > 0) targetIdx += 1;
      else targetIdx -= 1;
    } else {
      if (deltaY > 0) targetIdx += GRID_SIZE;
      else targetIdx -= GRID_SIZE;
    }

    if (targetIdx >= 0 && targetIdx < GRID_SIZE * GRID_SIZE && isValidMove(idx, targetIdx)) {
      performSwap(idx, targetIdx);
    }
  };

  return (
    <div 
      className="flex-1 w-full max-w-md mx-auto flex flex-col bg-slate-50 dark:bg-slate-950 h-full relative"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-rose-200 to-slate-50 dark:from-rose-900/30 dark:to-slate-950 opacity-80 pointer-events-none" />
      
      <div className="px-4 pt-safe pb-4 flex flex-col h-full relative z-10 w-full">
      <header className="flex items-center justify-between py-4">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {language === 'bn' ? 'ক্যান্ডি ক্রাশ' : 'Candy Match'}
            </h1>
            <span className="text-xs font-bold text-rose-500">Score: {score}</span>
        </div>
        <button onClick={createBoard} className="p-2 text-slate-500 hover:text-rose-500 transition-colors" disabled={isProcessing}>
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
         <p className="text-xs text-slate-500 mb-6 font-medium text-center">
             {language === 'bn' ? 'ক্যান্ডি মিলিয়ে নিতে সোয়াইপ করুন' : 'Swipe candies to match!'} <br/>
             {language === 'bn' ? 'কোনো কয়েন দেওয়া হবে না' : 'Just for fun, no coins awarded'}
         </p>
         
        <div 
          className="grid border-4 border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950 gap-1 rounded-xl overflow-hidden shadow-xl p-1 touch-none" 
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`}}
        >
          {grid.map((candy, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <motion.div
                key={idx}
                onPointerDown={(e) => handlePointerDown(idx, e as any)}
                animate={{ scale: isSelected ? 1.1 : 1, opacity: candy === '' ? 0 : 1 }}
                whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-2xl sm:text-3xl cursor-pointer select-none bg-white dark:bg-slate-900 rounded ${isSelected ? 'ring-2 ring-rose-500 z-10' : ''}`}
              >
                {candy}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}
