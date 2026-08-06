import React from 'react';
import {
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Building,
  Video,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  QrCode,
  Heart,
  Calendar,
  Smartphone,
  Sun,
  Flame,
  Check,
  Activity,
  Layers,
  ChevronLeft,
  AlertTriangle,
  History,
  Image as ImageIcon
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in text-slate-100 px-4 py-6">
      
      {/* ⚠️ DEMO BETA SYSTEM NOTICE BANNER */}
      <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#fbbf24] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-[#fbbf24]">تنبيه مرحلة التشغيل التجريبي (Beta/Demo System)</div>
            <p className="text-[11px] text-slate-300">
              المنظومة والواجهات الذكية حالياً في المرحلة التجريبية لخدمة كُتّاب 2026 .. وكافة البيانات والأرقام المعروضة هي <strong>بيانات تجريبية وقيد المراجعة والتدقيق المستمر</strong>.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-amber-500/20 text-[#fbbf24] text-[11px] font-bold rounded-lg border border-amber-500/30 shrink-0">
          نسخة تجريبية 2026
        </span>
      </div>

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

        <p className="text-base sm:text-xl font-bold text-emerald-200 mb-6 max-w-3xl mx-auto leading-relaxed">
          "الأصالة في التحفيظ والتربية .. والسهولة والذكاء في النظام والمتابعة"
        </p>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          نرفع الأعباء الإدارية والورقية عن الشيوخ لتفرّغ التلاوة والتربية، ونوفر مراجعة وتقييمات لحظية لأولياء الأمور عبر كروت الـ QR Code، مع تطوير شامل للمبنى والأمان.
        </p>

        {/* أزرار الإجراءات الرئيسية */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('form')}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <Award className="w-5 h-5" />
            استكمال بيانات طالب مكرم
          </button>

          <button
            onClick={() => onNavigate('sheikh-form')}
            className="px-6 py-3.5 bg-[#0c3d34] hover:bg-[#114b40] text-emerald-300 font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <Users className="w-5 h-5" />
            تسجيل معلم / شيخ
          </button>

          <a
            href="https://www.facebook.com/profile.php?id=61592682399138"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold rounded-xl border border-blue-500/30 transition-all flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            صفحة الفيسبوك الرسمية
          </a>
        </div>
      </div>

      {/* 📊 2. COUNTERS GRID (مؤشرات الإنجاز الحية التجريبية) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 text-center backdrop-blur-xl hover:border-[#fbbf24]/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-[#fbbf24] mb-1">141+</div>
          <div className="text-xs font-bold text-slate-200">طالب وطالبة مقيدين</div>
          <div className="text-[11px] text-slate-400 mt-1">بيانات قيد المراجعة</div>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 text-center backdrop-blur-xl hover:border-[#fbbf24]/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-[#fbbf24] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-[#fbbf24] mb-1">14</div>
          <div className="text-xs font-bold text-slate-200">شيخ ومحفظ متفرغ</div>
          <div className="text-[11px] text-slate-400 mt-1">إشراف وتربية مستمرة</div>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 text-center backdrop-blur-xl hover:border-[#fbbf24]/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Video className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-[#fbbf24] mb-1">32</div>
          <div className="text-xs font-bold text-slate-200">كاميرا مراقبة Hikvision</div>
          <div className="text-[11px] text-slate-400 mt-1">منظومة أمان وحماية شاملة</div>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 text-center backdrop-blur-xl hover:border-[#fbbf24]/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
            <Building className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-[#fbbf24] mb-1">5</div>
          <div className="text-xs font-bold text-slate-200">فصول مجهزة + صالة كبرى</div>
          <div className="text-[11px] text-slate-400 mt-1">تتسع لـ 250+ طالب بالدور الـ6</div>
        </div>
      </div>

      {/* 📜 3. ARCHIVE & TIMELINE SHOWCASE (أرشيف والخط الزمني للأنشطة) */}
      <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#fbbf24] mb-1">
              <History className="w-4 h-4" />
              أرشيف وإنجازات الكُتّاب
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">الخط الزمني لتطور الأنشطة والمبنى (Timeline Archive)</h3>
          </div>

          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/40">
            أرشيف الأعمال
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-emerald-700/40 space-y-2">
            <span className="text-xs font-bold text-amber-400">📅 المرحلة الأولى (التأسيس والتحفيظ)</span>
            <h4 className="text-sm font-black text-white">تأسيس فصول الكتاتيب الأصيلة</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              انطلاق حلقات التحفيظ بالقرية، والتركيز على مخارج الحروف والتلاوة المباشرة على الشيوخ.
            </p>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-emerald-700/40 space-y-2">
            <span className="text-xs font-bold text-emerald-400">📅 المرحلة الثانية (تطوير المبنى والأمان)</span>
            <h4 className="text-sm font-black text-white">شبكة الكاميرات وصالة الدور الـ 6</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              تجهيز 32 كاميرا Hikvision لمراقبة دخول وخروج الأطفال وسقف الفايبر الحراري بالصالة الكبرى.
            </p>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-emerald-700/40 space-y-2">
            <span className="text-xs font-bold text-[#fbbf24]">📅 المرحلة الثالثة (التحول الرقمي 2026)</span>
            <h4 className="text-sm font-black text-white">كروت QR Code والدورة الصيفية</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              الربط بالمنظومة الذكية بكروت الـ QR وتفرغ الشيوخ وتكريم 141 طالباً وطالبة بالمسابقة الصيفية.
            </p>
          </div>
        </div>
      </div>

      {/* 🏗️ 4. DAILY DEVELOPMENT & METHODOLOGY SHOWCASE */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">
            <Activity className="w-4 h-4" />
            التحديثات الميدانية واليومية
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">متابعة أعمال التطوير والمنهجية اليومية</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            خطوات عملية ومستمرة لتطوير المبنى والأمان والمنظومة الذكية مع الطلاب للشيوخ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* كارت 1 */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-4 hover:border-[#fbbf24]/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#fbbf24]">🏢 1. تطوير المبنى والأمان</h3>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                شبكة مراقبة بـ 32 كاميرا Hikvision لتأمين الأطفال.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                سقف فايبر حراري لصالة الدور السادس الواسعة.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                كولدير مياه شرب نقي ومرافق نظافة متكاملة.
              </li>
            </ul>
          </div>

          {/* كارت 2 */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-4 hover:border-[#fbbf24]/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#fbbf24]">💻 2. المنظومة الذكية والسيستم</h3>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                كروت QR Code فردية لحساب غياب وتقييم الطالب.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                رفع الأعباء الإدارية والورقية عن الشيوخ لتفرّغ التلاوة.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                تقارير إلكترونية لحظية تصل لأولياء الأمور.
              </li>
            </ul>
          </div>

          {/* كارت 3 */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-4 hover:border-[#fbbf24]/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-[#fbbf24] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#fbbf24]">📖 3. منهجية الشيوخ والتحفيظ</h3>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                حفظ جديد + مراجعة قريبة + مراجعة بعيدة يومياً.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                تدريب متصل على أحكام التجويد ومتون الأزهر.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                تكريم وتصعيد الخاتمين والمتميزين أسبوعياً.
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
