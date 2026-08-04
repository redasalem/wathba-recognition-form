import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Trash2, 
  Heart, 
  GraduationCap, 
  Eye, 
  X, 
  Grid, 
  List, 
  MessageSquare,
  Printer,
  Calendar,
  Activity,
  ChevronRight,
  ChevronLeft,
  Edit3,
  Save,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { exportStudentsToCSV, exportStudentsToJSON, deleteStudentRecord, updateStudentRecord } from '../firebase';

// ─── Animated Counter Component ────────────────────────────────
function AnimatedCounter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const start = display;
    const end = Number(value) || 0;
    if (start === end) return;

    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return <>{display}</>;
}

// ─── Donut Chart Component (CSS-based) ─────────────────────────
function DonutChart({ segments, size = 120, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let accumulated = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      {/* Background circle */}
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dashLen = pct * circumference;
        const offset = accumulated * circumference;
        accumulated += pct;
        return (
          <circle
            key={i}
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            className="transition-all duration-700"
            style={{ filter: `drop-shadow(0 0 4px ${seg.color}40)` }}
          />
        );
      })}
    </svg>
  );
}

// ─── Age Distribution Bar Component ────────────────────────────
function AgeDistribution({ students }) {
  const buckets = useMemo(() => {
    const groups = { '3-6': 0, '7-10': 0, '11-14': 0, '15-18': 0, '19+': 0 };
    students.forEach(s => {
      const age = Number(s.studentAge || 0);
      if (age <= 6) groups['3-6']++;
      else if (age <= 10) groups['7-10']++;
      else if (age <= 14) groups['11-14']++;
      else if (age <= 18) groups['15-18']++;
      else groups['19+']++;
    });
    return groups;
  }, [students]);

  const max = Math.max(...Object.values(buckets), 1);
  const colors = ['#14b8a6', '#f59e0b', '#6366f1', '#10b981', '#f43f5e'];

  return (
    <div className="flex items-end justify-between gap-2 h-20 px-2">
      {Object.entries(buckets).map(([label, count], i) => (
        <div key={label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[10px] font-bold text-white">{count}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-700 min-h-[4px]"
            style={{
              height: `${Math.max((count / max) * 100, 6)}%`,
              background: `linear-gradient(to top, ${colors[i]}90, ${colors[i]})`,
              boxShadow: `0 0 8px ${colors[i]}30`,
            }}
          />
          <span className="text-[9px] text-slate-400 font-semibold">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Edit Student Modal ────────────────────────────────────────
function EditStudentModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({ ...student });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeInUp print:hidden">
      <div className="w-full max-w-md rounded-3xl border border-teal-500/30 bg-slate-900 p-6 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-4">
          ✏️ تعديل بيانات الطالب
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { field: 'studentName', label: 'اسم الطالب', type: 'text' },
            { field: 'studentAge', label: 'السن', type: 'number' },
            { field: 'schoolName', label: 'المدرسة / المعهد', type: 'text' },
            { field: 'fatherPhone', label: 'رقم ولي الأمر', type: 'tel' },
            { field: 'motherPhone', label: 'رقم الأم', type: 'tel' },
          ].map(({ field, label, type }) => (
            <div key={field}>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{label}</label>
              <input
                type={type}
                value={form[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>
          ))}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">المرحلة الدراسية</label>
            <select
              value={form.studyStage || ''}
              onChange={(e) => handleChange('studyStage', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="حضانة">حضانة</option>
              <option value="ابتدائي">ابتدائي</option>
              <option value="إعدادي">إعدادي</option>
              <option value="ثانوي">ثانوي</option>
              <option value="معهد أزهري">معهد أزهري</option>
              <option value="جامعي">جامعي</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">حالة الأب</label>
            <select
              value={form.fatherStatus || ''}
              onChange={(e) => handleChange('fatherStatus', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="الأب على قيد الحياة">الأب على قيد الحياة</option>
              <option value="يتيم الأب">يتيم الأب</option>
              <option value="يتيم الأبوين">يتيم الأبوين</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// ═══ MAIN ADMIN DASHBOARD COMPONENT ══════════════════════════
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard({ students, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [fatherStatusFilter, setFatherStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [viewMode, setViewMode] = useState('table');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ─── Deep Analytics ───────────────────────────────────────
  const stats = useMemo(() => {
    const total = students.length;
    if (total === 0) {
      return { total: 0, orphansFather: 0, orphansBoth: 0, aliveFather: 0, withPhoto: 0, avgAge: 0, stages: {} };
    }

    let orphansFather = 0, orphansBoth = 0, aliveFather = 0, withPhoto = 0, totalAge = 0;
    const stages = {};

    students.forEach(s => {
      if (s.fatherStatus === 'يتيم الأب') orphansFather++;
      else if (s.fatherStatus === 'يتيم الأبوين') orphansBoth++;
      else aliveFather++;
      if (s.photoUrl) withPhoto++;
      totalAge += Number(s.studentAge || 0);
      const stage = s.studyStage || 'غير محدد';
      stages[stage] = (stages[stage] || 0) + 1;
    });

    return { total, orphansFather, orphansBoth, aliveFather, withPhoto, avgAge: Math.round((totalAge / total) * 10) / 10, stages };
  }, [students]);

  // ─── Filtering & Sorting ──────────────────────────────────
  const filteredStudents = useMemo(() => {
    let result = students.filter(student => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (student.studentName || '').toLowerCase().includes(term) ||
                            (student.schoolName || '').toLowerCase().includes(term) ||
                            (student.fatherPhone || '').includes(searchTerm);
      const matchesStage = stageFilter === 'ALL' || student.studyStage === stageFilter;
      const matchesStatus = fatherStatusFilter === 'ALL' || student.fatherStatus === fatherStatusFilter;
      return matchesSearch && matchesStage && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'OLDEST') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'NAME') return (a.studentName || '').localeCompare(b.studentName || '', 'ar');
      if (sortBy === 'AGE') return Number(a.studentAge || 0) - Number(b.studentAge || 0);
      return 0;
    });
  }, [students, searchTerm, stageFilter, fatherStatusFilter, sortBy]);

  // ─── Pagination ───────────────────────────────────────────
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, stageFilter, fatherStatusFilter, sortBy]);

  // ─── Handlers ─────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من إزالة الطالب (${name}) من القائمة؟`)) {
      setDeletingId(id);
      await deleteStudentRecord(id);
      setDeletingId(null);
      showToast?.(`تم حذف الطالب "${name}" بنجاح`, 'warning');
    }
  };

  const handleEditSave = async (updatedStudent) => {
    await updateStudentRecord(updatedStudent.id, updatedStudent);
    setEditingStudent(null);
    showToast?.(`تم تعديل بيانات "${updatedStudent.studentName}" بنجاح`, 'success');
  };

  // ─── Donut segments for social status ─────────────────────
  const socialSegments = [
    { label: 'الأب على قيد الحياة', value: stats.aliveFather, color: '#10b981' },
    { label: 'يتيم الأب', value: stats.orphansFather, color: '#f59e0b' },
    { label: 'يتيم الأبوين', value: stats.orphansBoth, color: '#f43f5e' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto my-4 px-3 sm:px-4 space-y-5 animate-fadeInUp">

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ TOP ANALYTICS BANNER ══════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 backdrop-blur-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden print:hidden">
        
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/6 rounded-full blur-3xl pointer-events-none" />

        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500/30 to-teal-700/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  لوحة تحكم وإحصائيات الكُتّاب 📊
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    متصل لحظياً
                  </span>
                  <span className="text-xs text-slate-400">
                    حصر الطلاب المكرمين 2026
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Export & Print Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-lg"
              title="طباعة التقرير أو حفظ كـ PDF"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>طباعة PDF</span>
            </button>

            <button
              onClick={() => exportStudentsToCSV(filteredStudents)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={() => exportStudentsToJSON(students)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-900/30 flex items-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20"
            >
              <Download className="w-4 h-4" />
              <span>نسخة JSON</span>
            </button>
          </div>
        </div>

        {/* ─── KPI Cards Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-5 relative z-10">
          
          {/* Card 1: Total Students */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/60 to-teal-900/30 border border-teal-500/25 relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-teal-400/5 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-400/10 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-bold text-teal-300/80">إجمالي المسجلين</span>
              <div className="p-2 rounded-xl bg-teal-500/15 text-teal-300 group-hover:bg-teal-500/25 transition-all">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 relative z-10">
              <AnimatedCounter value={stats.total} /> <span className="text-xs font-semibold text-teal-300/70">طالب</span>
            </div>
            <div className="text-[10px] text-teal-200/50 mt-1.5 flex items-center justify-between relative z-10">
              <span>مرفق صور: {stats.withPhoto}</span>
              <span className="font-bold text-teal-300/80">{stats.total ? Math.round((stats.withPhoto / stats.total) * 100) : 0}%</span>
            </div>
            {/* Progress bar for photo percentage */}
            <div className="h-1 w-full bg-teal-950 rounded-full mt-2 overflow-hidden relative z-10">
              <div className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-700" style={{ width: `${stats.total ? (stats.withPhoto / stats.total) * 100 : 0}%` }} />
            </div>
          </div>

          {/* Card 2: Orphan Care */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-amber-900/30 border border-amber-500/25 relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-400/10 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-bold text-amber-300/80">رعاية الأيتام</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-300 group-hover:bg-amber-500/25 transition-all">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 relative z-10">
              <AnimatedCounter value={stats.orphansFather + stats.orphansBoth} /> <span className="text-xs font-semibold text-amber-300/70">طالب</span>
            </div>
            <div className="text-[10px] text-amber-200/50 mt-1.5 relative z-10">
              {stats.orphansFather} يتيم الأب | {stats.orphansBoth} يتيم الأبوين
            </div>
          </div>

          {/* Card 3: Average Age */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-indigo-900/30 border border-indigo-500/25 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-400/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-400/10 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-bold text-indigo-300/80">متوسط الأعمار</span>
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-300 group-hover:bg-indigo-500/25 transition-all">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 relative z-10">
              {stats.avgAge} <span className="text-xs font-semibold text-indigo-300/70">سنة</span>
            </div>
            <div className="text-[10px] text-indigo-200/50 mt-1.5 relative z-10">
              متوسط أعمار الطلاب المكرمين
            </div>
          </div>

          {/* Card 4: Top Stage */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-bold text-slate-300/80">أعلى مرحلة إقبالاً</span>
              <div className="p-2 rounded-xl bg-slate-700/50 text-slate-300 group-hover:bg-slate-600/50 transition-all">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-white mt-2 truncate relative z-10">
              {Object.entries(stats.stages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد'}
            </div>
            <div className="text-[10px] text-slate-400/70 mt-1.5 relative z-10">
              من إجمالي {Object.keys(stats.stages).length} مراحل دراسية
            </div>
          </div>
        </div>

        {/* ─── Visual Analytics Section ───────────────────────── */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 relative z-10">
            
            {/* Donut Chart: Social Status */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-300">الحالة الاجتماعية</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="relative">
                  <DonutChart segments={socialSegments} size={100} strokeWidth={12} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-black text-white">{stats.total}</div>
                      <div className="text-[8px] text-slate-400">طالب</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {socialSegments.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-2 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-slate-300">{seg.label}</span>
                      <span className="font-black text-white">{seg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Age Distribution Chart */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">توزيع الأعمار</span>
              </div>
              <AgeDistribution students={students} />
            </div>

            {/* Stage Distribution */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-300">المراحل الدراسية</span>
                <span className="text-teal-400 text-[10px] font-bold mr-auto">{filteredStudents.length} نتيجة</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-white/5">
                {Object.entries(stats.stages).map(([stage, count], idx) => {
                  const pct = (count / stats.total) * 100;
                  const colors = ['#14b8a6', '#f59e0b', '#6366f1', '#10b981', '#f43f5e', '#0ea5e9'];
                  return (
                    <div
                      key={stage}
                      style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length] }}
                      className="transition-all duration-500 rounded-sm relative group/bar cursor-pointer"
                      title={`${stage}: ${count} طالب (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(stats.stages).map(([stage, count], idx) => {
                  const colors = ['#14b8a6', '#f59e0b', '#6366f1', '#10b981', '#f43f5e', '#0ea5e9'];
                  return (
                    <span key={stage} className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                      {stage}: <strong className="text-white font-extrabold">{count}</strong>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ CONTROLS BAR ══════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-4 flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الطالب، المدرسة، أو التليفون..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:shadow-lg focus:shadow-teal-500/10 transition-all"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer">
            <option value="ALL">جميع المراحل</option>
            <option value="حضانة">حضانة / روضة</option>
            <option value="ابتدائي">ابتدائي</option>
            <option value="إعدادي">إعدادي</option>
            <option value="ثانوي">ثانوي</option>
            <option value="معهد أزهري">معهد أزهري</option>
            <option value="جامعي">جامعي</option>
          </select>

          <select value={fatherStatusFilter} onChange={(e) => setFatherStatusFilter(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer">
            <option value="ALL">جميع الحالات</option>
            <option value="الأب على قيد الحياة">الأب على قيد الحياة</option>
            <option value="يتيم الأب">يتيم الأب</option>
            <option value="يتيم الأبوين">يتيم الأبوين</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer">
            <option value="NEWEST">الأحدث تسجيلاً</option>
            <option value="OLDEST">الأقدم تسجيلاً</option>
            <option value="NAME">أبجدياً (أ-ي)</option>
            <option value="AGE">حسب السن</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'cards' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              title="عرض كروت"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Printable Title */}
      <div className="hidden print:block text-center py-4 border-b-2 border-black mb-6">
        <h1 className="text-2xl font-black text-black">كشف الطلاب المسجلين لحضور حفل تكريم الكُتّاب 2026</h1>
        <p className="text-sm text-gray-700 mt-1">عدد الطلاب المسجلين: {filteredStudents.length} طالب | تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ MAIN CONTENT AREA ═════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      {filteredStudents.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/60 flex items-center justify-center animate-pulseGlow">
            <Users className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-300 mb-2">لا توجد نتائج مطابقة!</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            لم نجد طلاباً يطابقون معايير البحث أو التصفية الحالية. جرّب تغيير الفلتر أو مسح البحث.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStageFilter('ALL'); setFatherStatusFilter('ALL'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>

      ) : viewMode === 'table' ? (
        /* ─── Table View ───────────────────────────────────────── */
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs print:text-black">
              <thead className="bg-gradient-to-r from-slate-950/90 to-slate-900/90 text-slate-400 font-bold border-b border-white/10 print:bg-gray-200 print:text-black">
                <tr>
                  <th className="py-3.5 px-4">م</th>
                  <th className="py-3.5 px-4">الطالب</th>
                  <th className="py-3.5 px-4">السن والمرحلة</th>
                  <th className="py-3.5 px-4">المدرسة / المعهد</th>
                  <th className="py-3.5 px-4">تواصل الأب</th>
                  <th className="py-3.5 px-4">تواصل الأم</th>
                  <th className="py-3.5 px-4">حالة الأب</th>
                  <th className="py-3.5 px-4 text-center print:hidden">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200 print:divide-gray-300">
                {paginatedStudents.map((student, idx) => {
                  const waUrl = `https://wa.me/20${student.fatherPhone}?text=${encodeURIComponent(`السلام عليكم ولي أمر الطالب (${student.studentName})، نود التأكيد معكم بشأن حفل تكريم الكُتّاب 2026.`)}`;
                  const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;

                  return (
                    <tr key={student.id} className="hover:bg-white/[0.03] transition-colors group/row">
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">{globalIdx}</td>

                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.studentName} className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/50 shrink-0 group-hover/row:border-teal-400 transition-all" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold shrink-0 text-sm">
                              {student.studentName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-white text-sm">{student.studentName}</div>
                            <div className="text-[10px] text-slate-400 print:hidden">{new Date(student.createdAt).toLocaleDateString('ar-EG')}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold">{student.studentAge} سنة</div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold mt-0.5">{student.studyStage}</span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-300 max-w-[150px] truncate">{student.schoolName}</td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 font-bold">{student.fatherPhone}</span>
                          <a href={waUrl} target="_blank" rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 transition-all print:hidden"
                            title="تواصل بالواتساب">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">{student.motherPhone || '—'}</td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                          student.fatherStatus === 'يتيم الأب' || student.fatherStatus === 'يتيم الأبوين'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {student.fatherStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setSelectedStudent(student)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-teal-300 transition-all border border-white/10 cursor-pointer" title="معاينة"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditingStudent(student)} className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all cursor-pointer" title="تعديل"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(student.id, student.studentName)} disabled={deletingId === student.id} className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50" title="حذف"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
        /* ─── Cards View ───────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedStudents.map((student) => {
            const waUrl = `https://wa.me/20${student.fatherPhone}?text=${encodeURIComponent(`السلام عليكم ولي أمر الطالب (${student.studentName})، نود التأكيد معكم بشأن حفل تكريم الكُتّاب 2026.`)}`;

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/70 backdrop-blur-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-teal-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-teal-500/5"
              >
                {/* Decorative glow on hover */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-teal-400/0 group-hover:bg-teal-400/5 rounded-full blur-2xl transition-all pointer-events-none" />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                      {student.photoUrl ? (
                        <img src={student.photoUrl} alt={student.studentName} className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-400/40 shadow-md group-hover:border-teal-400 transition-all" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-900 to-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-300 font-black text-xl">
                          {student.studentName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-white text-sm line-clamp-1">{student.studentName}</h4>
                        <div className="text-[11px] text-teal-300/80 font-semibold">{student.studentAge} سنة | {student.studyStage}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{new Date(student.createdAt).toLocaleDateString('ar-EG')}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button onClick={() => setSelectedStudent(student)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer" title="عرض"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingStudent(student)} className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 cursor-pointer" title="تعديل"><Edit3 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 my-3 pt-2 border-t border-white/5 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">المدرسة:</span>
                      <span className="font-medium text-white truncate max-w-[160px]">{student.schoolName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">حالة الأب:</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        student.fatherStatus === 'يتيم الأب' || student.fatherStatus === 'يتيم الأبوين'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>{student.fatherStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">تليفون الأب:</span>
                      <span className="font-mono text-white font-bold">{student.fatherPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>واتساب</span>
                  </a>
                  <button onClick={() => handleDelete(student.id, student.studentName)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer" title="حذف">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Pagination ═══════════════════════════════════════ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4 print:hidden">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 disabled:opacity-30 cursor-pointer transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                page === currentPage
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 disabled:opacity-30 cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[11px] text-slate-500 mr-2">
            صفحة {currentPage} من {totalPages} ({filteredStudents.length} طالب)
          </span>
        </div>
      )}

      {/* ═══ Student Profile Modal ════════════════════════════ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeInUp print:hidden">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl relative overflow-hidden text-center">
            {/* Decorative glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <button onClick={() => setSelectedStudent(null)} className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer z-10">
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-4">
                🏆 بطاقة تكريم الطالب المتفوق
              </div>

              <div className="mx-auto mb-4 relative w-24 h-24">
                {selectedStudent.photoUrl ? (
                  <img src={selectedStudent.photoUrl} alt={selectedStudent.studentName} className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-xl" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                    {selectedStudent.studentName?.charAt(0)}
                  </div>
                )}
              </div>

              <h3 className="text-xl font-black text-white mb-1">{selectedStudent.studentName}</h3>
              <p className="text-xs text-amber-300 font-bold mb-4">{selectedStudent.studyStage} | {selectedStudent.studentAge} سنة</p>

              <div className="bg-slate-950/60 rounded-2xl p-4 text-right space-y-2.5 text-xs text-slate-300 mb-5 border border-white/10">
                <div className="flex justify-between"><span className="text-slate-400">المدرسة / المعهد:</span><span className="font-bold text-white">{selectedStudent.schoolName}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">رقم ولي الأمر:</span><span className="font-mono text-white font-bold">{selectedStudent.fatherPhone}</span></div>
                {selectedStudent.motherPhone && <div className="flex justify-between"><span className="text-slate-400">رقم الأم:</span><span className="font-mono text-white">{selectedStudent.motherPhone}</span></div>}
                <div className="flex justify-between"><span className="text-slate-400">حالة الأب:</span><span className="font-bold text-amber-300">{selectedStudent.fatherStatus}</span></div>
              </div>

              <a
                href={`https://wa.me/20${selectedStudent.fatherPhone}?text=${encodeURIComponent(`السلام عليكم ولي أمر الطالب (${selectedStudent.studentName})، نود التأكيد معكم بشأن حفل تكريم الكُتّاب 2026.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>مراسلة عبر الواتساب مباشرة</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Edit Student Modal ═══════════════════════════════ */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
