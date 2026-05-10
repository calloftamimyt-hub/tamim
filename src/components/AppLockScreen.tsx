import React, { useState, useEffect } from "react";
import { ShieldCheck, Fingerprint } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface Props {
  onUnlock: () => void;
  expectedPinBase64: string;
  biometricCredentialId?: string | null;
}

export function AppLockScreen({
  onUnlock,
  expectedPinBase64,
  biometricCredentialId,
}: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (biometricCredentialId) {
      // Auto-trigger biometric on load
      authenticateBiometric();
    }
  }, [biometricCredentialId]);

  const authenticateBiometric = async () => {
    if (!biometricCredentialId) return;
    setIsAuthenticating(true);
    try {
      const rawId = Uint8Array.from(atob(biometricCredentialId), (c) =>
        c.charCodeAt(0),
      );
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [
            {
              type: "public-key" as const,
              id: rawId,
            },
          ],
          userVerification: "required",
          timeout: 60000,
        },
      });
      // success! unlock app
      onUnlock();
    } catch (e) {
      console.error(e);
      // Don't show error, just let them use PIN
    } finally {
      setIsAuthenticating(false);
    }
  };

  const setupBiometric = async () => {
    if (!auth.currentUser) return;
    setIsAuthenticating(true);
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
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          "twoStep.biometricCredentialId": credentialId,
        });
        onUnlock(); // successfully set up and matched
      }
    } catch (e: any) {
      console.error(e);
      if (e.name === "NotAllowedError") {
        setError(
          language === "bn"
            ? "ব্রাউজার বা ডিভাইস ফিঙ্গারপ্রিন্ট সমর্থন করছে না।"
            : "Biometric setup not allowed on this browser/device.",
        );
      } else {
        setError(
          language === "bn"
            ? "ফিঙ্গারপ্রিন্ট সেটআপ বাতিল করা হয়েছে"
            : "Biometric setup cancelled or unsupported.",
        );
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePress = (num: number) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setError("");

      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const verifyPin = (enteredPin: string) => {
    const enteredBase64 = btoa(enteredPin);
    if (enteredBase64 === expectedPinBase64) {
      onUnlock();
    } else {
      setError(
        language === "bn"
          ? "ভুল পিন। আবার চেষ্টা করুন।"
          : "Incorrect PIN. Try again.",
      );
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin("");
      }, 500);
    }
  };

  const renderDots = () => {
    return (
      <motion.div
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center gap-4 my-10"
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < pin.length
                ? "bg-blue-600 dark:bg-blue-500 scale-110"
                : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto mt-10">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold dark:text-white mb-2">
          {language === "bn" ? "অ্যাপ লক করা" : "App Locked"}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center">
          {language === "bn"
            ? "অ্যাপ ব্যবহার করতে আপনার পিন দিন"
            : "Enter your PIN to access the app"}
        </p>
        {renderDots()}
        {error && (
          <p className="text-red-500 text-center font-medium mb-6">{error}</p>
        )}
        {!error && <div className="h-6 mb-6" />} {/* Spacer */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num)}
              className="w-20 h-20 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-3xl font-medium active:scale-95 transition-all text-slate-900 dark:text-white"
            >
              {num}
            </button>
          ))}
          {isBiometricSupported ? (
            <button
              onClick={
                biometricCredentialId ? authenticateBiometric : setupBiometric
              }
              className={`w-20 h-20 rounded-full flex items-center justify-center font-medium active:scale-95 transition-all
                ${
                  isAuthenticating
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 opacity-50"
                    : "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
            >
              <Fingerprint
                className={`w-8 h-8 ${isAuthenticating ? "animate-pulse" : ""}`}
              />
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => handlePress(0)}
            className="w-20 h-20 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-3xl font-medium active:scale-95 transition-all text-slate-900 dark:text-white"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-20 h-20 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-2xl font-medium active:scale-95 transition-all text-slate-600 dark:text-slate-400"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
