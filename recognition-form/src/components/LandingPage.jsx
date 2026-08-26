import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  BookOpen,
  Award,
  Sparkles,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Star,
  QrCode,
  Heart
} from 'lucide-react';
import { STUDENTS_CATALOG, QURAN_PARTS_ORDER } from '../data/studentsCatalog';
import { subscribeStudents, subscribeSheikhs } from '../firebase';

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/share/1LpQGaqNUP/';

export default function LandingPage({ onNavigate }) {
  // Initial fallback data from static catalog
  const initialStudentsCount = STUDENTS_CATALOG.length;
  const initialFullQuranCount = STUDENTS_CATALOG.filter(s => s.part === "القرآن كاملاً").length;
  const totalLevels = QURAN_PARTS_ORDER.length;

  const [studentsCount, setStudentsCount] = useState(initialStudentsCount);
  const [sheikhsCount, setSheikhsCount] = useState(3);
  const [fullQuranCount, setFullQuranCount] = useState(initialFullQuranCount);

  useEffect(() => {
    // Realtime listener for students
    const unsubStudents = subscribeStudents(
      (data) => {
        // Filter out soft-deleted records if any
        const activeStudents = data.filter(s => s.isDeleted !== true && s.accountStatus !== 'DELETED');
        if (activeStudents.length > 0) {
          setStudentsCount(activeStudents.length);
          setFullQuranCount(activeStudents.filter(s => s.partName === "القرآن كاملاً" || s.part === "القرآن كاملاً").length);
        }
      },
      (err) => console.error('Failed to sync students for LandingPage:', err)
    );

    // Realtime listener for sheikhs
    const unsubSheikhs = subscribeSheikhs(
      (data) => {
        const activeSheikhs = data.filter(s => s.isDeleted !== true && s.accountStatus !== 'DELETED');
        if (activeSheikhs.length > 0) {
          setSheikhsCount(activeSheikhs.length);
        }
      },
      (err) => console.error('Failed to sync sheikhs for LandingPage:', err)
    );

    return () => {
      unsubStudents();
      unsubSheikhs();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in text-slate-100 px-4 py-6">
      
      {/* 🌟 1. HERO SECTION — خرافي ومميز */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0c3d34] via-[#062b24] to-[#041915] border border-[#fbbf24]/30 p-8 sm:p-12 shadow-2xl text-center flex flex-col items-center">
        
        {/* Animated decorative glows */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-[#fbbf24]/8 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-20 w-2 h-2 bg-[#fbbf24]/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
          <div className="absolute top-32 left-16 w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-32 w-2.5 h-2.5 bg-[#fbbf24]/30 rounded-full animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '3.5s' }}></div>
          <div className="absolute top-24 left-1/3 w-1 h-1 bg-emerald-300/60 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        </div>

        {/* Logo — Centerpiece */}
        <div className="relative inline-block mb-6">
          <div className="absolute -inset-4 bg-gradient-to-br from-[#fbbf24]/20 via-emerald-400/10 to-[#fbbf24]/20 rounded-full blur-xl opacity-70 animate-pulse"></div>
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-emerald-500 via-[#fbbf24] to-emerald-400 p-1 shadow-2xl shadow-amber-500/30 mx-auto hover:scale-105 transition-transform">
            <img
              src="/logo.jpg"
              alt="كُتّاب دار تاج الوقار"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fbbf24]/15 border border-[#fbbf24]/40 text-[#fbbf24] text-xs font-black mb-6 backdrop-blur-sm shadow-lg shadow-amber-900/10">
          <Sparkles className="w-4 h-4 animate-pulse" />
          المنظومة الذكية لتحفيظ القرآن الكريم والتربية
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight tracking-tight">
          كُتّاب <span className="bg-gradient-to-r from-[#fbbf24] via-amber-300 to-[#fbbf24] bg-clip-text text-transparent">دار تاج الوقار</span>
        </h1>

        <p className="text-xs sm:text-sm font-black text-emerald-300 mb-3">المنظومة الذكية لتحفيظ القرآن الكريم والتربية</p>

        <p className="text-base sm:text-xl font-bold text-emerald-200 mb-4 max-w-3xl mx-auto leading-relaxed">
          "الأصالة في التحفيظ والتربية .. والسهولة والذكاء في المتابعة والتكريم"
        </p>

        <p className="text-xs sm:text-sm text-slate-300/90 max-w-2xl mx-auto mb-8 leading-relaxed">
          نرحب بأولياء الأمور الكرام وضيوفنا الأفاضل في المنظومة الرقمية لخدمة كتاب الله وتكريم أهل القرآن
        </p>


        {/* أزرار الإجراءات الرئيسية — فيسبوك + إدارة */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          
          {/* زر بوابة الإدارة */}
          <button
            onClick={() => onNavigate('admin')}
            className="px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 text-sm sm:text-base cursor-pointer border border-amber-300/50 group"
          >
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>بوابة الإدارة ولوحة التحكم 🔑</span>
          </button>

          {/* زر صفحة الفيسبوك */}
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gradient-to-r from-[#1877F2] via-[#1a6ddb] to-[#1565C0] hover:from-[#3b8ef5] hover:to-[#1877F2] text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 text-sm sm:text-base cursor-pointer border border-blue-400/40 group"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>صفحة دار تاج الوقار على فيسبوك</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* 🏆 2. CEREMONY ANNOUNCEMENT & DETAILS */}
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
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-700/40 flex items-center gap-3.5 hover:border-[#fbbf24]/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#fbbf24] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold">موعد الحفل</div>
              <div className="text-sm font-black text-white">الخميس 27 أغسطس 2026</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-700/40 flex items-center gap-3.5 hover:border-[#fbbf24]/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold">المكان</div>
              <div className="text-sm font-black text-white">نادى أبو زينة الرياضى</div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-emerald-700/40 flex items-center gap-3.5 hover:border-[#fbbf24]/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
              تكريم شيوخ ومحفظي دار تاج الوقار تقديراً لجهدهم المبارك طوال الدورة.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">✦</span>
              عرض الإنجازات والتطويرات الإنشائية والتقنية الحديثة للمبنى.
            </li>
          </ul>
        </div>
      </div>

      {/* 📱 3. FACEBOOK QR CODE SECTION — بطاقة تفاعلية خرافية */}
      <div className="rounded-3xl border-2 border-[#1877F2]/40 bg-gradient-to-br from-[#062b24]/95 via-[#041915] to-[#0a2540]/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Facebook-themed glow */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#1877F2]/8 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#1877F2]/6 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 relative z-10">
          
          {/* Left: Info & CTA */}
          <div className="flex-1 text-center lg:text-right space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1877F2]/15 border border-[#1877F2]/40 text-blue-300 text-xs font-black">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              تابعنا على فيسبوك
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
              صفحة <span className="text-[#4599FF]">كُتّاب دار تاج الوقار</span> الرسمية على فيسبوك
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg lg:mx-0 mx-auto">
              تابعونا على صفحتنا الرسمية لمتابعة آخر الأخبار والفعاليات والمسابقات القرآنية، والصور الحصرية لأنشطة دار تاج الوقار والحفل الختامي. 
              امسح رمز الـ QR بكاميرا الهاتف للوصول المباشر!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-[#1877F2] to-[#1565C0] hover:from-[#3b8ef5] hover:to-[#1877F2] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer border border-blue-400/30"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>زيارة صفحة دار تاج الوقار</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>تابع · شارك · ادعم</span>
              </div>
            </div>
          </div>

          {/* Right: QR Code Card */}
          <div className="shrink-0">
            <div className="relative group">
              {/* Outer glow ring */}
              <div className="absolute -inset-3 bg-gradient-to-br from-[#1877F2]/20 via-blue-500/10 to-[#1877F2]/20 rounded-3xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
              
              {/* QR Card */}
              <div className="relative bg-white rounded-2xl p-5 shadow-2xl shadow-blue-900/30 border-2 border-blue-200/50 group-hover:border-[#1877F2]/60 transition-all">
                {/* Card Header */}
                <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-slate-200">
                  <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs font-black text-[#1877F2]">دار تاج الوقار</span>
                </div>

                {/* QR Code */}
                <QRCodeSVG
                  value={FACEBOOK_PAGE_URL}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#1877F2"
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: '',
                    x: undefined,
                    y: undefined,
                    height: 0,
                    width: 0,
                    excavate: false,
                  }}
                />

                {/* Card Footer */}
                <div className="mt-3 pt-2 border-t border-slate-200 text-center">
                  <p className="text-[10px] font-bold text-slate-500">امسح الكود بكاميرا هاتفك 📱</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">للوصول المباشر لصفحتنا على فيسبوك</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📖 4. SYSTEM HIGHLIGHTS — بطاقات المميزات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-3 hover:border-[#fbbf24]/40 transition-all text-center group hover:shadow-lg hover:shadow-amber-900/10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-[#fbbf24] flex items-center justify-center mx-auto border border-amber-500/20 group-hover:scale-110 transition-transform">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#fbbf24]">تعليم وتلقين أصيل</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            التركيز على ضبط مخارج الحروف وأحكام التجويد والتلاوة المباشرة على نخبة من الشيوخ الأجلاء بالسند المتصل.
          </p>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-3 hover:border-[#fbbf24]/40 transition-all text-center group hover:shadow-lg hover:shadow-emerald-900/10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <QrCode className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#fbbf24]">منظومة ذكية وكروت QR</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            تسهيل تسجيل ومتابعة بيانات الطلاب عبر كروت الـ QR Code لربط أولياء الأمور بنتائج وتكريمات أبنائهم.
          </p>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-6 space-y-3 hover:border-[#fbbf24]/40 transition-all text-center group hover:shadow-lg hover:shadow-blue-900/10">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#fbbf24]">بيئة تربوية آمنة</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            تجهيزات متطورة تشمل منظومة مراقبة حديثة، وقاعات مجهزة ومكيفة لراحة وسلامة أبنائنا وبناتنا.
          </p>
        </div>
      </div>

      {/* 📊 5. STATS BAR — شريط الإحصائيات */}
      <div className="rounded-2xl border border-emerald-700/40 bg-[#062b24]/60 backdrop-blur-xl p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#fbbf24]">{studentsCount}</div>
            <div className="text-[11px] text-slate-400 font-bold">طالب وطالبة مُكرَّمين</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{totalLevels}</div>
            <div className="text-[11px] text-slate-400 font-bold">مستوى قرآني</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-blue-400">{sheikhsCount}</div>
            <div className="text-[11px] text-slate-400 font-bold">شيوخ ومحفظين</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-rose-400">{fullQuranCount}</div>
            <div className="text-[11px] text-slate-400 font-bold">حفظة القرآن كاملاً</div>
          </div>
        </div>
      </div>

    </div>
  );
}
