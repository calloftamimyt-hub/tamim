import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, CheckCircle2, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function SudokuGame({ onBack }: { onBack: () => void }) {
  const { t } = useLanguage();
  const [grid, setGrid] = useState<(number | null)[][]>(Array(9).fill(null).map(() => Array(9).fill(null)));
  const [initialGrid, setInitialGrid] = useState<boolean[][]>(Array(9).fill(false).map(() => Array(9).fill(false)));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Simple initial grid generator (very basic)
  useEffect(() => {
    generateGame();
  }, []);

  const generateGame = () => {
    const newGrid = Array(9).fill(null).map(() => Array(9).fill(null));
    const fixed = Array(9).fill(false).map(() => Array(9).fill(false));
    
    // Fill some random valid values
    for (let i = 0; i < 25; i++) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      const v = Math.floor(Math.random() * 9) + 1;
      
      if (!newGrid[r][c] && isValid(newGrid, r, c, v)) {
        newGrid[r][c] = v;
        fixed[r][c] = true;
      }
    }
    
    setGrid(newGrid);
    setInitialGrid(fixed);
    setIsComplete(false);
  };

  const isValid = (g: (number | null)[][], row: number, col: number, val: number) => {
    for (let i = 0; i < 9; i++) {
       if (g[row][i] === val) return false;
       if (g[i][col] === val) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (g[startRow + i][startCol + j] === val) return false;
      }
    }
    return true;
  };

  const handleCellClick = (r: number, c: number) => {
    if (initialGrid[r][c]) return;
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = num === 0 ? null : num;
    setGrid(newGrid);
    
    checkCompletion(newGrid);
  };

  const checkCompletion = (g: (number | null)[][]) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (g[i][j] === null) return;
      }
    }
    setIsComplete(true);
  };

  return (
    <div className="flex-1 w-full max-w-md mx-auto flex flex-col bg-slate-50 dark:bg-slate-950 px-4 pt-safe pb-4 h-full">
      <header className="flex items-center justify-between py-4">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">{t('sudoku-title')}</h1>
        <button onClick={generateGame} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className="grid grid-cols-9 border-2 border-slate-900 dark:border-white bg-slate-900 dark:bg-white gap-px shadow-xl rounded-lg overflow-hidden max-w-full">
          {grid.map((row, r) => (
            row.map((val, c) => {
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isInitial = initialGrid[r][c];
              const borderRight = (c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-slate-900 dark:border-white' : '';
              const borderBottom = (r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-slate-900 dark:border-white' : '';
              
              return (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold transition-all cursor-pointer bg-white dark:bg-slate-900
                    ${isSelected ? 'bg-primary/20 dark:bg-primary/40 ring-2 ring-primary z-10' : ''}
                    ${isInitial ? 'text-slate-900 dark:text-white font-black' : 'text-primary dark:text-primary-light'}
                    ${borderRight} ${borderBottom}
                  `}
                >
                  {val !== null ? val : ''}
                </div>
              );
            })
          ))}
        </div>

        <div className="mt-8 grid grid-cols-5 gap-2 w-full max-w-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:scale-90 transition-all hover:border-primary"
            >
              {num === 0 ? 'X' : num}
            </button>
          ))}
        </div>
      </div>

      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg mb-4"
        >
          <CheckCircle2 className="w-8 h-8" />
          <div className="flex-1">
            <h4 className="font-black uppercase tracking-wider">{t('well-done') || 'Well Done!'}</h4>
            <p className="text-xs opacity-90">{t('sudoku-desc')}</p>
          </div>
          <button onClick={generateGame} className="bg-white/20 p-2 rounded-lg"><RotateCcw className="w-5 h-5" /></button>
        </motion.div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-3 mt-auto">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
          {t('sudoku-rules') || 'Sudoku is a logic-based number placement puzzle. The goal is to fill the 9x9 grid so that each row, column, and 3x3 box contains all digits from 1 to 9.'}
        </p>
      </div>
    </div>
  );
}
