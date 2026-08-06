import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import StudentForm from './components/StudentForm';
import SheikhForm from './components/SheikhForm';
import SuccessView from './components/SuccessView';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { subscribeStudents, subscribeSheikhs } from './firebase';

export default function App() {
  // Views: 'landing' | 'form' | 'sheikh-form' | 'success' | 'admin'
  const [activeView, setActiveView] = useState('landing');
  const [records, setRecords] = useState([]);
  const [sheikhs, setSheikhs] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);

  // Admin auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

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

  // Realtime Firebase Listener for Sheikhs
  useEffect(() => {
    const unsubscribe = subscribeSheikhs(
      (data) => {
        setSheikhs(data);
      },
      (err) => {
        console.error('Sheikhs Firebase error:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminModalOpen(false);
    setActiveView('admin');
    showToast('تم تسجيل دخول الإدارة بنجاح 🔑', 'success');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveView('landing');
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const handleStudentFormSuccess = (studentRecord) => {
    setSubmittedData(studentRecord);
    setActiveView('success');
  };

  const handleSheikhFormSuccess = (sheikhRecord) => {
    showToast(`تم إدراج بيانات فضيلة الشيخ (${sheikhRecord.name}) بنجاح 🎉`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#041915] text-slate-100 font-['Cairo',sans-serif] flex flex-col selection:bg-[#fbbf24] selection:text-slate-950">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border text-xs font-black backdrop-blur-xl animate-fadeInUp flex items-center gap-2 ${
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
        onNavigate={(view) => setActiveView(view)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeView === 'landing' && (
          <LandingPage
            onNavigate={(view) => setActiveView(view)}
            studentsCount={records.length}
            sheikhsCount={sheikhs.length}
          />
        )}

        {activeView === 'form' && (
          <StudentForm onSuccess={handleStudentFormSuccess} showToast={showToast} />
        )}

        {activeView === 'sheikh-form' && (
          <SheikhForm onSuccess={handleSheikhFormSuccess} showToast={showToast} />
        )}

        {activeView === 'success' && (
          <SuccessView
            studentData={submittedData}
            onReset={() => setActiveView('form')}
            onViewDashboard={() => setActiveView('admin')}
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
            <div className="text-center py-20">
              <p className="text-slate-400 mb-4">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-6 py-3 bg-[#fbbf24] text-slate-950 font-black rounded-xl"
              >
                فتح نافذة الدخول
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

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminModalOpen(false)}
          onSuccess={handleAdminLoginSuccess}
          showToast={showToast}
        />
      )}
    </div>
  );
}
