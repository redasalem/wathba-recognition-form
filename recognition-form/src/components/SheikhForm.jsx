import React, { useState, useMemo } from 'react';
import { UserCheck, Phone, BookOpen, Users, Camera, Upload, CheckCircle2, ShieldCheck, ArrowRight, Award, GraduationCap, MapPin, Calendar, MessageSquare, Heart, AlertCircle, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { uploadStudentPhoto } from '../services/cloudinary';
import { addSheikhRecord } from '../firebase';

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

export default function SheikhForm({ onSuccess, showToast }) {
  const [formData, setFormData] = useState({
    sheikhName: '',
    phone: '',
    address: 'قرية جناج - مركز بسيون',
    qualification: 'معهد القراءات / الأزهر الشريف',
    ijazat: 'رواية حفص عن عاصم',
    socialStatus: 'متزوج',
    participatingSummer: 'نعم - مشارك بالدورة الصيفية',
    summerLevel: 'إشراف عام وفصول القرآن كاملاً',
    studentsCount: '10',
    stipendStatus: 'متفرغ كلياً (مكافأة شهرية)',
    notes: '',
    photoUrl: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSheikh, setSubmittedSheikh] = useState(null);
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

  // ─── Real-time Validation ─────────────────────────────────
  const phoneRegex = /^01[0125]\d{8}$/;

  const validation = useMemo(() => {
    const nameVal = formData.sheikhName.trim();
    const nameWords = nameVal.split(/\s+/).filter(w => w.length > 0);
    const count = Number(formData.studentsCount);

    return {
      sheikhName: {
        valid: nameWords.length >= 2,
        message: nameVal.length === 0
          ? null
          : nameWords.length < 2
            ? '📝 يرجى إدخال اسم الشيخ ثنائي على الأقل'
            : '✅ ممتاز! اسم الشيخ مكتمل',
        type: nameWords.length >= 2 ? 'success' : 'error',
      },

      phone: {
        valid: formData.phone === '' || phoneRegex.test(formData.phone.trim()),
        message: formData.phone.length === 0
          ? null
          : !formData.phone.startsWith('01')
            ? '📱 الرقم يجب أن يبدأ بـ 01 (مثل: 010 أو 011 أو 012 أو 015)'
            : formData.phone.length < 11
              ? `📱 الرقم ناقص — كتبت ${formData.phone.length} أرقام من أصل 11`
              : formData.phone.length > 11
                ? `📱 الرقم زيادة — كتبت ${formData.phone.length} أرقام بدل 11`
                : phoneRegex.test(formData.phone.trim())
                  ? '✅ رقم تليفون صحيح!'
                  : '📱 الرقم يجب أن يكون أرقاماً فقط',
        type: (formData.phone === '' || phoneRegex.test(formData.phone.trim())) ? 'success' : 'error',
      },

      qualification: {
        valid: formData.qualification.trim().length >= 3,
        message: formData.qualification.trim().length === 0
          ? null
          : formData.qualification.trim().length < 3
            ? '📝 يرجى التوضيح بشكل أكبر'
            : '✅ مؤهل علمي معتمد',
        type: formData.qualification.trim().length >= 3 ? 'success' : 'error',
      },

      ijazat: {
        valid: formData.ijazat.trim().length >= 3,
        message: formData.ijazat.trim().length === 0
          ? null
          : '✅ الإجازات المسندة مدونة',
        type: 'success',
      },

      address: {
        valid: formData.address.trim().length >= 3,
        message: formData.address.trim().length === 0
          ? null
          : '✅ العنوان مدون',
        type: 'success',
      },

      studentsCount: {
        valid: count >= 0 && count <= 200,
        message: formData.studentsCount === ''
          ? null
          : count < 0
            ? '⚠️ العدد لا يمكن أن يكون بالسالب'
            : count > 200
              ? '⚠️ أقصى عدد 200 طالب'
              : `✅ إسناد ${count} طالب للشيخ`,
        type: (count >= 0 && count <= 200) ? 'success' : 'error',
      },
    };
  }, [formData]);

  const getInputClass = (field) => {
    const base = 'w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 focus:outline-none text-sm transition-all';
    if (!touched[field] || validation[field]?.message === null) {
      return `${base} border-emerald-700/50 focus:border-[#fbbf24]`;
    }
    if (validation[field]?.valid) {
      return `${base} border-emerald-500/60 bg-emerald-500/5 focus:border-emerald-400`;
    }
    return `${base} border-rose-500/60 bg-rose-500/5 focus:border-rose-400`;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast?.('حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت', 'error');
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);

    try {
      const url = await uploadStudentPhoto(file);
      setFormData((prev) => ({ ...prev, photoUrl: url }));
      showToast?.('تم رفع صورة الشيخ بنجاح 📸', 'success');
    } catch (err) {
      console.error('Photo upload error:', err);
      showToast?.('حدث خطأ أثناء رفع الصورة، حاول مرة أخرى', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      sheikhName: true,
      phone: true,
      qualification: true,
      ijazat: true,
      address: true,
      studentsCount: true,
    });

    if (!validation.sheikhName.valid) {
      showToast?.('يرجى كتابة اسم الشيخ ثنائي على الأقل', 'error');
      return;
    }
    if (!validation.phone.valid) {
      showToast?.('يرجى كتابة رقم هاتف صحيح يبدأ بـ 01 ويتكون من 11 رقم', 'error');
      return;
    }
    if (!validation.studentsCount.valid) {
      showToast?.('يرجى كتابة عدد طلاب صحيح بين 0 و 200', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.sheikhName.trim(),
        phone: formData.phone.trim() || '-',
        address: formData.address.trim() || 'قرية جناج',
        qualification: formData.qualification.trim() || 'حافظ لكتاب الله',
        ijazat: formData.ijazat.trim() || 'رواية حفص عن عاصم',
        socialStatus: formData.socialStatus,
        participatingSummer: formData.participatingSummer,
        summerLevel: formData.summerLevel,
        specialization: formData.summerLevel,
        availability: formData.stipendStatus,
        studentsCount: Number(formData.studentsCount) || 0,
        stipendStatus: formData.stipendStatus,
        notes: formData.notes.trim() || 'معلم ومحفظ فاضل بالمنظومة',
        photoUrl: formData.photoUrl || ''
      };

      const sheikhId = await addSheikhRecord(payload);
      const recordWithId = { id: sheikhId, ...payload };

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmittedSheikh(recordWithId);
      showToast?.('تم حفظ بيانات فضيلة الشيخ بنجاح 🎉', 'success');
      onSuccess?.(recordWithId);
    } catch (err) {
      console.error('Save Sheikh Error:', err);
      showToast?.('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSheikh) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-[#062b24] border border-[#fbbf24]/30 rounded-2xl shadow-2xl text-center text-slate-100 backdrop-blur-xl animate-fadeInUp">
        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="text-2xl font-black text-[#fbbf24] mb-3">تم حصر وتسجيل الشيخ بنجاح! 🎉</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          أهلاً ومرحباً بفضيلة الشيخ <strong className="text-emerald-300">{submittedSheikh.name}</strong> في حصر ومتابعة منظومة كُتّاب الذكية.
        </p>

        {submittedSheikh.photoUrl && (
          <img
            src={submittedSheikh.photoUrl}
            alt={submittedSheikh.name}
            className="w-28 h-28 object-cover rounded-full mx-auto mb-6 border-2 border-[#fbbf24] shadow-lg"
          />
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              setSubmittedSheikh(null);
              setFormData({
                sheikhName: '',
                phone: '',
                address: 'قرية جناج - مركز بسيون',
                qualification: 'معهد القراءات / الأزهر الشريف',
                ijazat: 'رواية حفص عن عاصم',
                socialStatus: 'متزوج',
                participatingSummer: 'نعم - مشارك بالدورة الصيفية',
                summerLevel: 'إشراف عام وفصول القرآن كاملاً',
                studentsCount: '10',
                stipendStatus: 'متفرغ كلياً (مكافأة شهرية)',
                notes: '',
                photoUrl: ''
              });
              setPhotoPreview(null);
              setTouched({});
            }}
            className="px-6 py-3 bg-[#0c3d34] hover:bg-[#114b40] text-emerald-300 font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-5 h-5" />
            تسجيل بيانات شيخ آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 p-6 sm:p-10 bg-[#062b24]/90 border border-[#fbbf24]/30 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 animate-fadeInUp">
      
      {/* ترويسة الاستمارة */}
      <div className="text-center mb-8 pb-6 border-b border-emerald-800/40">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-bold mb-3">
          <ShieldCheck className="w-4 h-4" />
          حصر وتسجيل الشيوخ والمعلمين - كُتّاب
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">استمارة حصر وتحديث بيانات فضيلة الشيخ</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          نرجو من فضيلتكم استكمال كافة البيانات الأساسية وبيانات المشاركة بالدورة الصيفية لخدمة منظومة الكُتّاب وتنظيم المتابعة والتقدير
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* قسم رفع صورة الشيخ */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/50 border border-emerald-700/40 rounded-2xl">
          <div className="relative w-28 h-28 mb-3">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="معاينة صورة الشيخ"
                className="w-28 h-28 object-cover rounded-full border-2 border-[#fbbf24] shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-emerald-950/80 border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400">
                <Camera className="w-8 h-8 mb-1" />
                <span className="text-[10px] text-slate-400">صورة شخصية</span>
              </div>
            )}

            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center text-xs text-white font-bold">
                جاري الرفع...
              </div>
            )}
          </div>

          <label className="cursor-pointer px-4 py-2 bg-emerald-700/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-lg transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {photoPreview ? 'تغيير صورة الشيخ' : 'تحميل صورة شخصية لفضيلة الشيخ'}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>

        {/* 📌 القسم الأول: البيانات الأساسية لفضيلة الشيخ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#fbbf24] font-black text-sm pb-2 border-b border-emerald-800/40">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>أولاً: البيانات الأساسية لفضيلة الشيخ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Sheikh Name */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#fbbf24]" />
                اسم الشيخ / المحفظ الكامل <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sheikhName}
                onChange={(e) => handleInputChange('sheikhName', e.target.value)}
                onBlur={() => handleBlur('sheikhName')}
                placeholder="مثال: الشيخ عبد الله حسن الديهى"
                className={getInputClass('sheikhName')}
              />
              <FieldHint
                show={touched.sheikhName && validation.sheikhName.message}
                type={validation.sheikhName.type}
                message={validation.sheikhName.message}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#fbbf24]" />
                رقم التليفون / الواتساب
              </label>
              <input
                type="tel"
                maxLength={11}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="مثال: 01550215634"
                className={getInputClass('phone')}
              />
              <FieldHint
                show={touched.phone && validation.phone.message}
                type={validation.phone.type}
                message={validation.phone.message}
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Qualification */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#fbbf24]" />
                المؤهل العلمي / الأزهرية
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                onBlur={() => handleBlur('qualification')}
                placeholder="مثال: لسانس لغة عربية / معهد القراءات"
                className={getInputClass('qualification')}
              />
              <FieldHint
                show={touched.qualification && validation.qualification.message}
                type={validation.qualification.type}
                message={validation.qualification.message}
              />
            </div>

            {/* Ijazat */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#fbbf24]" />
                الإجازات والقراءات المسندة
              </label>
              <input
                type="text"
                value={formData.ijazat}
                onChange={(e) => handleInputChange('ijazat', e.target.value)}
                onBlur={() => handleBlur('ijazat')}
                placeholder="مثال: إجازة حفص عن عاصم / القراءات العشر"
                className={getInputClass('ijazat')}
              />
              <FieldHint
                show={touched.ijazat && validation.ijazat.message}
                type={validation.ijazat.type}
                message={validation.ijazat.message}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#fbbf24]" />
                العنوان والقرية
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
                placeholder="مثال: قرية جناج - بسيون"
                className={getInputClass('address')}
              />
              <FieldHint
                show={touched.address && validation.address.message}
                type={validation.address.type}
                message={validation.address.message}
              />
            </div>

          </div>
        </div>

        {/* ☀️ القسم الثاني: بيانات وملاحظات المشاركة بالدورة الصيفية 2026 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#fbbf24] font-black text-sm pb-2 border-b border-emerald-800/40">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>ثانياً: بيانات وملاحظات الدورة الصيفية 2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
                المشاركة بالدورة الصيفية الحالية
              </label>
              <select
                value={formData.participatingSummer}
                onChange={(e) => setFormData({ ...formData, participatingSummer: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all"
              >
                <option value="نعم - مشارك بالدورة الصيفية">نعم - مشارك بالدورة الصيفية 2026</option>
                <option value="لا - محفظ دائم بالكُتّاب">لا - محفظ دائم بالكُتّاب فقط</option>
                <option value="مشارك جزئي / بديل">مشارك جزئي / بديل</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#fbbf24]" />
                المستوى / الفصول المشرف عليها
              </label>
              <select
                value={formData.summerLevel}
                onChange={(e) => setFormData({ ...formData, summerLevel: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all"
              >
                <option value="إشراف عام وفصول القرآن كاملاً">إشراف عام وفصول القرآن كاملاً</option>
                <option value="فصول جزء الأعراف إلى 15 جزء">فصول جزء الأعراف إلى 15 جزء</option>
                <option value="فصول البراعم وجزء عم">فصول البراعم وجزء عم</option>
                <option value="فصول التجويد والمتون والتأهيل">فصول التجويد والمتون والتأهيل</option>
              </select>
            </div>

            {/* Students Count */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#fbbf24]" />
                عدد الطلاب التابعين للشيخ بالدورة
              </label>
              <input
                type="number"
                min="0"
                value={formData.studentsCount}
                onChange={(e) => handleInputChange('studentsCount', e.target.value)}
                onBlur={() => handleBlur('studentsCount')}
                placeholder="مثال: 10"
                className={getInputClass('studentsCount')}
              />
              <FieldHint
                show={touched.studentsCount && validation.studentsCount.message}
                type={validation.studentsCount.type}
                message={validation.studentsCount.message}
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#fbbf24]" />
                طبيعة التفرغ والمكافأة
              </label>
              <select
                value={formData.stipendStatus}
                onChange={(e) => setFormData({ ...formData, stipendStatus: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all"
              >
                <option value="متفرغ كلياً (مكافأة شهرية)">متفرغ كلياً (مكافأة شهرية كاملة)</option>
                <option value="متطوع بدون مقابل">عمل تطوعي لله تعالى</option>
                <option value="متفرغ جزئياً">متفرغ جزئياً</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#fbbf24]" />
                الحالة الاجتماعية
              </label>
              <select
                value={formData.socialStatus}
                onChange={(e) => setFormData({ ...formData, socialStatus: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all"
              >
                <option value="متزوج">متزوج</option>
                <option value="عزب / عزباء">عزب / عزباء</option>
                <option value="أرمل / أرملة">أرمل / أرملة</option>
              </select>
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#fbbf24]" />
              ملاحظات الشيخ عن إنجازات الدورة ومقترحات تطوير الكُتّاب
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="مثال: يرجى إضافة لوحة شرف شهرية للبراعم، نسبة الحضور ممتاز بالفصل..."
              className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] text-sm transition-all resize-none"
            ></textarea>
          </div>

        </div>

        {/* زر التقديم */}
        <button
          type="submit"
          disabled={isSubmitting || uploadingPhoto}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            'جاري حفظ البيانات...'
          ) : (
            <>
              حفظ وتأكيد بيانات فضيلة الشيخ بالكامل
              <ArrowRight className="w-5 h-5 rotate-180" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}
