import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User, Phone, School, Calendar, BookOpen, Heart, MapPin, Clock, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadStudentPhoto } from '../services/cloudinary';
import { addPermanentKuttabRecord, updatePermanentKuttabRecord } from '../firebase';

export default function PermanentStudentModal({ student, isOpen, onClose, showToast }) {
  const [formData, setFormData] = useState({
    registrationCode: '',
    studentName: '',
    birthDate: '',
    studyStage: 'حضانة تمهيدي (قبل المدرسة)',
    schoolName: '',
    fatherPhone: '',
    alternativePhone: '',
    fatherStatus: 'نعم (على قيد الحياة)',
    quranLevel: 'مبتدئ (تلقين وقاعدة نورانية)',
    preferredShift: 'الفترة المسائية',
    address: '',
    notes: '',
    photoUrl: '',
    status: 'ACTIVE'
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        registrationCode: student.registrationCode || '',
        studentName: student.studentName || '',
        birthDate: student.birthDate || '',
        studyStage: student.studyStage || 'حضانة تمهيدي (قبل المدرسة)',
        schoolName: student.schoolName || '',
        fatherPhone: student.fatherPhone || '',
        alternativePhone: student.alternativePhone || '',
        fatherStatus: student.fatherStatus || 'نعم (على قيد الحياة)',
        quranLevel: student.quranLevel || 'مبتدئ (تلقين وقاعدة نورانية)',
        preferredShift: student.preferredShift || 'الفترة المسائية',
        address: student.address || '',
        notes: student.notes || '',
        photoUrl: student.photoUrl || '',
        status: student.status || 'ACTIVE'
      });
      setPhotoPreview(student.photoUrl || null);
    } else {
      setFormData({
        registrationCode: `KUT-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: '',
        birthDate: '',
        studyStage: 'المرحلة الابتدائية (صفوف أولى 1-3)',
        schoolName: '',
        fatherPhone: '',
        alternativePhone: '',
        fatherStatus: 'نعم (على قيد الحياة)',
        quranLevel: 'مبتدئ (تلقين وقاعدة نورانية)',
        preferredShift: 'الفترة المسائية',
        address: '',
        notes: '',
        photoUrl: '',
        status: 'ACTIVE'
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setPhotoPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName.trim()) {
      showToast?.('يرجى إدخال اسم الطالب', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let finalPhotoUrl = formData.photoUrl;
      if (photoFile) {
        try {
          finalPhotoUrl = await uploadStudentPhoto(photoFile);
        } catch (uploadErr) {
          console.warn('Photo upload fallback:', uploadErr);
        }
      }

      const payload = {
        ...formData,
        photoUrl: finalPhotoUrl || '',
        studentName: formData.studentName.trim(),
        schoolName: formData.schoolName.trim(),
        fatherPhone: formData.fatherPhone.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim()
      };

      if (student && student.id) {
        await updatePermanentKuttabRecord(student.id, payload);
        showToast?.('تم تحديث بيانات الطالب في الكُتّاب الدائم بنجاح ✨', 'success');
      } else {
        await addPermanentKuttabRecord(payload);
        showToast?.('تمت إضافة الطالب إلى الكُتّاب الدائم بنجاح 🌿', 'success');
      }

      onClose();
    } catch (err) {
      console.error('Error saving permanent student:', err);
      showToast?.('حدث خطأ أثناء حفظ البيانات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#041915] rounded-3xl border-2 border-[#fbbf24]/50 max-w-2xl w-full p-5 sm:p-6 text-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto animate-scaleIn"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#fbbf24]" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {student ? 'تعديل بيانات طالب الكُتّاب الدائم' : 'إضافة طالب جديد للكُتّاب الدائم'}
              </h3>
              <p className="text-xs text-amber-400 font-mono font-bold">
                {formData.registrationCode || '#KUT-NEW'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Photo & Name Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#062b24]/60 p-4 rounded-2xl border border-emerald-800/40">
            <div className="relative group shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="صورة الطالب"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#fbbf24]"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-950/60 border border-emerald-700 flex items-center justify-center text-[#fbbf24]">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-right">
              <label
                htmlFor="modalPhoto"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-600/70 text-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-emerald-500/40"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{photoPreview ? 'تغيير الصورة' : 'رفع صورة شخصية'}</span>
              </label>
              <input
                type="file"
                id="modalPhoto"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-[10px] text-slate-400">صورة الطالب الشخصية تظهر في كروت القيد والشهادات</p>
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label htmlFor="studentName" className="block text-xs font-bold text-slate-200 mb-1">
              اسم الطالب رباعياً <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              required
              placeholder="الاسم الرباعي للطالب"
              className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
            />
          </div>

          {/* Birth Date & Study Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="birthDate" className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>تاريخ الميلاد</span>
              </label>
              <input
                type="date"
                id="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
              />
            </div>

            <div>
              <label htmlFor="studyStage" className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>المرحلة الدراسية</span>
              </label>
              <select
                id="studyStage"
                value={formData.studyStage}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
              >
                <option value="حضانة تمهيدي (قبل المدرسة)">حضانة تمهيدي (قبل المدرسة)</option>
                <option value="المرحلة الابتدائية (صفوف أولى 1-3)">المرحلة الابتدائية (صفوف أولى 1-3)</option>
                <option value="المرحلة الابتدائية (صفوف عليا 4-6)">المرحلة الابتدائية (صفوف عليا 4-6)</option>
                <option value="المرحلة الإعدادية">المرحلة الإعدادية</option>
                <option value="المرحلة الثانوية">المرحلة الثانوية</option>
                <option value="المرحلة الجامعية">المرحلة الجامعية</option>
                <option value="خريج / تعليم عام">خريج / تعليم عام</option>
              </select>
            </div>
          </div>

          {/* School Name */}
          <div>
            <label htmlFor="schoolName" className="block text-xs font-bold text-slate-200 mb-1">
              اسم المدرسة / الحضانة
            </label>
            <input
              type="text"
              id="schoolName"
              value={formData.schoolName}
              onChange={handleInputChange}
              placeholder="اسم المدرسة أو الروضة"
              className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
            />
          </div>

          {/* Phones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="fatherPhone" className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>رقم هاتف ولي الأمر (واتساب)</span>
              </label>
              <input
                type="tel"
                id="fatherPhone"
                value={formData.fatherPhone}
                onChange={handleInputChange}
                placeholder="010XXXXXXXX"
                dir="ltr"
                maxLength={11}
                className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 font-mono text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
              />
            </div>

            <div>
              <label htmlFor="alternativePhone" className="block text-xs font-bold text-slate-200 mb-1">
                رقم هاتف إضافي
              </label>
              <input
                type="tel"
                id="alternativePhone"
                value={formData.alternativePhone}
                onChange={handleInputChange}
                placeholder="01XXXXXXXXX"
                dir="ltr"
                maxLength={11}
                className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 font-mono text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
              />
            </div>
          </div>

          {/* Quran Level & Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="quranLevel" className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>مستوى الحفظ الحالي</span>
              </label>
              <select
                id="quranLevel"
                value={formData.quranLevel}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
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

            <div>
              <label htmlFor="preferredShift" className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>فترة الحضور</span>
              </label>
              <select
                id="preferredShift"
                value={formData.preferredShift}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
              >
                <option value="الفترة المسائية">الفترة المسائية (بعد العصر / المغرب)</option>
                <option value="الفترة الصباحية">الفترة الصباحية (العطلات)</option>
                <option value="أي فترة متاحة">أي فترة متاحة</option>
              </select>
            </div>
          </div>

          {/* Father Status & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="fatherStatus" className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>حالة الأب</span>
              </label>
              <select
                id="fatherStatus"
                value={formData.fatherStatus}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
              >
                <option value="نعم (على قيد الحياة)">نعم (على قيد الحياة)</option>
                <option value="متوفى">متوفى - رحمه الله</option>
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>العنوان / القرية</span>
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="عنوان السكن"
                className="w-full px-3.5 py-2.5 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-xs font-bold text-slate-200 mb-1">
              ملاحظات إدارية
            </label>
            <textarea
              id="notes"
              rows={2}
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="أي ملاحظات خاصة بالطالب أو المحفظ..."
              className="w-full px-3.5 py-2 bg-[#062b24]/80 rounded-xl border border-emerald-800/60 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]/50 resize-none"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-800/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#fbbf24] hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{student ? 'حفظ التعديلات' : 'إضافة الطالب'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}
