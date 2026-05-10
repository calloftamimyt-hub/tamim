import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/utils";

export const cacheMediaForOffline = async (fileId: string, type: "video" | "photo" = "video", maxItems = 100) => {
  try {
    if (!("caches" in window) || !fileId) return;
    const cacheName = type === "video" ? "offline-videos" : "offline-photos";
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    const mediaUrl = getApiUrl(`/api/telegram/file/${fileId}`);
    
    // Check if we already have it
    const match = await cache.match(mediaUrl);
    if (match) return;

    // Cache if under the limit
    if (keys.length < maxItems) {
      await cache.add(mediaUrl);
    }
  } catch (err) {
    console.debug(`Offline caching skipped or failed for ${type}`, err);
  }
};

export const useOfflineMedia = (fileId: string | null | undefined, type: "video" | "photo" = "video") => {
  const defaultUrl = fileId ? getApiUrl(`/api/telegram/file/${fileId}`) : "";
  const [src, setSrc] = useState<string>(defaultUrl);

  useEffect(() => {
    if (!fileId) {
      setSrc("");
      return;
    }

    setSrc(getApiUrl(`/api/telegram/file/${fileId}`)); // reset

    let isMounted = true;
    let blobUrl = "";

    const checkCache = async () => {
      if (typeof caches === "undefined") return;
      try {
        const cacheName = type === "video" ? "offline-videos" : "offline-photos";
        const cache = await caches.open(cacheName);
        const urlToMatch = getApiUrl(`/api/telegram/file/${fileId}`);
        const response = await cache.match(urlToMatch);
        
        if (response && isMounted) {
          const blob = await response.blob();
          blobUrl = URL.createObjectURL(blob);
          setSrc(blobUrl);
        }
      } catch (err) {
        console.debug("Failed to load from cache", err);
      }
    };

    checkCache();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fileId, type]);

  return src;
};
