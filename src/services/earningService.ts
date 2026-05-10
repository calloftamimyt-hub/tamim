import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  limit,
  doc,
  writeBatch,
  increment,
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface EarningHistory {
  id?: string;
  userId: string;
  type: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  createdAt: any;
}

const HISTORY_CACHE_KEY = 'earning_history_cache';
const DEPOSIT_HISTORY_KEY = 'deposit_history_cache';
const WITHDRAW_HISTORY_KEY = 'withdraw_history_cache';

/**
 * Service to manage earning, deposit, and withdrawal history with local storage and Firestore.
 */
export const earningService = {
  // --- Earning History ---
  async addEarningRecord(record: Omit<EarningHistory, 'userId' | 'createdAt' | 'id'>) {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to add earning record');

    const amount = Number(record.amount) || 0;
    
    try {
      const batch = writeBatch(db);
      
      // 1. Add to Firestore earning history (subcollection)
      const historyRef = doc(collection(db, `users/${user.uid}/earning_history`));
      const firestoreRecord = {
        userId: user.uid,
        type: record.type,
        amount: amount,
        status: record.status,
        description: record.description || '',
        createdAt: serverTimestamp()
      };
      batch.set(historyRef, firestoreRecord);

      // 2. If approved, update user balance
      if (record.status === 'approved' && amount > 0) {
        const balanceRef = doc(db, 'user_balances', user.uid);
        batch.set(balanceRef, {
          userId: user.uid,
          currentBalance: increment(amount),
          totalEarned: increment(amount),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();

      // 3. Update local cache as fallback
      const newRecordLocal: EarningHistory = {
        ...record,
        userId: user.uid,
        id: historyRef.id,
        createdAt: new Date().toISOString(),
      };
      const cached = this.getLocalHistory();
      const updatedHistory = [newRecordLocal, ...cached].slice(0, 100);
      localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(updatedHistory));
      
      return historyRef.id;
    } catch (error) {
      console.error('Error adding earning record:', error);
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/earning_history`);
      throw error;
    }
  },

  async getEarningHistory(): Promise<EarningHistory[]> {
    const user = auth.currentUser;
    if (!user) return this.getLocalHistory();

    try {
      const q = query(
        collection(db, `users/${user.uid}/earning_history`),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })) as EarningHistory[];
      
      // Sync local cache
      if (history.length > 0) {
        localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(history));
      }
      
      return history;
    } catch (error) {
      console.warn('Failed to fetch history from Firestore, using local cache:', error);
      return this.getLocalHistory();
    }
  },

  getLocalHistory(): EarningHistory[] {
    const cached = localStorage.getItem(HISTORY_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  },

  deleteRecords(ids: string[]) {
    const cached = this.getLocalHistory();
    const updatedHistory = cached.filter(item => !item.id || !ids.includes(item.id));
    localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(updatedHistory));
  },

  // --- Deposit History ---
  async addDepositRecord(record: any) {
    const user = auth.currentUser;
    if (!user) return;
    const newRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
    };
    const history = this.getDepositHistory();
    localStorage.setItem(DEPOSIT_HISTORY_KEY, JSON.stringify([newRecord, ...history].slice(0, 100)));
  },

  getDepositHistory(): any[] {
    const cached = localStorage.getItem(DEPOSIT_HISTORY_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  deleteDepositRecords(ids: string[]) {
    const history = this.getDepositHistory();
    localStorage.setItem(DEPOSIT_HISTORY_KEY, JSON.stringify(history.filter(item => !ids.includes(item.id))));
  },

  // --- Withdraw History ---
  async addWithdrawRecord(record: any) {
    const user = auth.currentUser;
    if (!user) return;
    const newRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
    };
    const history = this.getWithdrawHistory();
    localStorage.setItem(WITHDRAW_HISTORY_KEY, JSON.stringify([newRecord, ...history].slice(0, 100)));
  },

  getWithdrawHistory(): any[] {
    const cached = localStorage.getItem(WITHDRAW_HISTORY_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  deleteWithdrawRecords(ids: string[]) {
    const history = this.getWithdrawHistory();
    localStorage.setItem(WITHDRAW_HISTORY_KEY, JSON.stringify(history.filter(item => !ids.includes(item.id))));
  },

  clearCache() {
    localStorage.removeItem(HISTORY_CACHE_KEY);
    localStorage.removeItem(DEPOSIT_HISTORY_KEY);
    localStorage.removeItem(WITHDRAW_HISTORY_KEY);
  }
};
