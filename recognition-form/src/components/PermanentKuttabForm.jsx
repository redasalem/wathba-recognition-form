import React, { useState, useMemo } from 'react';
import { 
  User, 
  Phone, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Award,
  ArrowRight,
  School,
  Calendar,
  Heart,
  BookOpen,
  MapPin,
  Clock,
  Printer,
  Share2,
  RefreshCw,
  Home
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { uploadStudentPhoto } from '../services/cloudinary';
import { addPermanentKuttabRecord } from '../firebase';

// ─── Inline Field Hint Component ────────────────────────────
function FieldHint({ show, type = 'error', message }) {
  if (!show || !message) return null;

  const styles = {
    error: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
    success: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    info: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
  };

  const icons = {
    error: <AlertCircle className="w-3.5 h-3.5 shrink-0" />,
    success: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
    info: <Info className="w-3.5 h-3.5 shrink-0" />,
  };

  return (
    <div className={`mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border animate-fadeInUp ${styles[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}

export default function PermanentKuttabForm({ onGoHome, showToast }) {
  const [formData, setFormData] = useState({
    studentName: '',
    birthDate: '',
    studyStage: '',
    schoolName: '',
    fatherPhone: '',
    alternativePhone: '',
    fatherStatus: 'نعم (على قيد الحياة)',
    quranLevel: 'مبتدئ (تلقين وقاعدة نورانية)',
    preferredShift: 'الفترة المسائية',
    address: '',
    notes: '',
    photoUrl: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState({});
  const [submittedRecord, setSubmittedRecord] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (!touched[id]) {
      setTouched(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  // ─── Photo compression utility ─────────────────────────────
  const compressImage = (file, maxWidth = 800, quality = 0.75) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const MAX_PHOTO_SIZE_MB = 5;
  const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
      showToast?.('⚠️ يرجى اختيار صورة بصيغة JPG أو PNG أو WebP فقط', 'error');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      showToast?.(`⚠️ حجم الصورة كبير جداً (${(file.size / 1024 / 1024).toFixed(1)}MB). الحد الأقصى ${MAX_PHOTO_SIZE_MB}MB`, 'error');
      return;
    }

    const compressedFile = await compressImage(file, 800, 0.75);
    setPhotoFile(compressedFile);

    const reader = new FileReader();
    reader.onload = (event) => setPhotoPreview(event.target.result);
    reader.readAsDataURL(compressedFile);
  };

  // ─── Real-time Arabic Validation ───────────────────────────
  const phoneRegex = /^01[0-9]{9}$/;

  const validation = useMemo(() => {
    const nameVal = (formData.studentName || '').trim();
    const nameWords = nameVal.split(/\s+/).filter(w => w.length > 0);

    return {
      studentName: {
        valid: nameWords.length >= 3,
        message: nameVal.length === 0
          ? '⚠️ يرجى إدخال اسم الطالب ثلاثياً أو رباعياً بالعربية'
          : nameWords.length < 3
            ? `📝 يرجى كتابة الاسم ثلاثي أو رباعي (كتبت ${nameWords.length} كلمة)`
            : '✅ الاسم مكتمل وصحيح',
        type: nameWords.length >= 3 ? 'success' : 'error',
      },

      birthDate: {
        valid: !!formData.birthDate,
        message: !formData.birthDate
          ? '⚠️ يرجى تحديد تاريخ الميلاد باستخدام التقويم'
          : '✅ تم تحديد تاريخ الميلاد',
        type: !!formData.birthDate ? 'success' : 'error',
      },

      studyStage: {
        valid: formData.studyStage !== '',
        message: formData.studyStage === ''
          ? '⚠️ يرجى اختيار المرحلة الدراسية من القائمة'
          : '✅ تم اختيار المرحلة الدراسية',
        type: formData.studyStage !== '' ? 'success' : 'error',
      },

      schoolName: {
        valid: (formData.schoolName || '').trim().length >= 3,
        message: (formData.schoolName || '').trim().length === 0
          ? '⚠️ يرجى إدخال اسم المدرسة أو الحضانة'
          : (formData.schoolName || '').trim().length < 3
            ? '📝 يرجى كتابة اسم المدرسة/الحضانة بالكامل (3 أحرف على الأقل)'
            : '✅ تم كتابة اسم المدرسة/الحضانة بالكامل',
        type: (formData.schoolName || '').trim().length >= 3 ? 'success' : 'error',
      },

      fatherPhone: {
        valid: phoneRegex.test(formData.fatherPhone || ''),
        message: (formData.fatherPhone || '').length === 0
          ? '⚠️ يرجى إدخال رقم هاتف ولي الأمر للتواصل والواتساب (11 رقماً)'
          : !(formData.fatherPhone || '').startsWith('01')
            ? '📱 رقم الهاتف يجب أن يبدأ بـ 01 (مثل: 010 أو 011 أو 012 أو 015)'
            : (formData.fatherPhone || '').length < 11
              ? `📱 الرقم ناقص — كتبت ${(formData.fatherPhone || '').length} أرقام من أصل 11`
              : (formData.fatherPhone || '').length > 11
                ? `📱 الرقم زائد — كتبت ${(formData.fatherPhone || '').length} أرقام بدلاً من 11`
                : phoneRegex.test(formData.fatherPhone)
                  ? '✅ رقم الهاتف صحيح'
                  : '📱 الرقم يجب أن يتكون من أرقام فقط',
        type: phoneRegex.test(formData.fatherPhone || '') ? 'success' : 'error',
      },

      photo: {
        valid: !!(photoPreview || formData.photoUrl),
        message: !(photoPreview || formData.photoUrl)
          ? '💡 يُفضل إرفاق صورة شخصية واضحة للطالب لاستخراج بطاقة العضوية'
          : '✅ تم تجهيز صورة الطالب بنجاح',
        type: (photoPreview || formData.photoUrl) ? 'success' : 'info',
      },
    };
  }, [formData, photoPreview]);

  const isFormValid = useMemo(() => {
    return (
      validation.studentName.valid &&
      validation.birthDate.valid &&
      validation.studyStage.valid &&
      validation.schoolName.valid &&
      validation.fatherPhone.valid
    );
  }, [validation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    setTouched({
      studentName: true,
      birthDate: true,
      studyStage: true,
      schoolName: true,
      fatherPhone: true,
      quranLevel: true
    });

    if (!isFormValid) {
      setErrorMessage('يرجى تصحيح وتعبئة جميع الحقول الإلزامية الموضحة باللون الأحمر');
      showToast?.('يرجى استكمال البيانات المطلوبة بشكل صحيح', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalPhotoUrl = formData.photoUrl;

      // 1. Upload photo if selected
      if (photoFile) {
        try {
          finalPhotoUrl = await uploadStudentPhoto(photoFile);
        } catch (uploadErr) {
          console.warn('Photo upload fallback:', uploadErr);
        }
      }

      // 2. Build Registration Payload
      const registrationCode = `KUT-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        registrationCode,
        studentName: formData.studentName.trim(),
        birthDate: formData.birthDate,
        studyStage: formData.studyStage,
        schoolName: formData.schoolName.trim(),
        fatherPhone: formData.fatherPhone.trim(),
        alternativePhone: formData.alternativePhone.trim(),
        fatherStatus: formData.fatherStatus,
        quranLevel: formData.quranLevel,
        preferredShift: formData.preferredShift,
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        photoUrl: finalPhotoUrl || '',
        registrationSource: 'PUBLIC_QR_FORM',
        status: 'NEW_ENROLLED'
      };

      const docId = await addPermanentKuttabRecord(payload);
      const savedRecord = { id: docId, ...payload };

      setSubmittedRecord(savedRecord);
      showToast?.('🎉 تم تسجيل الطالب في الكُتّاب الدائم بنجاح!', 'success');
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('حدث خطأ أثناء حفظ البيانات في الخادم. يرجى التحقق من الاتصال بالإنترنت والمحاولة مجدداً.');
      showToast?.('حدث خطأ أثناء حفظ البيانات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!submittedRecord) return;
    const text = `🎉 تم تسجيل الطالب في *الكُتّاب الدائم* بنجاح!\n` +
      `👤 اسم الطالب: ${submittedRecord.studentName}\n` +
      `🔖 كود القيد: ${submittedRecord.registrationCode}\n` +
      `📖 مستوى الحفظ: ${submittedRecord.quranLevel}\n` +
      `🏫 المرحلة: ${submittedRecord.studyStage}\n` +
      `📞 رقم التواصل: ${submittedRecord.fatherPhone}\n\n` +
      `منظومة الكُتّاب لتحفيظ القرآن الكريم والتربية 🌿`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleResetForm = () => {
    setSubmittedRecord(null);
    setFormData({
      studentName: '',
      birthDate: '',
      studyStage: '',
      schoolName: '',
      fatherPhone: '',
      alternativePhone: '',
      fatherStatus: 'نعم (على قيد الحياة)',
      quranLevel: 'مبتدئ (تلقين وقاعدة نورانية)',
      preferredShift: 'الفترة المسائية',
      address: '',
      notes: '',
      photoUrl: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setTouched({});
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ══════════════════════════════════════════════════════════════
  // 🎉 SUCCESS VIEW
  // ══════════════════════════════════════════════════════════════
  if (submittedRecord) {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://wathba-kuttab.vercel.app';
    const qrUrl = `${origin}/#/permanent-form`;

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 animate-scaleIn">
        <div className="bg-[#062b24]/90 border-2 border-[#fbbf24]/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 relative overflow-hidden">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-[#fbbf24] p-1 shadow-xl flex items-center justify-center animate-bounce">
            <div className="w-full h-full bg-[#041915] rounded-[22px] flex items-center justify-center text-[#fbbf24]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div>
            <span className="px-3 py-1 bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/30 rounded-full text-xs font-bold inline-block mb-2">
              ✨ استمارة الكُتّاب الدائم المعتمدة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              تم تسجيل قيد الطالب بنجاح!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
              أهلاً بكم في حلقات الكُتّاب الدائم لتحفيظ القرآن الكريم والتربية. تم حفظ بيانات الطالب في السجل الدائم بنجاح.
            </p>
          </div>

          {/* Registration Card Receipt */}
          <div className="bg-[#041915]/90 border border-emerald-500/40 rounded-2xl p-5 text-right space-y-4 max-w-xl mx-auto shadow-inner">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <div className="flex items-center gap-3">
                {submittedRecord.photoUrl ? (
                  <img
                    src={submittedRecord.photoUrl}
                    alt={submittedRecord.studentName}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-[#fbbf24]"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-900/50 border border-emerald-700 flex items-center justify-center text-[#fbbf24]">
                    <User className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-black text-white">{submittedRecord.studentName}</h3>
                  <p className="text-xs text-[#fbbf24] font-mono font-bold">{submittedRecord.registrationCode}</p>
                </div>
              </div>

              <div className="bg-white p-1.5 rounded-xl border border-amber-300/40 shadow-sm shrink-0">
                <QRCodeSVG value={qrUrl} size={56} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#062b24] p-2.5 rounded-xl border border-emerald-800/30">
                <span className="text-slate-400 block text-[10px]">مستوى الحفظ المسجل:</span>
                <span className="font-bold text-emerald-300">{submittedRecord.quranLevel}</span>
              </div>
              <div className="bg-[#062b24] p-2.5 rounded-xl border border-emerald-800/30">
                <span className="text-slate-400 block text-[10px]">المرحلة الدراسية:</span>
                <span className="font-bold text-slate-200">{submittedRecord.studyStage}</span>
              </div>
              <div className="bg-[#062b24] p-2.5 rounded-xl border border-emerald-800/30">
                <span className="text-slate-400 block text-[10px]">المدرسة / الحضانة:</span>
                <span className="font-bold text-slate-200">{submittedRecord.schoolName}</span>
              </div>
              <div className="bg-[#062b24] p-2.5 rounded-xl border border-emerald-800/30">
                <span className="text-slate-400 block text-[10px]">رقم هاتف ولي الأمر:</span>
                <span className="font-mono font-bold text-amber-300" dir="ltr">{submittedRecord.fatherPhone}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handlePrintReceipt}
              className="px-5 py-2.5 bg-[#fbbf24] hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة إشعار التسجيل</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة عبر الواتساب</span>
            </button>

            <button
              onClick={handleResetForm}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تسجيل طالب آخر</span>
            </button>

            {onGoHome && (
              <button
                onClick={onGoHome}
                className="px-5 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-emerald-800/40"
              >
                <Home className="w-4 h-4" />
                <span>الرئيسية</span>
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // 📝 REGISTRATION FORM VIEW
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[#fbbf24] text-xs font-bold shadow-lg">
          <BookOpen className="w-4 h-4" />
          <span>استمارة الالتحاق بحلقات تحفيظ القرآن الكريم</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          تسجيل طالب جديد في <span className="text-[#fbbf24]">الكُتّاب الدائم</span> 🌿
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          يرجى إدخال بيانات الطالب بدقة للانضمام إلى حلقات الكُتّاب الدائم وتسكينه في الحلقات المناسبة لمستواه القرآني والعُمري.
        </p>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ─── القسم الأول: البيانات الشخصية والأساسية ─── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/40">
            <User className="w-5 h-5 text-[#fbbf24]" />
            <h3 className="text-sm font-black text-white">1. البيانات الشخصية للطالب</h3>
          </div>

          {/* Student Name */}
          <div>
            <label htmlFor="studentName" className="block text-xs font-bold text-slate-200 mb-1.5">
              اسم الطالب ثلاثياً أو رباعياً بالعربية <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="مثال: يوسف أحمد محمد علي"
                className={`w-full px-4 py-3 bg-[#041915]/80 rounded-xl border text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  touched.studentName && !validation.studentName.valid
                    ? 'border-rose-500/60 focus:ring-rose-500/40'
                    : touched.studentName && validation.studentName.valid
                    ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                    : 'border-emerald-800/60 focus:ring-[#fbbf24]/50'
                }`}
                required
              />
            </div>
            <FieldHint
              show={touched.studentName}
              type={validation.studentName.type}
              message={validation.studentName.message}
            />
          </div>

          {/* Birth Date & Study Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Birth Date */}
            <div>
              <label htmlFor="birthDate" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>تاريخ الميلاد <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="date"
                id="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-[#041915]/80 rounded-xl border text-xs sm:text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                  touched.birthDate && !validation.birthDate.valid
                    ? 'border-rose-500/60 focus:ring-rose-500/40'
                    : touched.birthDate && validation.birthDate.valid
                    ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                    : 'border-emerald-800/60 focus:ring-[#fbbf24]/50'
                }`}
                required
              />
              <FieldHint
                show={touched.birthDate}
                type={validation.birthDate.type}
                message={validation.birthDate.message}
              />
            </div>

            {/* Study Stage */}
            <div>
              <label htmlFor="studyStage" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>المرحلة الدراسية <span className="text-rose-400">*</span></span>
              </label>
              <select
                id="studyStage"
                value={formData.studyStage}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 bg-[#041915]/80 rounded-xl border text-xs sm:text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                  touched.studyStage && !validation.studyStage.valid
                    ? 'border-rose-500/60 focus:ring-rose-500/40'
                    : touched.studyStage && validation.studyStage.valid
                    ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                    : 'border-emerald-800/60 focus:ring-[#fbbf24]/50'
                }`}
                required
              >
                <option value="" disabled>اختر المرحلة الدراسية</option>
                <option value="حضانة تمهيدي (قبل المدرسة)">حضانة تمهيدي (قبل المدرسة)</option>
                <option value="المرحلة الابتدائية (صفوف أولى 1-3)">المرحلة الابتدائية (صفوف أولى 1-3)</option>
                <option value="المرحلة الابتدائية (صفوف عليا 4-6)">المرحلة الابتدائية (صفوف عليا 4-6)</option>
                <option value="المرحلة الإعدادية">المرحلة الإعدادية</option>
                <option value="المرحلة الثانوية">المرحلة الثانوية</option>
                <option value="المرحلة الجامعية">المرحلة الجامعية</option>
                <option value="خريج / تعليم عام">خريج / تعليم عام</option>
              </select>
              <FieldHint
                show={touched.studyStage}
                type={validation.studyStage.type}
                message={validation.studyStage.message}
              />
            </div>
          </div>

          {/* School Name */}
          <div>
            <label htmlFor="schoolName" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>اسم المدرسة أو الحضانة <span className="text-rose-400">*</span></span>
            </label>
            <input
              type="text"
              id="schoolName"
              value={formData.schoolName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="مثال: مدرسة عمر بن الخطاب الابتدائية / روضة الإيمان"
              className={`w-full px-4 py-3 bg-[#041915]/80 rounded-xl border text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                touched.schoolName && !validation.schoolName.valid
                  ? 'border-rose-500/60 focus:ring-rose-500/40'
                  : touched.schoolName && validation.schoolName.valid
                  ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                  : 'border-emerald-800/60 focus:ring-[#fbbf24]/50'
              }`}
              required
            />
            <FieldHint
              show={touched.schoolName}
              type={validation.schoolName.type}
              message={validation.schoolName.message}
            />
          </div>
        </div>

        {/* ─── القسم الثاني: بيانات التواصل وولي الأمر ─── */}
        <div className="space-y-4 pt-4 border-t border-emerald-800/40">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/40">
            <Phone className="w-5 h-5 text-[#fbbf24]" />
            <h3 className="text-sm font-black text-white">2. بيانات ولي الأمر والتواصل</h3>
          </div>

          {/* Father Phone & Alternative Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Father Phone */}
            <div>
              <label htmlFor="fatherPhone" className="block text-xs font-bold text-slate-200 mb-1.5">
                رقم هاتف ولي الأمر (واتساب) <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                id="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="010XXXXXXXX"
                dir="ltr"
                maxLength={11}
                className={`w-full px-4 py-3 bg-[#041915]/80 rounded-xl border text-xs sm:text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  touched.fatherPhone && !validation.fatherPhone.valid
                    ? 'border-rose-500/60 focus:ring-rose-500/40'
                    : touched.fatherPhone && validation.fatherPhone.valid
                    ? 'border-emerald-500/60 focus:ring-emerald-500/40'
                    : 'border-emerald-800/60 focus:ring-[#fbbf24]/50'
                }`}
                required
              />
              <FieldHint
                show={touched.fatherPhone}
                type={validation.fatherPhone.type}
                message={validation.fatherPhone.message}
              />
            </div>

            {/* Alternative Phone */}
            <div>
              <label htmlFor="alternativePhone" className="block text-xs font-bold text-slate-200 mb-1.5">
                رقم هاتف إضافي / بديل (اختياري)
              </label>
              <input
                type="tel"
                id="alternativePhone"
                value={formData.alternativePhone}
                onChange={handleInputChange}
                placeholder="01XXXXXXXXX"
                dir="ltr"
                maxLength={11}
                className="w-full px-4 py-3 bg-[#041915]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 transition-all"
              />
            </div>
          </div>

          {/* Father Status */}
          <div>
            <label htmlFor="fatherStatus" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>حالة الأب <span className="text-rose-400">*</span></span>
            </label>
            <select
              id="fatherStatus"
              value={formData.fatherStatus}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#041915]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 transition-all"
            >
              <option value="نعم (على قيد الحياة)">نعم (على قيد الحياة) - حفظه الله</option>
              <option value="متوفى">متوفى - رحمه الله وأسكنه الفردوس</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>عنوان السكن / القرية / المركز (اختياري)</span>
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="مثال: ديهيتا / شارع المسجد الكبير"
              className="w-full px-4 py-3 bg-[#041915]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 transition-all"
            />
          </div>
        </div>

        {/* ─── القسم الثالث: المستوى القرآني والفترة ─── */}
        <div className="space-y-4 pt-4 border-t border-emerald-800/40">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/40">
            <BookOpen className="w-5 h-5 text-[#fbbf24]" />
            <h3 className="text-sm font-black text-white">3. مستوى الحفظ القرآني والفترة المفضلة</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quran Level */}
            <div>
              <label htmlFor="quranLevel" className="block text-xs font-bold text-slate-200 mb-1.5">
                مستوى الحفظ الحالي للطالب <span className="text-rose-400">*</span>
              </label>
              <select
                id="quranLevel"
                value={formData.quranLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#041915]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 transition-all"
                required
              >
                <option value="مبتدئ (تلقين وقاعدة نورانية)">مبتدئ (تلقين وقاعدة نورانية)</option>
                <option value="جزء عم (المستوى الأول)">جزء عم (المستوى الأول)</option>
                <option value="جزء تبارك (المستوى الثاني)">جزء تبارك (المستوى الثاني)</option>
                <option value="3 أجزاء (عم وتبارك وقد سمع)">3 أجزاء (عم وتبارك وقد سمع)</option>
                <option value="5 أجزاء">5 أجزاء قرآنية</option>
                <option value="10 أجزاء">10 أجزاء قرآنية</option>
                <option value="15 جزءاً (نصف القرآن)">15 جزءاً (نصف القرآن)</option>
                <option value="20 جزءاً فأكثر">20 جزءاً فأكثر</option>
                <option value="القرآن كاملاً">القرآن كاملاً (مراجعة وإجازة)</option>
              </select>
            </div>

            {/* Preferred Shift */}
            <div>
              <label htmlFor="preferredShift" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>الفترة المناسبة للحضور</span>
              </label>
              <select
                id="preferredShift"
                value={formData.preferredShift}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#041915]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 transition-all"
              >
                <option value="الفترة المسائية">الفترة المسائية (بعد العصر / المغرب)</option>
                <option value="الفترة الصباحية">الفترة الصباحية (الإجازات والعطلات)</option>
                <option value="أي فترة متاحة">أي فترة متاحة ومناسبة للمحفظ</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-bold text-slate-200 mb-1.5">
              ملاحظات أو رغبات خاصة لولي الأمر (اختياري)
            </label>
            <textarea
              id="notes"
              rows={2}
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="مثال: رغبة في التحفيظ مع محفظ معين، أوقات معينة في الامتحانات، أو تفاصيل خاصة..."
              className="w-full px-4 py-2.5 bg-[#041915]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        {/* ─── القسم الرابع: الصورة الشخصية ─── */}
        <div className="space-y-4 pt-4 border-t border-emerald-800/40">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/40">
            <ImageIcon className="w-5 h-5 text-[#fbbf24]" />
            <h3 className="text-sm font-black text-white">4. صورة الطالب الشخصية (اختياري)</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#041915]/60 p-4 rounded-2xl border border-emerald-800/40">
            {photoPreview ? (
              <div className="relative group shrink-0">
                <img
                  src={photoPreview}
                  alt="معاينة الصورة"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#fbbf24] shadow-lg shadow-emerald-950/60"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setFormData(prev => ({ ...prev, photoUrl: '' }));
                  }}
                  className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-500 transition-transform active:scale-90"
                  title="حذف الصورة"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-950/60 border-2 border-dashed border-emerald-700/60 flex flex-col items-center justify-center text-emerald-400/80 gap-1 shrink-0">
                <ImageIcon className="w-8 h-8 text-emerald-500/60" />
                <span className="text-[10px] font-bold">لا توجد صورة</span>
              </div>
            )}

            <div className="flex-1 space-y-2 text-center sm:text-right">
              <label
                htmlFor="photoUpload"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
              >
                <ImageIcon className="w-4 h-4 text-[#fbbf24]" />
                <span>{photoPreview ? 'تغيير صورة الطالب' : 'رفع صورة شخصية للطالب'}</span>
              </label>
              <input
                type="file"
                id="photoUpload"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                الصيغ المدعومة: JPG, PNG, WebP (الحد الأقصى 5 ميجابايت). يتم ضغط الصورة تلقائياً لسرعة التحميل واستخراج كارت القيد.
              </p>
              <FieldHint
                show={true}
                type={validation.photo.type}
                message={validation.photo.message}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-emerald-800/40">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl text-slate-950 font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer ${
              isSubmitting
                ? 'bg-amber-600 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-[#fbbf24] via-amber-400 to-[#fbbf24] hover:brightness-110 active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري حفظ وتوثيق بيانات الطالب في الكُتّاب الدائم...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>تأكيد تسجيل الطالب في الكُتّاب الدائم 🌿</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
