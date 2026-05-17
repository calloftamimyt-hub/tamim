import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Madhab } from 'adhan';

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface HijriDateInfo {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
    bn?: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
    bn?: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

export interface DayData {
  timings: PrayerTimes;
  date: {
    readable: string;
    timestamp: string;
    gregorian: any;
    hijri: HijriDateInfo;
  };
}

const BENGALI_WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const BENGALI_HIJRI_MONTHS = [
  'মুহাররাম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি',
  'রজব', 'শা’বান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
];

export function usePrayerTimes(latitude: number | null, longitude: number | null) {
  const getStoredMadhab = () => localStorage.getItem('islamic_app_madhab') || 'Shafi';
  const getStoredCalcMethod = () => localStorage.getItem('islamic_app_calc_method') || 'Karachi';

  const [data, setData] = useState<DayData[] | null>(() => {
    const saved = localStorage.getItem('prayerTimesCache');
    const savedCoords = localStorage.getItem('prayerTimesCoords');
    const savedMonth = localStorage.getItem('prayerTimesMonth');
    const savedMadhab = localStorage.getItem('prayerTimesMadhabCache');
    const savedCalc = localStorage.getItem('prayerTimesCalcCache');
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const currentMadhab = getStoredMadhab();
    const currentCalc = getStoredCalcMethod();

    if (saved && savedCoords && savedMonth === currentMonth && savedMadhab === currentMadhab && savedCalc === currentCalc) {
      const coords = JSON.parse(savedCoords);
      if (latitude && longitude && 
          Math.abs(coords.lat - latitude) < 0.01 && 
          Math.abs(coords.lon - longitude) < 0.01) {
        return JSON.parse(saved);
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      if (!data) setLoading(false);
      return;
    }

    const calculateTimes = () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11
        const currentMonth = `${year}-${month + 1}`;
        const userMadhab = getStoredMadhab();
        const userCalcOption = getStoredCalcMethod();
        
        if (data && localStorage.getItem('prayerTimesMonth') === currentMonth && localStorage.getItem('prayerTimesMadhabCache') === userMadhab && localStorage.getItem('prayerTimesCalcCache') === userCalcOption) {
          setLoading(false);
          return;
        }

        const coords = new Coordinates(latitude, longitude);
        let params;
        switch (userCalcOption) {
          case 'Muslim World League': params = CalculationMethod.MuslimWorldLeague(); break;
          case 'Islamic Society of North America': params = CalculationMethod.NorthAmerica(); break;
          case 'Egyptian General Authority of Survey': params = CalculationMethod.Egyptian(); break;
          case 'Umm Al-Qura University, Makkah': params = CalculationMethod.UmmAlQura(); break;
          case 'Institute of Geophysics, University of Tehran': params = CalculationMethod.Tehran(); break;
          case 'Shia Ithna-Ashari, Leva Institute, Qum': params = CalculationMethod.MoonsightingCommittee(); break;
          default: params = CalculationMethod.Karachi(); break;
        }
        params.madhab = userMadhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const formattedData: DayData[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const times = new AdhanPrayerTimes(coords, date, params);
          
          const formatTime = (date: Date) => {
            const h = date.getHours().toString().padStart(2, '0');
            const m = date.getMinutes().toString().padStart(2, '0');
            return `${h}:${m}`;
          };

          const timings: PrayerTimes = {
            Fajr: formatTime(times.fajr),
            Sunrise: formatTime(times.sunrise),
            Dhuhr: formatTime(times.dhuhr),
            Asr: formatTime(times.asr),
            Sunset: formatTime(times.maghrib), // Sunset matches Maghrib in adhan
            Maghrib: formatTime(times.maghrib),
            Isha: formatTime(times.isha),
            Imsak: formatTime(new Date(times.fajr.getTime() - 10 * 60000)), // Approximate
            Midnight: formatTime(new Date((times.maghrib.getTime() + times.fajr.getTime()) / 2)),
          };

          formattedData.push({
            timings,
            date: {
              readable: date.toLocaleDateString(),
              timestamp: date.getTime().toString(),
              gregorian: { date: `${day.toString().padStart(2, '0')}-${(month + 1).toString().padStart(2, '0')}-${year}` },
              hijri: {
                date: '', format: '', day: '',
                weekday: { en: '', ar: '', bn: BENGALI_WEEKDAYS[date.getDay()] },
                month: { number: 0, en: '', ar: '', bn: '' },
                year: '', designation: { abbreviated: '', expanded: '' },
                holidays: []
              }
            }
          });
        }

        setData(formattedData);
        localStorage.setItem('prayerTimesCache', JSON.stringify(formattedData));
        localStorage.setItem('prayerTimesCoords', JSON.stringify({ lat: latitude, lon: longitude }));
        localStorage.setItem('prayerTimesMonth', currentMonth);
        localStorage.setItem('prayerTimesMadhabCache', userMadhab);
        localStorage.setItem('prayerTimesCalcCache', userCalcOption);
        setError(null);
      } catch (err) {
        console.error('Error calculating prayer times:', err);
        setError('নামাজের সময়সূচি ক্যালকুলেশনে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    calculateTimes();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'islamic_app_madhab' || e.key === 'islamic_app_calc_method') {
        calculateTimes();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Add custom event listener for in-app changes
    const handleMadhabChange = () => calculateTimes();
    const handleCalcChange = () => calculateTimes();
    window.addEventListener('madhab-changed', handleMadhabChange);
    window.addEventListener('calc-changed', handleCalcChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('madhab-changed', handleMadhabChange);
      window.removeEventListener('calc-changed', handleCalcChange);
    };
  }, [latitude, longitude]);

  return { data, loading, error };
}
