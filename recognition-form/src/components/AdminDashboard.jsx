import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Trash2, 
  Phone, 
  Heart, 
  GraduationCap, 
  Eye, 
  X, 
  Grid, 
  List, 
  Sparkles,
  MessageSquare,
  Printer,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  Upload,
  PieChart,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { exportStudentsToCSV, exportStudentsToJSON, deleteStudentRecord } from '../firebase';

export default function AdminDashboard({ students, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [fatherStatusFilter, setFatherStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST' | 'OLDEST' | 'NAME' | 'AGE'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Deep Analytics Calculation
  const stats = useMemo(() => {
    const total = students.length;
    if (total === 0) {
      return {
        total: 0,
        orphansFather: 0,
        orphansBoth: 0,
        aliveFather: 0,
        withPhoto: 0,
        avgAge: 0,
        stages: {}
      };
    }

    let orphansFather = 0;
    let orphansBoth = 0;
    let aliveFather = 0;
    let withPhoto = 0;
    let totalAge = 0;
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

    const avgAge = Math.round((totalAge / total) * 10) / 10;

    return {
      total,
      orphansFather,
      orphansBoth,
      aliveFather,
      withPhoto,
      avgAge,
      stages
    };
  }, [students]);

  // Filtering & Sorting
  const filteredStudents = useMemo(() => {
    let result = students.filter(student => {
      const nameMatch = (student.studentName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const schoolMatch = (student.schoolName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = (student.fatherPhone || '').includes(searchTerm);
      const matchesSearch = nameMatch || schoolMatch || phoneMatch;

      const matchesStage = stageFilter === 'ALL' || student.studyStage === stageFilter;
      const matchesStatus = fatherStatusFilter === 'ALL' || student.fatherStatus === fatherStatusFilter;

      return matchesSearch && matchesStage && matchesStatus;
    });

    // Sorting logic
    return result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'NAME') {
        return (a.studentName || '').localeCompare(b.studentName || '', 'ar');
      }
      if (sortBy === 'AGE') {
        return Number(a.studentAge || 0) - Number(b.studentAge || 0);
      }
      return 0;
    });
  }, [students, searchTerm, stageFilter, fatherStatusFilter, sortBy]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت تأكد من إزالة الطالب (${name}) من القائمة؟`)) {
      setDeletingId(id);
      await deleteStudentRecord(id);
      setDeletingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-6 px-4 space-y-6 animate-fadeInUp">
      {/* Top Banner & Stats Overview */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden print:hidden">
        
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  لوحة تحكم وإحصائيات الكُتّاب 📊
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    متصل لحظياً (Real-time Sync)
                  </span>
                  <span className="text-xs text-slate-400">
                    تأكيد وحصر الطلاب المكرمين 2026
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Export & Print Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="طباعة التقرير أو حفظ كـ PDF"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              <span>طباعة PDF</span>
            </button>

            <button
              onClick={() => exportStudentsToCSV(filteredStudents)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel (CSV)</span>
            </button>

            <button
              onClick={() => exportStudentsToJSON(students)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-900/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>نسخة JSON</span>
            </button>
          </div>
        </div>

        {/* Analytics KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Total Students */}
          <div className="p-4.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 relative overflow-hidden group hover:border-teal-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300">إجمالي المسجلين</span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3">
              {stats.total} <span className="text-xs font-semibold text-teal-300">طالب</span>
            </div>
            <div className="text-[11px] text-teal-200/70 mt-1 flex items-center justify-between">
              <span>مرفق صور: {stats.withPhoto}</span>
              <span className="font-bold text-teal-300">{stats.total ? Math.round((stats.withPhoto / stats.total) * 100) : 0}%</span>
            </div>
          </div>

          {/* Card 2: Orphan Care Ratio */}
          <div className="p-4.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">رعاية الأيتام</span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3">
              {stats.orphansFather + stats.orphansBoth} <span className="text-xs font-semibold text-amber-300">طالب</span>
            </div>
            <div className="text-[11px] text-amber-200/70 mt-1">
              {stats.orphansFather} يتيم الأب | {stats.orphansBoth} يتيم الأبوين
            </div>
          </div>

          {/* Card 3: Average Age */}
          <div className="p-4.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 relative overflow-hidden group hover:border-indigo-500/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">متوسط الأعمار</span>
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3">
              {stats.avgAge} <span className="text-xs font-semibold text-indigo-300">سنة</span>
            </div>
            <div className="text-[11px] text-indigo-200/70 mt-1">
              مجموع أعمار الطلاب المكرمين
            </div>
          </div>

          {/* Card 4: Top Stage */}
          <div className="p-4.5 rounded-2xl bg-slate-800/60 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">أعلى مرحلة إقبالاً</span>
              <div className="p-2 rounded-xl bg-slate-700 text-slate-300">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-white mt-3 truncate">
              {Object.entries(stats.stages).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              من إجمالي {Object.keys(stats.stages).length} مراحل دراسية
            </div>
          </div>
        </div>

        {/* Stage distribution bar chart */}
        {stats.total > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-300 font-bold">
              <span>توزيع المراحل الدراسية للطلاب:</span>
              <span className="text-teal-400">{filteredStudents.length} نتائج معروضة</span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-white/5">
              {Object.entries(stats.stages).map(([stage, count], idx) => {
                const pct = (count / stats.total) * 100;
                const colors = ['bg-teal-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-sky-500'];
                return (
                  <div
                    key={stage}
                    style={{ width: `${pct}%` }}
                    className={`${colors[idx % colors.length]} transition-all rounded-sm relative group cursor-pointer`}
                    title={`${stage}: ${count} طالب (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-slate-300">
              {Object.entries(stats.stages).map(([stage, count], idx) => {
                const colors = ['bg-teal-400', 'bg-amber-400', 'bg-indigo-400', 'bg-emerald-400', 'bg-rose-400', 'bg-sky-400'];
                return (
                  <span key={stage} className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                    <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`}></span>
                    <span>{stage}: <strong className="text-white font-extrabold">{count}</strong></span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar: Search, Filters & Sorting */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-4 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الطالب، المدرسة، أو تليفون الأب..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Stage filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">جميع المراحل الدراسية</option>
            <option value="حضانة">حضانة / روضة</option>
            <option value="ابتدائي">ابتدائي</option>
            <option value="إعدادي">إعدادي</option>
            <option value="ثانوي">ثانوي</option>
            <option value="معهد أزهري">معهد أزهري</option>
            <option value="جامعي">جامعي</option>
          </select>

          {/* Father status filter */}
          <select
            value={fatherStatusFilter}
            onChange={(e) => setFatherStatusFilter(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">جميع الحالات الاجتماعية</option>
            <option value="الأب على قيد الحياة">الأب على قيد الحياة</option>
            <option value="يتيم الأب">يتيم الأب</option>
            <option value="يتيم الأبوين">يتيم الأبوين</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="NEWEST">الأحدث تسجيلاً</option>
            <option value="OLDEST">الأقدم تسجيلاً</option>
            <option value="NAME">أبجدياً (أ-ي)</option>
            <option value="AGE">حسب السن (أصغر-أكبر)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
              title="عرض كروت المكرمين"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Printable Title Header */}
      <div className="hidden print:block text-center py-4 border-b border-black mb-6">
        <h1 className="text-2xl font-black text-black">كشف الطلاب المسجلين لحضور حفل تكريم الكُتّاب 2026</h1>
        <p className="text-sm text-gray-700">عدد الطلاب المسجلين: {filteredStudents.length} طالب</p>
      </div>

      {/* Main Content Area */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300 mb-1">لا توجد نتائج مطابقة!</h3>
          <p className="text-xs text-slate-500">
            لم نجد طلاباً يطابقون معايير البحث أو التصفية الحالية.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs print:text-black">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-white/10 print:bg-gray-200 print:text-black">
                <tr>
                  <th className="py-3.5 px-4">م</th>
                  <th className="py-3.5 px-4">اسم الطالب والصورة</th>
                  <th className="py-3.5 px-4">السن والمرحلة</th>
                  <th className="py-3.5 px-4">المدرسة / المعهد</th>
                  <th className="py-3.5 px-4">تواصل الأب (الواتساب)</th>
                  <th className="py-3.5 px-4">تواصل الأم</th>
                  <th className="py-3.5 px-4">حالة الأب</th>
                  <th className="py-3.5 px-4 text-center print:hidden">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200 print:divide-gray-300">
                {filteredStudents.map((student, idx) => {
                  const waUrl = `https://wa.me/2${student.fatherPhone}?text=${encodeURIComponent(`السلام عليكم ولي أمر الطالب (${student.studentName})، نود التأكيد معكم بشأن حفل تكريم الكُتّاب 2026.`)}`;

                  return (
                    <tr key={student.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Name & Photo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.studentName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/50 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 font-bold shrink-0">
                              {student.studentName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-white text-sm">
                              {student.studentName}
                            </div>
                            <div className="text-[10px] text-slate-400 print:hidden">
                              {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age & Stage */}
                      <td className="py-3 px-4">
                        <div className="font-bold">{student.studentAge} سنة</div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold mt-0.5">
                          {student.studyStage}
                        </span>
                      </td>

                      {/* School */}
                      <td className="py-3 px-4 font-medium text-slate-300">
                        {student.schoolName}
                      </td>

                      {/* Father Phone */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 font-bold">{student.fatherPhone}</span>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 transition-all print:hidden"
                            title="تواصل بالواتساب"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Mother Phone */}
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {student.motherPhone || '-'}
                      </td>

                      {/* Father Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${
                          student.fatherStatus === 'يتيم الأب' || student.fatherStatus === 'يتيم الأبوين'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {student.fatherStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-teal-300 transition-all border border-white/10 cursor-pointer"
                            title="معاينة كارت التكريم"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.studentName)}
                            disabled={deletingId === student.id}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                            title="حذف الطالب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const waUrl = `https://wa.me/2${student.fatherPhone}?text=${encodeURIComponent(`السلام عليكم ولي أمر الطالب (${student.studentName})، نود التأكيد معكم بشأن حفل تكريم الكُتّاب 2026.`)}`;

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-teal-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {student.photoUrl ? (
                        <img
                          src={student.photoUrl}
                          alt={student.studentName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-teal-400 shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-300 font-black text-lg">
                          {student.studentName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-white text-sm line-clamp-1">
                          {student.studentName}
                        </h4>
                        <div className="text-[11px] text-teal-300 font-semibold">
                          {student.studentAge} سنة | {student.studyStage}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                      title="عرض كارت التكريم"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 my-3 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">المدرسة/المعهد:</span>
                      <span className="font-medium text-white truncate max-w-[140px]">{student.schoolName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">حالة الأب:</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        student.fatherStatus === 'يتيم الأب' || student.fatherStatus === 'يتيم الأبوين'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {student.fatherStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مراسلة الواتساب</span>
                  </a>

                  <button
                    onClick={() => handleDelete(student.id, student.studentName)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Recognition Profile Card Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeInUp print:hidden">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl relative overflow-hidden text-center">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Badge Header */}
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-4">
              🏆 بطاقة تكريم الطالب المتفوق
            </div>

            {/* Photo Avatar */}
            <div className="mx-auto mb-4 relative w-24 h-24">
              {selectedStudent.photoUrl ? (
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.studentName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                  {selectedStudent.studentName.charAt(0)}
                </div>
              )}
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              {selectedStudent.studentName}
            </h3>
            <p className="text-xs text-amber-300 font-bold mb-4">
              {selectedStudent.studyStage} | {selectedStudent.studentAge} سنة
            </p>

            <div className="bg-slate-950/60 rounded-2xl p-4 text-right space-y-2.5 text-xs text-slate-300 mb-5 border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">المدرسة / المعهد:</span>
                <span className="font-bold text-white">{selectedStudent.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رقم تليفون ولي الأمر:</span>
                <span className="font-mono text-white font-bold">{selectedStudent.fatherPhone}</span>
              </div>
              {selectedStudent.motherPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">رقم تليفون الأم:</span>
                  <span className="font-mono text-white">{selectedStudent.motherPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">حالة الأب:</span>
                <span className="font-bold text-amber-300">{selectedStudent.fatherStatus}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/2${selectedStudent.fatherPhone}?text=${encodeURIComponent(`السلام عليكم ولي أمر الطالب (${selectedStudent.studentName})، نود التأكيد معكم بشأن حفل تكريم الكُتّاب 2026.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>مراسلة عبر الواتساب مباشرة</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
