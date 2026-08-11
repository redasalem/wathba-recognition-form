import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import StudentForm from './components/StudentForm';
import SheikhForm from './components/SheikhForm';
import SuccessView from './components/SuccessView';
import AdminDashboard from './components/AdminDashboard';
import LoginPortalModal from './components/LoginPortalModal';
import { subscribeStudents } from './firebase';

export default function App() {
  // Views: 'landing' | 'form' | 'sheikh-form' | 'success' | 'admin'
  const [activeView, setActiveView] = useState('landing');
  const [records, setRecords] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);

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

  // 🔗 URL HASH & ROUTE INITIALIZATION (Direct Form URLs)
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (hash.includes('sheikh-form') || path.includes('sheikh-form') || search.includes('sheikh-form')) {
        setActiveView('sheikh-form');
      } else if (hash.includes('student-form') || hash.includes('form') || path.includes('form') || search.includes('form')) {
        setActiveView('form');
      } else if (hash.includes('admin') || path.includes('admin') || search.includes('admin')) {
        setActiveView('admin');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, []);

  // Sync hash when activeView changes
  const handleNavigate = (view) => {
    setActiveView(view);
    if (view === 'sheikh-form') {
      window.location.hash = '/sheikh-form';
    } else if (view === 'form') {
      window.location.hash = '/student-form';
    } else if (view === 'admin') {
      window.location.hash = '/admin';
    } else {
      window.location.hash = '';
    }
  };

  // Realtime Firebase Listener for Students
  useEffect(() => {
    const unsubscribe = subscribeStudents(
      (data) => {
        setRecords(data);
      },
      (err) => {
        console.error('Firebase error:', err);
        showToast('حدث خطأ في الاتصال بقاعدة البيانات', 'error');
      }
    );
    return () => unsubscribe();
  }, [showToast]);

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
    setActiveView('success');
  };

  const handleSheikhFormSuccess = (sheikhRecord) => {
    // Optionally return to landing or show notification
  };

  return (
    <div className="min-h-screen bg-[#041915] text-slate-100 font-['Cairo',sans-serif] flex flex-col selection:bg-[#fbbf24] selection:text-slate-950">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border text-xs font-black backdrop-blur-xl animate-bounce flex items-center gap-2 ${
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

        {activeView === 'form' && (
          <StudentForm onSuccess={handleStudentFormSuccess} showToast={showToast} />
        )}

        {activeView === 'sheikh-form' && (
          <SheikhForm onSuccess={handleSheikhFormSuccess} showToast={showToast} />
        )}

        {activeView === 'success' && (
          <SuccessView
            submittedData={submittedData}
            onRegisterAnother={() => handleNavigate('form')}
            onGoHome={() => handleNavigate('landing')}
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
