import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wathba-kuttab.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wathba-kuttab",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wathba-kuttab.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase init err:", e);
}

export { db };

// ---------------------------------------------------
// 🔥 1. خدمة الطلاب (Students Collection)
// ---------------------------------------------------
export const subscribeStudents = (onSuccess, onError) => {
  if (!db) {
    if (onError) onError(new Error("Firestore is not initialized"));
    return () => {};
  }

  const colRef = collection(db, 'students');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      // Sort by createdAt descending
      data.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return tB - tA;
      });

      onSuccess(data);
    },
    (err) => {
      console.error("Firestore Snapshot Error:", err);
      if (onError) onError(err);
    }
  );
};

export const addStudentRecord = async (formData) => {
  if (!db) throw new Error("Firestore is not initialized");
  const colRef = collection(db, 'students');
  const payload = {
    ...formData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
};

export const updateStudentRecord = async (id, formData) => {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, 'students', id);
  const payload = {
    ...formData,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, payload);
};

export const deleteStudentRecord = async (id) => {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, 'students', id);
  await deleteDoc(docRef);
};

// ---------------------------------------------------
// 👳‍♂️ 2. خدمة الشيوخ والمعلمين (Sheikhs Collection)
// ---------------------------------------------------
export const subscribeSheikhs = (onSuccess, onError) => {
  if (!db) {
    if (onError) onError(new Error("Firestore is not initialized"));
    return () => {};
  }

  const colRef = collection(db, 'sheikhs');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      data.sort((a, b) => (b.studentsCount || 0) - (a.studentsCount || 0));

      onSuccess(data);
    },
    (err) => {
      console.error("Firestore Sheikhs Snapshot Error:", err);
      if (onError) onError(err);
    }
  );
};

export const addSheikhRecord = async (sheikhData) => {
  if (!db) throw new Error("Firestore is not initialized");
  const colRef = collection(db, 'sheikhs');
  const payload = {
    ...sheikhData,
    studentsCount: Number(sheikhData.studentsCount || 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
};

export const updateSheikhRecord = async (id, sheikhData) => {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, 'sheikhs', id);
  const payload = {
    ...sheikhData,
    studentsCount: Number(sheikhData.studentsCount || 0),
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, payload);
};

export const deleteSheikhRecord = async (id) => {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, 'sheikhs', id);
  await deleteDoc(docRef);
};
