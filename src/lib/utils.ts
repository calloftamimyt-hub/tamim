import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getApiUrl = (path: string) => {
    // If an explicit API URL is provided, use it
    if (import.meta.env.VITE_API_URL) {
       return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}${path}`;
    }

    // If running in Vite Dev server, use relative path (proxied)
    if (import.meta.env.DEV) {
        return path;
    }

    // If in production but deployed on AI Studio domain, use relative path
    const origin = window.location.origin;
    if (origin.includes('.run.app')) {
        return path;
    }

    // Otherwise (like Android Studio WebView context without explicit Capacitor), fallback to the remote backend
    return `https://muslim-sathi-sosal.onrender.com${path}`;
};

export const formatCount = (num: number) => {
  if (!num) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};

export function timeAgo(date: any) {
  if (!date) return 'Just now';
  
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else if (date && typeof date.toDate === 'function') {
    d = date.toDate();
  } else if (date && date.seconds) {
    d = new Date(date.seconds * 1000);
  } else {
    d = new Date(date);
  }

  if (isNaN(d.getTime())) return 'Just now';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return d.toLocaleDateString();
}
