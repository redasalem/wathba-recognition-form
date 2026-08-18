import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  Printer, 
  Share2, 
  Users, 
  Phone, 
  School, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  HeartHandshake,
  BookOpen,
  Gift
} from 'lucide-react';

export default function StudentProfileView({ student, onEdit, onGoHome, showToast }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  // Smart URL for this student
  const studentSmartUrl = student.studentId 
    ? `${window.location.origin}/#/student?id=${student.studentId}`
    : window.location.href;

  const handleShareWhatsApp = () => {
    const text = `🎉 كارت تكريم الطالب المكرم في كُتّاب: ${student.studentName}\nكود التكريم: ${student.studentCode || ''}\nفئة التكريم: ${student.awardTier || student.tier || ''}\nمستوى الحفظ: ${student.partName || student.part || 'القرآن كاملاً'}\nالدرجة: ${student.examScore || student.score || ''}%\nالجائزة: ${student.gift || ''}\n\nرابط بروفايل وكارت التكريم الرسمي:\n${studentSmartUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const qrPayload = student.smartUrl || studentSmartUrl;
  const siblings = Array.isArray(student.siblings) ? student.siblings : [];

  return (
    <div className="w-full max-w-2xl mx-auto my-4 sm:my-8 animate-fade-in">
      {/* Outer Card Container */}
      <div className="rounded-3xl overflow-hidden border border-[#fbbf24]/40 shadow-2xl bg-[#062b24]/90 backdrop-blur-xl">

        {/* Top Control Bar (Hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#041915]/90 border-b border-emerald-800/40 print:hidden">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-[#fbbf24] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 border border-[#fbbf24]/50 text-[#fbbf24] text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>
            <button
              onClick={() => onEdit(student)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل البيانات</span>
            </button>
          </div>
        </div>

        {/* Printable Profile Card */}
        <div id="printable-badge" className="p-6 sm:p-8 space-y-6">

          {/* Banner Header with Logo & Status */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0c3d34] via-[#062b24] to-[#041915] rounded-3xl p-6 border border-[#fbbf24]/30 text-center shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-[#fbbf24]/20 pb-3 mb-4 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#fbbf24]" />
                <span className="text-[#fbbf24] font-black">كُتّاب | KUTTAB 2026</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>بيانات معتمدة ومسجلة</span>
              </div>
            </div>

            {/* Photo & QR Avatar Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="relative">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.studentName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#fbbf24] shadow-2xl"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-emerald-950 border-4 border-[#fbbf24] flex flex-col items-center justify-center text-emerald-400 shadow-2xl">
                    <Award className="w-12 h-12 mb-1 text-[#fbbf24]" />
                    <span className="text-[11px] font-black">طالب مكرم</span>
                  </div>
                )}
                {student.studentCode && (
                  <span className="absolute -bottom-2 -left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-2.5 py-0.5 rounded-full text-xs font-black shadow-lg border border-white/40">
                    {student.studentCode}
                  </span>
                )}
              </div>

              {/* Student Main Title */}
              <div className="text-center sm:text-right space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow tracking-wide">
                  {student.studentName}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                    <span>{student.awardTier || student.tier || '👑 الفئة المتميزة'}</span>
                  </span>

                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                    {student.partName || student.part || 'القرآن الكريم'}
                  </span>

                  {(student.examScore || student.score) && (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 font-mono font-black text-xs">
                      {student.examScore || student.score}%
                    </span>
                  )}
                </div>

                {/* Gift description */}
                {(student.gift) && (
                  <div className="p-2.5 bg-gradient-to-r from-amber-500/15 via-[#062b24] to-amber-500/15 rounded-xl border border-[#fbbf24]/30 text-amber-300 text-xs font-black flex items-center justify-center sm:justify-start gap-2">
                    <Gift className="w-4 h-4 text-[#fbbf24]" />
                    <span>{student.gift}</span>
                  </div>
                )}

                {student.studentId && (
                  <p className="text-[11px] text-slate-400 font-mono">
                    معرف الطالب: <span className="text-[#fbbf24] font-bold">{student.studentId}</span>
                  </p>
                )}
              </div>

              {/* Verified QR Code on Card */}
              <div className="sm:mr-auto bg-white p-2.5 rounded-2xl shadow-xl border-2 border-[#fbbf24] flex flex-col items-center gap-1">
                <QRCodeSVG
                  value={qrPayload}
                  size={90}
                  bgColor={"#FFFFFF"}
                  fgColor={"#041915"}
                  level={"M"}
                  includeMargin={false}
                />
                <span className="text-[8px] font-black text-slate-800 tracking-wider font-mono">
                  {student.studentCode || student.studentId || 'KUTTAB-2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Grid: Academic & Personal Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#041915]/80 p-4 rounded-2xl border border-emerald-800/40 space-y-3">
              <div className="flex items-center gap-2 text-[#fbbf24] font-bold border-b border-emerald-800/30 pb-2">
                <School className="w-4 h-4" />
                <span>البيانات التعليمية</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">السن:</span>
                  <span className="font-bold text-white">{student.studentAge ? `${student.studentAge} سنة` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المرحلة الدراسية:</span>
                  <span className="font-bold text-white">{student.studyStage || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المدرسة / المعهد:</span>
                  <span className="font-bold text-white">{student.schoolName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الشيخ المشرف:</span>
                  <span className="font-bold text-[#fbbf24]">{student.sheikhName || 'مشرف الحلقات'}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#041915]/80 p-4 rounded-2xl border border-emerald-800/40 space-y-3">
              <div className="flex items-center gap-2 text-[#fbbf24] font-bold border-b border-emerald-800/30 pb-2">
                <Phone className="w-4 h-4" />
                <span>بيانات ولي الأمر والأسرة</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">اسم ولي الأمر:</span>
                  <span className="font-bold text-white">{student.parentName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">هاتف الواتساب:</span>
                  <span className="font-bold text-emerald-300 font-mono">{student.fatherPhone || '—'}</span>
                </div>
                {student.motherPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">هاتف الأم:</span>
                    <span className="font-bold text-slate-300 font-mono">{student.motherPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">حالة الأب:</span>
                  <span className="font-bold text-amber-200">{student.fatherStatus || 'الأب على قيد الحياة'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sibling & Family Relations Card */}
          <div className="bg-[#041915]/80 p-5 rounded-2xl border border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800/30 pb-2.5">
              <div className="flex items-center gap-2 text-[#fbbf24] font-bold text-xs sm:text-sm">
                <Users className="w-4 h-4" />
                <span>إحصائيات الأسرة والأشقاء في الكُتّاب</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-700/40 text-slate-300">
                  إجمالي الأبناء: <strong className="text-[#fbbf24]">{student.totalChildrenCount || '—'}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-600/40 text-emerald-300">
                  في الكُتّاب: <strong className="text-white">{student.kuttabChildrenCount || '—'}</strong>
                </span>
              </div>
            </div>

            {siblings.length > 0 ? (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-400 font-semibold">الأشقاء المسجلين في الكُتّاب مع هذا الطالب:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {siblings.map((sib, index) => (
                    <div
                      key={sib.id || index}
                      className="p-3 rounded-xl bg-slate-950/70 border border-emerald-700/30 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-[#fbbf24]">#{index + 1}</span>
                          <span>{sib.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {sib.studyStage} {sib.schoolName ? `— ${sib.schoolName}` : ''} {sib.age ? `(${sib.age} سنة)` : ''}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        مقيد بالكُتّاب
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                لم يتم إضافة أشقاء آخرين في الكُتّاب تحت هذا السجل.
              </p>
            )}
          </div>

          {/* Bottom Footer Details */}
          <div className="pt-4 border-t border-[#fbbf24]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
              <span>بطاقة رسمية معتمدة من إدارة كُتّاب</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(student)}
                className="text-[#fbbf24] hover:underline font-bold cursor-pointer print:hidden"
              >
                ✏️ هل ترغب في تحديث أي بيانات؟ اضغط هنا للتعديل
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
