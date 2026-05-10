import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Store, Coins, AlertCircle, Heart, Coffee, Crown, Rocket, Gem, Check, Flower } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, runTransaction, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const GIFTS = [
  { id: 'rose', name_en: 'Rose', name_bn: 'গোলাপ', price: 0.01, icon: Flower, color: 'text-rose-500' },
  { id: 'coffee', name_en: 'Coffee', name_bn: 'কফি', price: 0.02, icon: Coffee, color: 'text-amber-700' },
  { id: 'crown', name_en: 'Crown', name_bn: 'মুকুট', price: 0.03, icon: Crown, color: 'text-yellow-500' },
  { id: 'heart', name_en: 'Heart', name_bn: 'হার্ট', price: 0.04, icon: Heart, color: 'text-pink-500', fill: true },
  { id: 'rocket', name_en: 'Rocket', name_bn: 'রকেট', price: 0.05, icon: Rocket, color: 'text-blue-500' },
  { id: 'diamond', name_en: 'Diamond', name_bn: 'হীরা', price: 0.10, icon: Gem, color: 'text-cyan-400' },
];

export function ShopModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { language } = useLanguage();
    const [depositBalance, setDepositBalance] = useState(0);
    const [selectedGift, setSelectedGift] = useState<any>(null);
    const [buyQuantity, setBuyQuantity] = useState(10);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !auth.currentUser) return;

        const unsub = onSnapshot(doc(db, 'user_balances', auth.currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                setDepositBalance(docSnap.data().depositBalance || 0);
            }
        });

        return () => unsub();
    }, [isOpen]);

    const handlePurchase = async () => {
        if (!selectedGift || !auth.currentUser || buyQuantity < 10) return;
        
        const totalCost = selectedGift.price * buyQuantity;
        if (depositBalance < totalCost) {
            setErrorMsg(language === 'bn' ? 'আপনার ডিপোজিট ব্যালেন্সে পর্যাপ্ত টাকা নেই!' : 'Insufficient deposit balance!');
            setTimeout(() => setErrorMsg(null), 3000);
            return;
        }

        setIsPurchasing(true);
        setErrorMsg(null);

        try {
            const userId = auth.currentUser.uid;
            const balanceRef = doc(db, 'user_balances', userId);
            
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(balanceRef);
                if (!userDoc.exists()) throw new Error("Balance document does not exist");
                
                const currentDeposit = userDoc.data().depositBalance || 0;
                if (currentDeposit < totalCost) throw new Error("Insufficient deposit balance");
                
                transaction.update(balanceRef, {
                    depositBalance: increment(-totalCost),
                    updatedAt: serverTimestamp()
                });

                // Update user inventory
                const inventoryRef = doc(db, `user_inventories/${userId}/items`, selectedGift.id);
                const inventorySnap = await transaction.get(inventoryRef);
                
                if (inventorySnap.exists()) {
                    transaction.update(inventoryRef, {
                        quantity: increment(buyQuantity),
                        updatedAt: serverTimestamp()
                    });
                } else {
                    transaction.set(inventoryRef, {
                        id: selectedGift.id,
                        name: language === 'bn' ? selectedGift.name_bn : selectedGift.name_en,
                        quantity: buyQuantity,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
                
                // Add to transaction history
                const historyRef = doc(collection(db, `users/${userId}/earning_history`));
                transaction.set(historyRef, {
                    userId: userId,
                    type: `Gift Purchase: ${selectedGift.name_en} x${buyQuantity}`,
                    amount: -totalCost,
                    status: 'approved',
                    createdAt: serverTimestamp()
                });
            });

            setPurchaseSuccess(language === 'bn' ? 'সফলভাবে কেনা হয়েছে!' : 'Successfully purchased!');
            setTimeout(() => {
                setPurchaseSuccess(null);
                setSelectedGift(null);
            }, 2000);
        } catch (error) {
            console.error("Purchase error:", error);
            setErrorMsg(language === 'bn' ? 'কেনাকাটা ব্যর্থ হয়েছে!' : 'Purchase failed!');
            setTimeout(() => setErrorMsg(null), 3000);
        } finally {
            setIsPurchasing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed inset-0 z-[400] bg-white dark:bg-slate-950 flex flex-col"
            >
                <header className="sticky top-0 z-[401] bg-white dark:bg-slate-950 px-3 pt-safe pb-2 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center">
                        <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
                            <ArrowLeft className="w-6 h-6 stroke-[2.5px] text-slate-800 dark:text-slate-200" />
                        </button>
                        <h1 className="text-[20px] font-bold text-slate-900 dark:text-white ml-2 tracking-tight">
                            {language === 'bn' ? 'শপ (Shop)' : 'Gift Shop'}
                        </h1>
                    </div>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <Coins className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="font-bold text-slate-900 dark:text-white">৳ {depositBalance.toFixed(2)}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto w-full p-4 bg-slate-50 dark:bg-slate-950 font-sans relative">
                    
                    {errorMsg && (
                        <div className="mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex items-center text-red-600 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                            <p className="text-sm font-medium">{errorMsg}</p>
                        </div>
                    )}

                    {purchaseSuccess && (
                        <div className="mb-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl p-3 flex items-center text-green-600 dark:text-green-400">
                            <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center mr-2 shrink-0 text-xs text-center leading-none">✓</div>
                            <p className="text-sm font-medium">{purchaseSuccess}</p>
                        </div>
                    )}

                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-md">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-xl font-bold">{language === 'bn' ? 'গিফট শপ' : 'Gift Shop'}</h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    {language === 'bn' ? 'আপনার ডিপোজিট ব্যালেন্স ব্যবহার করে গিফট কিনুন এবং কন্টেন্ট ক্রিয়েটরদের দিন।' : 'Buy gifts using your deposit balance and send them to creators.'}
                                </p>
                            </div>
                            <Store className="w-12 h-12 text-blue-200 opacity-80" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-12">
                        {GIFTS.map((gift) => (
                            <div key={gift.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                                <motion.div 
                                    animate={{ 
                                        y: [0, -6, 0],
                                    }}
                                    transition={{ 
                                        duration: 3, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                    }}
                                    className="w-16 h-16 flex items-center justify-center mb-3"
                                >
                                    <gift.icon className={cn("w-12 h-12", gift.color, gift.fill && "fill-current")} />
                                </motion.div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[15px] mb-1">
                                    {language === 'bn' ? gift.name_bn : gift.name_en}
                                </h3>
                                <div className="flex items-center text-primary font-bold mb-3">
                                    <span className="text-[14px]">৳ {gift.price}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedGift(gift);
                                        setBuyQuantity(10);
                                    }}
                                    className="w-full py-2 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl text-[13px] font-bold active:scale-95 transition-transform"
                                >
                                    {language === 'bn' ? 'কিনুন' : 'Buy Now'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {selectedGift && (
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="fixed inset-0 z-[430] bg-white dark:bg-slate-950 flex flex-col"
                        >
                            <header className="p-4 pt-safe flex items-center border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <button onClick={() => setSelectedGift(null)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-white" />
                                </button>
                                <h1 className="text-[18px] font-bold text-slate-900 dark:text-white ml-2">
                                    {language === 'bn' ? selectedGift.name_bn : selectedGift.name_en} {language === 'bn' ? 'কিনুন' : 'Purchase'}
                                </h1>
                            </header>

                            <div className="flex-1 flex flex-col items-center justify-center px-6">
                                <motion.div 
                                    animate={{ 
                                        y: [0, -10, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ 
                                        duration: 4, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                    }}
                                    className="w-32 h-32 flex items-center justify-center mb-8"
                                >
                                    <selectedGift.icon className={cn("w-24 h-24", selectedGift.color, selectedGift.fill && "fill-current")} />
                                </motion.div>

                                <h2 className="text-[28px] font-black text-slate-900 dark:text-white mb-2">
                                    {language === 'bn' ? selectedGift.name_bn : selectedGift.name_en}
                                </h2>
                                <p className="text-slate-500 font-medium mb-10">
                                    {language === 'bn' ? 'প্রতিটি গিফটের দামঃ' : 'Price per gift:'} ৳{selectedGift.price}
                                </p>

                                <div className="w-full max-w-[300px] mb-10">
                                    <label className="block text-center text-[13px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                                        {language === 'bn' ? 'পরিমাণ সেট করুন (মিনিমাম ১০)' : 'SET QUANTITY (MIN 10)'}
                                    </label>
                                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/50 backdrop-blur-md p-1.5 rounded-[20px] border border-slate-200 dark:border-slate-800">
                                        <button 
                                            onClick={() => setBuyQuantity(Math.max(10, buyQuantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center text-[24px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number" 
                                            value={buyQuantity || ''}
                                            placeholder="0"
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setBuyQuantity(isNaN(val) ? 0 : val);
                                            }}
                                            className="bg-transparent text-center text-[26px] font-black text-slate-900 dark:text-white w-24 outline-none"
                                        />
                                        <button 
                                            onClick={() => setBuyQuantity((buyQuantity || 0) + 1)}
                                            className="w-12 h-12 flex items-center justify-center text-[24px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full max-w-[340px] space-y-5">
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <p className="text-slate-500 font-bold text-sm tracking-wide">{language === 'bn' ? 'মোট খরচঃ' : 'TOTAL COST'}</p>
                                        <p className="text-[22px] font-black text-primary">৳{(selectedGift.price * (buyQuantity || 0)).toFixed(2)}</p>
                                    </div>
                                    
                                    <button 
                                        disabled={(buyQuantity || 0) < 10 || isPurchasing}
                                        onClick={handlePurchase}
                                        className={cn(
                                            "w-full py-3.5 rounded-full font-black text-[16px] transition-all active:scale-[0.98] shadow-lg",
                                            (buyQuantity || 0) >= 10 
                                                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-slate-900/20 dark:shadow-white/10" 
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        )}
                                    >
                                        {isPurchasing 
                                            ? (language === 'bn' ? 'প্রসেসিং...' : 'Processing...') 
                                            : (language === 'bn' ? 'কনফার্ম করুন' : 'Confirm Purchase')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {purchaseSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed inset-0 z-[500] flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 text-center max-w-[300px] shadow-2xl">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400 stroke-[3px]" />
                                </div>
                                <h3 className="text-[22px] font-black text-slate-900 dark:text-white mb-2">
                                    {language === 'bn' ? 'সফল হয়েছে!' : 'Success!'}
                                </h3>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    {language === 'bn' ? 'আপনার গিফট সফলভাবে কেনা হয়েছে।' : 'Your gifts have been purchased successfully.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </AnimatePresence>
    );
}
