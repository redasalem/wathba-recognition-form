import React, { useState, useEffect, useMemo } from 'react';
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
  Heart
} from 'lucide-react';
import { uploadStudentPhoto } from '../services/cloudinary';
import { addStudentRecord, updateStudentRecord } from '../firebase';
import { findStudentInCatalog } from '../data/studentsCatalog';

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

export default function StudentForm({ initialStudentData, isEditMode = false, onCancel, onSuccess, showToast }) {
  const [formData, setFormData] = useState({
    studentId: '',
    studentCode: '',
    studentName: '',
    birthDate: '',
    studyStage: '',
    schoolName: '',
    fatherPhone: '',
    fatherStatus: 'نعم (على قيد الحياة)',
    photoUrl: '',
    partName: '',
    examScore: '',
    awardTier: '',
    gift: '',
    totalParts: 1,
    smartUrl: '',
    qrCodeUrl: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [touched, setTouched] = useState({});

  // Sync initialStudentData whenever it changes
  useEffect(() => {
    if (initialStudentData) {
      setFormData(prev => ({
        ...prev,
        studentId: initialStudentData.studentId || initialStudentData.id || prev.studentId,
        studentCode: initialStudentData.studentCode || initialStudentData.code || prev.studentCode,
        studentName: initialStudentData.studentName || initialStudentData.name || prev.studentName,
        birthDate: initialStudentData.birthDate || prev.birthDate || '',
        studyStage: initialStudentData.studyStage || prev.studyStage || '',
        schoolName: initialStudentData.schoolName || prev.schoolName || '',
        fatherPhone: initialStudentData.fatherPhone || prev.fatherPhone || '',
        fatherStatus: initialStudentData.fatherStatus || prev.fatherStatus || 'نعم (على قيد الحياة)',
        photoUrl: initialStudentData.photoUrl || prev.photoUrl || '',
        partName: initialStudentData.partName || initialStudentData.part || prev.partName,
        examScore: initialStudentData.examScore || initialStudentData.score || prev.examScore,
        awardTier: initialStudentData.awardTier || initialStudentData.tier || prev.awardTier,
        gift: initialStudentData.gift || prev.gift,
        totalParts: initialStudentData.totalParts || prev.totalParts || 1,
        smartUrl: initialStudentData.smartUrl || initialStudentData.smart_url || prev.smartUrl,
        qrCodeUrl: initialStudentData.qrCodeUrl || initialStudentData.qr_code_url || prev.qrCodeUrl,
      }));

      if (initialStudentData.photoUrl) {
        setPhotoPreview(initialStudentData.photoUrl);
      }
    }
  }, [initialStudentData]);

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPhotoPreview(event.target.result);
      reader.readAsDataURL(file);
    }
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
          ? '⚠️ يرجى إدخال اسم الطالب رباعياً بالعربية'
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
      }
    };
  }, [formData]);

  // ─── Dynamic input border styling ────────────────────────
  const getInputClass = (field) => {
    const base = 'w-full px-4 py-3 rounded-xl text-sm bg-[#062b24]/90 border text-white placeholder-slate-500 focus:outline-none transition-all';
    if (!touched[field]) {
      return `${base} border-emerald-700/50 focus:border-[#fbbf24] focus:bg-[#062b24]`;
    }
    if (validation[field]?.valid) {
      return `${base} border-emerald-500/60 bg-emerald-500/10 focus:border-emerald-400`;
    }
    return `${base} border-rose-500 bg-rose-500/15 focus:border-rose-400`;
  };

  // ─── Submit Handler ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Mark all required fields as touched
    setTouched({
      studentName: true,
      birthDate: true,
      studyStage: true,
      schoolName: true,
      fatherPhone: true
    });

    if (!validation.studentName.valid) {
      setErrorMessage('يرجى كتابة اسم الطالب رباعياً بالعربية');
      showToast?.('يرجى استكمال الحقول المطلوبة المحددة باللون الأحمر', 'error');
      return;
    }
    if (!validation.birthDate.valid) {
      setErrorMessage('يرجى تحديد تاريخ الميلاد باستخدام التقويم');
      showToast?.('يرجى تحديد تاريخ الميلاد', 'error');
      return;
    }
    if (!validation.studyStage.valid) {
      setErrorMessage('يرجى اختيار المرحلة الدراسية من القائمة');
      showToast?.('يرجى اختيار المرحلة الدراسية', 'error');
      return;
    }
    if (!validation.schoolName.valid) {
      setErrorMessage('يرجى كتابة اسم المدرسة أو الحضانة بالكامل');
      showToast?.('يرجى كتابة اسم المدرسة أو الحضانة', 'error');
      return;
    }
    if (!validation.fatherPhone.valid) {
      setErrorMessage('يرجى إدخال رقم هاتف ولي الأمر المكون من 11 رقماً يبدأ بـ 01');
      showToast?.('يرجى كتابة رقم هاتف صحيح مكون من 11 رقماً', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = formData.photoUrl || '';
      if (photoFile) {
        photoUrl = await uploadStudentPhoto(photoFile);
      }

      // Auto-resolve code and catalog details if not already present
      let resolvedCode = formData.studentCode;
      let resolvedId = formData.studentId;
      let resolvedTier = formData.awardTier;
      let resolvedPart = formData.partName;
      let resolvedScore = formData.examScore;
      let resolvedGift = formData.gift;

      if (!resolvedCode) {
        const catMatch = findStudentInCatalog(formData.studentName);
        if (catMatch) {
          resolvedCode = catMatch.code;
          resolvedId = catMatch.studentId;
          if (!resolvedTier) resolvedTier = catMatch.tier;
          if (!resolvedPart) resolvedPart = catMatch.part;
          if (resolvedScore === undefined || resolvedScore === '') resolvedScore = catMatch.score;
          if (!resolvedGift) resolvedGift = catMatch.gift;
        }
      }

      // Security check: Must belong to official catalog or existing document
      if (!resolvedCode && !initialStudentData?.id) {
        setErrorMessage('⚠️ عذراً، لم يتم العثور على اسم الطالب في قائمة الطلاب المعتمدين بالدورة الصيفية 2026. يرجى مراجعة إدارة الكُتّاب.');
        showToast?.('اسم الطالب غير مسجل ضمن كشوفات الطلاب المعتمدين', 'error');
        setIsSubmitting(false);
        return;
      }

      const studentPayload = {
        ...formData,
        studentCode: resolvedCode || '',
        studentId: resolvedId || formData.studentId || '',
        awardTier: resolvedTier || formData.awardTier || '✨ فئة متميزة',
        partName: resolvedPart || formData.partName || 'القرآن الكريم',
        examScore: resolvedScore !== undefined && resolvedScore !== '' ? Number(resolvedScore) : (Number(formData.examScore) || 0),
        gift: resolvedGift || formData.gift || 'مكافأة وهدية التكريم',
        completed: true,
        photoUrl
      };

      let savedRecord;
      const targetDocId = initialStudentData?.id || initialStudentData?.studentId || studentPayload.studentId;

      if (targetDocId) {
        // Updating or upserting official document
        await updateStudentRecord(targetDocId, studentPayload);
        savedRecord = { id: targetDocId, ...studentPayload };
        showToast?.('تم حفظ وتأكيد بيانات الطالب بنجاح 🌟', 'success');
      } else {
        // Creating new standalone document
        const newDocId = await addStudentRecord(studentPayload);
        savedRecord = { id: newDocId, ...studentPayload };
        showToast?.('تم تسجيل وحفظ بيانات الطالب بنجاح 🎉', 'success');
      }

      onSuccess(savedRecord);
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
      showToast?.('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 animate-fade-in">
      {/* Outer Card */}
      <div className="rounded-3xl overflow-hidden border border-[#fbbf24]/30 shadow-2xl bg-[#062b24]/90 backdrop-blur-xl">

        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0c3d34] via-[#062b24] to-[#041915] px-6 pt-8 pb-8 text-center border-b border-emerald-800/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/10 rounded-full blur-2xl pointer-events-none"></div>
          
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#fbbf24] transition-colors cursor-pointer bg-slate-900/60 px-3 py-1.5 rounded-xl border border-emerald-700/40"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>إلغاء والعودة للبروفايل</span>
            </button>
          )}

          <div className="mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center bg-amber-500/20 border-2 border-[#fbbf24] shadow-xl">
            <span className="text-3xl">🏆</span>
          </div>

          {/* Correct diacritics on مُكَرَّم */}
          <h2 className="text-white text-xl sm:text-2xl font-black mb-2 leading-tight">
            {isEditMode ? 'تحديث وتعديل بيانات الطالب المُكَرَّم' : 'استكمال بيانات طالب مُكَرَّم 🎉'}
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-semibold max-w-lg mx-auto">
            يسر إدارة <span className="text-[#fbbf24] font-black">كُتّاب</span> أن تتقدم بأجمل التهاني لأولياء أمور أبنائنا الفضلاء لتفوقهم في الدورة الصيفية 2026.
          </p>

          {/* Simplified Header Badge: ONLY Quran Level & Student Code */}
          {(formData.studentCode || formData.partName) && (
            <div className="mt-4 flex items-center justify-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-950/80 border border-[#fbbf24]/50 shadow-inner text-xs sm:text-sm font-black">
                {formData.studentCode && (
                  <span className="text-[#fbbf24]">🏷️ كود الطالب: {formData.studentCode}</span>
                )}
                {formData.partName && (
                  <span className="text-emerald-300">| 📖 المستوى القرآني: {formData.partName}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Container */}
        <div className="px-5 sm:px-8 pb-8 pt-6 bg-[#041915]/90">

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORM: ONLY the 7 required fields */}
          <form noValidate onSubmit={handleSubmit} className="space-y-5">

            {/* 1. Student Full Name */}
            <div>
              <label htmlFor="studentName" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>1️⃣ اسم الطالب رباعي</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                id="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClass('studentName')}
                placeholder="مثال: أحمد محمد علي إبراهيم"
              />
              <FieldHint
                show={touched.studentName}
                type={validation.studentName.type}
                message={validation.studentName.message}
              />
            </div>

            {/* 2. Birth Date (Calendar / Date Picker) */}
            <div>
              <label htmlFor="birthDate" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>2️⃣ تاريخ الميلاد</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                id="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClass('birthDate')}
              />
              <FieldHint
                show={touched.birthDate}
                type={validation.birthDate.type}
                message={validation.birthDate.message}
              />
            </div>

            {/* 3. Study Stage */}
            <div>
              <label htmlFor="studyStage" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>3️⃣ المرحلة الدراسية</span>
                <span className="text-rose-400">*</span>
              </label>
              <select
                id="studyStage"
                value={formData.studyStage}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClass('studyStage')}
              >
                <option value="">اختر المرحلة الدراسية...</option>
                <option value="روضة / حضانة">روضة / حضانة</option>
                <option value="ابتدائي">ابتدائي</option>
                <option value="إعدادي">إعدادي</option>
                <option value="ثانوي">ثانوي</option>
                <option value="معهد أزهري">معهد أزهري</option>
                <option value="جامعي">جامعي</option>
              </select>
              <FieldHint
                show={touched.studyStage}
                type={validation.studyStage.type}
                message={validation.studyStage.message}
              />
            </div>

            {/* 4. School or Kindergarten Name */}
            <div>
              <label htmlFor="schoolName" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>4️⃣ اسم المدرسة أو الحضانة</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                id="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClass('schoolName')}
                placeholder="مثال: مدرسة جناج الابتدائية / روضة الإيمان"
              />
              <FieldHint
                show={touched.schoolName}
                type={validation.schoolName.type}
                message={validation.schoolName.message}
              />
            </div>

            {/* 5. Parent Phone (WhatsApp) */}
            <div>
              <label htmlFor="fatherPhone" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>5️⃣ رقم هاتف ولي الأمر (للتواصل والواتساب)</span>
                <span className="text-rose-400">*</span>
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
              />
              <FieldHint
                show={touched.fatherPhone}
                type={validation.fatherPhone.type}
                message={validation.fatherPhone.message}
              />
            </div>

            {/* 6. Is Father Alive? */}
            <div>
              <label htmlFor="fatherStatus" className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>6️⃣ هل الوالد على قيد الحياة؟</span>
                <span className="text-rose-400">*</span>
              </label>
              <select
                id="fatherStatus"
                value={formData.fatherStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl text-sm bg-[#062b24]/90 border border-emerald-700/50 text-white focus:outline-none focus:border-[#fbbf24] transition-all cursor-pointer"
              >
                <option value="نعم (على قيد الحياة)">نعم (على قيد الحياة - حفظه الله)</option>
                <option value="لا (متوفى - رحمه الله)">لا (متوفى - رحمه الله وأسكنه الفردوس)</option>
              </select>
            </div>

            {/* 7. Student Photo (Optional) */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>7️⃣ صورة الطالب الشخصية</span>
                <span className="text-slate-400 text-[11px] font-normal">(اختياري)</span>
              </label>

              <div
                onClick={() => document.getElementById('photoUploadInput').click()}
                className="border-2 border-dashed border-emerald-700/50 hover:border-[#fbbf24] bg-slate-900/60 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 group"
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
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#fbbf24] shadow-xl"
                    />
                    <span className="text-xs text-[#fbbf24] font-bold">اضغط لتغيير الصورة 🔄</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform text-[#fbbf24]">
                      <span className="text-xl">📸</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">
                      اضغط هنا لرفع صورة الطالب الشخصية (اختياري)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري حفظ وتخزين البيانات...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{isEditMode ? 'حفظ وتحديث التعديلات' : 'حفظ وتأكيد بيانات الطالب'}</span>
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
