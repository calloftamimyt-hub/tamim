import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Shield, Smartphone, Activity, Link as LinkIcon, Mail, CheckCircle2, Copy, Bell, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { getTelegramLink, verifyTelegramConnection } from '../../lib/telegram';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface GuardianControlViewProps {
  onBack: () => void;
}

export const GuardianControlView = ({ onBack }: GuardianControlViewProps) => {
  const { language } = useLanguage();
  const [role, setRole] = useState<'guardian' | 'child' | null>(null);
  const [pairingCode, setPairingCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [linkedDevices, setLinkedDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [emailConfig, setEmailConfig] = useState('');
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [isTelegramEnabled, setIsTelegramEnabled] = useState(false);
  const [verifyingTelegram, setVerifyingTelegram] = useState(false);
  const [verifyCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [localNotifications, setLocalNotifications] = useState<any[]>([]);

  const currentUser = auth.currentUser;

  useEffect(() => {
    // Load local notifications from storage
    const stored = localStorage.getItem('guardian_local_notifications');
    if (stored) {
      try {
        setLocalNotifications(JSON.parse(stored));
      } catch (e) {}
    }

    if (Capacitor.isNativePlatform()) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      const addListener = async () => {
        await PushNotifications.addListener('pushNotificationReceived', notification => {
          setLocalNotifications(prev => {
            const newNotifs = [{ id: new Date().getTime(), title: notification.title, body: notification.body, time: new Date().toISOString() }, ...prev];
            localStorage.setItem('guardian_local_notifications', JSON.stringify(newNotifs));
            return newNotifs;
          });
        });
      };
      
      addListener();

      return () => {
        PushNotifications.removeAllListeners();
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Load user role and linked status
    const loadStatus = async () => {
      try {
        const docRef = doc(db, 'parental_controls', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRole(data.role || null);
          if (data.role === 'child' && data.pairingCode) {
            setPairingCode(data.pairingCode);
          }
          if (data.role === 'guardian') {
            setIsEmailEnabled(data.emailAlerts || false);
            setEmailConfig(data.guardianEmail || currentUser.email || '');
            setIsTelegramEnabled(data.telegramAlerts || false);
            setTelegramChatId(data.telegramChatId || '');
            // Subscribe to linked children
            const q = query(collection(db, 'parental_controls'), where('guardianId', '==', currentUser.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
              const children = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
              setLinkedDevices(children);
            }, (error) => {
              handleFirestoreError(error, OperationType.LIST, 'parental_controls');
            });
            return () => unsubscribe();
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'parental_controls');
      }
    };
    loadStatus();
  }, [currentUser]);

  const handleSetRole = async (selectedRole: 'guardian' | 'child') => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const code = selectedRole === 'child' ? Math.random().toString(36).substring(2, 8).toUpperCase() : '';
      await setDoc(doc(db, 'parental_controls', currentUser.uid), {
        role: selectedRole,
        pairingCode: code,
        guardianId: null,
        updatedAt: new Date()
      }, { merge: true });
      
      setRole(selectedRole);
      if (code) setPairingCode(code);
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'Error saving role' });
    }
    setLoading(false);
  };

  const linkChildDevice = async () => {
    if (!currentUser || !inputCode) return;
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      // Find child by pairing code
      const q = query(collection(db, 'parental_controls'), where('pairingCode', '==', inputCode.toUpperCase()), where('role', '==', 'child'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const childDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'parental_controls', childDoc.id), {
          guardianId: currentUser.uid,
          guardianEmail: emailConfig,
          emailAlerts: isEmailEnabled,
          telegramChatId: telegramChatId,
          telegramAlerts: isTelegramEnabled,
          updatedAt: new Date()
        });

        await setDoc(doc(db, 'parental_controls', currentUser.uid), {
          guardianEmail: emailConfig,
          emailAlerts: isEmailEnabled,
          telegramChatId: telegramChatId,
          telegramAlerts: isTelegramEnabled,
          updatedAt: new Date()
        }, { merge: true });

        setStatusMsg({ type: 'success', text: language === 'bn' ? 'সফলভাবে যুক্ত হয়েছে!' : 'Successfully linked!' });
        setInputCode('');
      } else {
        setStatusMsg({ type: 'error', text: language === 'bn' ? 'ভুল কোড' : 'Invalid code' });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'parental_controls');
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setStatusMsg({ type: 'success', text: language === 'bn' ? 'কপি হয়েছে' : 'Copied' });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 2000);
  };

  const toggleEmailAlerts = async () => {
    if (!currentUser) return;
    const newState = !isEmailEnabled;
    setIsEmailEnabled(newState);
    if (role === 'guardian') {
      await setDoc(doc(db, 'parental_controls', currentUser.uid), {
        emailAlerts: newState,
        guardianEmail: emailConfig
      }, { merge: true });
    }
  };

  const toggleTelegramAlerts = async () => {
    if (!currentUser) return;
    const newState = !isTelegramEnabled;
    setIsTelegramEnabled(newState);
    if (role === 'guardian') {
      await setDoc(doc(db, 'parental_controls', currentUser.uid), {
        telegramAlerts: newState,
        telegramChatId: telegramChatId
      }, { merge: true });
    }
  };

  const handleVerifyTelegram = async () => {
    if (!currentUser) return;
    setVerifyingTelegram(true);
    setStatusMsg({ type: '', text: '' });
    
    const chatId = await verifyTelegramConnection(verifyCode);
    if (chatId) {
      setTelegramChatId(chatId);
      setIsTelegramEnabled(true);
      await setDoc(doc(db, 'parental_controls', currentUser.uid), {
        telegramChatId: chatId,
        telegramAlerts: true
      }, { merge: true });
      setStatusMsg({ type: 'success', text: language === 'bn' ? 'টেলিগ্রাম যুক্ত হয়েছে!' : 'Telegram connected!' });
    } else {
      setStatusMsg({ 
        type: 'error', 
        text: language === 'bn' 
          ? 'দুঃখিত, কোনো মেসেজ পাওয়া যায়নি। আবার মেসেজ পাঠিয়ে চেষ্টা করুন।' 
          : 'No message found. Please send the message and try again.' 
      });
    }
    setVerifyingTelegram(false);
  };

  const clearNotifications = () => {
    setLocalNotifications([]);
    localStorage.removeItem('guardian_local_notifications');
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col h-full overflow-hidden">
      <header className="flex items-center p-4 pt-safe bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="text-xl font-bold ml-2 text-slate-800 dark:text-white">
          {language === 'bn' ? 'প্যারেন্টাল কন্ট্রোল' : 'Parental Control'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!role ? (
          <div className="space-y-4 pt-4">
            <h2 className="text-center text-lg font-medium text-slate-700 dark:text-slate-300 mb-6">
              {language === 'bn' ? 'এই ডিভাইসটি কার?' : 'Whose device is this?'}
            </h2>
            
            <button 
              onClick={() => handleSetRole('guardian')}
              className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-6 flex flex-col items-center gap-4 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {language === 'bn' ? 'গার্জিয়ান / পিতা-মাতা' : 'Guardian / Parent'}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  {language === 'bn' ? 'সন্তানের কার্যকলাপ মনিটর করতে চাই' : 'Monitor child activities'}
                </p>
              </div>
            </button>

            <button 
              onClick={() => handleSetRole('child')}
              className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 flex flex-col items-center gap-4 hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {language === 'bn' ? 'সন্তান / শিশু' : 'Child / Ward'}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  {language === 'bn' ? 'এই ডিভাইসে মনিটরিং অন করতে চাই' : 'Enable monitoring on this device'}
                </p>
              </div>
            </button>
          </div>
        ) : role === 'guardian' ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                {language === 'bn' ? 'নতুন ডিভাইস যুক্ত করুন' : 'Link New Device'}
              </h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={language === 'bn' ? 'সন্তানের ডিভাইসের কোড দিন' : 'Enter child device code'}
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 font-mono uppercase"
                />
                <button 
                  onClick={linkChildDevice}
                  disabled={loading || !inputCode}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium disabled:opacity-50"
                >
                  {loading ? '...' : (language === 'bn' ? 'যুক্ত করুন' : 'Link')}
                </button>
              </div>
              {statusMsg.text && (
                <p className={`text-sm mt-2 ${statusMsg.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {statusMsg.text}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
               <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-500" />
                {language === 'bn' ? 'টেলিগ্রাম এলার্ট' : 'Telegram Alerts'}
              </h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600 dark:text-slate-300 text-sm">
                  {language === 'bn' ? 'টেলিগ্রামে সরাসরি রিপোর্ট পান (সম্পূর্ণ ফ্রি)' : 'Get reports directly in Telegram (100% Free)'}
                </span>
                <button 
                  onClick={toggleTelegramAlerts}
                  className={`w-12 h-7 rounded-full transition-colors relative ${isTelegramEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${isTelegramEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              
              {isTelegramEnabled && (
                <div className="space-y-3">
                  {!telegramChatId ? (
                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 border border-sky-100 dark:border-sky-900/30">
                      <p className="text-sm text-sky-800 dark:text-sky-300 mb-3">
                        {language === 'bn' ? 'টেলিগ্রাম যুক্ত করতে নিচের লিংকে ক্লিক করুন এবং স্টার্ট (Start) বাটনে চাপ দিন বা মেসেজটি সেন্ড করুন।' : 'To connect Telegram, click the link below and press Start or send the message.'}
                      </p>
                      
                      <a 
                        href={getTelegramLink(verifyCode)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-4 py-2.5 rounded-xl font-medium transition-colors mb-3"
                      >
                        <Send className="w-4 h-4" />
                        {language === 'bn' ? 'টেলিগ্রাম ওপেন করুন' : 'Open Telegram'}
                      </a>

                      <button 
                        onClick={handleVerifyTelegram}
                        disabled={verifyingTelegram}
                        className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                      >
                        {verifyingTelegram 
                          ? (language === 'bn' ? 'চেক করা হচ্ছে...' : 'Verifying...') 
                          : (language === 'bn' ? 'মেসেজ পাঠিয়েছি, ভেরিফাই করুন' : 'I sent the message, Verify')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        {language === 'bn' ? 'টেলিগ্রাম যুক্ত আছে' : 'Telegram Connected'}
                      </div>
                      <button 
                        onClick={() => { setTelegramChatId(''); setIsTelegramEnabled(false); }}
                        className="text-xs text-red-500 hover:text-red-600 underline font-medium"
                      >
                        {language === 'bn' ? 'রিমুভ করুন' : 'Remove'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
               <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                {language === 'bn' ? 'ইমেইল এলার্ট' : 'Email Alerts'}
              </h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600 dark:text-slate-300 text-sm">
                  {language === 'bn' ? 'ডেইলি রিপোর্ট ইমেইলে পান (Fireabase এর মাধ্যমে)' : 'Get daily reports via email'}
                </span>
                <button 
                  onClick={toggleEmailAlerts}
                  className={`w-12 h-7 rounded-full transition-colors relative ${isEmailEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${isEmailEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {isEmailEnabled && (
                <input 
                  type="email" 
                  value={emailConfig}
                  onChange={(e) => setEmailConfig(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm"
                />
              )}
              <p className="text-xs text-slate-500 mt-2">
                {language === 'bn' ? '* ইমেইল নোটিফিকেশন পাঠানোর জন্য আমরা EmailJS বা অন্য কোনো ফ্রি অপশন ব্যবহার করতে পারি।' : '* We can use EmailJS or another free alternative for email notifications.'}
              </p>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white mt-6 mb-2">
              {language === 'bn' ? 'যুক্ত হওয়া ডিভাইসসমূহ' : 'Linked Devices'}
            </h3>
            {linkedDevices.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                {language === 'bn' ? 'কোনো ডিভাইস যুক্ত নেই' : 'No devices linked'}
              </div>
            ) : (
              <div className="space-y-3">
                {linkedDevices.map(device => (
                  <div key={device.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-white">Device: {device.pairingCode}</div>
                        <div className="text-xs text-emerald-500 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> 
                          {language === 'bn' ? 'মনিটরিং চলছে' : 'Monitoring active'}
                        </div>
                      </div>
                    </div>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg">
                      {language === 'bn' ? 'রিপোর্ট দেখুন' : 'View Stats'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Local Notifications View for Guardian */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  {language === 'bn' ? 'অফলাইন নোটিফিকেশন' : 'Offline Notifications'}
                </h3>
                {localNotifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-xs text-red-500 hover:text-red-600 font-medium">
                    {language === 'bn' ? 'সব মুছুন' : 'Clear All'}
                  </button>
                )}
              </div>
              
              {localNotifications.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  {language === 'bn' ? 'কোনো নোটিফিকেশন নেই (এটি লোকাল স্টোরেজে সেভ হয়)' : 'No notifications (saved to local storage)'}
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {localNotifications.map((notif: any) => (
                    <div key={notif.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                      <div className="font-medium text-slate-800 dark:text-white text-sm">{notif.title}</div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">{notif.body}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-2 text-right">
                        {new Date(notif.time).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="h-10" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                <LinkIcon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">
                {language === 'bn' ? 'গার্জিয়ানের সাথে যুক্ত করুন' : 'Link with Guardian'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {language === 'bn' 
                  ? 'নিচের কোডটি গার্জিয়ানের ডিভাইসে দিন। এরপর গার্জিয়ান আপনার ডিভাইসের স্ক্রিন টাইম দেখতে পারবে।' 
                  : 'Enter this code in the Guardian device to allow them to monitor screen time.'}
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <span className="font-mono text-2xl font-bold tracking-widest text-slate-800 dark:text-white">
                  {pairingCode}
                </span>
                <button onClick={copyCode} className="p-2 text-slate-500 hover:text-indigo-600 transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              {statusMsg.text && (
                <p className="text-sm mt-3 text-emerald-500 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {statusMsg.text}
                </p>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-2">
                {language === 'bn' ? 'নজরদারি কীভাবে কাজ করে?' : 'How monitoring works?'}
              </h4>
              <ul className="text-xs text-amber-700 dark:text-amber-500 space-y-2 list-disc pl-4">
                <li>{language === 'bn' ? 'অ্যাপ ব্যবহারের সময় রেকর্ড করা হবে।' : 'App usage time will be recorded.'}</li>
                <li>{language === 'bn' ? 'গার্জিয়ানের কাছে লোকাল পুশ নোটিফিকেশন যাবে।' : 'Local push notifications will be sent to the guardian.'}</li>
                <li>{language === 'bn' ? 'টেলিগ্রাম যুক্ত থাকলে আপনার টেলিগ্রাম অ্যাকাউন্টে মেসেজ যাবে।' : 'If Telegram is connected, reports will be sent directly to your Telegram.'}</li>
                <li>{language === 'bn' ? 'ইমেইল সেট করা থাকলে রিপোর্ট স্বয়ংক্রিয়ভাবে অ্যাপ থেকে ইমেইলে চলে যাবে।' : 'If email is set, reports will be sent directly to the email.'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
