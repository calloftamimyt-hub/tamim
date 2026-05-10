import React, { useState } from 'react';
import { Mail, Lock, Phone, User, LogIn, UserPlus, Users } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { checkAndRegisterDevice } from '../lib/device';

interface AuthFormProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthForm({ initialMode = 'login', onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCodeInput: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          throw new Error("First Name and Last Name are required.");
        }
        if (!formData.phone.trim()) {
          throw new Error("Mobile Number is required.");
        }
        if (!isValidEmail(formData.email.trim())) {
          throw new Error("Please enter a valid email address.");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match!");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters!");
        }
        if (!formData.referralCodeInput.trim()) {
          throw new Error("Referral Code is required.");
        }

        let formattedPhone = formData.phone.trim();
        if (formattedPhone.startsWith('01')) {
          formattedPhone = '+88' + formattedPhone;
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+' + formattedPhone;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
        const user = userCredential.user;

        await checkAndRegisterDevice(user.uid, true);
        await updateProfile(user, {
          displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        });

        const myReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        try {
          await setDoc(doc(db, 'users', user.uid), {
            displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            phoneNumber: formattedPhone,
            email: formData.email.trim(),
            role: 'client',
            referralCode: myReferralCode,
            referralCount: 0,
            referredBy: formData.referralCodeInput.trim(),
            updatedAt: serverTimestamp(),
          }, { merge: true });

          const referrersRef = collection(db, 'users');
          const q = query(referrersRef, where('referralCode', '==', formData.referralCodeInput.trim()));
          const referrerDocs = await getDocs(q);
          if (!referrerDocs.empty) {
            const referrerUid = referrerDocs.docs[0].id;
            await setDoc(doc(db, 'referrals', `${referrerUid}_${user.uid}`), {
              referrerId: referrerUid,
              refereeId: user.uid,
              refereeName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
              status: 'pending',
              createdAt: serverTimestamp(),
            });
          }
        } catch (e) {
          console.error("Failed to create user document:", e);
        }

        try {
          await setDoc(doc(db, 'user_balances', user.uid), {
            userId: user.uid,
            totalEarned: 0,
            currentBalance: 0,
            depositBalance: 0,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Failed to initialize balance:", e);
        }

        if (onSuccess) onSuccess();

      } else if (mode === 'login') {
        if (!isValidEmail(formData.email.trim())) {
          throw new Error("Please enter a valid email address.");
        }
        const userCredential = await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
        await checkAndRegisterDevice(userCredential.user.uid, false);
        
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let errorMessage = err.message || "Something went wrong. Please try again.";
      
      if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = "An account already exists with this email.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Use at least 6 characters.";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Check your internet connection.";
      } else if (err.message && err.message.includes("একাধিক অ্যাকাউন্ট")) {
        errorMessage = err.message;
      } else if (err.message && err.message.includes("Firebase:")) {
        errorMessage = "Something went wrong. Please try again.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col justify-center max-w-md mx-auto px-4 py-4 bg-white dark:bg-slate-950">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? 'Login with your email and password' : 'Fill in the details below to register'}
        </p>
      </div>

      <div className="flex space-x-2 mb-4 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
        <button
          onClick={() => { setMode('login'); setError(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'login' 
              ? 'bg-white dark:bg-slate-800 text-primary dark:text-primary-light shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => { setMode('register'); setError(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'register' 
              ? 'bg-white dark:bg-slate-800 text-primary dark:text-primary-light shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Registration
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">First Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                    placeholder="First Name"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Mobile Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email <span className="text-red-500">*</span></label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
              placeholder="••••••••"
            />
          </div>
        </div>

        {mode === 'register' && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Referral Code <span className="text-red-500">*</span></label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="referralCodeInput"
                  required
                  value={formData.referralCodeInput}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none dark:text-white"
                  placeholder="REFERRAL CODE"
                />
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 font-medium mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : mode === 'login' ? (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </>
          )}
        </button>
      </form>
    </div>
  );
}

