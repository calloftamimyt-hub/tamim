import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Globe, Palette, Shield, ChevronRight, Trash2, Loader2, Check,
  Lock, Smartphone, UserX, Eye, LogOut, Bell, PlayCircle, Search, Settings2, Moon, Focus, Type, User, Book
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { PrivacySecurityView } from './PrivacySecurity';
import { DataPermissionView } from './DataPermissionView';
import { DeleteAccountView } from './DeleteAccountView';
import { LanguageSelectionView } from './LanguageSelectionView';
import { TwoStepVerificationView } from './TwoStepVerificationView';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface AppSettingsProps {
  onBack: () => void;
}

const STORAGE_KEY = 'islamic_app_settings';

export function AppSettings({ onBack }: AppSettingsProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { language, preference, setLanguage, t } = useLanguage();
  const { 
    themeMode, colorTheme, fontSize, arabicFont, normalFont, 
    setThemeMode, setColorTheme, setFontSize, setArabicFont, setNormalFont 
  } = useTheme();

  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      'auto-location': true,
      'profile-visibility': 'Public',
      'theme': 'System',
      'offline-mode': false,
      'auto-play-video': true,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setSettings(prev => ({
              ...prev,
              ...(data.profileVisibility && { 'profile-visibility': data.profileVisibility }),
              ...(data.commentPermission && { 'comment-permission': data.commentPermission })
            }));
          }
        } catch (error) {
          console.error("Error fetching user settings:", error);
        }
      }
    };
    fetchUserSettings();
    
    const handlePopState = () => {
      if (activeModal) {
        setActiveModal(null);
      } else {
        onBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeModal, onBack]);

  const updateSelectSetting = async (id: string, value: string) => {
    if (id === 'theme-mode') setThemeMode(value as any);
    else if (id === 'app-color-theme') setColorTheme(value as any);
    else if (id === 'arabic-font') setArabicFont(value as any);
    else if (id === 'normal-font') setNormalFont(value as any);
    else if (id === 'font-size') setFontSize(value as any);
    else if (id === 'madhab-selection') {
      localStorage.setItem('islamic_app_madhab', value);
      window.dispatchEvent(new Event('madhab-changed'));
      setSettings(prev => ({ ...prev, [id]: value }));
    } else {
      setSettings(prev => ({ ...prev, [id]: value }));
    }
    
    if ((id === 'profile-visibility' || id === 'comment-permission') && auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          [id === 'profile-visibility' ? 'profileVisibility' : 'commentPermission']: value
        });
      } catch (error) {
        console.error(`Error updating ${id} in Firestore:`, error);
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Are you sure you want to logout?')) {
        try {
            await signOut(auth);
            onBack();
        } catch (error) {
            console.error("Logout failed", error);
        }
    }
  };

  const OptionRow = ({ title, value, description, options, onSelect, icon: Icon, isLanguage }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="flex flex-col">
        <button 
          onClick={() => {
            if (isLanguage) {
               window.history.pushState({ modal: 'language-selection' }, '');
               setActiveModal('language-selection-view');
            } else {
               setIsOpen(!isOpen);
            }
          }}
          className="w-full py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left"
        >
          <div className="flex items-center gap-4 flex-1 pr-4">
            {Icon && (
              <Icon className="w-7 h-7 text-slate-800 dark:text-slate-200 stroke-[1.5px] shrink-0" />
            )}
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 text-[17px]">{title}</h4>
              {(description || value) && (
                <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                  {description || (isLanguage ? value : (value || 'Select option'))}
                </p>
              )}
            </div>
          </div>
        </button>
        
        {isOpen && !isLanguage && (
          <div className="bg-slate-50 dark:bg-slate-800/30 p-2 mb-2 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-100 dark:border-slate-800">
            {options.map((opt: any) => {
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const isSelected = value === optValue;
              
              return (
                <button
                  key={optValue}
                  onClick={() => {
                    onSelect(optValue);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                    isSelected 
                      ? "bg-primary/5 border-primary/20 text-primary dark:bg-primary-dark/10 dark:border-primary-dark/30 dark:text-primary-light" 
                      : "bg-white border-slate-200 text-slate-700 hover:border-primary/30 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  )}
                >
                  <span className="font-medium text-sm">{optLabel}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary dark:text-primary-light" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const ActionRow = ({ title, description, onClick, icon: Icon, customIcon }: any) => (
    <button 
      onClick={onClick}
      className="w-full py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left"
    >
      <div className="flex items-center gap-4 flex-1 pr-4">
        {Icon && (
          <Icon className="w-7 h-7 text-slate-800 dark:text-slate-200 stroke-[1.5px] shrink-0" />
        )}
        <div className="flex flex-col justify-center">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 text-[17px]">{title}</h4>
          {description && <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{description}</p>}
        </div>
      </div>
      {customIcon}
    </button>
  );

  const ToggleRow = ({ icon: Icon, title, description, isActive, onClick }: any) => (
    <button 
      onClick={onClick}
      className="w-full py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-left"
    >
      <div className="flex items-center gap-4 flex-1 pr-4">
        {Icon && (
          <Icon className="w-7 h-7 text-slate-800 dark:text-slate-200 stroke-[1.5px] shrink-0" />
        )}
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100 text-[17px]">{title}</h4>
          {description && <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">{description}</p>}
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-colors border ${isActive ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'}`}>
        <motion.div 
          layout
          className={`w-4 h-4 rounded-full bg-white shadow-sm ${isActive ? 'ml-auto' : ''}`}
        />
      </div>
    </button>
  );

  const Section = ({ title, description, children }: any) => (
    <div className="flex flex-col px-4 pt-5 pb-1">
      <div className="mb-1">
        <h3 className="text-[20px] sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  );

  const translateTheme = (v: string) => {
    if (v === 'Light') return t('light-mode' as any) || 'Light';
    if (v === 'Dark') return t('dark-mode' as any) || 'Dark';
    if (v === 'System') return t('system-mode' as any) || 'System';
    return v;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans relative">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-3 pt-safe pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
            <ArrowLeft className="w-6 h-6 stroke-[2px] text-slate-800 dark:text-slate-200" />
          </button>
          <h1 className="text-[20px] font-bold text-slate-900 dark:text-white ml-2">
            {language === 'bn' ? 'সেটিংস' : 'Settings & privacy'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Search className="w-6 h-6 stroke-[2px] text-slate-800 dark:text-slate-200" />
          </button>
          {auth.currentUser?.photoURL ? (
            <img src={auth.currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full pb-24">
        
        <Section title={language === 'bn' ? 'প্রেফারেন্স' : 'Preferences'} description={language === 'bn' ? 'আপনার ফেসবুক এবং অ্যাপ ব্যবহারের অভিজ্ঞতা কাস্টমাইজ করুন।' : 'Customize your experience on the app.'}>
          <OptionRow 
            icon={Globe}
            title={t('select-language' as any) || 'ভাষা নির্বাচন'}
            value={preference === 'auto' ? (t('auto-language' as any) || 'Auto (Device Language)') : preference === 'bn' ? 'বাংলা' : 'English'}
            isLanguage={true}
          />
          <OptionRow 
            icon={Book}
            title="মাযহাব (Madhab)"
            value={localStorage.getItem('islamic_app_madhab') || 'Shafi'}
            options={['Hanafi', 'Maliki', 'Shafi', 'Hanbali']}
            onSelect={(v: string) => updateSelectSetting('madhab-selection', v)}
          />
          <OptionRow 
            icon={Moon}
            title={t('dark-light-mode')}
            value={themeMode}
            options={[
              { label: translateTheme('Light'), value: 'Light' },
              { label: translateTheme('Dark'), value: 'Dark' },
              { label: translateTheme('System'), value: 'System' }
            ]}
            onSelect={(v: string) => updateSelectSetting('theme-mode', v)}
          />
          <OptionRow 
            icon={Palette}
            title={t('app-color-theme')}
            value={colorTheme}
            options={['Green', 'Blue', 'Gold', 'Dark Green']}
            onSelect={(v: string) => updateSelectSetting('app-color-theme', v)}
          />
          <OptionRow 
            icon={Type}
            title="সাধারণ ফন্ট (বাংলা/ইংরেজি)"
            value={normalFont}
            options={['Bengali', 'Inter', 'Roboto']}
            onSelect={(v: string) => updateSelectSetting('normal-font', v)}
          />
          <OptionRow 
            icon={Type}
            title="আরবি ফন্ট (কুরআনের জন্য)"
            value={arabicFont}
            options={['Amiri', 'Scheherazade', 'Traditional']}
            onSelect={(v: string) => updateSelectSetting('arabic-font', v)}
          />
          <OptionRow 
            icon={Settings2}
            title={t('font-size')}
            value={fontSize}
            options={['Small', 'Medium', 'Large']}
            onSelect={(v: string) => updateSelectSetting('font-size', v)}
          />
          <ToggleRow 
              icon={PlayCircle}
              title={language === 'bn' ? "মিডিয়া" : "Media"}
              isActive={settings['auto-play-video'] !== false}
              onClick={() => {
                 const newValue = settings['auto-play-video'] === false ? true : false;
                 setSettings(prev => ({ ...prev, 'auto-play-video': newValue }));
              }}
          />
          <ToggleRow 
              icon={Bell}
              title={language === 'bn' ? "নোটিফিকেশন" : "Notifications"}
              isActive={notificationsEnabled}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          />
        </Section>

        <div className="h-[6px] w-full bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800" />

        <Section title={language === 'bn' ? 'টুলস ও রিসোর্স' : 'Tools and resources'} description={language === 'bn' ? 'আমাদের টুলস আপনার প্রাইভেসি নিয়ন্ত্রণ করতে সাহায্য করে।' : 'Our tools help you control and manage your privacy.'}>
            <ActionRow 
              title={language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
              onClick={() => {}}
              icon={Lock}
            />
            <ActionRow 
              title={language === 'bn' ? 'টু-স্টেপ ভেরিফিকেশন' : 'Two-Step Verification'}
              onClick={() => {
                window.history.pushState({ modal: 'two-step' }, '');
                setActiveModal('two-step-view');
              }}
              icon={Smartphone}
            />
            <ActionRow 
              title={language === 'bn' ? 'ব্লকড ইউজার্স' : 'Blocked Users'}
              onClick={() => {}}
              icon={UserX}
            />
            <ActionRow 
              title={language === 'bn' ? 'প্রোফাইল ভিজিবিলিটি' : 'Profile Visibility'}
              onClick={() => {}}
              icon={Eye}
            />
            <ActionRow 
              title={t('privacy-policy')}
              onClick={() => {
                window.history.pushState({ modal: 'privacy' }, '');
                setActiveModal('privacy-security-view');
              }}
              icon={Shield}
            />
            <ActionRow 
              title={t('terms-conditions')}
              onClick={() => {
                 window.history.pushState({ modal: 'terms' }, '');
                 setActiveModal('terms-view');
              }}
              icon={Shield}
            />
            <ActionRow 
              title={t('data-permission-control')}
              onClick={() => {
                 window.history.pushState({ modal: 'data' }, '');
                 setActiveModal('data-permission-view');
              }}
              icon={Settings2}
            />
            <ActionRow 
              title={t('account-delete')}
              onClick={() => {
                 window.history.pushState({ modal: 'delete' }, '');
                 setActiveModal('delete-account-view');
              }}
              icon={Trash2}
            />
        </Section>

        <div className="h-[6px] w-full bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800" />

        <div className="flex flex-col px-4 pt-4 pb-6">
          <button 
              onClick={handleLogout}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold mt-2 py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
              {language === 'bn' ? 'লগআউট করুন' : 'Log out'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col pt-safe-top"
          >
            {activeModal === 'privacy-security-view' && <PrivacySecurityView type="privacy" onBack={() => window.history.back()} />}
            {activeModal === 'terms-view' && <PrivacySecurityView type="terms" onBack={() => window.history.back()} />}
            {activeModal === 'data-permission-view' && <DataPermissionView settings={settings} onToggle={() => {}} onBack={() => window.history.back()} />}
            {activeModal === 'delete-account-view' && <DeleteAccountView onBack={() => window.history.back()} />}
            {activeModal === 'language-selection-view' && <LanguageSelectionView onBack={() => window.history.back()} />}
            {activeModal === 'two-step-view' && <TwoStepVerificationView onBack={() => window.history.back()} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
