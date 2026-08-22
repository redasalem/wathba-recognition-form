import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, KeyRound, X, AlertCircle, Eye, EyeOff, ShieldCheck, Users, ArrowLeft, Sparkles, BookOpen } from 'lucide-react';

export default function LoginPortalModal({ onClose, onAdminSuccess, onSheikhSelect, showToast }) {
  // Roles: 'admin' | 'sheikh'
  const [activeRole, setActiveRole] = useState('admin');

  // Admin state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // 🔑 Close on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const targetPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'kuttab2026@@';
  const validPasswords = [targetPassword, 'kuttab', 'kuttab2026', 'kuttab2026@@'];

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('⚠️ يرجى إدخال كلمة المرور');
      return;
    }

    if (validPasswords.includes(password.trim())) {
      if (rememberMe) {
        localStorage.setItem('kuttab_admin_session', 'true');
        localStorage.setItem('kuttab_admin_auth', 'true');
      } else {
        localStorage.removeItem('kuttab_admin_session');
        localStorage.removeItem('kuttab_admin_auth');
      }
      onAdminSuccess();
      setPassword('');
      onClose();
    } else {
      setError('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border-2 border-[#fbbf24]/40 bg-[#062b24] shadow-2xl p-5 sm:p-6 relative overflow-hidden text-slate-100 animate-scaleIn my-auto"
      >
        
        {/* Glow background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#fbbf24]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center text-[#fbbf24] mx-auto mb-2 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">تسجيل الدخول للمنظومة 🔐</h3>
          <p className="text-xs text-slate-300">اختر نوع الدخول المطلوب للمتابعة</p>
        </div>

        {/* ONLY 2 ROLES: ADMIN & SHEIKH */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-emerald-700/40 mb-5 text-xs font-bold">
          <button
            onClick={() => { setActiveRole('admin'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-[#fbbf24] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>المدير / Admin</span>
          </button>

          <button
            onClick={() => { setActiveRole('sheikh'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'sheikh'
                ? 'bg-[#fbbf24] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الشيخ / المحفظ</span>
          </button>
        </div>

        {/* ROLE 1: ADMIN LOGIN */}
        {activeRole === 'admin' && (
          <form noValidate onSubmit={handleAdminSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                كلمة مرور لوحة التحكم (Admin Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور الإدارة..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-emerald-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] transition-all pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-emerald-700 bg-slate-900 text-[#fbbf24] focus:ring-[#fbbf24] cursor-pointer"
              />
              <label htmlFor="rememberMe" className="cursor-pointer text-slate-200 hover:text-white">
                تذكر تسجيل الدخول على هذا الجهاز (Remember Me)
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>دخول لوحة التحكم (Admin Dashboard) 🚀</span>
            </button>
          </form>
        )}

        {/* ROLE 2: SHEIKH PORTAL ACCESS */}
        {activeRole === 'sheikh' && (
          <div className="space-y-4 text-center py-2 animate-fade-in">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/40 space-y-3 text-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#fbbf24]">بوابة مشايخ ومعلمي الكُتّاب</h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                مرحباً بكم يا أهل القرآن.. يمكنكم تسجيل بياناتكم أو تحديث الفصول والحلقات والمكافآت عبر استمارة المعلمين المعتمدة.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSheikhSelect) {
                  onSheikhSelect();
                } else {
                  window.location.hash = '/sheikh-form';
                }
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>فتح استمارة تسجيل وتحديث بيانات الشيخ 👳‍♂️</span>
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
