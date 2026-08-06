import React, { useState, useMemo } from 'react';
import { User, Phone, Image as ImageIcon, Sparkles, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { uploadStudentPhoto } from '../services/cloudinary';
import { saveStudentRegistration } from '../firebase';

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
    const nameVal = formData.studentName.trim();
    const nameWords = nameVal.split(/\s+/).filter(w => w.length > 0);
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
        valid: formData.schoolName.trim().length >= 3,
        message: formData.schoolName.trim().length === 0
          ? '⚠️ يرجى إدخال اسم المدرسة أو المعهد بالكامل'
          : formData.schoolName.trim().length < 3
            ? '📝 يرجى التوضيح واكتفاء الاسم بالكامل (3 أحرف على الأقل)'
            : '✅ تم كتابة اسم المدرسة بالكامل',
        type: formData.schoolName.trim().length >= 3 ? 'success' : 'error',
      },

      fatherPhone: {
        valid: phoneRegex.test(formData.fatherPhone),
        message: formData.fatherPhone.length === 0
          ? '⚠️ يرجى إدخال رقم تليفون ولي الأمر المكون من 11 رقماً'
          : !formData.fatherPhone.startsWith('01')
            ? '📱 رقم التليفون يجب أن يبدأ بـ 01 (مثل: 010 أو 011 أو 012 أو 015)'
            : formData.fatherPhone.length < 11
              ? `📱 الرقم ناقص — كتبت ${formData.fatherPhone.length} أرقام من أصل 11`
              : formData.fatherPhone.length > 11
                ? `📱 الرقم زائد — كتبت ${formData.fatherPhone.length} أرقام بدلاً من 11`
                : phoneRegex.test(formData.fatherPhone)
                  ? '✅ رقم التليفون صحيح'
                  : '📱 الرقم يجب أن يتكون من أرقام فقط',
        type: phoneRegex.test(formData.fatherPhone) ? 'success' : 'error',
      },

      motherPhone: {
        valid: formData.motherPhone === '' || phoneRegex.test(formData.motherPhone),
        message: formData.motherPhone.length === 0
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
        type: (formData.motherPhone === '' || phoneRegex.test(formData.motherPhone)) ? 'success' : 'error',
      },
    };
  }, [formData]);

  // ─── Dynamic input border styling ────────────────────────
  const getInputClass = (field) => {
    const base = 'w-full px-4 py-3 rounded-xl text-sm bg-[#062b24]/90 border text-white placeholder-slate-500 focus:outline-none transition-all';
    if (!touched[field]) {
      return `${base} border-emerald-700/50 focus:border-[#fbbf24] focus:bg-[#062b24]`;
    }
    if (validation[field].valid) {
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
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadStudentPhoto(photoFile);
      }

      const studentPayload = {
        ...formData,
        studentAge: Number(formData.studentAge),
        photoUrl
      };

      const savedRecord = await saveStudentRegistration(studentPayload);
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
    <div className="w-full max-w-lg mx-auto my-4 animate-fadeInUp">
      {/* Outer Card */}
      <div className="rounded-3xl overflow-hidden border border-[#fbbf24]/30 shadow-2xl bg-[#062b24]/90 backdrop-blur-xl">

        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0c3d34] via-[#062b24] to-[#041915] px-6 pt-8 pb-10 text-center border-b border-emerald-800/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center bg-amber-500/20 border-2 border-[#fbbf24] shadow-xl">
            <span className="text-4xl">🏆</span>
          </div>

          <h2 className="text-white text-xl sm:text-2xl font-black mb-3 leading-tight">
            استكمال بيانات طالب مكرم 🎉
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-semibold">
            يسر إدارة <span className="text-[#fbbf24] font-black">كُتّاب</span> أن تتقدم بأجمل التهاني لأولياء أمور أبنائنا الفضلاء لتفوقهم في الدورة الصيفية.
          </p>
        </div>

        {/* Form Container */}
        <div className="px-5 sm:px-7 pb-7 pt-4 bg-[#041915]/90">

          {/* Global Arabic Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2.5 animate-fadeInUp">
              <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ⚠️ FORM WITH noValidate TO PREVENT ENGLISH BROWSER TOOLTIPS */}
          <form noValidate onSubmit={handleSubmit} className="space-y-4">

            {/* Section 1: Basic Info */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-800/40">
              <User className="w-4 h-4 text-[#fbbf24]" />
              <h3 className="text-[#fbbf24] text-xs sm:text-sm font-bold">البيانات الأساسية للطالب</h3>
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
                  <option value="حضانة">روضة / حضانة</option>
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

            {/* Section 2: Contact Info */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-800/40 pt-2">
              <Phone className="w-4 h-4 text-[#fbbf24]" />
              <h3 className="text-[#fbbf24] text-xs sm:text-sm font-bold">بيانات تواصل أولياء الأمور</h3>
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

            {/* Section 3: Photo Upload */}
            <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-800/40 pt-2">
              <ImageIcon className="w-4 h-4 text-[#fbbf24]" />
              <h3 className="text-[#fbbf24] text-xs sm:text-sm font-bold">
                صورة الطالب الشخصية <span className="text-slate-400 text-[11px] font-normal">(اختياري)</span>
              </h3>
            </div>

            {/* Photo Box */}
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
                    <span className="text-[10px] text-slate-400">(تأتي مطبوعة في كارت التكريم)</span>
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
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
                  <span>حفظ وتأكيد بيانات الطالب</span>
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
