import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudentForm from './components/StudentForm';
import SuccessView from './components/SuccessView';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { subscribeToStudents } from './firebase';

export default function App() {
  const [students, setStudents] = useState([]);
  const [activeView, setActiveView] = useState('form'); // 'form' | 'success' | 'dashboard'
  const [submittedData, setSubmittedData] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Subscribe to student registrations in real-time
  useEffect(() => {
    const unsubscribe = subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setActiveView('dashboard');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleFormSuccess = (studentRecord) => {
    setSubmittedData(studentRecord);
    setActiveView('success');
  };

  const handleResetForm = () => {
    setSubmittedData(null);
    setActiveView('form');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 relative overflow-x-hidden animate-gradientMove">
      
      {/* Background Decorative Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] right-[15%] w-72 h-72 rounded-full opacity-15 animate-float bg-teal-500/30 blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 rounded-full opacity-10 animate-float delay-200 bg-amber-500/20 blur-3xl"></div>
        <div className="absolute top-[50%] left-[50%] w-64 h-64 rounded-full opacity-10 animate-float delay-500 bg-indigo-500/20 blur-3xl"></div>

        {/* Floating particles */}
        <div className="absolute top-[20%] right-[30%] w-1.5 h-1.5 bg-teal-400 rounded-full animate-particle opacity-60"></div>
        <div className="absolute top-[40%] right-[60%] w-1 h-1 bg-amber-400 rounded-full animate-particle delay-300 opacity-40"></div>
        <div className="absolute top-[60%] right-[20%] w-2 h-2 bg-teal-300 rounded-full animate-particle delay-500 opacity-50"></div>
      </div>

      {/* Header */}
      <Header
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Views Container */}
      <main className="relative z-10 flex-grow p-3 sm:p-5 flex items-center justify-center">
        {activeView === 'form' && (
          <StudentForm onSuccess={handleFormSuccess} />
        )}

        {activeView === 'success' && (
          <SuccessView
            studentData={submittedData}
            onReset={handleResetForm}
            onViewDashboard={() => setActiveView('dashboard')}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        )}

        {activeView === 'dashboard' && (
          <AdminDashboard
            students={students}
            onRefresh={() => {}}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-5 text-center border-t border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="text-xs text-slate-400 font-semibold mb-1">
          الكُتّاب - النظام الذكي لتحفيظ القرآن الكريم والتكريم
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[10px] text-slate-500">Powered by</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            <span className="text-teal-400 font-extrabold text-[11px]">وثبـة | Wathba</span>
          </div>
        </div>
      </footer>

      {/* Admin Login Password Protection Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveView('dashboard');
        }}
      />
    </div>
  );
}
