import React, { useState } from 'react';
import { UserCheck, Phone, BookOpen, Users, Camera, Upload, CheckCircle2, ShieldCheck, ArrowRight, Award, GraduationCap, MapPin, Calendar, MessageSquare, Heart, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { uploadToCloudinary } from '../services/cloudinary';
import { addSheikhRecord } from '../firebase';

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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem('kuttab_sheikh_session') === 'true' || localStorage.getItem('kuttab_admin_session') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [verifyAttempts, setVerifyAttempts] = useState(0);

  const targetSheikhPasscode = import.meta.env.VITE_SHEIKH_PASSCODE || '';

  const handleVerifySheikhPasscode = (e) => {
    e.preventDefault();
    setPasscodeError('');
    const clean = passcode.trim();

    if (!clean) {
      setPasscodeError('⚠️ يرجى إدخال رمز اعتماد المشايخ');
      return;
    }

    if (targetSheikhPasscode && clean === targetSheikhPasscode) {
      setIsAuthorized(true);
      localStorage.setItem('kuttab_sheikh_session', 'true');
      showToast?.('تم التحقق من هوية فضيلة الشيخ بنجاح 👳‍♂️✨', 'success');
    } else {
      const nextAttempts = verifyAttempts + 1;
      setVerifyAttempts(nextAttempts);
      setPasscodeError(`رمز المرور غير صحيح. يرجى مراجعة إدارة الكُتّاب (محاولة ${nextAttempts}).`);
    }
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const egyptPhoneRegex = /^01[0125]\d{8}$/;
    return egyptPhoneRegex.test(phone.trim());
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
      const url = await uploadToCloudinary(file);
      setFormData((prev) => ({ ...prev, photoUrl: url }));
      showToast?.('تم رفع صورة الشيخ بنجاح 📸', 'success');
    } catch (err) {
      console.error('Photo upload error:', err);
      showToast?.('حدث خطأ أثناء رفع الصورة، حاول مرة أخرى', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sheikhName.trim()) {
      newErrors.sheikhName = '⚠️ يرجى إدخال اسم الشيخ أو المعلم الكامل بالعربية';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = '⚠️ رقم الهاتف غير صحيح (يجب أن يكون 11 رقماً ويبدأ بـ 01)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setTouched({ sheikhName: true, phone: true });

    if (!validateForm()) {
      showToast?.('يرجى استكمال الحقول المطلوبة المحددة باللون الأحمر بالعربية', 'error');
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

  if (!isAuthorized) {
    return (
      <div className="w-full max-w-md mx-auto my-8 sm:my-14 animate-fade-in px-4">
        <div className="rounded-3xl border-2 border-[#fbbf24]/40 bg-[#062b24] shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden text-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-[#fbbf24]/40 flex items-center justify-center text-[#fbbf24] mx-auto mb-4 shadow-lg shadow-amber-900/30">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-black text-white mb-2">بوابة تسجيل واعتماد المشايخ 👳‍♂️🔐</h3>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            هذه الاستمارة مخصصة لفضيلة مشايخ ومعلمي الكُتّاب. يرجى إدخال رمز اعتماد المعلم للمتابعة.
          </p>

          {passcodeError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passcodeError}</span>
            </div>
          )}

          <form onSubmit={handleVerifySheikhPasscode} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="أدخل رمز اعتماد المشايخ..."
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl text-sm bg-slate-900 border border-emerald-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] transition-all text-center tracking-widest font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تحقق وفتح الاستمارة 🚀</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (submittedSheikh) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-[#062b24] border border-[#fbbf24]/30 rounded-2xl shadow-2xl text-center text-slate-100 backdrop-blur-xl animate-fade-in">
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
              setErrors({});
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
    <div className="max-w-4xl mx-auto my-6 p-6 sm:p-10 bg-[#062b24]/90 border border-[#fbbf24]/30 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100">
      
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

      {/* ⚠️ FORM WITH noValidate TO PREVENT ENGLISH BROWSER TOOLTIPS */}
      <form noValidate onSubmit={handleSubmit} className="space-y-8">
        
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
            
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#fbbf24]" />
                اسم الشيخ / المحفظ الكامل <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.sheikhName}
                onChange={(e) => {
                  setFormData({ ...formData, sheikhName: e.target.value });
                  if (errors.sheikhName) setErrors(prev => ({ ...prev, sheikhName: '' }));
                }}
                onBlur={() => setTouched(prev => ({ ...prev, sheikhName: true }))}
                placeholder="مثال: الشيخ عبد الله حسن الديهى"
                className={`w-full px-4 py-3 bg-slate-900/60 border ${
                  errors.sheikhName && touched.sheikhName ? 'border-rose-500 bg-rose-500/10' : 'border-emerald-700/50'
                } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] text-sm transition-all`}
              />
              {errors.sheikhName && touched.sheikhName && (
                <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.sheikhName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#fbbf24]" />
                رقم التليفون / الواتساب
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                }}
                onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                placeholder="مثال: 01550215634"
                className={`w-full px-4 py-3 bg-slate-900/60 border ${
                  errors.phone && touched.phone ? 'border-rose-500 bg-rose-500/10' : 'border-emerald-700/50'
                } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] text-sm transition-all`}
              />
              {errors.phone && touched.phone && (
                <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#fbbf24]" />
                المؤهل العلمي / الأزهرية
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="مثال: لسانس لغة عربية / معهد القراءات"
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#fbbf24]" />
                الإجازات والقراءات المسندة
              </label>
              <input
                type="text"
                value={formData.ijazat}
                onChange={(e) => setFormData({ ...formData, ijazat: e.target.value })}
                placeholder="مثال: إجازة حفص عن عاصم / القراءات العشر"
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#fbbf24]" />
                العنوان والقرية
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="مثال: قرية جناج - بسيون"
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] text-sm transition-all"
              />
            </div>

          </div>
        </div>

        {/* ☀️ القسم الثاني: بيانات وملاحظات المشاركة بالدورة الصيفية 2026 */}
        <div className="space-y-4 pt-4 border-t border-emerald-800/40">
          <div className="flex items-center gap-2 text-[#fbbf24] font-black text-sm pb-2 border-b border-emerald-800/40">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>ثانياً: تفاصيل وملاحظات الدورة الصيفية 2026</span>
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
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all cursor-pointer"
              >
                <option value="نعم - مشارك بالدورة الصيفية">نعم - مشارك بالدورة الصيفية 2026</option>
                <option value="لا - محفظ دائم بالكُتّاب">لا - محفظ دائم بالكُتّاب فقط</option>
                <option value="مشارك جزئي / بديل">مشارك جزئي / بديل</option>
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
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all cursor-pointer"
              >
                <option value="متزوج">متزوج</option>
                <option value="عزب / عزباء">عزب / عزباء</option>
                <option value="أرمل / أرملة">أرمل / أرملة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#fbbf24]" />
                طبيعة التفرغ والمكافأة
              </label>
              <select
                value={formData.stipendStatus}
                onChange={(e) => setFormData({ ...formData, stipendStatus: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all cursor-pointer"
              >
                <option value="متفرغ كلياً (مكافأة شهرية)">متفرغ كلياً (مكافأة شهرية كاملة)</option>
                <option value="متطوع بدون مقابل">عمل تطوعي لله تعالى</option>
                <option value="متفرغ جزئياً">متفرغ جزئياً</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#fbbf24]" />
                مستوى المشاركة الصيفية / التخصص
              </label>
              <select
                value={formData.summerLevel}
                onChange={(e) => setFormData({ ...formData, summerLevel: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all cursor-pointer"
              >
                <option value="إشراف عام وفصول القرآن كاملاً">إشراف عام وفصول القرآن كاملاً</option>
                <option value="تأسيس وتلقين البراعم">تأسيس وتلقين البراعم</option>
                <option value="مراجعة وتثبيت الأجزاء">مراجعة وتثبيت الأجزاء</option>
                <option value="تحفيظ وتجويد">تحفيظ وتجويد</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#fbbf24]" />
                عدد الطلاب (المقرر أو الفعلي)
              </label>
              <input
                type="number"
                min="0"
                value={formData.studentsCount}
                onChange={(e) => setFormData({ ...formData, studentsCount: e.target.value })}
                placeholder="مثال: 15"
                className="w-full px-4 py-3 bg-slate-900/60 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] text-sm transition-all"
              />
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
