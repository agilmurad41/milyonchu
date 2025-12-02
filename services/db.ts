
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
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { User, Question, Topic } from "../types";

// --- KONFİQURASİYA ---
const firebaseConfig: any = {
 apiKey: "AIzaSyDjtML91jvDUait-CdCIRli7UUMupm3V18",
 authDomain: "bilmece-live.firebaseapp.com",
 projectId: "bilmece-live",
 storageBucket: "bilmece-live.firebasestorage.app",
 messagingSenderId: "23811133406",
 appId: "1:23811133406:web:1aed708a82bc4444a1d74f"
};

const USE_CLOUD_DB = true; 

let db: any;
let usersCollection: any;
let questionsCollection: any;

if (USE_CLOUD_DB && firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    usersCollection = collection(db, "users");
    questionsCollection = collection(db, "questions");
    console.log("🔥 Firebase qoşuldu!");
  } catch (e) {
    console.error("Firebase qoşulma xətası:", e);
  }
}

const LOCAL_KEY = 'milyoncu_users_db';

export const dbService = {
  
  // --- USERS ---

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
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    }
  },

  addUser: async (user: User): Promise<boolean> => {
    if (USE_CLOUD_DB && db) {
      try {
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
  },

  // --- QUESTIONS (Firebase Only) ---

  // Updated to support Language filtering
  getQuestions: async (topic?: Topic, language: 'az' | 'en' = 'az'): Promise<Question[]> => {
    if (USE_CLOUD_DB && db) {
      try {
        let q = query(questionsCollection, where("language", "==", language));
        
        if (topic) {
          // Compound query: topic + language
          // Note: Requires Firestore index, but usually works for small datasets or dev mode
          q = query(questionsCollection, where("topic", "==", topic), where("language", "==", language));
        }
        
        const snapshot = await getDocs(q);
        const questions: Question[] = [];
        snapshot.forEach((doc: any) => {
          questions.push({ id: doc.id, ...doc.data() } as Question);
        });
        return questions;
      } catch (e) {
        console.error("Sual gətirmə xətası:", e);
        return [];
      }
    }
    return [];
  },

  addQuestion: async (question: Omit<Question, 'id'>): Promise<boolean> => {
    if (USE_CLOUD_DB && db) {
      try {
        await addDoc(questionsCollection, question);
        return true;
      } catch (e) {
        console.error("Sual əlavə etmə xətası:", e);
        return false;
      }
    }
    return false;
  },

  updateQuestion: async (id: string, updates: Partial<Question>): Promise<boolean> => {
    if (USE_CLOUD_DB && db) {
      try {
        const qRef = doc(db, "questions", id);
        await updateDoc(qRef, updates);
        return true;
      } catch (e) {
        console.error("Sual yeniləmə xətası:", e);
        return false;
      }
    }
    return false;
  },

  deleteQuestion: async (id: string): Promise<boolean> => {
    if (USE_CLOUD_DB && db) {
      try {
        await deleteDoc(doc(db, "questions", id));
        return true;
      } catch (e) {
        console.error("Sual silmə xətası:", e);
        return false;
      }
    }
    return false;
  },

  seedQuestions: async (questions: any[]): Promise<void> => {
    if (USE_CLOUD_DB && db) {
      console.log("Suallar bazaya yüklənir...");
      const batchPromises = questions.map(q => addDoc(questionsCollection, q));
      await Promise.all(batchPromises);
      console.log("Bütün suallar yükləndi!");
    }
  }
};
