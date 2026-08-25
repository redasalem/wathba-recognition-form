import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  PartyPopper,
  Flame,
  Layout,
  FileText
} from 'lucide-react';
import {
  launchStageCelebration,
  launchRocketFireworks,
  launchGoldenRain,
  playCelebrationSound,
  setCelebrationMuted,
  getCelebrationMuted
} from '../services/celebration';

// ─── Islamic Arabesque Corner Ornaments SVG Component ───────────────────────
function OrnateCorner({ position = 'top-right' }) {
  const rotation = {
    'top-right': '',
    'top-left': 'scale-x-[-1]',
    'bottom-right': 'scale-y-[-1]',
    'bottom-left': 'scale-[-1]'
  }[position] || '';

  const posClass = {
    'top-right': 'top-1 right-1 sm:top-2 sm:right-2',
    'top-left': 'top-1 left-1 sm:top-2 sm:left-2',
    'bottom-right': 'bottom-1 right-1 sm:bottom-2 sm:right-2',
    'bottom-left': 'bottom-1 left-1 sm:bottom-2 sm:left-2'
  }[position] || '';

  return (
    <div className={`absolute ${posClass} ${rotation} pointer-events-none z-20 w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Outer Corner Frame */}
        <path d="M5 95 V25 C5 14 14 5 25 5 H95" stroke="url(#goldGradient)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M12 95 V30 C12 20 20 12 30 12 H95" stroke="url(#goldGradientLight)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
        {/* Arabesque Flourish */}
        <path d="M5 25 C25 25 25 5 25 5 C25 25 45 25 45 45 C25 45 25 25 5 25 Z" fill="url(#goldGradient)" opacity="0.85" />
        <circle cx="25" cy="25" r="4" fill="#fef08a" />
        <circle cx="45" cy="45" r="3" fill="#fbbf24" />
        <circle cx="8" cy="8" r="3" fill="#fbbf24" />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="30%" stopColor="#fde047" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="goldGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function StagePrompterModal({
  student,
  currentIndex = 0,
  totalStudents = 1,
  onNext,
  onPrev,
  onClose,
  categoryName = 'كشف صعود المسرح وتكريم الطلاب'
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(getCelebrationMuted());
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [displayMode, setDisplayMode] = useState('template'); // 'template' | 'royal'
  const [animKey, setAnimKey] = useState(0);
  const containerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // 🔑 Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 🎆 Trigger celebration on open and whenever student changes
  useEffect(() => {
    if (student) {
      setAnimKey((prev) => prev + 1);
      launchStageCelebration();
    }
  }, [student?.id, student?.studentId, student?.idx, currentIndex]);

  // ⏯️ Auto-play Slideshow Timer
  useEffect(() => {
    if (isAutoPlay) {
      autoPlayTimerRef.current = setInterval(() => {
        if (currentIndex < totalStudents - 1) {
          onNext();
        } else {
          setIsAutoPlay(false);
        }
      }, 7000);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    }
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlay, currentIndex, totalStudents, onNext]);

  // 🔊 Audio Mute toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setCelebrationMuted(next);
  };

  // 🎉 Manual Fireworks trigger
  const handleManualCelebration = () => {
    launchStageCelebration();
  };

  // 🎹 Keyboard Shortcuts for live ceremony operation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        onPrev();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'c' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleManualCelebration();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  // 🖨️ Handle Print
  const handlePrint = () => {
    document.body.classList.add('printing-stage-cert');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-stage-cert');
    }, 1500);
  };

  if (!student) return null;

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://wathba-kuttab.vercel.app';
  const studentQrUrl = `${origin}/#/permanent-form`;
  const studentCode = student.studentCode || (student.idx ? `#${String(student.idx).padStart(3, '0')}` : '#001');
  const studentName = student.studentName || student.name || 'طالب دار تاج الوقار';
  const partName = student.partName || student.part || 'القرآن كاملاً';
  const sheikhName = student.sheikhName && student.sheikhName !== 'شيوخ الكُتّاب' ? student.sheikhName : 'شيوخ الكُتّاب المعتمدين';
  const gift = student.gift || student.awardTier || 'شهادة تقدير وتكريم الكُتّاب 2026';
  const tier = student.awardTier || student.tier || '👑 الفئة الذهبية المتميزة';

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#020d0a]/98 backdrop-blur-xl flex flex-col items-center justify-between p-2 sm:p-3 md:p-4 overflow-hidden text-slate-100 select-none print:bg-white print:p-0 print:static"
    >
      {/* Background Animated Ambient Lights & Stardust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#fbbf24]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      {/* ─── 1. TOP STAGE CONTROLS HEADER (Hidden in Print) ─── */}
      <div className="w-full max-w-6xl 2xl:max-w-7xl flex flex-wrap items-center justify-between gap-3 bg-[#062b24]/95 border-2 border-[#fbbf24]/50 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-2xl mb-3 shrink-0 print:hidden relative z-30">
        
        {/* Left: Ceremony Badge & Order Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#fef08a] via-[#fbbf24] to-[#d97706] text-slate-950 font-black text-base sm:text-lg flex items-center justify-center shadow-lg border-2 border-white/60">
            {currentIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fbbf24] animate-spinSlow" />
              <h3 className="font-black text-white text-xs sm:text-base tracking-wide flex items-center gap-1.5">
                <span>منصة التكريم والنداء الحي على المسرح 🎙️</span>
              </h3>
            </div>
            <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
              <span>{categoryName}</span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-emerald-300 font-black">طالب #{currentIndex + 1} من {totalStudents}</span>
            </p>
          </div>
        </div>

        {/* Right: Stage Control Actions */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          
          {/* Fireworks Celebration Trigger Button */}
          <button
            onClick={handleManualCelebration}
            className="px-3 py-2 bg-gradient-to-r from-amber-500 via-[#fbbf24] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 animate-pulse"
            title="إطلاق فرقعة صواريخ واحتفال كأنك في جوجل (Space / C)"
          >
            <PartyPopper className="w-4 h-4" />
            <span className="hidden md:inline">احتفال وصواريخ (C)</span>
          </button>

          {/* Certificate View Mode Toggle (Template vs Royal Digital) */}
          <button
            onClick={() => setDisplayMode(displayMode === 'template' ? 'royal' : 'template')}
            className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-600/60 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title={displayMode === 'template' ? 'التحويل إلى نمط الشهادة الملكية الرقمية' : 'التحويل إلى نمط قالب الشهادة المعتمد'}
          >
            {displayMode === 'template' ? <Layout className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-amber-400" />}
            <span className="hidden lg:inline">{displayMode === 'template' ? 'الشهادة الملكية' : 'قالب الشهادة'}</span>
          </button>

          {/* Auto-Play Slideshow Toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow border ${
              isAutoPlay ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-slate-900 border-emerald-700/50 text-slate-300 hover:text-white'
            }`}
            title={isAutoPlay ? 'إيقاف العرض التلقائي' : 'تشغيل العرض التلقائي (Slideshow)'}
          >
            {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAutoPlay ? 'إيقاف العرض' : 'عرض تلقائي'}</span>
          </button>

          {/* Audio Chime Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-emerald-700/60 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
            title={isMuted ? 'تشغيل نغمة الاحتفال' : 'كتم نغمة الاحتفال'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:px-3 sm:py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-700/60 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title={isFullscreen ? 'الخروج من ملء الشاشة (F)' : 'شاشة كاملة للبروجكتور (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'تصغير' : 'بروجكتور (F)'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-2 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title="طباعة الشهادة الرسمية"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">طباعة</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN PRESENTATION BODY (THE ORNATE LUXURY CERTIFICATE) ─── */}
      <div className="w-full max-w-6xl 2xl:max-w-7xl flex-1 flex flex-col items-center justify-center my-auto min-h-0 print:max-w-none print:w-full print:m-0 relative z-20">
        
        {/* Gilded Outer Halo Wrapper with Moving Sheen & Arabesque Corners */}
        <div
          key={animKey}
          className="relative w-full max-w-5xl 2xl:max-w-6xl max-h-[calc(100vh-11rem)] sm:max-h-[calc(100vh-12rem)] p-1.5 sm:p-2.5 md:p-3 rounded-3xl sm:rounded-[36px] bg-gradient-to-tr from-[#021813] via-[#083a30] to-[#041c16] border-2 sm:border-4 border-[#fbbf24] shadow-[0_30px_100px_rgba(0,0,0,0.95)] animate-stage-card-in animate-royal-glow overflow-hidden print:p-0 print:border-none print:shadow-none print:w-full print:max-h-none"
        >
          {/* Moving Light Beam Sheen across the entire certificate */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden print:hidden">
            <div className="w-32 h-[300%] bg-gradient-to-r from-transparent via-white/20 to-transparent -rotate-45 animate-stage-sheen blur-sm"></div>
          </div>

          {/* Islamic Ornate Gilded Corners (All 4 Corners) */}
          <OrnateCorner position="top-right" />
          <OrnateCorner position="top-left" />
          <OrnateCorner position="bottom-right" />
          <OrnateCorner position="bottom-left" />

          {/* Inner Golden Filigree Border */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[1.414/1] rounded-2xl sm:rounded-[28px] overflow-hidden border border-[#fbbf24]/60 bg-[#062b24] shadow-2xl print:border-none print:w-full print:aspect-[1.414/1]">
            
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* 🌟 MODE A: OFFICIAL TEMPLATE MODE (دار تاج الوقار) */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {displayMode === 'template' ? (
              <div
                id="stage-certificate-print"
                className="relative w-full h-full flex flex-col justify-between"
                style={{
                  backgroundImage: `url('/certificate-template.jpg')`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* 1. STUDENT NAME OVERLAY (Perfect vertical & horizontal center inside the ornate banner) */}
                <div
                  className="absolute text-center flex items-center justify-center px-4"
                  style={{
                    top: '55.2%',
                    left: '26%',
                    width: '48%',
                    height: '7.8%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <h1
                    className="font-black text-[#fef08a] font-amiri tracking-wide truncate drop-shadow-[0_4px_8px_rgba(0,0,0,0.98)] gold-glow-lg animate-fade-in"
                    style={{
                      fontSize: 'clamp(1.15rem, 2.5vw, 2.4rem)',
                      textShadow: '0 0 20px rgba(251, 191, 36, 0.9), 0 3px 10px rgba(0,0,0,0.98)'
                    }}
                  >
                    {studentName}
                  </h1>
                </div>

                {/* 2. QURANIC LEVEL OVERLAY (Inside the dark green oval frame) */}
                <div
                  className="absolute text-center flex items-center justify-center px-1"
                  style={{
                    top: '76.4%',
                    left: '42.0%',
                    width: '20.0%',
                    height: '5.8%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <span
                    className="font-black text-[#fbbf24] font-amiri drop-shadow-[0_2px_5px_rgba(0,0,0,0.98)] whitespace-nowrap gold-glow-md animate-fade-in"
                    style={{
                      fontSize: 'clamp(0.85rem, 1.45vw, 1.35rem)',
                      textShadow: '0 0 14px rgba(251, 191, 36, 0.8), 0 2px 6px rgba(0,0,0,0.95)'
                    }}
                  >
                    {partName}
                  </span>
                </div>
              </div>
            ) : (
              /* ══════════════════════════════════════════════════════════════ */
              /* 👑 MODE B: ROYAL DIGITAL CERTIFICATE MASTERPIECE */
              /* ══════════════════════════════════════════════════════════════ */
              <div
                id="stage-certificate-print"
                className="relative w-full h-full bg-gradient-to-b from-[#062b24] via-[#031d17] to-[#02100d] p-4 sm:p-6 md:p-8 flex flex-col justify-between items-center text-center overflow-hidden"
              >
                {/* Background Islamic Geometric Pattern Watermark */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                {/* Top Basmalah & Quranic Crest */}
                <div className="relative z-10 space-y-0.5 sm:space-y-1">
                  <p className="font-scheherazade text-sm sm:text-lg md:text-xl text-[#fef08a] gold-glow-md tracking-wider font-bold">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="h-[1px] w-10 sm:w-20 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent"></span>
                    <span className="font-kufi text-[9px] sm:text-[11px] text-amber-300 tracking-widest font-black uppercase">
                      كُتّاب | منظومة تحفيظ القرآن الكريم والتربية
                    </span>
                    <span className="h-[1px] w-10 sm:w-20 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent"></span>
                  </div>
                  <h2 className="font-amiri text-xl sm:text-3xl md:text-4xl font-black text-gold-gradient gold-glow-lg pt-0.5">
                    شَهَادَةُ تَقْدِيرٍ وَتَكْرِيمٍ
                  </h2>
                </div>

                {/* Quranic Verse */}
                <div className="relative z-10 my-0.5 sm:my-1 px-3 py-1 bg-[#fbbf24]/10 rounded-2xl border border-[#fbbf24]/30 max-w-xl">
                  <p className="font-amiri text-[11px] sm:text-xs md:text-sm text-amber-200 font-bold">
                    ﴿ وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ ﴾
                  </p>
                </div>

                {/* Main Honored Student Name Showcase */}
                <div className="relative z-10 my-auto py-1.5 sm:py-3 px-4 rounded-3xl bg-gradient-to-r from-transparent via-[#083a30]/80 to-transparent border-y border-[#fbbf24]/40 w-full max-w-3xl">
                  <p className="text-[11px] sm:text-xs text-emerald-300 font-bold mb-0.5">
                    تَتَشَرَّفُ إِدَارَةُ الكُتَّابِ بِمَنْحِ هَذِهِ الشَّهَادَةِ لِابْنِنَا البَارِّ المُكَرَّمِ:
                  </p>
                  <h1 className="font-amiri text-2xl sm:text-4xl md:text-5xl font-black text-[#fef08a] gold-glow-lg tracking-wide my-0.5 sm:my-1">
                    {studentName}
                  </h1>
                  <p className="text-[11px] sm:text-xs md:text-sm text-slate-200 font-medium max-w-2xl mx-auto">
                    تَقْدِيراً لِاجْتِهَادِهِ وَتَفَوُّقِهِ المُبَارَكِ فِي حِفْظِ وَإِتْقَانِ كِتَابِ اللَّهِ تَعَالَى ضِمْنَ حَفْلِ عَامِ 2026م
                  </p>
                </div>

                {/* Badges & Honor Level */}
                <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-1">
                  <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-[#fbbf24]/60 text-[#fbbf24] text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-lg">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>مستوى الحفظ: {partName}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/60 text-emerald-300 text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-lg">
                    <Award className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>{tier}</span>
                  </div>
                </div>

                {/* Bottom Signatures & Seal */}
                <div className="relative z-10 w-full pt-2 sm:pt-3 border-t border-[#fbbf24]/30 flex items-center justify-between text-right px-3 sm:px-6 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 text-[9px] sm:text-[11px] block">المحفظ المشرف:</span>
                    <strong className="text-amber-300 font-amiri text-xs sm:text-sm">{sheikhName}</strong>
                  </div>

                  {/* Golden Seal of Excellence */}
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-600 via-[#fbbf24] to-amber-300 p-0.5 shadow-xl flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#041915] flex flex-col items-center justify-center text-[#fbbf24] border border-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                      <span className="text-[7px] font-black tracking-tighter">كُتّاب 2026</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-slate-400 text-[9px] sm:text-[11px] block">المشرف العام على المنظومة:</span>
                    <strong className="text-[#fef08a] font-amiri text-xs sm:text-sm">إدارة دار تاج الوقار</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3. BOTTOM NAVIGATION BAR (Hidden in Print) ─── */}
      <div className="w-full max-w-6xl 2xl:max-w-7xl flex items-center justify-between gap-3 bg-[#062b24]/95 border-2 border-[#fbbf24]/40 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-2xl shrink-0 mt-3 print:hidden relative z-30">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-4 sm:px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition-all border border-emerald-700/50 active:scale-95 shadow"
        >
          <ChevronRight className="w-5 h-5 text-amber-400" />
          <span>الطالب السابق (→)</span>
        </button>

        <div className="text-center hidden sm:flex items-center gap-2 text-xs text-slate-300 font-bold">
          <span className="px-2 py-1 bg-slate-900/80 rounded-lg border border-emerald-800/40 text-amber-300 font-mono">
            {studentCode}
          </span>
          <span>التنقل السريع بالأسهم (← / →) • الاحتفال (مسطرة المسافات / C)</span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex >= totalStudents - 1}
          className="px-5 sm:px-7 py-2.5 bg-gradient-to-r from-amber-500 via-[#fbbf24] to-amber-500 hover:from-amber-400 hover:to-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-xl"
        >
          <span>الطالب التالي (←)</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>,
    document.body
  );
}
