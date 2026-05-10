import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useLanguage } from "../../contexts/LanguageContext";

interface Props {
  onBack: () => void;
}

export function TwoStepVerificationView({ onBack }: Props) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"status" | "setup-pin" | "confirm-pin">(
    "status",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { language } = useLanguage();

  useEffect(() => {
    loadSettings();
    window.dispatchEvent(new CustomEvent("hide-nav", { detail: true }));

    // Check biometric support
    if (
      window.PublicKeyCredential &&
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
    ) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(
        (supported) => {
          setIsBiometricSupported(supported);
        },
      );
    }

    return () => {
      window.dispatchEvent(new CustomEvent("hide-nav", { detail: false }));
    };
  }, []);

  const loadSettings = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().twoStep?.enabled) {
        setIsEnabled(true);
        if (snap.data().twoStep?.biometricCredentialId) {
          setBiometricEnabled(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = () => {
    setStep("setup-pin");
    setPin("");
    setConfirmPin("");
    setError("");
  };

  const handleDisable = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        "twoStep.enabled": false,
        "twoStep.pin": null,
        "twoStep.biometricCredentialId": null,
      });
      setIsEnabled(false);
      setBiometricEnabled(false);
    } catch (err) {
      setError(
        language === "bn" ? "বন্ধ করতে ব্যর্থ হয়েছে" : "Failed to disable",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBiometric = async () => {
    if (!auth.currentUser) return;
    setError("");

    if (biometricEnabled) {
      // Disable biometric
      setIsLoading(true);
      try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          "twoStep.biometricCredentialId": null,
        });
        setBiometricEnabled(false);
      } catch (err) {
        setError(
          language === "bn" ? "বন্ধ করতে ব্যর্থ হয়েছে" : "Failed to disable",
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Enable biometric
      try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);

        const pubKeyCredParams = [
          { type: "public-key" as const, alg: -7 },
          { type: "public-key" as const, alg: -257 },
        ];

        const credential = (await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "Islamic App" },
            user: {
              id: userId,
              name: auth.currentUser?.email || "user@example.com",
              displayName: auth.currentUser?.displayName || "User",
            },
            pubKeyCredParams,
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
          },
        })) as PublicKeyCredential | null;

        if (credential) {
          const credentialId = btoa(
            String.fromCharCode(...new Uint8Array(credential.rawId)),
          );
          setIsLoading(true);
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            "twoStep.biometricCredentialId": credentialId,
          });
          setBiometricEnabled(true);
        }
      } catch (e: any) {
        console.error(e);
        if (e.name === "NotAllowedError") {
          setError(
            language === "bn"
              ? "ব্রাউজার বা ডিভাইস ফিঙ্গারপ্রিন্ট সমর্থন করছে না। অন্য ট্যাবে অ্যাপটি ওপেন করে দেখুন।"
              : "Biometric setup not allowed. Try opening the app in a new tab.",
          );
        } else {
          setError(
            language === "bn"
              ? "ফিঙ্গারপ্রিন্ট সেটআপ বাতিল করা হয়েছে"
              : "Biometric setup cancelled or unsupported",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSavePin = async () => {
    if (pin.length !== 6 || confirmPin.length !== 6) {
      setError(
        language === "bn" ? "পিন ৬ ডিজিটের হতে হবে" : "PIN must be 6 digits",
      );
      return;
    }
    if (pin !== confirmPin) {
      setError(language === "bn" ? "পিন মিলছে না" : "PINs do not match");
      return;
    }

    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const encodedPin = btoa(pin);
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        twoStep: {
          enabled: true,
          pin: encodedPin,
        },
      });
      setIsEnabled(true);
      setStep("status");
    } catch (err) {
      setError(
        language === "bn" ? "পিন সেভ করতে ব্যর্থ হয়েছে" : "Failed to save PIN",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderKeypad = (value: string, setValue: (v: string) => void) => {
    const handlePress = (num: number) => {
      if (value.length < 6) setValue(value + num);
      setError("");
    };
    const handleDelete = () => {
      setValue(value.slice(0, -1));
      setError("");
    };

    return (
      <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto mt-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num)}
            className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-medium active:scale-95 transition-all text-slate-900 dark:text-white"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePress(0)}
          className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-medium active:scale-95 transition-all text-slate-900 dark:text-white"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-medium active:scale-95 transition-all text-slate-600 dark:text-slate-400"
        >
          ⌫
        </button>
      </div>
    );
  };

  const renderDots = (value: string) => {
    return (
      <div className="flex items-center justify-center gap-3 my-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < value.length
                ? "bg-blue-600 dark:bg-blue-500 scale-110"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading && step === "status") {
    return (
      <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col">
        <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-6 h-6 dark:text-white" />
          </button>
          <div className="font-semibold ml-2 dark:text-white">
            {language === "bn"
              ? "টু-স্টেপ ভেরিফিকেশন"
              : "Two-Step Verification"}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col"
    >
      {/* Back button layer */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe flex items-center">
        <button
          onClick={step === "status" ? onBack : () => setStep("status")}
          className="p-2 -ml-2 rounded-full bg-white/20 backdrop-blur-md dark:bg-slate-900/30 hover:bg-white/40 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full mx-auto flex flex-col bg-slate-50 dark:bg-slate-950">
        {step === "status" && (
          <div className="flex-1 flex flex-col pb-8">
            {/* Hero Section */}
            <div className="relative pt-20 pb-16 px-6 flex flex-col items-center justify-center text-center overflow-hidden rounded-b-[2rem] shadow-sm">
              <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950/20 -z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 to-transparent dark:from-blue-900/20 -z-10" />

              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl dark:bg-blue-600/20 animate-pulse" />
                <div
                  className={`relative w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-xl ${
                    isEnabled
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                      : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                  }`}
                >
                  {isEnabled ? (
                    <ShieldCheck className="w-14 h-14" />
                  ) : (
                    <Shield className="w-14 h-14" />
                  )}

                  {/* Decorative orbital dot */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -inset-1 border-2 border-dashed border-white/30 rounded-full"
                  />
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-3 dark:text-white">
                {language === "bn" ? "অ্যাপ লক" : "App Lock"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-sm text-lg">
                {isEnabled
                  ? language === "bn"
                    ? "আপনার অ্যাপ্লিকেশনটি এখন সম্পূর্ণ সুরক্ষিত।"
                    : "Your application is now fully secured."
                  : language === "bn"
                    ? "পিন এবং ফিঙ্গারপ্রিন্ট দিয়ে আপনার অ্যাপ সুরক্ষিত করুন।"
                    : "Secure your app with a PIN and Fingerprint."}
              </p>
            </div>

            <div className="px-6 -mt-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 backdrop-blur-xl">
                {!isEnabled && (
                  <div className="space-y-6 mb-8">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {language === "bn"
                            ? "অতিরিক্ত নিরাপত্তা"
                            : "Extra Security"}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                          {language === "bn"
                            ? "আপনার আয় এবং ব্যক্তিগত তথ্য সুরক্ষিত রাখুন।"
                            : "Keep your earnings and personal info protected."}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <ShieldAlert className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {language === "bn"
                            ? "নিশ্চিন্ত থাকুন"
                            : "Peace of Mind"}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                          {language === "bn"
                            ? "ফোন আনলক থাকলেও অ্যাপে কেউ ঢুকতে পারবে না।"
                            : "Nobody can enter the app even if your phone is unlocked."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={isEnabled ? handleDisable : handleEnable}
                  className={`w-full py-4 px-6 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                    isEnabled
                      ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25"
                  }`}
                >
                  <span className="text-lg">
                    {isEnabled
                      ? language === "bn"
                        ? "লক বন্ধ করুন"
                        : "Turn Off App Lock"
                      : language === "bn"
                        ? "সুরক্ষা চালু করুন"
                        : "Enable Protection"}
                  </span>
                  {!isEnabled && (
                    <span className="text-sm font-medium text-blue-100">
                      {language === "bn"
                        ? "৬-ডিজিটের পিন সেট আপ করুন"
                        : "Set up a 6-digit PIN"}
                    </span>
                  )}
                </button>

                {isEnabled && isBiometricSupported && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="pr-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          {language === "bn"
                            ? "ফিঙ্গারপ্রিন্ট দিয়ে আনলক"
                            : "Unlock with Fingerprint"}
                          {biometricEnabled && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase">
                              {language === "bn" ? "সক্রিয়" : "Active"}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {language === "bn"
                            ? "পিন এর পরিবর্তে বায়োমেট্রিক বা আঙ্গুলের ছাপ ব্যবহার করুন"
                            : "Use your fingerprint or face to unlock instead of PIN"}
                        </p>
                      </div>
                      <button
                        onClick={handleToggleBiometric}
                        disabled={isLoading}
                        className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors ${
                          biometricEnabled
                            ? "bg-emerald-500"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      >
                        <span className="sr-only">Toggle Biometric</span>
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            biometricEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm mt-3 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">
                        {error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === "setup-pin" && (
          <div className="flex-1 flex flex-col pt-20 px-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold dark:text-white">
                {language === "bn" ? "পিন তৈরি করুন" : "Create a PIN"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                {language === "bn"
                  ? "অ্যাপ সুরক্ষিত করতে ৬-ডিজিটের পিন দিন"
                  : "Enter a 6-digit PIN to secure your app"}
              </p>
            </div>

            {renderDots(pin)}

            {error && (
              <p className="text-red-500 text-center text-sm mb-4">{error}</p>
            )}

            {renderKeypad(pin, (val) => {
              setPin(val);
              if (val.length === 6) {
                setTimeout(() => setStep("confirm-pin"), 300);
              }
            })}
          </div>
        )}

        {step === "confirm-pin" && (
          <div className="flex-1 flex flex-col pt-20 px-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold dark:text-white">
                {language === "bn" ? "পিন নিশ্চিত করুন" : "Confirm PIN"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                {language === "bn"
                  ? "আপনার ৬-ডিজিটের পিন আবার দিন"
                  : "Enter your 6-digit PIN again"}
              </p>
            </div>

            {renderDots(confirmPin)}

            {error && (
              <p className="text-red-500 text-center text-sm mb-4">{error}</p>
            )}

            {renderKeypad(confirmPin, (val) => {
              setConfirmPin(val);
              if (val.length === 6) {
                if (val !== pin) {
                  setError(
                    language === "bn"
                      ? "পিন মিলছে না। আবার চেষ্টা করুন।"
                      : "PINs do not match. Try again.",
                  );
                  setConfirmPin("");
                }
              }
            })}

            <div className="mt-8">
              <button
                onClick={handleSavePin}
                disabled={
                  confirmPin.length !== 6 || isLoading || confirmPin !== pin
                }
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50 transition-all active:scale-95"
              >
                {isLoading
                  ? language === "bn"
                    ? "সেভ হচ্ছে..."
                    : "Saving..."
                  : language === "bn"
                    ? "নিশ্চিত করুন"
                    : "Confirm & Enable"}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
