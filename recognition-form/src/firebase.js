import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { STUDENTS_CATALOG } from './data/studentsCatalog';

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

      // Sort by idx or code or score
      data.sort((a, b) => {
        if (a.idx && b.idx) return a.idx - b.idx;
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
  await setDoc(docRef, payload, { merge: true });
};

export const deleteStudentRecord = async (id) => {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, 'students', id);
  await deleteDoc(docRef);
};

// ---------------------------------------------------
// ⚡ محرك مزامنة وإعادة تهيئة الطلاب مع Firebase (Batch & Reset Sync Engine)
// ---------------------------------------------------
export const batchSyncStudentsToFirestore = async (customCatalog = null, onProgress = null) => {
  if (!db) throw new Error("Firestore is not initialized");

  const catalogToSync = customCatalog || STUDENTS_CATALOG;
  const total = catalogToSync.length;
  let processed = 0;

  const chunkSize = 400;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = catalogToSync.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const student of chunk) {
      const docId = student.studentId || `STU-2026-${String(student.idx).padStart(3, '0')}`;
      const docRef = doc(db, 'students', docId);

      const studentPayload = {
        idx: student.idx,
        studentId: docId,
        studentCode: student.code || `#${String(student.idx).padStart(3, '0')}`,
        studentName: student.name,
        partName: student.part,
        examScore: Number(student.score) || 0,
        awardTier: student.tier || "✨ فئة التفوق",
        gift: student.gift || "شهادة تقدير وتكريم الكُتّاب",
        totalParts: Number(student.totalParts) || 1,
        smartUrl: student.smart_url || `${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://wathba-kuttab.vercel.app'}/#/student/form?name=${encodeURIComponent(student.name)}&id=${docId}`,
        qrCodeUrl: student.qr_code_url || student.smart_url,
        qrImgUrl: student.qr_img_url || "",
        isSummerStudent: true,
        accountStatus: "ACTIVE",
        updatedAt: serverTimestamp()
      };

      batch.set(docRef, studentPayload, { merge: true });
      processed++;
      if (onProgress) onProgress(processed, total);
    }

    await batch.commit();
  }

  return { success: true, count: processed };
};

// 🗑️⚡ مسح وإعادة ضبط قاعدة بيانات الطلاب بالكامل من الكتالوج المعتمد الجديد
export const resetAndWipeStudentsFirestore = async (customCatalog = null, onProgress = null) => {
  if (!db) throw new Error("Firestore is not initialized");

  const colRef = collection(db, 'students');
  const snapshot = await getDocs(colRef);
  
  // 1. Delete existing documents in batches
  const existingDocs = snapshot.docs;
  const deleteChunkSize = 400;
  for (let i = 0; i < existingDocs.length; i += deleteChunkSize) {
    const chunk = existingDocs.slice(i, i + deleteChunkSize);
    const batch = writeBatch(db);
    for (const docSnap of chunk) {
      batch.delete(docSnap.ref);
    }
    await batch.commit();
  }

  // 2. Freshly seed from catalog
  const catalogToSync = customCatalog || STUDENTS_CATALOG;
  const total = catalogToSync.length;
  let processed = 0;

  for (let i = 0; i < total; i += deleteChunkSize) {
    const chunk = catalogToSync.slice(i, i + deleteChunkSize);
    const batch = writeBatch(db);

    for (const student of chunk) {
      const docId = student.studentId || `STU-2026-${String(student.idx).padStart(3, '0')}`;
      const docRef = doc(db, 'students', docId);

      const studentPayload = {
        idx: student.idx,
        studentId: docId,
        studentCode: student.code || `#${String(student.idx).padStart(3, '0')}`,
        studentName: student.name,
        partName: student.part,
        examScore: Number(student.score) || 0,
        awardTier: student.tier || "✨ فئة التفوق",
        gift: student.gift || "شهادة تقدير وتكريم الكُتّاب",
        totalParts: Number(student.totalParts) || 1,
        smartUrl: student.smart_url || `${typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://wathba-kuttab.vercel.app'}/#/student/form?name=${encodeURIComponent(student.name)}&id=${docId}`,
        qrCodeUrl: student.qr_code_url || student.smart_url,
        qrImgUrl: student.qr_img_url || "",
        isSummerStudent: true,
        accountStatus: "ACTIVE",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(docRef, studentPayload);
      processed++;
      if (onProgress) onProgress(processed, total);
    }

    await batch.commit();
  }

  return { success: true, count: processed };
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

// ⚡ استيراد ومزامنة طاقم الشيوخ والكوادر المعتمدة
export const batchSyncSheikhsToFirestore = async (onProgress = null) => {
  if (!db) throw new Error("Firestore is not initialized");

  const DEFAULT_SHEIKHS = [
    {
      sheikhId: "TCH-001",
      name: "الشيخ عبدالله حسن الديهى",
      phone: "01000000001",
      qualification: "ليسانس شريعة وقانون - إجازة بالقراءات العشر",
      ijazat: "حفص عن عاصم، ورش عن نافع، القراءات العشر الكبرى",
      adminRole: "SUPER_ADMIN",
      permissionsLevel: "FULL_SYSTEM_CONTROL",
      hasAdminAccess: true,
      participatingSummer: true,
      summerLevel: "القرآن كاملاً والفئة العليا",
      availability: "طوال أيام الأسبوع",
      studentsCount: 25,
      notes: "المشرف العام ومدير منظومة الكُتّاب"
    },
    {
      sheikhId: "TCH-002",
      name: "الشيخ محمد الشعراوي الفوال",
      phone: "01000000002",
      qualification: "ليسانس دراسات إسلامية - إجازة حفص عن عاصم",
      ijazat: "حفص عن عاصم بالسند المتصل",
      adminRole: "DEPUTY_ADMIN",
      permissionsLevel: "ACADEMIC_EXAM_CONTROL",
      hasAdminAccess: true,
      participatingSummer: true,
      summerLevel: "الأجزاء المتقدمة (الأعراف إلى يس)",
      availability: "السبت والإثنين والأربعاء",
      studentsCount: 30,
      notes: "المشرف الأكاديمي والتنفيذي للجان الاختبارات"
    },
    {
      sheikhId: "TCH-003",
      name: "الشيخ أحمد فرج عبد المنعم",
      phone: "01000000003",
      qualification: "معهد القراءات - إجازة حفص",
      ijazat: "حفص عن عاصم",
      adminRole: "TEACHER",
      permissionsLevel: "GROUP_ONLY",
      hasAdminAccess: false,
      participatingSummer: true,
      summerLevel: "جزء عم وتبارك وقد سمع",
      availability: "الأحد والثلاثاء والخميس",
      studentsCount: 22,
      notes: "محفظ معتمد لحلقات المبتدئين"
    }
  ];

// ---------------------------------------------------
// 📖 3. خدمة الكُتّاب الدائم (Permanent Kuttab Collection)
// ---------------------------------------------------
export const subscribePermanentKuttab = (onSuccess, onError) => {
  if (!db) {
    if (onError) onError(new Error("Firestore is not initialized"));
    return () => {};
  }

  const colRef = collection(db, 'permanent_kuttab');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      // Sort by createdAt descending (newest registrations first)
      data.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return tB - tA;
      });

      onSuccess(data);
    },
    (err) => {
      console.error("Firestore Permanent Kuttab Snapshot Error:", err);
      if (onError) onError(err);
    }
  );
};

export const addPermanentKuttabRecord = async (formData) => {
  if (!db) throw new Error("Firestore is not initialized");
  const colRef = collection(db, 'permanent_kuttab');
  const payload = {
    ...formData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const docRef = await addDoc(colRef, payload);
  return docRef.id;
};

export const updatePermanentKuttabRecord = async (id, formData) => {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, 'permanent_kuttab', id);
  const payload = {
    ...formData,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, payload);
};

export const deletePermanentKuttabRecord = async (id) => {
  if (!db) throw new Error("Firestore is not initialized");
  const docRef = doc(db, 'permanent_kuttab', id);
  await deleteDoc(docRef);
};
