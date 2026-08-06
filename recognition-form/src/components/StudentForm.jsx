import React, { useState, useMemo } from 'react';
import { User, Phone, Image as ImageIcon, Sparkles, Loader2, CheckCircle2, AlertCircle, Info, BookOpen } from 'lucide-react';
import { uploadStudentPhoto } from '../services/cloudinary';
import { addStudentRecord } from '../firebase';

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

export default function StudentForm({ onSuccess, showToast }) {
  const [formData, setFormData] = useState({
    studentName: '',
    studentAge: '',
    studyStage: '',
    schoolName: '',
    partName: '',
    sheikhName: '',
    totalParts: '',
    fatherPhone: '',
    motherPhone: '',
    fatherStatus: 'الأب على قيد الحياة'
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState({});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Mark field as touched on first change
    if (!touched[id]) {
      setTouched(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleBlur = (e) => {
    const { id } = e.target;
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPhotoPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ─── Real-time Validation ─────────────────────────────────
  const phoneRegex = /^01[0-9]{9}$/;

  const validation = useMemo(() => {
    const nameVal = formData.studentName.trim();
    const nameWords = nameVal.split(/\s+/).filter(w => w.length > 0);
    const age = Number(formData.studentAge);

    return {
      studentName: {
        valid: nameWords.length >= 3,
        message: nameVal.length === 0
          ? null
          : nameWords.length < 3
            ? `📝 الاسم يجب أن يكون ثلاثي على الأقل — كتبت ${nameWords.length} ${nameWords.length === 1 ? 'كلمة' : 'كلمات'} فقط`
            : '✅ تمام! الاسم مكتمل',
        type: nameWords.length >= 3 ? 'success' : 'error',
      },

      studentAge: {
        valid: age >= 3 && age <= 25,
        message: formData.studentAge === ''
          ? null
          : age < 3
            ? '⚠️ السن لازم يكون 3 سنوات على الأقل'
            : age > 25
              ? '⚠️ السن لازم يكون 25 سنة أو أقل'
              : `✅ تمام! العمر ${age} سنة`,
        type: (age >= 3 && age <= 25) ? 'success' : 'error',
      },

      schoolName: {
        valid: formData.schoolName.trim().length >= 3,
        message: formData.schoolName.trim().length === 0
          ? null
          : formData.schoolName.trim().length < 3
            ? '📝 من فضلك اكتب اسم المدرسة أو المعهد بالكامل'
            : '✅ تمام!',
        type: formData.schoolName.trim().length >= 3 ? 'success' : 'error',
      },

      fatherPhone: {
        valid: phoneRegex.test(formData.fatherPhone),
        message: formData.fatherPhone.length === 0
          ? null
          : !formData.fatherPhone.startsWith('01')
            ? '📱 الرقم لازم يبدأ بـ 01 (مثل: 010 أو 011 أو 012 أو 015)'
            : formData.fatherPhone.length < 11
              ? `📱 الرقم ناقص — كتبت ${formData.fatherPhone.length} أرقام من أصل 11`
              : formData.fatherPhone.length > 11
                ? `📱 الرقم زيادة — كتبت ${formData.fatherPhone.length} أرقام بدل 11`
                : phoneRegex.test(formData.fatherPhone)
                  ? '✅ رقم صحيح!'
                  : '📱 الرقم لازم يكون أرقام فقط',
        type: phoneRegex.test(formData.fatherPhone) ? 'success' : 'error',
      },

      motherPhone: {
        valid: formData.motherPhone === '' || phoneRegex.test(formData.motherPhone),
        message: formData.motherPhone.length === 0
          ? null
          : !formData.motherPhone.startsWith('01')
            ? '📱 الرقم لازم يبدأ بـ 01 (مثل: 010 أو 011 أو 012 أو 015)'
            : formData.motherPhone.length < 11
              ? `📱 الرقم ناقص — كتبت ${formData.motherPhone.length} أرقام من أصل 11`
              : formData.motherPhone.length > 11
                ? `📱 الرقم زيادة — كتبت ${formData.motherPhone.length} أرقام بدل 11`
                : phoneRegex.test(formData.motherPhone)
                  ? '✅ رقم صحيح!'
                  : '📱 الرقم لازم يكون أرقام فقط',
        type: (formData.motherPhone === '' || phoneRegex.test(formData.motherPhone)) ? 'success' : 'error',
      },

      studyStage: {
        valid: formData.studyStage !== '',
        message: null,
        type: 'success',
      },

      partName: {
        valid: formData.partName !== '',
        message: null,
        type: 'success',
      },

      totalParts: {
        valid: formData.totalParts === '' || (Number(formData.totalParts) >= 1 && Number(formData.totalParts) <= 30),
        message: formData.totalParts === '' ? null
          : Number(formData.totalParts) < 1 ? '⚠️ يجب أن يكون عدد الأجزاء 1 على الأقل'
          : Number(formData.totalParts) > 30 ? '⚠️ أقصى عدد 30 جزء'
          : `✅ ${formData.totalParts} جزء`,
        type: (formData.totalParts === '' || (Number(formData.totalParts) >= 1 && Number(formData.totalParts) <= 30)) ? 'success' : 'error',
      },

      sheikhName: {
        valid: true,
        message: null,
        type: 'success',
      },
    };
  }, [formData]);

  // ─── Dynamic border color based on validation ─────────────
  const getInputClass = (field) => {
    const base = 'w-full px-4 py-3 rounded-xl text-sm bg-white/5 border text-white placeholder-slate-500 focus:outline-none transition-all';
    if (!touched[field] || validation[field].message === null) {
      return `${base} border-white/10 focus:border-teal-500 focus:bg-white/10`;
    }
    if (validation[field].valid) {
      return `${base} border-emerald-500/40 bg-emerald-500/5 focus:border-emerald-400`;
    }
    return `${base} border-rose-500/40 bg-rose-500/5 focus:border-rose-400`;
  };

  // ─── Submit Handler ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Mark all as touched
    setTouched({
      studentName: true,
      studentAge: true,
      studyStage: true,
      schoolName: true,
      partName: true,
      totalParts: true,
      sheikhName: true,
      fatherPhone: true,
      motherPhone: true,
    });

    // Check all validations
    if (!validation.studentName.valid) {
      setErrorMessage('يرجى كتابة اسم الطالب ثلاثي على الأقل (الاسم الأول + الأب + الجد)');
      return;
    }
    if (!validation.studentAge.valid) {
      setErrorMessage('السن يجب أن يكون بين 3 و 25 سنة');
      return;
    }
    if (!validation.studyStage.valid) {
      setErrorMessage('يرجى اختيار المرحلة الدراسية');
      return;
    }
    if (!validation.schoolName.valid) {
      setErrorMessage('يرجى كتابة اسم المدرسة أو المعهد');
      return;
    }
    if (!validation.partName.valid) {
      setErrorMessage('يرجى اختيار فئة المشاركة بالدورة الصيفية');
      return;
    }
    if (!validation.fatherPhone.valid) {
      setErrorMessage('رقم تليفون ولي الأمر يجب أن يبدأ بـ 01 ويتكون من 11 رقم');
      return;
    }
    if (!validation.motherPhone.valid) {
      setErrorMessage('رقم تليفون الأم يجب أن يبدأ بـ 01 ويتكون من 11 رقم');
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadStudentPhoto(photoFile);
      }

      const studentPayload = {
        ...formData,
        studentAge: Number(formData.studentAge),
        totalParts: formData.totalParts ? Number(formData.totalParts) : 0,
        photoUrl
      };

      const docId = await addStudentRecord(studentPayload);
      onSuccess({ id: docId, ...studentPayload });
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-4 animate-fadeInUp">
      {/* Glassmorphism Outer Card */}
      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/60 backdrop-blur-xl">

        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-900/90 via-teal-800/80 to-teal-950/95 px-6 pt-8 pb-10 text-center">
          {/* Header Glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-400/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Trophy Badge */}
          <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-500/30 to-amber-600/10 border-2 border-amber-400/40 backdrop-blur-md shadow-xl animate-popIn animate-pulseGlow">
            <span className="text-4xl animate-float">🏆</span>
          </div>

          {/* Title */}
          <h2 className="text-white text-xl sm:text-2xl font-black mb-3 leading-tight drop-shadow-md">
            نبارك لكم هذا الشرف العظيم! 🎉
          </h2>

          {/* Subtitle */}
          <p className="text-teal-100 text-sm leading-relaxed font-semibold">
            يسر إدارة <span className="text-amber-300 font-black">الكُتّاب</span> أن تتقدم بأجمل التهاني لأولياء أمور أبنائنا الفضلاء لتفوقهم واجتهادهم في الدورة الصيفية لحفظ كتاب الله.
          </p>
        </div>

        {/* Form Container */}
        <div className="px-5 sm:px-7 pb-7 pt-4 bg-slate-950/80">

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-2.5 animate-fadeInUp">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-300" />
              </div>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Section 1: Basic Info */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-teal-500/20">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 text-sm">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-teal-300 text-xs sm:text-sm font-bold">البيانات الأساسية للطالب</h3>
            </div>

            {/* Student Name */}
            <div>
              <label htmlFor="studentName" className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم الطالب ثلاثي / رباعي <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                id="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClass('studentName')}
                placeholder="مثال: أحمد محمد علي محمود"
                required
              />
              <FieldHint
                show={touched.studentName && validation.studentName.message}
                type={validation.studentName.type}
                message={validation.studentName.message}
              />
            </div>

            {/* Age & Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="studentAge" className="block text-xs font-bold text-slate-300 mb-1.5">
                  السن (بالسنوات) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  id="studentAge"
                  value={formData.studentAge}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  min="3"
                  max="25"
                  className={getInputClass('studentAge')}
                  placeholder="مثال: 9"
                  required
                />
                <FieldHint
                  show={touched.studentAge && validation.studentAge.message}
                  type={validation.studentAge.type}
                  message={validation.studentAge.message}
                />
              </div>

              <div>
                <label htmlFor="studyStage" className="block text-xs font-bold text-slate-300 mb-1.5">
                  المرحلة الدراسية <span className="text-rose-400">*</span>
                </label>
                <select
                  id="studyStage"
                  value={formData.studyStage}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-500 transition-all cursor-pointer"
                  required
                >
                  <option value="">اختر المرحلة...</option>
                  <option value="حضانة">روضة / حضانة</option>
                  <option value="ابتدائي">ابتدائي</option>
                  <option value="إعدادي">إعدادي</option>
                  <option value="ثانوي">ثانوي</option>
                  <option value="معهد أزهري">معهد أزهري</option>
                  <option value="جامعي">جامعي</option>
                </select>
              </div>
            </div>

            {/* School Name */}
            <div>
              <label htmlFor="schoolName" className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المدرسة / المعهد / الروضة <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                id="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClass('schoolName')}
                placeholder="مثال: مدرسة الفاروق / معهد الأزهر النموذجي"
                required
              />
              <FieldHint
                show={touched.schoolName && validation.schoolName.message}
                type={validation.schoolName.type}
                message={validation.schoolName.message}
              />
            </div>

            {/* Section 2: بيانات الدورة الصيفية */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-500/20 pt-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-emerald-300 text-xs sm:text-sm font-bold">بيانات المشاركة بالدورة الصيفية 2026</h3>
            </div>

            {/* Part Name & Total Parts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="partName" className="block text-xs font-bold text-slate-300 mb-1.5">
                  فئة المشاركة / الجزء <span className="text-rose-400">*</span>
                </label>
                <select
                  id="partName"
                  value={formData.partName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-500 transition-all cursor-pointer"
                  required
                >
                  <option value="">اختر الفئة...</option>
                  <option value="القرآن كاملاً">القرآن كاملاً 🏆</option>
                  <option value="جزء الأعراف">جزء الأعراف وما فوق</option>
                  <option value="من 10 إلى 15 جزء">من 10 إلى 15 جزء</option>
                  <option value="من 5 إلى 10 أجزاء">من 5 إلى 10 أجزاء</option>
                  <option value="جزء عم وقصار السور">جزء عم وقصار السور</option>
                </select>
              </div>

              <div>
                <label htmlFor="totalParts" className="block text-xs font-bold text-slate-300 mb-1.5">
                  عدد الأجزاء المحفوظة
                </label>
                <input
                  type="number"
                  id="totalParts"
                  value={formData.totalParts}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  min="1"
                  max="30"
                  className={getInputClass('totalParts')}
                  placeholder="مثال: 5"
                />
                <FieldHint
                  show={touched.totalParts && validation.totalParts.message}
                  type={validation.totalParts.type}
                  message={validation.totalParts.message}
                />
              </div>
            </div>

            {/* Sheikh Name */}
            <div>
              <label htmlFor="sheikhName" className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم الشيخ المشرف على الطالب
              </label>
              <input
                type="text"
                id="sheikhName"
                value={formData.sheikhName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClass('sheikhName')}
                placeholder="مثال: الشيخ عبد الله حسن الديهى"
              />
            </div>

            {/* Section 3: Contact Info */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-amber-500/20 pt-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-sm">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-amber-300 text-xs sm:text-sm font-bold">بيانات تواصل أولياء الأمور</h3>
            </div>

            {/* Father Phone */}
            <div>
              <label htmlFor="fatherPhone" className="block text-xs font-bold text-slate-300 mb-1.5">
                رقم تليفون ولي الأمر / الأب (الواتساب) <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                id="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                maxLength={11}
                className={getInputClass('fatherPhone')}
                placeholder="مثال: 01012345678"
                required
              />
              <FieldHint
                show={touched.fatherPhone && validation.fatherPhone.message}
                type={validation.fatherPhone.type}
                message={validation.fatherPhone.message}
              />
            </div>

            {/* Mother Phone */}
            <div>
              <label htmlFor="motherPhone" className="block text-xs font-bold text-slate-300 mb-1.5">
                رقم تليفون الأم <span className="text-slate-500 text-[11px] font-normal">(اختياري)</span>
              </label>
              <input
                type="tel"
                id="motherPhone"
                value={formData.motherPhone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                maxLength={11}
                className={getInputClass('motherPhone')}
                placeholder="مثال: 01112345678"
              />
              <FieldHint
                show={touched.motherPhone && validation.motherPhone.message}
                type={validation.motherPhone.type}
                message={validation.motherPhone.message}
              />
            </div>

            {/* Father Status */}
            <div>
              <label htmlFor="fatherStatus" className="block text-xs font-bold text-slate-300 mb-1.5">
                حالة الأب <span className="text-slate-500 text-[11px] font-normal">(لمراعاة وتكريم طلابنا الكرام)</span> <span className="text-rose-400">*</span>
              </label>
              <select
                id="fatherStatus"
                value={formData.fatherStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl text-sm bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-500 transition-all cursor-pointer"
                required
              >
                <option value="الأب على قيد الحياة">الأب على قيد الحياة (حفظه الله)</option>
                <option value="يتيم الأب">يتيم الأب (رحمه الله وأسكنه الفردوس)</option>
                <option value="يتيم الأبوين">يتيم الأبوين (رحمهما الله رحمة واسعة)</option>
              </select>
            </div>

            {/* Section 3: Photo Upload */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-indigo-500/20 pt-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h3 className="text-indigo-300 text-xs sm:text-sm font-bold">
                صورة الطالب الشخصية <span className="text-slate-500 text-[11px] font-normal">(اختياري)</span>
              </h3>
            </div>

            {/* Photo Box */}
            <div
              onClick={() => document.getElementById('photoUploadInput').click()}
              className="border-2 border-dashed border-white/15 hover:border-teal-500/50 bg-white/[0.02] hover:bg-teal-500/5 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 group"
            >
              <input
                type="file"
                id="photoUploadInput"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={photoPreview}
                    alt="معاينة صورة الطالب"
                    className="w-24 h-24 rounded-full object-cover border-4 border-teal-500/60 shadow-xl shadow-teal-500/20 animate-scaleIn"
                  />
                  <span className="text-xs text-teal-300 font-bold">اضغط لتغيير الصورة 🔄</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📸</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400">
                    اضغط هنا لتحميل صورة الطالب<br />
                    <span className="text-[10px] text-slate-500">(تأتي مطبوعة في كارت التكريم)</span>
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-black text-base shadow-xl shadow-amber-900/30 hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري حفظ وتخزين البيانات...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>حفظ وتأكيد البيانات</span>
                  <span className="text-xl">🌟</span>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
