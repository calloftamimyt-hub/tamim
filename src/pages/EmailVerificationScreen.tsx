import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';

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
        // App.tsx listen onAuthStateChanged might not trigger on reload directly,
        // so we force a reload of the window to update the state cleanly
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
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mb-6">
        <Mail className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify your email address</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 max-w-sm">
        We've sent a verification link to <span className="font-medium text-slate-900 dark:text-white">{user.email}</span>. 
        Please click the link in the email to verify your account.
      </p>

      {message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm flex items-start gap-2 text-left">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm text-left w-full max-w-sm">
          {error}
        </div>
      )}

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          I have verified my email
        </button>

        <button
          onClick={handleResend}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-70"
        >
          <RefreshCw className="w-4 h-4" />
          Resend verification link
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="mt-8 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-sm font-medium transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout and try a different account
      </button>

    </div>
  );
}
