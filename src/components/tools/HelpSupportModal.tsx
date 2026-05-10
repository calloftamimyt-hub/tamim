import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Image as ImageIcon, Send, ShieldCheck, Mail, MessageSquare, AlertCircle, Camera, CheckCircle2, ChevronLeft } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...selectedFiles].slice(0, 5)); // Limit to 5 max
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && images.length === 0) {
      setError(language === 'bn' ? 'দয়া করে একটি মেসেজ লিখুন বা ছবি আপলোড করুন' : 'Please provide a message or upload photos');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      let botToken = '8577168806:AAEvPksc7qHSYmr0wzE7DwHQeglzOUZZn5U'; // fallback
      let chatId = '-1002647379129'; // fallback

      // Try to get from settings
      try {
        const settingsSnap = await getDocs(query(collection(db, 'settings'), limit(1)));
        if (!settingsSnap.empty) {
          const settingsObj = settingsSnap.docs[0].data();
          if (settingsObj.telegramBotToken) botToken = settingsObj.telegramBotToken;
          if (settingsObj.telegramChatId) chatId = settingsObj.telegramChatId;
        }
      } catch (e) {
        console.warn("Could not fetch settings:", e);
      }

      const user = auth.currentUser;
      const userEmail = user?.email || 'Unknown User';
      const userUid = user?.uid || 'No UID';
      
      const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      const safeMessage = escapeHtml(message || 'No text message provided');
      
      const caption = `<b>🆘 Help & Support Request</b>\n\n<b>User:</b> ${userEmail}\n<b>UID:</b> <code>${userUid}</code>\n\n<b>Message:</b>\n${safeMessage}`;

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('photo', images[i]);
          
          if (i === 0) {
            formData.append('caption', caption);
            formData.append('parse_mode', 'HTML');
          }

          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error('Telegram API Error');
          }
        }
      } else {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: caption,
            parse_mode: 'HTML'
          })
        });

        if (!response.ok) {
          throw new Error('Telegram API Error');
        }
      }

      setSuccess(true);
      setMessage('');
      setImages([]);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);

    } catch (err: any) {
      console.error("Support submission error:", err);
      setError(language === 'bn' ? 'সাপোর্ট রিকোয়েস্ট পাঠানো যায়নি। আবার চেষ্টা করুন।' : 'Failed to send support request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[500] bg-white dark:bg-[#020617] flex flex-col overflow-hidden will-change-transform"
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 sticky top-0 z-10">
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
              {language === 'bn' ? 'সাহায্য ও সাপোর্ট' : 'Help & Support'}
            </h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto w-full pb-24">
            {/* Hero Section */}
            <div className="px-6 py-10 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-[#020617] border-b border-black/5 dark:border-white/5">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 rotate-3">
                  <MessageSquare className="w-8 h-8 text-white -rotate-3" />
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2 text-center tracking-tight">
                  {language === 'bn' ? 'আমরা কীভাবে সাহায্য করতে পারি?' : 'How can we help you?'}
                </h2>
                <p className="text-[15px] text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed">
                  {language === 'bn' 
                    ? 'আপনার সমস্যা বা মতামত আমাদের জানান। আমাদের সাপোর্ট টিম দ্রুত আপনার সাথে যোগাযোগ করবে।' 
                    : 'Tell us about your issue or feedback. Our support team will review and get back to you.'}
                </p>
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <ShieldCheck className="w-32 h-32 text-blue-500" />
                </div>
            </div>

            <div className="p-4 max-w-2xl mx-auto w-full">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-6 flex flex-col items-center text-center mt-8"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-400 mb-2">
                    {language === 'bn' ? 'মেসেজ পাঠানো হয়েছে!' : 'Message Sent!'}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-500/80">
                    {language === 'bn' 
                      ? 'ধন্যবাদ! আপনার সাপোর্ট রিকোয়েস্টটি আমাদের টিমের কাছে পৌঁছেছে।' 
                      : 'Thank you! Your support request has been successfully delivered to our team.'}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1">
                      {language === 'bn' ? 'বিস্তারিত লিখুন' : 'Describe the issue'}
                    </label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার সমস্যা বা প্রশ্নটি এখানে বিস্তারিত লিখুন...' : 'Write your issue or question in detail here...'}
                      className="w-full h-40 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-[15px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1">
                      {language === 'bn' ? 'স্ক্রিনশট বা ছবি (ঐচ্ছিক)' : 'Screenshots or Photos (Optional)'}
                    </label>
                    
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                        <AnimatePresence>
                          {images.map((img, i) => (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              key={i} 
                              className="aspect-square rounded-xl overflow-hidden relative group border border-slate-200 dark:border-slate-800"
                            >
                              <img src={URL.createObjectURL(img)} alt={`upload-${i}`} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                    />

                    {images.length < 5 && (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-6 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-[0.98]"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photos'}
                        </span>
                      </button>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-4"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {language === 'bn' ? 'রিকোয়েস্ট পাঠান' : 'Send Request'}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[12px] font-medium text-slate-400 mt-6 pb-6">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {language === 'bn' 
                      ? 'আপনার সকল তথ্য নিরাপদ ও প্রাইভেট' 
                      : 'Your information is secure and private'}
                  </div>

                </form>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
