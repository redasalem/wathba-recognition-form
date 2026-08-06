import React, { useState } from 'react';
import { BookOpen, ShieldCheck, UserCheck, Award, Home, Menu, X, Sparkles } from 'lucide-react';

export default function Header({ activeView, onNavigate, isAdminLoggedIn, onOpenAdminModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#041915]/90 border-b border-[#fbbf24]/20 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* LOGO & BRAND */}
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

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-2 bg-[#062b24]/60 p-1.5 rounded-xl border border-emerald-800/40">
          
          <button
            onClick={() => handleNav('landing')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'landing'
                ? 'bg-[#fbbf24] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <Home className="w-4 h-4" />
            الرئيسية والتعريف
          </button>

          <button
            onClick={() => handleNav('form')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'form'
                ? 'bg-[#fbbf24] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <Award className="w-4 h-4" />
            نموذج الطالب
          </button>

          <button
            onClick={() => handleNav('sheikh-form')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'sheikh-form'
                ? 'bg-[#fbbf24] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            نموذج الشيخ
          </button>

        </nav>

        {/* RIGHT ACTION: ADMIN LOGIN */}
        <div className="hidden md:flex items-center gap-3">
          {isAdminLoggedIn ? (
            <button
              onClick={() => handleNav('admin')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl border border-emerald-400/40 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
              لوحة التحكم
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="px-4 py-2 bg-[#062b24] hover:bg-[#0c3d34] text-[#fbbf24] text-xs font-bold rounded-xl border border-[#fbbf24]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              دخول الإدارة
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
            الرئيسية والتعريف
          </button>

          <button
            onClick={() => handleNav('form')}
            className={`w-full p-3 rounded-xl text-right text-xs font-bold flex items-center gap-3 ${
              activeView === 'form' ? 'bg-[#fbbf24] text-slate-950 font-black' : 'text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            نموذج الطالب
          </button>

          <button
            onClick={() => handleNav('sheikh-form')}
            className={`w-full p-3 rounded-xl text-right text-xs font-bold flex items-center gap-3 ${
              activeView === 'sheikh-form' ? 'bg-[#fbbf24] text-slate-950 font-black' : 'text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            نموذج الشيخ / المعلم
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
                  onOpenAdminModal();
                }}
                className="w-full p-3 bg-[#062b24] text-[#fbbf24] border border-[#fbbf24]/30 rounded-xl text-xs font-bold flex items-center gap-3"
              >
                <ShieldCheck className="w-4 h-4" />
                دخول الإدارة
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
