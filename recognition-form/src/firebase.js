import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';

// Environment variables or fallback config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let db = null;
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error('Firebase initialization error:', e);
  }
}

// Initial Sample Data for pre-seeding localStorage
const SEED_STUDENTS = [
  {
    id: 'seed-1',
    studentName: 'أحمد محمد علي الفقي',
    studentAge: 10,
    studyStage: 'ابتدائي',
    schoolName: 'مدرسة الفاروق الابتدائية',
    fatherPhone: '01012345678',
    motherPhone: '01123456789',
    fatherStatus: 'الأب على قيد الحياة',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'seed-2',
    studentName: 'عمر عبد الرحمن مصطفى',
    studentAge: 13,
    studyStage: 'إعدادي',
    schoolName: 'معهد الأزهر النموذجي الإعدادي',
    fatherPhone: '01223456789',
    motherPhone: '01098765432',
    fatherStatus: 'يتيم الأب',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'seed-3',
    studentName: 'يوسف محمود حسن',
    studentAge: 16,
    studyStage: 'ثانوي',
    schoolName: 'مدرسة الشروق الثانوية بنين',
    fatherPhone: '01556789012',
    motherPhone: '',
    fatherStatus: 'يتيم الأبوين',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'seed-4',
    studentName: 'حمزة إبراهيم خالد',
    studentAge: 6,
    studyStage: 'حضانة',
    schoolName: 'روضة براعم الإيمان',
    fatherPhone: '01034567890',
    motherPhone: '01187654321',
    fatherStatus: 'الأب على قيد الحياة',
    photoUrl: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'seed-5',
    studentName: 'عبد الله طارق سعيد',
    studentAge: 11,
    studyStage: 'معهد أزهري',
    schoolName: 'معهد الفتح الأزهر الابتدائية',
    fatherPhone: '01298765432',
    motherPhone: '01011223344',
    fatherStatus: 'يتيم الأب',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'kuttab_students_data';

// Initialize localStorage if empty
const getLocalStudents = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_STUDENTS));
    return SEED_STUDENTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveLocalStudents = (students) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
  window.dispatchEvent(new Event('storage'));
};

/**
 * Subscribe to live student updates (Firestore or LocalStorage)
 */
export const subscribeToStudents = (callback) => {
  if (db) {
    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const students = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }));
      callback(students);
    }, (error) => {
      console.warn('Firestore subscription error, using local storage:', error);
      callback(getLocalStudents());
    });
  } else {
    // LocalStorage fallback with listener
    callback(getLocalStudents());
    const handleStorageChange = () => callback(getLocalStudents());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }
};

/**
 * Save new student registration
 */
export const saveStudentRegistration = async (studentData) => {
  const newRecord = {
    ...studentData,
    createdAt: new Date().toISOString()
  };

  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...studentData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...newRecord };
    } catch (e) {
      console.error('Firestore save failed, saving locally:', e);
    }
  }

  // Fallback save to localStorage
  const current = getLocalStudents();
  const studentWithId = { id: 'local-' + Date.now(), ...newRecord };
  const updated = [studentWithId, ...current];
  saveLocalStudents(updated);
  return studentWithId;
};

/**
 * Delete a student record
 */
export const deleteStudentRecord = async (id) => {
  if (db && !id.startsWith('local-') && !id.startsWith('seed-')) {
    try {
      await deleteDoc(doc(db, 'students', id));
      return true;
    } catch (e) {
      console.error('Firestore delete failed:', e);
    }
  }

  // Fallback local delete
  const current = getLocalStudents();
  const updated = current.filter(s => s.id !== id);
  saveLocalStudents(updated);
  return true;
};

/**
 * Export students list to UTF-8 CSV (Excel compatible)
 */
export const exportStudentsToCSV = (students) => {
  if (!students || !students.length) return;

  const headers = [
    'م',
    'اسم الطالب',
    'السن',
    'المرحلة الدراسية',
    'المدرسة / المعهد',
    'رقم الأب (الواتساب)',
    'رقم الأم',
    'حالة الأب',
    'رابط الصورة',
    'تاريخ التسجيل'
  ];

  const rows = students.map((s, index) => [
    index + 1,
    `"${s.studentName || ''}"`,
    s.studentAge || '',
    `"${s.studyStage || ''}"`,
    `"${s.schoolName || ''}"`,
    `"${s.fatherPhone || ''}"`,
    `"${s.motherPhone || ''}"`,
    `"${s.fatherStatus || ''}"`,
    `"${s.photoUrl || ''}"`,
    `"${new Date(s.createdAt).toLocaleDateString('ar-EG')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `كشف_طلاب_الكتاب_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export to JSON Backup
 */
export const exportStudentsToJSON = (students) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
  const link = document.createElement('a');
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `نسخة_احتياطية_الكتاب_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
