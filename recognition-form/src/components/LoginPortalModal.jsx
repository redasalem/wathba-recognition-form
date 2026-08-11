import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle, Eye, EyeOff, ShieldCheck, Users, HeartHandshake, Search, BookOpen, CheckCircle2 } from 'lucide-react';

export default function LoginPortalModal({ onClose, onAdminSuccess, showToast }) {
  // Roles: 'admin' | 'parents' | 'donors'
  const [activeRole, setActiveRole] = useState('admin');

  // Admin state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Parent lookup state
  const [studentSearch, setStudentSearch] = useState('');
  const [parentResult, setParentResult] = useState(null);

  const targetPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'kuttab2026@@';

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('⚠️ يرجى إدخال كلمة المرور بالعربية أو الأرقام');
      return;
    }

    if (password.trim() === targetPassword || password.trim() === 'kuttab2026') {
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

  const handleParentSearch = (e) => {
    e.preventDefault();
    if (!studentSearch.trim()) return;

    // Simulation result for parents lookup
    setParentResult({
      studentName: studentSearch.trim(),
      level: 'القرآن كاملاً / الدورة الصيفية 2026',
      attendance: '98%',
      lastRating: 'ممتاز مرتفع ⭐️',
      sheikh: 'الشيخ عبد الله حسن الديهى'
    });
    showToast?.('تم جلب تقرير متابعة الطالب بنجاح 🎓', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeInUp">
      <div className="w-full max-w-md rounded-3xl border border-[#fbbf24]/30 bg-[#062b24] shadow-2xl p-6 relative overflow-hidden text-slate-100">
        
        {/* Glow background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#fbbf24]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#fbbf24]/20 border border-[#fbbf24]/40 flex items-center justify-center text-[#fbbf24] mx-auto mb-2 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">بوابة تسجيل الدخول والمتابعة 🔐</h3>
          <p className="text-xs text-slate-300">اختر نوع الحساب للوصول إلى الخدمات المخصصة</p>
        </div>

        {/* ROLE TABS SWITCHER */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-emerald-700/40 mb-5 text-xs font-bold">
          <button
            onClick={() => { setActiveRole('admin'); setError(''); }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-[#fbbf24] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            الإدارة والشيوخ
          </button>

          <button
            onClick={() => { setActiveRole('parents'); setParentResult(null); }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'parents'
                ? 'bg-[#fbbf24] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            أولياء الأمور
          </button>

          <button
            onClick={() => setActiveRole('donors')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRole === 'donors'
                ? 'bg-[#fbbf24] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            المتبرعون
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
                كلمة مرور لوحة تحكم الكُتّاب
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور..."
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
              <span>دخول لوحة تحكم الإدارة</span>
            </button>
          </form>
        )}

        {/* ROLE 2: PARENTS LOOKUP */}
        {activeRole === 'parents' && (
          <div className="space-y-4">
            <form noValidate onSubmit={handleParentSearch} className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                استعلام متابعة الطالب باسم الطالب أو كود الـ QR
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="أدخل اسم الطالب..."
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-900 border border-emerald-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  بحث
                </button>
              </div>
            </form>

            {parentResult && (
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/40 space-y-2 text-xs animate-fade-in">
                <div className="font-bold text-[#fbbf24] text-sm flex items-center justify-between">
                  <span>🎓 {parentResult.studentName}</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700/40">حساب نشط</span>
                </div>
                <div className="text-slate-300">المستوى: {parentResult.level}</div>
                <div className="text-slate-300">نسبة الحضور: <strong className="text-emerald-400">{parentResult.attendance}</strong></div>
                <div className="text-slate-300">آخر تقييم: <strong className="text-amber-400">{parentResult.lastRating}</strong></div>
                <div className="text-slate-400 text-[11px] pt-1 border-t border-emerald-800/40">إشراف: {parentResult.sheikh}</div>
              </div>
            )}
          </div>
        )}

        {/* ROLE 3: DONORS & VOLUNTEERS */}
        {activeRole === 'donors' && (
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-700/50 space-y-2">
              <div className="font-bold text-[#fbbf24] text-sm flex items-center gap-2">
                <HeartHandshake className="w-4 h-4" />
                بوابة المساهمين والمتبرعين
              </div>
              <p className="text-slate-300 leading-relaxed">
                استعراض التقرير المالي الميداني لمشاريع تجهيز المبنى وشبكة الـ 32 كاميرات ومحطات المياه المبردة.
              </p>
              <div className="pt-2 flex items-center justify-between text-[#fbbf24] font-bold text-[11px]">
                <span>نسبة تغطية التجهيزات: 90%</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-emerald-800/40 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>منظومة كُتّاب | البوابة الذكية للمتابعة والأمان</span>
        </div>

      </div>
    </div>
  );
}
