import React from 'react';
import {
  BookOpen,
  Award,
  Users,
  Sparkles,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Star,
  QrCode
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in text-slate-100 px-4 py-6">
      
      {/* 🌟 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0c3d34] to-[#041915] border border-[#fbbf24]/30 p-8 sm:p-12 shadow-2xl text-center">
        
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fbbf24]/15 border border-[#fbbf24]/40 text-[#fbbf24] text-xs font-black mb-6">
          <Sparkles className="w-4 h-4" />
          المنظومة الذكية لتحفيظ القرآن الكريم والتربية
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
          كُتّاب | <span className="text-[#fbbf24]">KUTTAB</span>
        </h1>

        <p className="text-base sm:text-xl font-bold text-emerald-200 mb-4 max-w-3xl mx-auto leading-relaxed">
          "الأصالة في التحفيظ والتربية .. والسهولة والذكاء في المتابعة والتكريم"
        </p>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          نرحب بأولياء الأمور الكرام وضيوفنا الأفاضل في المنظومة الرقمية لخدمة كتاب الله وتكريم أهل القرآن
        </p>

        {/* أزرار الإجراءات الرئيسية */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.facebook.com/profile.php?id=61592682399138"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-5 h-5" />
            صفحة الفيسبوك الرسمية
          </a>
        </div>
      </div>

      {/* 🏆 2. CEREMONY ANNOUNCEMENT & DETAILS (إعلان وتفاصيل حفل التكريم) */}
      <div className="rounded-3xl border border-[#fbbf24]/40 bg-[#062b24]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-emerald-800/40 pb-5 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-[#fbbf24]/50 flex items-center justify-center text-[#fbbf24] shadow-lg shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black text-[#fbbf24]">الحدث البارز 2026</span>
              <h2 className="text-xl sm:text-2xl font-black text-white">حفل ختام وتكريم الدورة الصيفية لكتاب الله</h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
            <CheckCircle2 className="w-4 h-4" />
            <span>الدعوة عامة لأهالينا الكرام</span>
          </div>
        </div>

        {/* تفاصيل الحفل */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-700/40 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#fbbf24] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold">موعد الحفل</div>
              <div className="text-sm font-black text-white">الجمعة 28 أغسطس 2026</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-700/40 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold">المكان</div>
              <div className="text-sm font-black text-white">نادى أبو زينة الرياضى</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-700/40 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold">التوقيت</div>
              <div className="text-sm font-black text-white">عقب صلاة العصر مباشرة</div>
            </div>
          </div>
        </div>

        {/* فقرات الحفل والمفاجآت */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#062b24] to-emerald-500/10 border border-[#fbbf24]/30 space-y-3">
          <h3 className="text-sm font-black text-[#fbbf24] flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span>أبرز فعاليات وفقرات حفل التكريم:</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✦</span>
              تتويج حفظة القرآن كاملاً بتاج الوقار والدروع التذكارية المذهبة.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✦</span>
              توزيع الجوائز والمكافآت المالية لكافة المستويات القرآنية.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✦</span>
              تكريم شيوخ ومحفظي الكُتّاب تقديراً لجهدهم المبارك طوال الدورة.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✦</span>
              عرض الإنجازات والتطويرات الإنشائية والتقنية الحديثة للمبنى.
            </li>
          </ul>
        </div>
      </div>

      {/* 📖 3. SYSTEM HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-3 hover:border-[#fbbf24]/40 transition-all text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-[#fbbf24] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#fbbf24]">تعليم وتلقين أصيل</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            التركيز على ضبط مخارج الحروف وأحكام التجويد والتلاوة المباشرة على نخبة من الشيوخ الأجلاء بالسند المتصل.
          </p>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-3 hover:border-[#fbbf24]/40 transition-all text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#fbbf24]">منظومة ذكية وكروت QR</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            تسهيل تسجيل ومتابعة بيانات الطلاب عبر كروت الـ QR Code لربط أولياء الأمور بنتائج وتكريمات أبنائهم.
          </p>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-3 hover:border-[#fbbf24]/40 transition-all text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#fbbf24]">بيئة تربوية آمنة</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            تجهيزات متطورة تشمل منظومة مراقبة حديثة، وقاعات مجهزة ومكيفة لراحة وسلامة أبنائنا وبناتنا.
          </p>
        </div>
      </div>

    </div>
  );
}
