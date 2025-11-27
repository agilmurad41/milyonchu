import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  deleteDoc
} from "firebase/firestore";
import { User } from "../types";

// --- KONFİQURASİYA ---
// 1. Firebase Konsolundan aldığın "firebaseConfig" obyektini aşağıya yapışdır.
// 2. USE_CLOUD_DB = true et.

const firebaseConfig: any = {
  // Bura öz API açarlarını yazmalısan:
 apiKey: "AIzaSyDjtML91jvDUait-CdCIRli7UUMupm3V18",
 authDomain: "bilmece-live.firebaseapp.com",
 projectId: "bilmece-live",
 storageBucket: "bilmece-live.firebasestorage.app",
 messagingSenderId: "23811133406",
 appId: "1:23811133406:web:1aed708a82bc4444a1d74f"
};

// Əgər Firebase işə salmaq istəyirsənsə bunu true et!
const USE_CLOUD_DB = true; 

// ---------------------

let db: any;
let usersCollection: any;

if (USE_CLOUD_DB && firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    usersCollection = collection(db, "users");
    console.log("🔥 Firebase qoşuldu!");
  } catch (e) {
    console.error("Firebase qoşulma xətası:", e);
  }
}

// LOCAL STORAGE FALLBACK KEY
const LOCAL_KEY = 'milyoncu_users_db';

export const dbService = {
  
  // Bütün istifadəçiləri gətir
  getUsers: async (): Promise<User[]> => {
    if (USE_CLOUD_DB && db) {
      try {
        const snapshot = await getDocs(usersCollection);
        const users: User[] = [];
        snapshot.forEach((doc: any) => {
          users.push(doc.data() as User);
        });
        return users;
      } catch (e) {
        console.error("Məlumat gətirmə xətası:", e);
        return [];
      }
    } else {
      // Local Storage Fallback
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    }
  },

  // İstifadəçi əlavə et (Qeydiyyat)
  addUser: async (user: User): Promise<boolean> => {
    if (USE_CLOUD_DB && db) {
      try {
        // İstifadəçi adı unikal ID kimi istifadə olunur
        await setDoc(doc(db, "users", user.username), user);
        return true;
      } catch (e) {
        console.error("Yaddaşa yazma xətası:", e);
        return false;
      }
    } else {
      const users = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      users.push(user);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(users));
      return true;
    }
  },

  // İstifadəçi məlumatını yenilə (Xal, Profil)
  updateUser: async (username: string, updates: Partial<User>): Promise<boolean> => {
    if (USE_CLOUD_DB && db) {
      try {
        const userRef = doc(db, "users", username);
        await updateDoc(userRef, updates);
        return true;
      } catch (e) {
        console.error("Yeniləmə xətası:", e);
        return false;
      }
    } else {
      const users: User[] = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      const index = users.findIndex(u => u.username === username);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem(LOCAL_KEY, JSON.stringify(users));
        return true;
      }
      return false;
    }
  },

  // İstifadəçini sil (Admin funksiyası)
  deleteUser: async (username: string): Promise<boolean> => {
    if (USE_CLOUD_DB && db) {
      try {
        await deleteDoc(doc(db, "users", username));
        return true;
      } catch (e) {
        console.error("Silinmə xətası:", e);
        return false;
      }
    } else {
      let users: User[] = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
      users = users.filter(u => u.username !== username);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(users));
      return true;
    }
  }
};