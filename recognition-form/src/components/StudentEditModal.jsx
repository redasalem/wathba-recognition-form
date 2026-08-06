import React, { useState, useMemo } from 'react';
import { X, User, Phone, BookOpen, GraduationCap, Upload, Save, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { updateStudentRecord } from '../firebase';
import { uploadStudentPhoto } from '../services/cloudinary';

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

export default function StudentEditModal({ student, onClose, showToast }) {
  const [formData, setFormData] = useState({
    studentName: student?.studentName || '',
    studentAge: student?.studentAge || '',
    studyStage: student?.studyStage || '',
    schoolName: student?.schoolName || '',
    partName: student?.partName || 'القرآن كاملاً',
    sheikhName: student?.sheikhName || '',
    totalParts: student?.totalParts || '',
    fatherPhone: student?.fatherPhone || '',
    motherPhone: student?.motherPhone || '',
    fatherStatus: student?.fatherStatus || 'الأب على قيد الحياة',
    photoUrl: student?.photoUrl || ''
  });

  const [photoPreview, setPhotoPreview] = useState(student?.photoUrl || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
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
          ? '⚠️ يرجى كتابة اسم الطالب ثلاثياً أو رباعياً بالعربية'
          : nameWords.length < 3
            ? `📝 الاسم ناقص — كتبت ${nameWords.length} كلمة فقط`
            : '✅ الاسم مكتمل',
        type: nameWords.length >= 3 ? 'success' : 'error',
      },

      studentAge: {
        valid: age >= 3 && age <= 25,
        message: formData.studentAge === ''
          ? '⚠️ يرجى تحديد سن الطالب بالعربية'
          : age < 3
            ? '⚠️ السن يجب أن يكون 3 سنوات على الأقل'
            : age > 25
              ? '⚠️ السن يجب أن يكون 25 سنة أو أقل'
              : `✅ السن ${age} سنة`,
        type: (age >= 3 && age <= 25) ? 'success' : 'error',
      },

      schoolName: {
        valid: formData.schoolName.trim().length >= 3,
        message: formData.schoolName.trim().length === 0
          ? '⚠️ يرجى كتابة اسم المدرسة بالكامل'
          : formData.schoolName.trim().length < 3
            ? '📝 يرجى التوضيح واسم المدرسة بالكامل'
            : '✅ تمام!',
        type: formData.schoolName.trim().length >= 3 ? 'success' : 'error',
      },

      fatherPhone: {
        valid: phoneRegex.test(formData.fatherPhone),
        message: formData.fatherPhone.length === 0
          ? '⚠️ يرجى إدخال رقم تليفون الأب (11 رقماً يبدأ بـ 01)'
          : !formData.fatherPhone.startsWith('01')
            ? '📱 الرقم يجب أن يبدأ بـ 01'
            : formData.fatherPhone.length < 11
              ? `📱 الرقم ناقص (${formData.fatherPhone.length}/11)`
              : formData.fatherPhone.length > 11
                ? `📱 الرقم زائد (${formData.fatherPhone.length}/11)`
                : phoneRegex.test(formData.fatherPhone)
                  ? '✅ رقم صحيح!'
                  : '📱 الرقم أرقام فقط',
        type: phoneRegex.test(formData.fatherPhone) ? 'success' : 'error',
      },

      motherPhone: {
        valid: formData.motherPhone === '' || phoneRegex.test(formData.motherPhone),
        message: formData.motherPhone.length === 0
          ? null
          : !formData.motherPhone.startsWith('01')
            ? '📱 الرقم يجب أن يبدأ بـ 01'
            : formData.motherPhone.length < 11
              ? `📱 الرقم ناقص (${formData.motherPhone.length}/11)`
              : formData.motherPhone.length > 11
                ? `📱 الرقم زائد (${formData.motherPhone.length}/11)`
                : phoneRegex.test(formData.motherPhone)
                  ? '✅ رقم صحيح!'
                  : '📱 الرقم أرقام فقط',
        type: (formData.motherPhone === '' || phoneRegex.test(formData.motherPhone)) ? 'success' : 'error',
      },

      totalParts: {
        valid: formData.totalParts === '' || (Number(formData.totalParts) >= 1 && Number(formData.totalParts) <= 30),
        message: formData.totalParts === '' ? null
          : Number(formData.totalParts) < 1 ? '⚠️ 1 جزء على الأقل'
          : Number(formData.totalParts) > 30 ? '⚠️ أقصى عدد 30 جزء'
          : `✅ ${formData.totalParts} جزء`,
        type: (formData.totalParts === '' || (Number(formData.totalParts) >= 1 && Number(formData.totalParts) <= 30)) ? 'success' : 'error',
      },
    };
  }, [formData]);

  const getInputClass = (field) => {
    const base = 'w-full px-3 py-2.5 bg-slate-900/80 border rounded-xl text-white focus:outline-none text-xs transition-all';
    if (!touched[field]) {
      return `${base} border-emerald-700/50 focus:border-[#fbbf24]`;
    }
    if (validation[field]?.valid) {
      return `${base} border-emerald-500/60 bg-emerald-500/5 focus:border-emerald-400`;
    }
    return `${base} border-rose-500 bg-rose-500/10 focus:border-rose-400`;
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    try {
      const url = await uploadStudentPhoto(file);
      setFormData((prev) => ({ ...prev, photoUrl: url }));
      showToast?.('تم رفع صورة الطالب بنجاح 📸', 'success');
    } catch (err) {
      console.error('Photo upload error:', err);
      showToast?.('حدث خطأ أثناء رفع الصورة', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      studentName: true,
      studentAge: true,
      schoolName: true,
      fatherPhone: true,
      motherPhone: true,
      totalParts: true,
    });

    if (!validation.studentName.valid) {
      showToast?.('يرجى كتابة اسم الطالب ثلاثياً على الأقل بالعربية', 'error');
      return;
    }
    if (!validation.studentAge.valid) {
      showToast?.('السن يجب أن يكون بين 3 و 25 سنة بالسنوات', 'error');
      return;
    }
    if (!validation.schoolName.valid) {
      showToast?.('يرجى كتابة اسم المدرسة بالكامل بالعربية', 'error');
      return;
    }
    if (!validation.fatherPhone.valid) {
      showToast?.('رقم تليفون الأب يجب أن يبدأ بـ 01 ويتكون من 11 رقماً', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        studentAge: Number(formData.studentAge) || 0,
        totalParts: formData.totalParts ? Number(formData.totalParts) : 0,
      };

      await updateStudentRecord(student.id, payload);
      showToast?.('تم تحديث بيانات الطالب بنجاح 🎉', 'success');
      onClose();
    } catch (err) {
      console.error('Update student error:', err);
      showToast?.('حدث خطأ أثناء حفظ التعديلات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-fadeInUp">
      <div className="relative bg-[#062b24] p-6 rounded-3xl border border-[#fbbf24]/40 max-w-2xl w-full text-right space-y-4 my-8 shadow-2xl backdrop-blur-xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#fbbf24]" />
            <h3 className="text-lg font-black text-white">تعديل بيانات الطالب المكرم</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ⚠️ FORM WITH noValidate TO PREVENT ENGLISH BROWSER TOOLTIPS */}
        <form noValidate onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Photo Preview & Upload */}
          <div className="flex items-center gap-4 p-3 bg-slate-900/60 rounded-2xl border border-emerald-700/30">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={formData.studentName}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#fbbf24] shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-dashed border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <User className="w-6 h-6" />
              </div>
            )}
            <div className="space-y-1">
              <label className="cursor-pointer px-3 py-1.5 bg-emerald-700/40 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 font-bold rounded-lg transition-all inline-flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{photoPreview ? 'تغيير الصورة' : 'رفع صورة شخصية'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              {uploadingPhoto && <p className="text-[10px] text-amber-400 font-bold">جاري رفع الصورة...</p>}
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block font-bold text-slate-200 mb-1">اسم الطالب ثلاثي / رباعي *</label>
            <input
              type="text"
              value={formData.studentName}
              onChange={(e) => handleInputChange('studentName', e.target.value)}
              onBlur={() => handleBlur('studentName')}
              className={getInputClass('studentName')}
            />
            <FieldHint
              show={touched.studentName}
              type={validation.studentName.type}
              message={validation.studentName.message}
            />
          </div>

          {/* Age & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">السن (بالسنوات) *</label>
              <input
                type="number"
                min="3"
                max="25"
                value={formData.studentAge}
                onChange={(e) => handleInputChange('studentAge', e.target.value)}
                onBlur={() => handleBlur('studentAge')}
                className={getInputClass('studentAge')}
              />
              <FieldHint
                show={touched.studentAge}
                type={validation.studentAge.type}
                message={validation.studentAge.message}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">المرحلة الدراسية *</label>
              <select
                value={formData.studyStage}
                onChange={(e) => setFormData({ ...formData, studyStage: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
              >
                <option value="حضانة">روضة / حضانة</option>
                <option value="ابتدائي">ابتدائي</option>
                <option value="إعدادي">إعدادي</option>
                <option value="ثانوي">ثانوي</option>
                <option value="معهد أزهري">معهد أزهري</option>
                <option value="جامعي">جامعي</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">المدرسة / المعهد *</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                onBlur={() => handleBlur('schoolName')}
                className={getInputClass('schoolName')}
              />
              <FieldHint
                show={touched.schoolName}
                type={validation.schoolName.type}
                message={validation.schoolName.message}
              />
            </div>
          </div>

          {/* Summer Course Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-800/30">
            <div>
              <label className="block font-bold text-emerald-300 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                فئة المشاركة بالدورة
              </label>
              <select
                value={formData.partName}
                onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
              >
                <option value="القرآن كاملاً">القرآن كاملاً 🏆</option>
                <option value="جزء الأعراف">جزء الأعراف وما فوق</option>
                <option value="من 10 إلى 15 جزء">من 10 إلى 15 جزء</option>
                <option value="من 5 إلى 10 أجزاء">من 5 إلى 10 أجزاء</option>
                <option value="جزء عم وقصار السور">جزء عم وقصار السور</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-emerald-300 mb-1">عدد الأجزاء المحفوظة</label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.totalParts}
                onChange={(e) => handleInputChange('totalParts', e.target.value)}
                onBlur={() => handleBlur('totalParts')}
                placeholder="مثال: 15"
                className={getInputClass('totalParts')}
              />
              <FieldHint
                show={touched.totalParts}
                type={validation.totalParts.type}
                message={validation.totalParts.message}
              />
            </div>

            <div>
              <label className="block font-bold text-emerald-300 mb-1">الشيخ المشرف</label>
              <input
                type="text"
                value={formData.sheikhName}
                onChange={(e) => setFormData({ ...formData, sheikhName: e.target.value })}
                placeholder="اسم الشيخ..."
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
              />
            </div>
          </div>

          {/* Family & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-800/30">
            <div>
              <label className="block font-bold text-amber-300 mb-1">هاتف الأب / الواتساب *</label>
              <input
                type="tel"
                maxLength={11}
                value={formData.fatherPhone}
                onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                onBlur={() => handleBlur('fatherPhone')}
                className={getInputClass('fatherPhone')}
              />
              <FieldHint
                show={touched.fatherPhone}
                type={validation.fatherPhone.type}
                message={validation.fatherPhone.message}
              />
            </div>

            <div>
              <label className="block font-bold text-amber-300 mb-1">هاتف الأم</label>
              <input
                type="tel"
                maxLength={11}
                value={formData.motherPhone}
                onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                onBlur={() => handleBlur('motherPhone')}
                className={getInputClass('motherPhone')}
              />
              <FieldHint
                show={touched.motherPhone}
                type={validation.motherPhone.type}
                message={validation.motherPhone.message}
              />
            </div>

            <div>
              <label className="block font-bold text-amber-300 mb-1">الحالة الإنسانية *</label>
              <select
                value={formData.fatherStatus}
                onChange={(e) => setFormData({ ...formData, fatherStatus: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
              >
                <option value="الأب على قيد الحياة">الأب على قيد الحياة</option>
                <option value="يتيم الأب">يتيم الأب ❤️</option>
                <option value="يتيم الأبوين">يتيم الأبوين 💔</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-emerald-800/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingPhoto}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
