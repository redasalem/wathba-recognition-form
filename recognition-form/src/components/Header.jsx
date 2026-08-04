import React from 'react';
import { ShieldCheck, BookOpen, Sparkles, LayoutDashboard, LogOut, Users } from 'lucide-react';

export default function Header({ onOpenAdmin, onLogout, isAdminLoggedIn, activeView, setActiveView, studentCount }) {
  return (
    <header className="w-full max-w-6xl mx-auto px-4 pt-6 pb-2 relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-900/40 border border-teal-400/30 text-white animate-popIn">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              الكُتّاب
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> الدورة الصيفية
            </span>
          </div>
          <p className="text-xs text-teal-200/80 font-medium">
            النظام الذكي لتحفيظ القرآن الكريم والتكريم
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {isAdminLoggedIn && (
          <>
            <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveView('form')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'form'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                نموذج الطالب
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                لوحة التحكم
                {studentCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[10px] font-black bg-teal-500 text-white shadow-sm">
                    {studentCount}
                  </span>
                )}
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="تسجيل خروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </>
        )}

        {!isAdminLoggedIn && (
          <button
            onClick={onOpenAdmin}
            className="group px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-md shadow-lg cursor-pointer"
            title="لوحة الإدارة والإحصائيات"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>دخول الإدارة 🔐</span>
          </button>
        )}
      </div>
    </header>
  );
}
