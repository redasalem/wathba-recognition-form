import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import StudentForm from './components/StudentForm';
import StudentProfileView from './components/StudentProfileView';
import SheikhForm from './components/SheikhForm';
import SuccessView from './components/SuccessView';
import AdminDashboard, { isStudentFullyRegistered } from './components/AdminDashboard';
import LoginPortalModal from './components/LoginPortalModal';
import StudentVerificationGate from './components/StudentVerificationGate';
import { subscribeStudents } from './firebase';
import { STUDENTS_CATALOG, findStudentInCatalog, normalizeArabic, isStudentMatch } from './data/studentsCatalog';

export default function App() {
  // Views: 'landing' | 'form' | 'student-profile' | 'sheikh-form' | 'success' | 'admin'
  const [activeView, setActiveView] = useState('landing');
  const [records, setRecords] = useState([]);
  const [isRecordsLoaded, setIsRecordsLoaded] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  
  // Student Profile & Form Integration State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [initialStudentData, setInitialStudentData] = useState(null);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Auth & Login Portal Modal state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // 🔑 PERSISTENT AUTHENTICATION CHECK (Remember Me)
  useEffect(() => {
    const savedAuth = localStorage.getItem('kuttab_admin_session') || localStorage.getItem('kuttab_admin_auth');
    if (savedAuth === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // 🔍 Helper to parse URL params from window.location (search + hash)
  const extractUrlParams = useCallback(() => {
    let idParam = '';
    let nameParam = '';
    let codeParam = '';
    let modeParam = '';

    // 1. Parse standard window.location.search
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      idParam = searchParams.get('id') || '';
      nameParam = searchParams.get('name') || '';
      codeParam = searchParams.get('code') || '';
      modeParam = searchParams.get('mode') || '';
    }

    // 2. Parse query parameters inside window.location.hash (e.g. #/student/form?name=...&id=...)
    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      const hashParams = new URLSearchParams(hashQuery);
      if (!idParam) idParam = hashParams.get('id') || '';
      if (!nameParam) nameParam = hashParams.get('name') || '';
      if (!codeParam) codeParam = hashParams.get('code') || '';
      if (!modeParam) modeParam = hashParams.get('mode') || '';
    }

    return { idParam, nameParam, codeParam, modeParam };
  }, []);

  // 🔗 SMART URL ROUTING & STATE EVALUATOR
  const evaluateRoute = useCallback((currentRecords, adminLoggedIn) => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const { idParam, nameParam, codeParam, modeParam } = extractUrlParams();

    // 1. Sheikh Form Route → Requires admin login to access
    if (hash.includes('sheikh-form') || path.includes('sheikh-form')) {
      if (adminLoggedIn) {
        setActiveView('sheikh-form');
      } else {
        setActiveView('admin');
      }
      return;
    }

    // 2. Admin Dashboard Route
    if (hash.includes('admin') || path.includes('admin')) {
      setActiveView('admin');
      return;
    }

    // 3. QR Code Scan / Student Verification Gate Route
    // Any QR code scanned (or old printed card URLs with parameters) goes directly to the Student Verification Gate!
    if (
      hash.includes('student-gate') ||
      path.includes('student-gate') ||
      hash.includes('gate') ||
      idParam ||
      nameParam ||
      codeParam ||
      hash.includes('student') ||
      hash.includes('form')
    ) {
      // If student parameters were provided in the URL (from printed QR card or shared link), pre-fill the search query!
      if (nameParam || codeParam || idParam) {
        setInitialSearchQuery(nameParam || codeParam || idParam);
      }

      // Check if this is a direct profile request with an exact ID and the user specifically requested #/student-profile
      if (hash.includes('student-profile') && (idParam || codeParam || nameParam)) {
        const catalogMatch = findStudentInCatalog(idParam || codeParam || nameParam);
        const existingDoc = currentRecords.find(rec => {
          if (idParam && (rec.studentId === idParam || rec.id === idParam)) return true;
          if (codeParam && rec.studentCode && rec.studentCode.replace('#', '') === codeParam.replace('#', '')) return true;
          if (catalogMatch && isStudentMatch(rec, catalogMatch)) return true;
          if (nameParam && isStudentMatch(rec, { name: nameParam })) return true;
          return false;
        });

        if (catalogMatch || existingDoc) {
          setSelectedStudent({
            ...(catalogMatch || {}),
            ...(existingDoc || {})
          });
          setActiveView('student-profile');
          return;
        }
      }

      // Always route student QR scans and public form attempts to the secure verification gate
      setActiveView('student-gate');
      return;
    }

    // 4. Default Landing View
    if (!hash || hash === '#' || hash === '#/' || hash === '#landing') {
      setActiveView('landing');
    }
  }, [extractUrlParams]);

  // URL Hash Listener
  useEffect(() => {
    evaluateRoute(records, isAdminLoggedIn);
    const handleHashChange = () => evaluateRoute(records, isAdminLoggedIn);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [records, evaluateRoute, isAdminLoggedIn]);

  // Realtime Firebase Listener for Students
  useEffect(() => {
    const unsubscribe = subscribeStudents(
      (data) => {
        setRecords(data);
        if (!isRecordsLoaded) setIsRecordsLoaded(true);
      },
      (err) => {
        console.error('Firebase error:', err);
        setIsRecordsLoaded(true);
        showToast('حدث خطأ في الاتصال بقاعدة البيانات', 'error');
      }
    );
    return () => unsubscribe();
  }, [showToast]);

  // Sync hash when activeView changes
  const handleNavigate = (view) => {
    setActiveView(view);
    if (view === 'sheikh-form') {
      window.location.hash = '/sheikh-form';
    } else if (view === 'student-gate') {
      window.location.hash = '/student-gate';
    } else if (view === 'admin') {
      window.location.hash = '/admin';
    } else if (view === 'student-profile' && selectedStudent?.studentId) {
      window.location.hash = `/student-profile?id=${selectedStudent.studentId}`;
    } else {
      window.location.hash = '';
    }
  };

  const handleStudentVerified = (verifiedStudent) => {
    setSelectedStudent(verifiedStudent);
    setActiveView('student-profile');
    window.location.hash = `/student-profile?id=${verifiedStudent.studentId || ''}`;
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsLoginModalOpen(false);
    handleNavigate('admin');
    showToast('تم تسجيل دخول لوحة الإدارة بنجاح 🔑', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('kuttab_admin_session');
    localStorage.removeItem('kuttab_admin_auth');
    setIsAdminLoggedIn(false);
    handleNavigate('landing');
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const handleStudentFormSuccess = (studentRecord) => {
    setSubmittedData(studentRecord);
    setSelectedStudent(studentRecord);
    setActiveView('success');
  };

  const handleSheikhFormSuccess = (sheikhRecord) => {
    showToast('تم تسجيل بيانات الشيخ بنجاح 🌟', 'success');
    handleNavigate('admin');
  };

  const handleEditStudentFromProfile = (student) => {
    if (isAdminLoggedIn) {
      setInitialStudentData(student);
      setIsEditMode(true);
      setActiveView('form');
    } else {
      setIsLoginModalOpen(true);
      showToast('يرجى تسجيل الدخول كمسؤول لتعديل بيانات الطلاب', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#041915] text-slate-100 font-['Cairo',sans-serif] flex flex-col selection:bg-[#fbbf24] selection:text-slate-950">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[999999] px-6 py-3 rounded-xl shadow-2xl border text-xs font-black backdrop-blur-xl animate-bounce flex items-center gap-2 ${
            toast.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200'
              : toast.type === 'error'
              ? 'border-rose-500/40 bg-rose-950/90 text-rose-200'
              : 'border-[#fbbf24]/40 bg-[#062b24]/90 text-[#fbbf24]'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {activeView === 'student-gate' && (
          <StudentVerificationGate
            records={records}
            initialQuery={initialSearchQuery}
            onStudentVerified={handleStudentVerified}
            onGoHome={() => handleNavigate('landing')}
            isAdminLoggedIn={isAdminLoggedIn}
            showToast={showToast}
          />
        )}

        {activeView === 'form' && (
          isAdminLoggedIn ? (
            <StudentForm 
              initialStudentData={initialStudentData}
              isEditMode={isEditMode}
              onCancel={selectedStudent ? () => setActiveView('student-profile') : () => handleNavigate('admin')}
              onSuccess={handleStudentFormSuccess} 
              showToast={showToast} 
            />
          ) : (
            <div className="text-center py-20 bg-[#062b24]/80 rounded-3xl border border-emerald-700/40 p-8 my-8 max-w-md mx-auto">
              <p className="text-slate-300 text-xs mb-4">الاستمارة وتعديل بيانات الطلاب مخصصة للوحة الإدارة فقط</p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3 bg-[#fbbf24] text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-lg"
              >
                تسجيل الدخول كمسؤول 🔑
              </button>
            </div>
          )
        )}

        {activeView === 'student-profile' && selectedStudent && (
          <StudentProfileView
            student={selectedStudent}
            onEdit={handleEditStudentFromProfile}
            onGoHome={() => handleNavigate('student-gate')}
            isAdminLoggedIn={isAdminLoggedIn}
            showToast={showToast}
          />
        )}

        {activeView === 'sheikh-form' && (
          <SheikhForm onSuccess={handleSheikhFormSuccess} showToast={showToast} />
        )}

        {activeView === 'success' && (
          <SuccessView
            submittedData={submittedData}
            onViewProfile={() => {
              const stu = selectedStudent || submittedData;
              if (stu) {
                setSelectedStudent(stu);
                setActiveView('student-profile');
              }
            }}
            onRegisterAnother={() => {
              setInitialStudentData(null);
              setIsEditMode(false);
              handleNavigate('student-gate');
            }}
            onGoHome={() => handleNavigate('landing')}
            onViewDashboard={() => handleNavigate('admin')}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        )}

        {activeView === 'admin' && (
          isAdminLoggedIn ? (
            <AdminDashboard
              records={records}
              onLogout={handleLogout}
              showToast={showToast}
            />
          ) : (
            <div className="text-center py-20 bg-[#062b24]/80 rounded-3xl border border-emerald-700/40 p-8 my-8 max-w-md mx-auto">
              <p className="text-slate-300 text-xs mb-4">يرجى تسجيل الدخول للوصول إلى لوحة الإدارة والشيوخ</p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-3 bg-[#fbbf24] text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-lg"
              >
                فتح بوابة تسجيل الدخول 🔑
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-900/40 bg-[#02100d] py-6 text-center text-xs text-slate-400 space-y-2">
        <p className="font-bold">الكُتّاب - المنظومة الذكية لتحفيظ القرآن الكريم والتربية</p>
        <p className="text-[11px] text-emerald-400/80">
          Powered by <span className="font-black text-[#fbbf24]">Wathba | وثبة</span>
        </p>
      </footer>

      {/* Unified Login Portal Modal */}
      {isLoginModalOpen && (
        <LoginPortalModal
          onClose={() => setIsLoginModalOpen(false)}
          onAdminSuccess={handleAdminLoginSuccess}
          showToast={showToast}
        />
      )}
    </div>
  );
}
