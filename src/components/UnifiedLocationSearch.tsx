import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Check, Navigation, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface UnifiedLocationSearchProps {
  onSelect: (location: { name: string; fullName: string; lat: number; lon: number }) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

const SEARCH_CACHE: Record<string, any[]> = {};

const BD_DISTRICTS = [
  { name: 'Dhaka', bn: 'ঢাকা', lat: 23.8103, lon: 90.4125 },
  { name: 'Chittagong', bn: 'চট্টগ্রাম', lat: 22.3569, lon: 91.7832 },
  { name: 'Sylhet', bn: 'সিলেট', lat: 24.8949, lon: 91.8687 },
  { name: 'Rajshahi', bn: 'রাজশাহী', lat: 24.3745, lon: 88.6042 },
  { name: 'Khulna', bn: 'খুলনা', lat: 22.8456, lon: 89.5403 },
  { name: 'Barisal', bn: 'বরিশাল', lat: 22.7010, lon: 90.3535 },
  { name: 'Rangpur', bn: 'রংপুর', lat: 25.7439, lon: 89.2752 },
  { name: 'Mymensingh', bn: 'ময়মনসিংহ', lat: 24.7471, lon: 90.4203 },
  { name: 'Comilla', bn: 'কুমিল্লা', lat: 23.4607, lon: 91.1809 },
  { name: 'Gazipur', bn: 'গাজীপুর', lat: 23.9999, lon: 90.4203 },
  { name: 'Narayanganj', bn: 'নারায়ণগঞ্জ', lat: 23.6238, lon: 90.5000 },
  { name: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া', lat: 23.9571, lon: 91.1119 },
  { name: 'Noakhali', bn: 'নোয়াখালী', lat: 22.8696, lon: 91.0994 },
  { name: 'Feni', bn: 'ফেনী', lat: 23.0159, lon: 91.3976 },
  { name: 'Chandpur', bn: 'চাঁদপুর', lat: 23.2321, lon: 90.6631 },
  { name: 'Lakshmipur', bn: 'লক্ষ্মীপুর', lat: 22.9429, lon: 90.8417 },
  { name: 'Cox\'s Bazar', bn: 'কক্সবাজার', lat: 21.4272, lon: 92.0058 },
  { name: 'Khagrachari', bn: 'খাগড়াছড়ি', lat: 23.1193, lon: 91.9847 },
  { name: 'Rangamati', bn: 'রাঙ্গামাটি', lat: 22.6574, lon: 92.1733 },
  { name: 'Bandarban', bn: 'বান্দরবান', lat: 22.1953, lon: 92.2184 },
  { name: 'Narsingdi', bn: 'নরসিংদী', lat: 23.9197, lon: 90.7177 },
  { name: 'Manikganj', bn: 'মানিকগঞ্জ', lat: 23.8617, lon: 90.0003 },
  { name: 'Munshiganj', bn: 'মুন্সীগঞ্জ', lat: 23.5436, lon: 90.5354 },
  { name: 'Faridpur', bn: 'ফরিদপুর', lat: 23.6071, lon: 89.8429 },
  { name: 'Madaripur', bn: 'মাদারীপুর', lat: 23.1641, lon: 90.1896 },
  { name: 'Gopalganj', bn: 'গোপালগঞ্জ', lat: 23.0059, lon: 89.8267 },
  { name: 'Rajbari', bn: 'রাজবাড়ী', lat: 23.7574, lon: 89.6444 },
  { name: 'Shariatpur', bn: 'শরীয়তপুর', lat: 23.2423, lon: 90.4348 },
  { name: 'Kishoreganj', bn: 'কিশোরগঞ্জ', lat: 24.4331, lon: 90.7820 },
  { name: 'Tangail', bn: 'টাঙ্গাইল', lat: 24.2513, lon: 89.9167 },
  { name: 'Netrokona', bn: 'নেত্রকোনা', lat: 24.8103, lon: 90.7167 },
  { name: 'Sherpur', bn: 'শেরপুর', lat: 25.0203, lon: 90.0153 },
  { name: 'Jamalpur', bn: 'জামালপুর', lat: 24.9375, lon: 89.9317 },
  { name: 'Bogura', bn: 'বগুড়া', lat: 24.8481, lon: 89.3730 },
  { name: 'Joypurhat', bn: 'জয়পুরহাট', lat: 25.0947, lon: 89.0200 },
  { name: 'Naogaon', bn: 'নওগাঁ', lat: 24.7936, lon: 88.9318 },
  { name: 'Natore', bn: 'নাটোর', lat: 24.4111, lon: 88.9734 },
  { name: 'Chapai Nawabganj', bn: 'চাঁপাইনবাবগঞ্জ', lat: 24.5965, lon: 88.2716 },
  { name: 'Pabna', bn: 'পাবনা', lat: 24.0158, lon: 89.2335 },
  { name: 'Sirajganj', bn: 'সিরাজগঞ্জ', lat: 24.4534, lon: 89.7084 },
  { name: 'Kushtia', bn: 'কুষ্টিয়া', lat: 23.9013, lon: 89.1204 },
  { name: 'Meherpur', bn: 'মেহেরপুর', lat: 23.7621, lon: 88.6318 },
  { name: 'Chuadanga', bn: 'চুয়াডাঙ্গা', lat: 23.6401, lon: 88.8418 },
  { name: 'Jhenaidah', bn: 'ঝিনাইদহ', lat: 23.5450, lon: 89.1726 },
  { name: 'Magura', bn: 'মাগুরা', lat: 23.4873, lon: 89.4199 },
  { name: 'Narail', bn: 'নড়াইল', lat: 23.1725, lon: 89.5126 },
  { name: 'Jashore', bn: 'যশোর', lat: 23.1664, lon: 89.2081 },
  { name: 'Satkhira', bn: 'সাতক্ষীরা', lat: 22.7185, lon: 89.0705 },
  { name: 'Bagerhat', bn: 'বাগেরহাট', lat: 22.6516, lon: 89.7859 },
  { name: 'Bhola', bn: 'ভোলা', lat: 22.6859, lon: 90.6481 },
  { name: 'Jhalokati', bn: 'ঝালকাঠি', lat: 22.6422, lon: 90.1989 },
  { name: 'Pirojpur', bn: 'পিরোজপুর', lat: 22.5803, lon: 89.9726 },
  { name: 'Patuakhali', bn: 'পটুয়াখালী', lat: 22.3596, lon: 90.3297 },
  { name: 'Barguna', bn: 'বরগুনা', lat: 22.1591, lon: 90.1255 },
  { name: 'Habiganj', bn: 'হবিগঞ্জ', lat: 24.3749, lon: 91.4170 },
  { name: 'Moulvibazar', bn: 'মৌলভীবাজার', lat: 24.4829, lon: 91.7682 },
  { name: 'Sunamganj', bn: 'সুনামগঞ্জ', lat: 25.0658, lon: 91.3950 },
  { name: 'Dinajpur', bn: 'দিনাজপুর', lat: 25.6217, lon: 88.6470 },
  { name: 'Thakurgaon', bn: 'ঠাকুরগাঁও', lat: 26.0337, lon: 88.4616 },
  { name: 'Panchagarh', bn: 'পঞ্চগড়', lat: 26.3411, lon: 88.5542 },
  { name: 'Nilphamari', bn: 'নীলফামারী', lat: 25.9317, lon: 88.8560 },
  { name: 'Lalmonirhat', bn: 'লালমনিরহাট', lat: 25.9129, lon: 89.4426 },
  { name: 'Kurigram', bn: 'কুড়িগ্রাম', lat: 25.8054, lon: 89.6361 },
  { name: 'Gaibandha', bn: 'গাইবান্ধা', lat: 25.3287, lon: 89.5280 },
];

export function UnifiedLocationSearch({ onSelect, placeholder, initialValue = '', className }: UnifiedLocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const localBdResults = searchQuery.length >= 2 
    ? BD_DISTRICTS.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.bn.includes(searchQuery)).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchLocation = async () => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      if (SEARCH_CACHE[searchQuery]) {
        setResults(SEARCH_CACHE[searchQuery]);
        setShowResults(true);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=8&addressdetails=1`);
        const data = await response.json();
        SEARCH_CACHE[searchQuery] = data;
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching location:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchLocation, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelect = (res: any) => {
    const name = res.display_name.split(',')[0];
    const fullName = res.display_name;
    const lat = parseFloat(res.lat);
    const lon = parseFloat(res.lon);
    
    onSelect({ name, fullName, lat, lon });
    setSearchQuery(name);
    setShowResults(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await response.json();
          
          const name = data.address.city || data.address.town || data.address.village || data.display_name.split(',')[0];
          onSelect({
            name,
            fullName: data.display_name,
            lat: latitude,
            lon: longitude
          });
          setSearchQuery(name);
          setShowResults(false);
        } catch (error) {
          console.error("Error getting current location details:", error);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);
        alert("Unable to retrieve your location");
      }
    );
  };

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length < 2) setShowResults(false);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder || "Search location..."}
          className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-slate-800 dark:text-white placeholder:text-slate-400 transition-all outline-none font-medium shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute z-[1000] w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[400px]"
          >
            <div className="p-2 overflow-y-auto custom-scrollbar">
              {/* Current Location Option */}
              <button
                onClick={handleCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center space-x-4 p-4 hover:bg-primary/5 dark:hover:bg-primary-dark/20 rounded-2xl transition-all text-left group border border-transparent hover:border-primary/10 dark:hover:border-primary-dark/50"
              >
                <div className="p-3 bg-primary/10 dark:bg-primary-dark/40 rounded-xl group-hover:bg-primary/20 dark:group-hover:bg-primary-dark/60 transition-colors">
                  {isGettingLocation ? (
                    <Loader2 className="w-5 h-5 text-primary-dark dark:text-primary-light animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5 text-primary-dark dark:text-primary-light" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-black text-primary-dark dark:text-primary-light text-[15px]">
                    Use Current Location
                  </div>
                  <div className="text-xs text-primary/70 dark:text-primary-light/70 font-bold mt-0.5">
                    {isGettingLocation ? 'Detecting location...' : 'Fastest way to set your city'}
                  </div>
                </div>
              </button>

              {(localBdResults.length > 0 || results.length > 0) && <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />}

              {/* Local BD Results */}
              {localBdResults.map((dist, idx) => (
                <button
                  key={`local-${idx}`}
                  onClick={() => onSelect({ name: dist.name, fullName: `${dist.name}, Bangladesh`, lat: dist.lat, lon: dist.lon })}
                  className="w-full flex items-start space-x-4 p-4 hover:bg-primary/5 dark:hover:bg-slate-800/50 rounded-2xl transition-all text-left group"
                >
                  <div className="mt-1 p-3 bg-primary/10 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-all border border-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 dark:text-white text-[15px] truncate group-hover:text-primary transition-colors">
                      {dist.name} ({dist.bn})
                    </div>
                    <div className="text-[10px] text-primary/70 font-bold uppercase tracking-wider mt-0.5">
                      Bangladesh
                    </div>
                  </div>
                </button>
              ))}

              {/* Search Results */}
              {results.filter(res => !localBdResults.some(bd => res.display_name.toLowerCase().includes(bd.name.toLowerCase()))).map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(res)}
                  className="w-full flex items-start space-x-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all text-left group"
                >
                  <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-all">
                    <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 dark:text-white text-[15px] truncate group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors">
                      {res.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-medium leading-relaxed">
                      {res.display_name}
                    </div>
                  </div>
                </button>
              ))}

              {searchQuery.length >= 2 && results.length === 0 && !isSearching && (
                <div className="p-12 text-center space-y-3">
                  <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                    <Globe className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">No locations found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Attribution */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Powered by OpenStreetMap
              </span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-primary rounded-full" />
                <div className="w-1 h-1 bg-primary/50 rounded-full" />
                <div className="w-1 h-1 bg-primary/20 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
