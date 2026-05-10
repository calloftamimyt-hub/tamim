import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export function MonetizationApplicationModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!auth.currentUser) return;
        setSubmitting(true);
        setError(null);
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const rejectionCount = userData.monetizationRejectionCount || 0;
                const lastRejection = userData.monetizationRejectedAt;

                if (rejectionCount >= 3) {
                    setError("আপনার মনিটাইজেশন চিরস্থায়ীভাবে বন্ধ করে দেওয়া হয়েছে। আপনি আর আবেদন করতে পারবেন না।");
                    setSubmitting(false);
                    return;
                }

                if (lastRejection) {
                    const rejectionDate = lastRejection.toDate();
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - rejectionDate.getTime()) / (1000 * 3600 * 24));
                    if (diffDays < 30) {
                        setError(`আপনি ${30 - diffDays} দিন পর আবার আবেদন করতে পারবেন।`);
                        setSubmitting(false);
                        return;
                    }
                }

                // Submit request to monetizationRequests collection
                const requestRef = doc(db, 'monetizationRequests', auth.currentUser.uid);
                await setDoc(requestRef, {
                    userId: auth.currentUser.uid,
                    status: 'pending',
                    appliedAt: serverTimestamp(),
                    followers: userData.followersCount || 0,
                    watchTimeSeconds: userData.watchTimeSeconds || 0
                });

                // Update user status
                await updateDoc(userRef, {
                    monetizationStatus: 'pending'
                });

                setStep(3); // Success
            }
        } catch (err) {
            console.error(err);
            setError("আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                    <h2 className="font-bold text-lg dark:text-white">মনিটাইজেশন আবেদন</h2>
                    <button onClick={onClose} className="p-2 bg-slate-200/50 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">নিয়মাবলী ও শর্তসমূহ</h3>
                            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5 mb-6">
                                <li>আপনার ভিডিও অবশ্যই অরিজিনাল কন্টেন্ট হতে হবে।</li>
                                <li>কোনো কপিরাইট লঙ্ঘন থাকা যাবে না।</li>
                                <li>ভুল বা স্প্যাম ওয়াচ টাইম ব্যবহার করলে আবেদন বাতিল হবে।</li>
                                <li>কমিউনিটি গাইডলাইন ভঙ্গ করলে মনিটাইজেশন যেকোনো সময় বাতিল হতে পারে।</li>
                                <li>আবেদন রিজেক্ট হলে ১ মাস পর আবার আবেদন করতে পারবেন। ৩ বার রিজেক্ট হলে চিরস্থায়ীভাবে মনিটাইজেশন বাতিল হবে।</li>
                            </ul>
                            
                            <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agreed} 
                                    onChange={t => setAgreed(t.target.checked)}
                                    className="mt-1 w-4 h-4 text-primary"
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    আমি মুসলিম সাথীর সমস্ত শর্তাবলী ও নিয়ম মেনে নিচ্ছি।
                                </span>
                            </label>

                            <button 
                                onClick={handleSubmit}
                                disabled={!agreed || submitting}
                                className="w-full mt-6 bg-primary text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "আবেদন জমা দিন"}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">আবেদন সফল হয়েছে!</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                আপনার আবেদনটি রিভিউ করার জন্য পাঠানো হয়েছে। আমরা আপনার একাউন্ট চেক করে দ্রুত আপডেট জানাবো।
                            </p>
                            <button 
                                onClick={onClose}
                                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl"
                            >
                                ঠিক আছে
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
