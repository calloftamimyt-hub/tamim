import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { Mail, RefreshCw, LogOut, CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function EmailVerificationScreen({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendEmailVerification(user);
      setMessage('Verification link sent successfully. Please check your inbox (and spam folder).');
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError('Failed to send verification email. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await user.reload();
      if (auth.currentUser?.emailVerified) {
        window.location.reload();
      } else {
        setError('Email is still not verified. Please check your inbox.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-28 h-28 mx-auto bg-gradient-to-tr from-blue-500 to-sky-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8"
        >
          <Send className="w-12 h-12 text-white relative left-1" />
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-slate-900 dark:text-white mb-3"
        >
          Verify Your Email
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-base text-slate-600 dark:text-slate-400 mb-8 max-w-sm"
        >
          We've sent a verification link to <span className="font-semibold text-slate-900 dark:text-white">{user.email}</span>. 
          Please click the link in the email to verify your account.
        </motion.p>

        <AnimatePresence mode="popLayout">
          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm flex items-start gap-3 text-left w-full shadow-sm"
            >
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-green-500" />
              <p>{message}</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm text-center font-medium w-full shadow-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="space-y-3 w-full"
        >
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white py-3.5 px-4 rounded-xl font-semibold transition-all disabled:opacity-70 shadow-md shadow-blue-500/20"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            I have verified my email
          </button>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-300 py-3.5 px-4 rounded-xl font-medium transition-all disabled:opacity-70 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Resend verification link
          </button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          onClick={handleLogout}
          className="mt-8 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout and try a different account
        </motion.button>
      </motion.div>
    </div>
  );
}
