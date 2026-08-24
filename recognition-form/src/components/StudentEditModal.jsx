import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  Upload, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Calendar,
  School,
  Heart,
  Award
} from 'lucide-react';
import { updateStudentRecord, addStudentRecord } from '../firebase';
import { uploadStudentPhoto } from '../services/cloudinary';
import { QURAN_PARTS_ORDER } from '../data/studentsCatalog';

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
    studentId: student?.studentId || '',
    studentCode: student?.studentCode || '',
    studentName: student?.studentName || '',
    birthDate: student?.birthDate || '',
    studyStage: student?.studyStage || 'ابتدائي',
    schoolName: student?.schoolName || '',
    partName: student?.partName || student?.part || 'القرآن كاملاً',
    examScore: student?.examScore || student?.score || '',
    awardTier: student?.awardTier || student?.tier || '',
    gift: student?.gift || '',
    sheikhName: student?.sheikhName || '',
    fatherPhone: student?.fatherPhone || '',
    fatherStatus: student?.fatherStatus || 'نعم (على قيد الحياة)',
    photoUrl: student?.photoUrl || ''
  });

  const [photoPreview, setPhotoPreview] = useState(student?.photoUrl || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // 🔑 Close on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  // 🔄 Sync state when student prop changes
  useEffect(() => {
    setFormData({
      studentId: student?.studentId || '',
      studentCode: student?.studentCode || '',
      studentName: student?.studentName || '',
      birthDate: student?.birthDate || '',
      studyStage: student?.studyStage || 'ابتدائي',
      schoolName: student?.schoolName || '',
      partName: student?.partName || student?.part || 'القرآن كاملاً',
      examScore: student?.examScore ?? student?.score ?? '',
      awardTier: student?.awardTier || student?.tier || '',
      gift: student?.gift || '',
      sheikhName: student?.sheikhName || '',
      fatherPhone: student?.fatherPhone || '',
      fatherStatus: student?.fatherStatus || 'نعم (على قيد الحياة)',
      photoUrl: student?.photoUrl || ''
    });
    setPhotoPreview(student?.photoUrl || null);
    setTouched({});
  }, [student]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  };

  const phoneRegex = /^01[0-9]{9}$/;

  const validation = useMemo(() => {
    const nameVal = (formData.studentName || '').trim();
    const nameWords = nameVal.split(/\s+/).filter(w => w.length > 0);

    return {
      studentName: {
        valid: nameWords.length >= 3,
        message: nameVal.length === 0
          ? '⚠️ يرجى إدخال اسم الطالب كاملاً'
          : nameWords.length < 3
            ? `📝 الاسم ناقص — يرجى كتابة الاسم ثلاثي أو رباعي (${nameWords.length} كلمات)`
            : '✅ الاسم مكتمل وصحيح',
        type: nameWords.length >= 3 ? 'success' : 'error',
      },

      fatherPhone: {
        valid: !formData.fatherPhone || phoneRegex.test(formData.fatherPhone),
        message: !formData.fatherPhone || formData.fatherPhone.length === 0
          ? null
          : !formData.fatherPhone.startsWith('01')
            ? '📱 رقم الهاتف يجب أن يبدأ بـ 01'
            : formData.fatherPhone.length !== 11
              ? `📱 يجب أن يتكون من 11 رقماً (كتبت ${formData.fatherPhone.length})`
              : '✅ رقم الهاتف صحيح',
        type: (!formData.fatherPhone || phoneRegex.test(formData.fatherPhone)) ? 'success' : 'error',
      }
    };
  }, [formData]);

  const getInputClass = (field) => {
    const base = 'w-full px-3 py-2 bg-slate-900 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all';
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
    if (isSubmitting) return;

    setTouched({
      studentName: true,
      fatherPhone: true
    });

    if (!validation.studentName.valid) {
      showToast?.('يرجى كتابة اسم الطالب ثلاثياً على الأقل بالعربية', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const isComplete = Boolean(
        formData.studentName &&
        formData.birthDate &&
        formData.studyStage &&
        formData.schoolName &&
        formData.fatherPhone &&
        /^01[0-9]{9}$/.test(formData.fatherPhone.trim())
      );

      const payload = {
        ...formData,
        examScore: formData.examScore !== '' ? Number(formData.examScore) : 0,
        completed: isComplete
      };

      if (student?.id || student?.studentId) {
        const docId = student.id || student.studentId;
        await updateStudentRecord(docId, payload);
        showToast?.('تم تحديث بيانات الطالب بنجاح 🎉', 'success');
      } else {
        await addStudentRecord(payload);
        showToast?.('تمت إضافة الطالب الجديد بنجاح 🎉', 'success');
      }
      onClose();
    } catch (err) {
      console.error('Save student error:', err);
      showToast?.('حدث خطأ أثناء حفظ البيانات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#062b24] p-5 sm:p-6 rounded-3xl border-2 border-[#fbbf24]/50 max-w-2xl w-full text-right space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto animate-scaleIn my-auto"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#fbbf24]" />
            <h3 className="text-base sm:text-lg font-black text-white">
              {student ? 'تعديل وتحديث بيانات الطالب المُكَرَّم' : 'تسجيل وإضافة طالب جديد في الكُتّاب 🌟'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
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

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#fbbf24] mb-1">كود الطالب</label>
              <input
                type="text"
                value={formData.studentCode}
                onChange={(e) => handleInputChange('studentCode', e.target.value)}
                placeholder="مثال: #001"
                className={getInputClass('studentCode')}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-200 mb-1">
                اسم الطالب رباعي <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                placeholder="اسم الطالب كاملاً بالعربية"
                className={getInputClass('studentName')}
              />
              <FieldHint
                show={touched.studentName}
                type={validation.studentName.type}
                message={validation.studentName.message}
              />
            </div>
          </div>

          {/* Academic & Age Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">تاريخ الميلاد</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className={getInputClass('birthDate')}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">المرحلة الدراسية</label>
              <select
                value={formData.studyStage}
                onChange={(e) => handleInputChange('studyStage', e.target.value)}
                className={getInputClass('studyStage')}
              >
                <option value="روضة / حضانة">روضة / حضانة</option>
                <option value="ابتدائي">ابتدائي</option>
                <option value="إعدادي">إعدادي</option>
                <option value="ثانوي">ثانوي</option>
                <option value="معهد أزهري">معهد أزهري</option>
                <option value="جامعي">جامعي</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">المدرسة / الحضانة</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="اسم المدرسة أو الحضانة"
                className={getInputClass('schoolName')}
              />
            </div>
          </div>

          {/* Quranic Level & Score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-emerald-300 mb-1">المستوى القرآني (الجزء)</label>
              <select
                value={formData.partName}
                onChange={(e) => handleInputChange('partName', e.target.value)}
                className={getInputClass('partName')}
              >
                {QURAN_PARTS_ORDER.map((part) => (
                  <option key={part} value={part}>{part}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-amber-300 mb-1">درجة الاختبار</label>
              <input
                type="number"
                value={formData.examScore}
                onChange={(e) => handleInputChange('examScore', e.target.value)}
                placeholder="درجة التقييم"
                className={getInputClass('examScore')}
              />
            </div>

            <div>
              <label className="block font-bold text-[#fbbf24] mb-1">فئة التكريم</label>
              <input
                type="text"
                value={formData.awardTier}
                onChange={(e) => handleInputChange('awardTier', e.target.value)}
                placeholder="مثال: الفئة الأولى الذهبية"
                className={getInputClass('awardTier')}
              />
            </div>
          </div>

          {/* Parent & Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-800/40">
            <div>
              <label className="block font-bold text-slate-200 mb-1">هاتف ولي الأمر (واتساب)</label>
              <input
                type="tel"
                value={formData.fatherPhone}
                onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                placeholder="01012345678"
                maxLength={11}
                className={getInputClass('fatherPhone')}
              />
              <FieldHint
                show={touched.fatherPhone}
                type={validation.fatherPhone.type}
                message={validation.fatherPhone.message}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">حالة الوالد</label>
              <select
                value={formData.fatherStatus}
                onChange={(e) => handleInputChange('fatherStatus', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-emerald-700/50 rounded-xl text-xs text-white focus:outline-none focus:border-[#fbbf24]"
              >
                <option value="نعم (على قيد الحياة)">نعم (على قيد الحياة)</option>
                <option value="لا (متوفى - رحمه الله)">لا (متوفى - رحمه الله)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-800/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-emerald-700/40 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{student ? 'حفظ التعديلات' : 'إضافة الطالب'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}
