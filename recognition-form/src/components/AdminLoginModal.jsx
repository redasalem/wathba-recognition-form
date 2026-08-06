import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminLoginModal({ onClose, onSuccess, showToast }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');


  const targetPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'kuttab2026';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === targetPassword) {
      onSuccess();
      setPassword('');
      onClose();
    } else {
      setError('كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeInUp">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 shadow-2xl p-6 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-900/30 animate-popIn">
          <Lock className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-center text-lg font-black text-white mb-1">
          تسجيل دخول لوحة الإدارة 🔐
        </h3>
        <p className="text-center text-xs text-slate-400 mb-5">
          قم بإدخال كلمة المرور المخصصة لمسؤولي نظام الكُتّاب
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>كلمة المرور</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:bg-white/10 transition-all pl-10"
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

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>دخول لوحة التحكم</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>الكُتّاب | حماية الإدارة والإحصائيات</span>
        </div>
      </div>
    </div>
  );
}
