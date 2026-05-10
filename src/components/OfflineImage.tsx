import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';

const dbPromise = openDB('image-cache-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('images')) {
      db.createObjectStore('images');
    }
  },
});

export const getCachedImage = async (url: string): Promise<string | null> => {
  try {
    const db = await dbPromise;
    return await db.get('images', url);
  } catch (e) {
    return null;
  }
}

export const setCachedImage = async (url: string, base64: string) => {
  try {
    const db = await dbPromise;
    await db.put('images', base64, url);
  } catch (e) {
    // ignore
  }
}

export const saveImageToCache = async (url: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                await setCachedImage(url, base64);
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        return null;
    }
}

interface OfflineImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const OfflineImage: React.FC<OfflineImageProps> = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string>(src);

  useEffect(() => {
    let isMounted = true;
    
    setImgSrc(src);

    const loadImage = async () => {
        if (!src || src.startsWith('data:')) return;
        
        const cached = await getCachedImage(src);
        if (cached && isMounted) {
            setImgSrc(cached);
        }

        if (navigator.onLine) {
            saveImageToCache(src).then(base64 => {
                 if (base64 && isMounted && !cached) {
                    setImgSrc(base64);
                 }
            });
        }
    };

    loadImage();

    return () => { isMounted = false; };
  }, [src]);

  return <img src={imgSrc} alt={alt} {...props} />;
};
