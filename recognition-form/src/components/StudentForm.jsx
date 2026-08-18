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
  Users, 
  Plus, 
  Trash2, 
  Award,
  ArrowRight,
  School,
  Calendar
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
    studentAge: '',
    studyStage: '',
    schoolName: '',
    partName: '',
    examScore: '',
    awardTier: '',
    gift: '',
    totalParts: 1,
    smartUrl: '',
    qrCodeUrl: '',
    parentName: '',
    fatherPhone: '',
    motherPhone: '',
    fatherStatus: 'الأب على قيد الحياة',
    totalChildrenCount: 1,
    kuttabChildrenCount: 1,
    siblings: []
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
        studentAge: initialStudentData.studentAge || prev.studentAge,
        studyStage: initialStudentData.studyStage || prev.studyStage,
        schoolName: initialStudentData.schoolName || prev.schoolName,
        partName: initialStudentData.partName || initialStudentData.part || prev.partName,
        examScore: initialStudentData.examScore || initialStudentData.score || prev.examScore,
        awardTier: initialStudentData.awardTier || initialStudentData.tier || prev.awardTier,
        gift: initialStudentData.gift || prev.gift,
        totalParts: initialStudentData.totalParts || prev.totalParts || 1,
        smartUrl: initialStudentData.smartUrl || initialStudentData.smart_url || prev.smartUrl,
        qrCodeUrl: initialStudentData.qrCodeUrl || initialStudentData.qr_code_url || prev.qrCodeUrl,
        parentName: initialStudentData.parentName || prev.parentName,
        fatherPhone: initialStudentData.fatherPhone || prev.fatherPhone,
        motherPhone: initialStudentData.motherPhone || prev.motherPhone,
        fatherStatus: initialStudentData.fatherStatus || prev.fatherStatus,
        totalChildrenCount: initialStudentData.totalChildrenCount || prev.totalChildrenCount,
        kuttabChildrenCount: initialStudentData.kuttabChildrenCount || prev.kuttabChildrenCount,
        siblings: Array.isArray(initialStudentData.siblings) ? initialStudentData.siblings : prev.siblings
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

  // ─── Siblings Management ──────────────────────────────────
  const handleAddSibling = () => {
    setFormData(prev => ({
      ...prev,
      siblings: [
        ...prev.siblings,
        {
          id: Date.now().toString(),
          name: '',
          age: '',
          studyStage: 'ابتدائي',
          schoolName: '',
          inKuttab: true
        }
      ]
    }));
  };

  const handleRemoveSibling = (index) => {
    setFormData(prev => ({
      ...prev,
      siblings: prev.siblings.filter((_, i) => i !== index)
    }));
  };

  const handleSiblingChange = (index, field, value) => {
    setFormData(prev => {
      const updatedSiblings = [...prev.siblings];
      updatedSiblings[index] = {
        ...updatedSiblings[index],
        [field]: value
      };
      return { ...prev, siblings: updatedSiblings };
    });
  };

  // ─── Real-time Arabic Validation ───────────────────────────
  const phoneRegex = /^01[0-9]{9}$/;

  const validation = useMemo(() => {
    const nameVal = (formData.studentName || '').trim();
    const nameWords = nameVal.split(/\s+/).filter(w => w.length > 0);
    const parentVal = (formData.parentName || '').trim();
    const parentWords = parentVal.split(/\s+/).filter(w => w.length > 0);
    const age = Number(formData.studentAge);

    return {
      studentName: {
        valid: nameWords.length >= 3,
        message: nameVal.length === 0
          ? '⚠️ يرجى إدخال اسم الطالب كاملاً ثلاثياً أو رباعياً بالعربية'
          : nameWords.length < 3
            ? `📝 الاسم ناقص — يرجى كتابة الاسم ثلاثي على الأقل (كتبت ${nameWords.length} كلمة)`
            : '✅ الاسم مكتمل وصحيح',
        type: nameWords.length >= 3 ? 'success' : 'error',
      },

      parentName: {
        valid: parentWords.length >= 3,
        message: parentVal.length === 0
          ? '⚠️ يرجى كتابة اسم ولي الأمر ثلاثياً أو رباعياً بالعربية'
          : parentWords.length < 3
            ? `📝 الاسم ناقص — يرجى كتابة اسم ولي الأمر ثلاثي على الأقل (كتبت ${parentWords.length} كلمة)`
            : '✅ اسم ولي الأمر مكتمل',
        type: parentWords.length >= 3 ? 'success' : 'error',
      },

      studentAge: {
        valid: age >= 3 && age <= 25,
        message: formData.studentAge === ''
          ? '⚠️ يرجى إدخال سن الطالب بالسنوات'
          : age < 3
            ? '⚠️ السن يجب أن يكون 3 سنوات على الأقل'
            : age > 25
              ? '⚠️ السن يجب أن يكون 25 سنة أو أقل'
              : `✅ السن صحيح (${age} سنة)`,
        type: (age >= 3 && age <= 25) ? 'success' : 'error',
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
          ? '⚠️ يرجى إدخال اسم المدرسة أو المعهد بالكامل'
          : (formData.schoolName || '').trim().length < 3
            ? '📝 يرجى التوضيح واكتفاء الاسم بالكامل (3 أحرف على الأقل)'
            : '✅ تم كتابة اسم المدرسة بالكامل',
        type: (formData.schoolName || '').trim().length >= 3 ? 'success' : 'error',
      },

      fatherPhone: {
        valid: phoneRegex.test(formData.fatherPhone || ''),
        message: (formData.fatherPhone || '').length === 0
          ? '⚠️ يرجى إدخال رقم تليفون ولي الأمر المكون من 11 رقماً'
          : !(formData.fatherPhone || '').startsWith('01')
            ? '📱 رقم التليفون يجب أن يبدأ بـ 01 (مثل: 010 أو 011 أو 012 أو 015)'
            : (formData.fatherPhone || '').length < 11
              ? `📱 الرقم ناقص — كتبت ${(formData.fatherPhone || '').length} أرقام من أصل 11`
              : (formData.fatherPhone || '').length > 11
                ? `📱 الرقم زائد — كتبت ${(formData.fatherPhone || '').length} أرقام بدلاً من 11`
                : phoneRegex.test(formData.fatherPhone)
                  ? '✅ رقم التليفون صحيح'
                  : '📱 الرقم يجب أن يتكون من أرقام فقط',
        type: phoneRegex.test(formData.fatherPhone || '') ? 'success' : 'error',
      },

      motherPhone: {
        valid: !formData.motherPhone || phoneRegex.test(formData.motherPhone),
        message: !formData.motherPhone || formData.motherPhone.length === 0
          ? null
          : !formData.motherPhone.startsWith('01')
            ? '📱 رقم التليفون يجب أن يبدأ بـ 01 (مثل: 010 أو 011 أو 012 أو 015)'
            : formData.motherPhone.length < 11
              ? `📱 الرقم ناقص — كتبت ${formData.motherPhone.length} أرقام من أصل 11`
              : formData.motherPhone.length > 11
                ? `📱 الرقم زائد — كتبت ${formData.motherPhone.length} أرقام بدلاً من 11`
                : phoneRegex.test(formData.motherPhone)
                  ? '✅ رقم التليفون صحيح'
                  : '📱 الرقم يجب أن يتكون من أرقام فقط',
        type: (!formData.motherPhone || phoneRegex.test(formData.motherPhone)) ? 'success' : 'error',
      },
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
      parentName: true,
      studentAge: true,
      studyStage: true,
      schoolName: true,
      fatherPhone: true,
      motherPhone: true,
    });

    if (!validation.studentName.valid) {
      setErrorMessage('يرجى كتابة اسم الطالب ثلاثياً أو رباعياً بالعربية');
      showToast?.('يرجى استكمال الحقول المطلوبة المحددة باللون الأحمر بالعربية', 'error');
      return;
    }
    if (!validation.parentName.valid) {
      setErrorMessage('يرجى كتابة اسم ولي الأمر ثلاثياً أو رباعياً بالعربية');
      showToast?.('يرجى كتابة اسم ولي الأمر ثلاثياً', 'error');
      return;
    }
    if (!validation.studentAge.valid) {
      setErrorMessage('يرجى تحديد سن الطالب بين 3 و 25 سنة بالسنوات');
      showToast?.('يرجى تحديد سن الطالب بالسنوات', 'error');
      return;
    }
    if (!validation.studyStage.valid) {
      setErrorMessage('يرجى اختيار المرحلة الدراسية من القائمة بالعربية');
      showToast?.('يرجى اختيار المرحلة الدراسية', 'error');
      return;
    }
    if (!validation.schoolName.valid) {
      setErrorMessage('يرجى كتابة اسم المدرسة أو المعهد بالكامل بالعربية');
      showToast?.('يرجى كتابة اسم المدرسة أو المعهد', 'error');
      return;
    }
    if (!validation.fatherPhone.valid) {
      setErrorMessage('يرجى إدخال رقم تليفون ولي الأمر المكون من 11 رقماً يبدأ بـ 01');
      showToast?.('يرجى كتابة رقم تليفون صحيح مكون من 11 رقماً', 'error');
      return;
    }
    if (!validation.motherPhone.valid) {
      setErrorMessage('رقم تليفون الأم يجب أن يكون مكوناً من 11 رقماً ويبدأ بـ 01');
      showToast?.('يرجى تصحيح رقم تليفون الأم', 'error');
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

      const studentPayload = {
        ...formData,
        studentCode: resolvedCode || '',
        studentId: resolvedId || formData.studentId || '',
        awardTier: resolvedTier || formData.awardTier || '✨ فئة متميزة',
        partName: resolvedPart || formData.partName || 'القرآن الكريم',
        examScore: resolvedScore !== undefined && resolvedScore !== '' ? Number(resolvedScore) : (Number(formData.examScore) || 0),
        gift: resolvedGift || formData.gift || 'مكافأة وهدية التكريم',
        studentAge: Number(formData.studentAge),
        totalChildrenCount: Number(formData.totalChildrenCount || 1),
        kuttabChildrenCount: Number(formData.kuttabChildrenCount || 1),
        completed: true,
        photoUrl
      };

      let savedRecord;
      if (initialStudentData?.id) {
        // Updating existing document
        await updateStudentRecord(initialStudentData.id, studentPayload);
        savedRecord = { id: initialStudentData.id, ...studentPayload };
        showToast?.('تم تحديث بيانات الطالب والأسرة بنجاح 🌟', 'success');
      } else {
        // Creating new document
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

          <h2 className="text-white text-xl sm:text-2xl font-black mb-2 leading-tight">
            {isEditMode ? 'تحديث وتعديل بيانات الطالب المكرم' : 'استكمال بيانات طالب مكرم 🎉'}
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-semibold max-w-lg mx-auto">
            يسر إدارة <span className="text-[#fbbf24] font-black">كُتّاب</span> أن تتقدم بأجمل التهاني لأولياء أمور أبنائنا الفضلاء لتفوقهم في الدورة الصيفية 2026.
          </p>

          {/* Recognized Student Badge from QR Code */}
          {(formData.studentCode || formData.partName || formData.studentId || formData.awardTier) && (
            <div className="mt-4 flex flex-col items-center justify-center gap-2">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/80 border border-[#fbbf24]/50 shadow-inner text-xs font-black">
                {formData.studentCode && (
                  <span className="text-[#fbbf24]">🏷️ كود التكريم: {formData.studentCode}</span>
                )}
                {formData.partName && (
                  <span className="text-emerald-300">| 📖 المستوى: {formData.partName}</span>
                )}
                {formData.examScore && (
                  <span className="text-amber-200">| ⭐ الدرجة: {formData.examScore}%</span>
                )}
              </div>

              {formData.awardTier && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                  <span>{formData.awardTier}</span>
                  {formData.gift && <span className="text-emerald-300 mr-2">🎁 {formData.gift}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Container */}
        <div className="px-5 sm:px-8 pb-8 pt-5 bg-[#041915]/90">

          {/* Global Arabic Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORM WITH noValidate */}
          <form noValidate onSubmit={handleSubmit} className="space-y-6">

            {/* ═══════════════════════════════════════════════════ */}
            {/* Section 1: Basic Honored Student Info */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-800/40">
                <Award className="w-4 h-4 text-[#fbbf24]" />
                <h3 className="text-[#fbbf24] text-xs sm:text-sm font-bold">1️⃣ البيانات الأساسية للطالب المكرم</h3>
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
                />
                <FieldHint
                  show={touched.studentName}
                  type={validation.studentName.type}
                  message={validation.studentName.message}
                />
              </div>

              {/* Age & Study Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  />
                  <FieldHint
                    show={touched.studentAge}
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
                    className={getInputClass('studyStage')}
                  >
                    <option value="">اختر المرحلة الدراسية...</option>
                    <option value="حضانة / روضة">روضة / حضانة</option>
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
                />
                <FieldHint
                  show={touched.schoolName}
                  type={validation.schoolName.type}
                  message={validation.schoolName.message}
                />
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* Section 2: Parent & Family Contact Info */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-800/40">
                <Phone className="w-4 h-4 text-[#fbbf24]" />
                <h3 className="text-[#fbbf24] text-xs sm:text-sm font-bold">2️⃣ بيانات ولي الأمر والتواصل</h3>
              </div>

              {/* Parent Name */}
              <div>
                <label htmlFor="parentName" className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم ولي الأمر ثلاثي / رباعي <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClass('parentName')}
                  placeholder="مثال: محمد علي محمود إبراهيم"
                />
                <FieldHint
                  show={touched.parentName}
                  type={validation.parentName.type}
                  message={validation.parentName.message}
                />
              </div>

              {/* Father Phone (WhatsApp) */}
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
                />
                <FieldHint
                  show={touched.fatherPhone}
                  type={validation.fatherPhone.type}
                  message={validation.fatherPhone.message}
                />
              </div>

              {/* Mother Phone */}
              <div>
                <label htmlFor="motherPhone" className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم تليفون الأم <span className="text-slate-400 text-[11px] font-normal">(اختياري)</span>
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
                  show={touched.motherPhone}
                  type={validation.motherPhone.type}
                  message={validation.motherPhone.message}
                />
              </div>

              {/* Father Status */}
              <div>
                <label htmlFor="fatherStatus" className="block text-xs font-bold text-slate-300 mb-1.5">
                  حالة الأب <span className="text-slate-400 text-[11px] font-normal">(لمراعاة وتكريم طلابنا الكرام)</span> <span className="text-rose-400">*</span>
                </label>
                <select
                  id="fatherStatus"
                  value={formData.fatherStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-sm bg-[#062b24]/90 border border-emerald-700/50 text-white focus:outline-none focus:border-[#fbbf24] transition-all cursor-pointer"
                >
                  <option value="الأب على قيد الحياة">الأب على قيد الحياة (حفظه الله)</option>
                  <option value="يتيم الأب">يتيم الأب (رحمه الله وأسكنه الفردوس)</option>
                  <option value="يتيم الأبوين">يتيم الأبوين (رحمهما الله رحمة واسعة)</option>
                </select>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* Section 3: Family Metrics & Siblings in Kuttab */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-800/40">
                <Users className="w-4 h-4 text-[#fbbf24]" />
                <h3 className="text-[#fbbf24] text-xs sm:text-sm font-bold">3️⃣ إحصاء الأسرة والأشقاء في الكُتّاب</h3>
              </div>

              {/* Family Counts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="totalChildrenCount" className="block text-xs font-bold text-slate-300 mb-1.5">
                    إجمالي عدد الأولاد في الأسرة
                  </label>
                  <input
                    type="number"
                    id="totalChildrenCount"
                    value={formData.totalChildrenCount}
                    onChange={handleInputChange}
                    min="1"
                    max="15"
                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#062b24]/90 border border-emerald-700/50 text-white focus:outline-none focus:border-[#fbbf24]"
                    placeholder="مثال: 3"
                  />
                </div>

                <div>
                  <label htmlFor="kuttabChildrenCount" className="block text-xs font-bold text-slate-300 mb-1.5">
                    عدد الأولاد المقيدين في الكُتّاب
                  </label>
                  <input
                    type="number"
                    id="kuttabChildrenCount"
                    value={formData.kuttabChildrenCount}
                    onChange={handleInputChange}
                    min="1"
                    max="15"
                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#062b24]/90 border border-emerald-700/50 text-white focus:outline-none focus:border-[#fbbf24]"
                    placeholder="مثال: 2"
                  />
                </div>
              </div>

              {/* Siblings Repeater Box */}
              <div className="bg-[#062b24]/60 p-4 rounded-2xl border border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">هل لديك أبناء آخرون مقيدون في الكُتّاب؟</h4>
                    <p className="text-[11px] text-slate-400">سجل أسماء أشقاء الطالب لربطهم في تقارير الأسر</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSibling}
                    className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ إضافة أخ/أخت</span>
                  </button>
                </div>

                {formData.siblings.map((sibling, index) => (
                  <div
                    key={sibling.id || index}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-700/40 space-y-3 animate-fade-in"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-emerald-900/40">
                      <span className="text-xs font-bold text-[#fbbf24]">الأخ / الأخت #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSibling(index)}
                        className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          اسم الأخ / الأخت
                        </label>
                        <input
                          type="text"
                          value={sibling.name}
                          onChange={(e) => handleSiblingChange(index, 'name', e.target.value)}
                          placeholder="الاسم كاملاً"
                          className="w-full px-3 py-2 rounded-lg text-xs bg-[#062b24] border border-emerald-700/40 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          المرحلة الدراسية
                        </label>
                        <select
                          value={sibling.studyStage}
                          onChange={(e) => handleSiblingChange(index, 'studyStage', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs bg-[#062b24] border border-emerald-700/40 text-white focus:outline-none focus:border-[#fbbf24]"
                        >
                          <option value="حضانة / روضة">حضانة / روضة</option>
                          <option value="ابتدائي">ابتدائي</option>
                          <option value="إعدادي">إعدادي</option>
                          <option value="ثانوي">ثانوي</option>
                          <option value="معهد أزهري">معهد أزهري</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* Section 4: Photo Upload */}
            {/* ═══════════════════════════════════════════════════ */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-800/40">
                <ImageIcon className="w-4 h-4 text-[#fbbf24]" />
                <h3 className="text-[#fbbf24] text-xs sm:text-sm font-bold">
                  4️⃣ صورة الطالب الشخصية <span className="text-slate-400 text-[11px] font-normal">(اختياري)</span>
                </h3>
              </div>

              <div
                onClick={() => document.getElementById('photoUploadInput').click()}
                className="border-2 border-dashed border-emerald-700/50 hover:border-[#fbbf24] bg-slate-900/60 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 group"
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
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#fbbf24] shadow-xl"
                    />
                    <span className="text-xs text-[#fbbf24] font-bold">اضغط لتغيير الصورة 🔄</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform text-[#fbbf24]">
                      <span className="text-2xl">📸</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">
                      اضغط هنا لتحميل صورة الطالب الشخصية<br />
                      <span className="text-[10px] text-slate-400">(تظهر في كارت التكريم وبادج الحفل)</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* Submit Button */}
            {/* ═══════════════════════════════════════════════════ */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 cursor-pointer"
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
