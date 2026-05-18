import React, { useState } from 'react';
import { Mail, Lock, Phone, User, LogIn, UserPlus, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { checkAndRegisterDevice } from '../lib/device';

interface AuthFormProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

import { WelcomeAnimation } from './WelcomeAnimation';
import { CyberSecurityAnimation } from './CyberSecurityAnimation';
import { MobileAnimation } from './MobileAnimation';
import { PasswordAnimation } from './PasswordAnimation';
import { ReferralAnimation } from './ReferralAnimation';
import { LoginAnimation } from './LoginAnimation';

export function AuthForm({ initialMode = 'login', onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [registerStep, setRegisterStep] = useState(1);
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
    accountType: 'child',
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

    if (mode === 'register') {
      if (registerStep === 1) {
        if (!formData.firstName.trim() || !formData.lastName.trim()) return setError("First Name and Last Name are required.");
        return setRegisterStep(2);
      }
      if (registerStep === 2) {
        if (!isValidEmail(formData.email.trim())) return setError("Please enter a valid email address.");
        return setRegisterStep(3);
      }
      if (registerStep === 3) {
        if (!formData.phone.trim()) return setError("Mobile Number is required.");
        return setRegisterStep(4);
      }
      if (registerStep === 4) {
        if (formData.password.length < 6) return setError("Password must be at least 6 characters!");
        if (formData.password !== formData.confirmPassword) return setError("Passwords do not match!");
        return setRegisterStep(5);
      }
      if (registerStep === 5) {
        if (!formData.referralCodeInput.trim()) return setError("Referral Code is required.");
        // Proceed to submit
      }
    } else {
      if (!isValidEmail(formData.email.trim())) return setError("Please enter a valid email address.");
    }

    setLoading(true);

    try {
      if (mode === 'register') {
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
            accountType: formData.accountType,
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
        const userCredential = await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
        await checkAndRegisterDevice(userCredential.user.uid, false);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let errorMessage = err.message || "Something went wrong. Please try again.";
      
      if (err.code === 'auth/invalid-email') errorMessage = "Invalid email address.";
      else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') errorMessage = "Incorrect email or password.";
      else if (err.code === 'auth/email-already-in-use') errorMessage = "An account already exists with this email.";
      else if (err.code === 'auth/weak-password') errorMessage = "Password is too weak. Use at least 6 characters.";
      else if (err.code === 'auth/network-request-failed') errorMessage = "Check your internet connection.";
      else if (err.message && err.message.includes("একাধিক অ্যাকাউন্ট")) errorMessage = err.message;
      else if (err.message && err.message.includes("Firebase:")) errorMessage = "Something went wrong. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  const isRegisterStep1 = mode === 'register' && registerStep === 1;
  const isRegisterStep2 = mode === 'register' && registerStep === 2;
  const isRegisterStep3 = mode === 'register' && registerStep === 3;
  const isRegisterStep4 = mode === 'register' && registerStep === 4;
  const isRegisterStep5 = mode === 'register' && registerStep === 5;
  const showAnimationStep = true;

  const renderAnimation = () => {
    if (mode === 'login') return <LoginAnimation />;
    switch (registerStep) {
      case 1: return <WelcomeAnimation />;
      case 2: return <CyberSecurityAnimation />;
      case 3: return <MobileAnimation />;
      case 4: return <PasswordAnimation />;
      case 5: return <ReferralAnimation />;
      default: return null;
    }
  };

  const getStepTitle = () => {
    switch (registerStep) {
      case 1: return 'Provide your details';
      case 2: return 'Secure your account';
      case 3: return 'Verify mobile number';
      case 4: return 'Set your password';
      case 5: return 'Referral & Complete';
      default: return '';
    }
  };

  return (
    <div className={`w-full min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden ${showAnimationStep ? 'bg-[#1a1921] px-0 pt-0 justify-start' : 'bg-white dark:bg-slate-950 px-4 py-8 justify-center'}`}>
      
      {showAnimationStep && (
        <div className="flex-shrink-0 w-full flex flex-col items-center max-w-md mx-auto">
          <div className="w-full h-8 bg-white dark:bg-slate-950 z-[60]" />
          <div className="w-full z-0 pb-8 relative">
            {renderAnimation()}
          </div>
        </div>
      )}

      <div className="flex flex-col relative z-20 flex-1 bg-white dark:bg-slate-950 rounded-2xl rounded-b-none px-6 pt-6 pb-6 -mt-12">
        
        {mode === 'login' ? (
          <div className="text-center mb-6 relative z-10 w-full">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Login with your email and password</p>
            <div className="flex space-x-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl">
              <button
                type="button"
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 bg-white dark:bg-slate-800 text-primary dark:text-primary-light shadow-md"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setRegisterStep(1); }}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Registration
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center mb-6 relative z-10 w-full">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Create Account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Step {registerStep} of 5: {getStepTitle()}</p>
          </div>
        )}

      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="z-10 relative overflow-hidden"
          >
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col z-10 relative">
        <div className="overflow-visible">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div key="login-form" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Email <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Password <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`register-step-${registerStep}`} variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                {registerStep === 1 && (
                  <>
                    <div className="grid gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">First Name <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none"
                            placeholder="First Name"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Last Name <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none"
                            placeholder="Last Name"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {registerStep === 2 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Email <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                  </>
                )}

                {registerStep === 3 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Mobile Number <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none"
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                    </div>
                  </>
                )}

                {registerStep === 4 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Password <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Confirm Password <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </>
                )}

                {registerStep === 5 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Referral Code <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <input
                          type="text"
                          name="referralCodeInput"
                          required
                          value={formData.referralCodeInput}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-transparent border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white transition-all shadow-none uppercase tracking-wide font-medium"
                          placeholder="ENTER REFERRAL CODE"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Account Type <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, accountType: 'guardian'})}
                          className={`py-2.5 text-sm rounded-md font-medium border transition-colors ${formData.accountType === 'guardian' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'}`}
                        >
                          Guardian Use
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, accountType: 'child'})}
                          className={`py-2.5 text-sm rounded-md font-medium border transition-colors ${formData.accountType === 'child' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'}`}
                        >
                          Child Use
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 mt-auto pt-6">
          {mode === 'register' && (
            <button
              type="button"
              onClick={() => { 
                setError(''); 
                if (registerStep === 1) {
                  setMode('login');
                } else {
                  setRegisterStep(registerStep - 1); 
                }
              }}
              className="w-28 px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center font-medium shadow-sm hover:shadow-md text-sm"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all disabled:opacity-70 font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-[2px] border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Login to Account
              </>
            ) : registerStep < 5 ? (
              <>
                {showAnimationStep ? 'Next' : 'Continue'}
                <ArrowRight className={`${showAnimationStep ? 'w-4 h-4' : 'w-5 h-5'} ml-2`} />
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Registration
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}


