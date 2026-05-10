import React, { useState, useEffect } from 'react';
import { ToolHero } from './ToolHero';
import { ListTodo, ArrowLeft, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';


import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

export const TodoListTool = ({ onBack }: { onBack: () => void }) => {
  const { language } = useLanguage();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState('');

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('todos_app_data');
    if (saved) {
      try { setTodos(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('todos_app_data', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!task.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: task.trim(),
      completed: false
    };
    
    setTodos(prev => [newTodo, ...prev]);
    setTask('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
      <ToolHero title={{ bn: 'টু-ডু লিস্ট', en: 'To-Do List' }} description={{ bn: 'আপনার প্রতিদিনের কাজ গুছিয়ে রাখুন', en: 'Manage your daily tasks' }} Icon={ListTodo} bgGradient="bg-gradient-to-br from-blue-400 to-indigo-500" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-6">
        
        {/* Progress Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
           <ListTodo className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
           <p className="text-white/80 text-sm font-bold mb-1">
              {language === 'bn' ? 'কাজের অগ্রগতি' : 'Task Progress'}
           </p>
           <h3 className="text-3xl font-black mb-4 tracking-tight">
              {completedCount} / {todos.length} <span className="text-lg font-bold opacity-80">{language === 'bn' ? 'সম্পন্ন' : 'Done'}</span>
           </h3>
           <div className="h-2 bg-black/20 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-white rounded-full"
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
             />
           </div>
        </div>

        {/* Input Form */}
        <form onSubmit={addTodo} className="relative">
           <input
             type="text"
             value={task}
             onChange={(e) => setTask(e.target.value)}
             placeholder={language === 'bn' ? 'নতুন কাজ যোগ করুন (উদাঃ বাজার করা)...' : 'Add a new task...'}
             className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white shadow-sm"
           />
           <button
             type="submit"
             disabled={!task.trim()}
             className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 disabled:opacity-50 rounded-xl transition-colors"
           >
             <Plus className="w-5 h-5 font-bold" />
           </button>
        </form>

        {/* List */}
        <div className="space-y-2">
           <AnimatePresence>
              {todos.length === 0 && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 text-slate-400 font-bold text-sm">
                    {language === 'bn' ? 'কোনো কাজ নেই' : 'No tasks pending.'}
                 </motion.div>
              )}
              {todos.map(todo => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                     "flex justify-between items-center bg-white dark:bg-slate-900 border p-4 rounded-2xl shadow-sm transition-all",
                     todo.completed ? "border-slate-100 dark:border-slate-800 opacity-60" : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  <label className="flex items-start gap-4 flex-1 cursor-pointer">
                     <button onClick={() => toggleTodo(todo.id)} className="shrink-0 mt-0.5 outline-none">
                        {todo.completed 
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-indigo-500" />
                        }
                     </button>
                     <span className={cn(
                        "font-bold text-sm select-none break-words flex-1 pr-2",
                        todo.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"
                     )}>
                        {todo.text}
                     </span>
                  </label>
                  <button 
                     onClick={() => deleteTodo(todo.id)} 
                     className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
