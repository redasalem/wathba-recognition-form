import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Home, Menu, X, LogIn, Sparkles, Award } from 'lucide-react';

export default function Header({ activeView, onNavigate, isAdminLoggedIn, onOpenLoginModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#041915]/95 border-b border-[#fbbf24]/20 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* LOGO & BRAND TITLE */}
        <div
          onClick={() => handleNav('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-[#fbbf24] p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#062b24] rounded-[10px] flex items-center justify-center text-[#fbbf24]">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white tracking-wide">كُتّاب</span>
              <span className="text-xs font-bold text-[#fbbf24] px-1.5 py-0.5 rounded bg-[#fbbf24]/10 border border-[#fbbf24]/30">
                KUTTAB
              </span>
            </div>
            <p className="text-[10px] text-emerald-300/80 font-medium">المنظومة الذكية لتحفيظ القرآن الكريم والتربية</p>
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-2 bg-[#062b24]/60 p-1 rounded-xl border border-emerald-800/40">
          <button
            onClick={() => handleNav('landing')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'landing'
                ? 'bg-[#fbbf24] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </button>

          <button
            onClick={() => handleNav('permanent-form')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'permanent-form'
                ? 'bg-gradient-to-r from-emerald-400 to-[#fbbf24] text-slate-950 shadow-md font-black scale-105'
                : 'text-amber-300 hover:text-white hover:bg-emerald-800/30 font-extrabold'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#fbbf24]" />
            استمارة الكُتّاب الدائم
          </button>

          <button
            onClick={() => handleNav('student-gate')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'student-gate' || activeView === 'form' || activeView === 'student-profile' || activeView === 'success'
                ? 'bg-[#fbbf24] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <Award className="w-4 h-4" />
            بوابة تكريم الطلاب 2026
          </button>
        </nav>

        {/* RIGHT ACTION: UNIFIED LOGIN BUTTON */}
        <div className="hidden md:flex items-center gap-3">
          {isAdminLoggedIn ? (
            <button
              onClick={() => handleNav('admin')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl border border-emerald-400/40 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
              لوحة التحكم الإدارية
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-emerald-950/60 border border-emerald-700/40"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#041915] border-b border-emerald-800/50 p-4 space-y-2 animate-fade-in">
          <button
            onClick={() => handleNav('landing')}
            className={`w-full p-3 rounded-xl text-right text-xs font-bold flex items-center gap-3 ${
              activeView === 'landing' ? 'bg-[#fbbf24] text-slate-950 font-black' : 'text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </button>

          <button
            onClick={() => handleNav('permanent-form')}
            className={`w-full p-3 rounded-xl text-right text-xs font-bold flex items-center gap-3 ${
              activeView === 'permanent-form'
                ? 'bg-gradient-to-r from-emerald-400 to-[#fbbf24] text-slate-950 font-black'
                : 'text-amber-300 bg-emerald-950/40 border border-amber-400/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#fbbf24]" />
            استمارة الكُتّاب الدائم
          </button>

          <button
            onClick={() => handleNav('student-gate')}
            className={`w-full p-3 rounded-xl text-right text-xs font-bold flex items-center gap-3 ${
              activeView === 'student-gate' || activeView === 'form' || activeView === 'student-profile' || activeView === 'success'
                ? 'bg-[#fbbf24] text-slate-950 font-black'
                : 'text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            بوابة تكريم الطلاب 2026
          </button>

          <div className="pt-2 border-t border-emerald-900/60">
            {isAdminLoggedIn ? (
              <button
                onClick={() => handleNav('admin')}
                className="w-full p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-3"
              >
                <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
                لوحة التحكم المباشرة
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-3 justify-center shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
