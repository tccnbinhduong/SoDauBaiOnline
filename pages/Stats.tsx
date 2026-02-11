import React, { useMemo, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User } from '../types';
import { StorageService } from '../services/storageService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface StatsProps {
  currentUser: User;
}

// Helper to get ISO week number
const getWeekNumber = (d: Date) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

export const Stats: React.FC<StatsProps> = ({ currentUser }) => {
  const entries = StorageService.getEntries();
  const isAdmin = currentUser.role === 'ADMIN';
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const statsContentRef = useRef<HTMLDivElement>(null);

  const allTeachers = useMemo(() => {
    return isAdmin ? StorageService.getUsers().filter(u => u.role === 'TEACHER') : [];
  }, [isAdmin]);

  // Filter entries based on role and selection
  const filteredEntries = useMemo(() => {
    if (!isAdmin) {
      return entries.filter(e => e.teacherId === currentUser.id);
    }
    if (selectedTeacherId === 'all') {
      return entries;
    }
    return entries.filter(e => e.teacherId === selectedTeacherId);
  }, [isAdmin, entries, currentUser.id, selectedTeacherId]);

  const weeklyData = useMemo(() => {
    const map = new Map<string, number>();
    filteredEntries.forEach(e => {
      const date = new Date(e.date);
      const week = `Tuần ${getWeekNumber(date)}`;
      const current = map.get(week) || 0;
      map.set(week, current + e.duration);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, periods: count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredEntries]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    filteredEntries.forEach(e => {
      const date = new Date(e.date);
      const month = `Tháng ${date.getMonth() + 1}`;
      const current = map.get(month) || 0;
      map.set(month, current + e.duration);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, periods: count }));
  }, [filteredEntries]);

  // Calculate summary cards
  const totalPeriods = filteredEntries.reduce((acc, curr) => acc + curr.duration, 0);
  const totalAbsents = filteredEntries.reduce((acc, curr) => acc + curr.absentCount, 0);
  const uniqueClasses = new Set(filteredEntries.map(e => e.className)).size;

  const selectedTeacher = allTeachers.find(t => t.id === selectedTeacherId);
  const title = isAdmin
    ? selectedTeacher ? `Thống Kê cho: ${selectedTeacher.fullName}` : 'Thống Kê Toàn Trường'
    : 'Thống Kê Giảng Dạy';
  const description = isAdmin
    ? selectedTeacher ? 'Tổng hợp số liệu từ giáo viên đã chọn' : 'Tổng hợp số liệu từ tất cả giáo viên'
    : `Tổng hợp số liệu của giáo viên ${currentUser.fullName}`;

  const handleExportPDF = async () => {
    if (!statsContentRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(statsContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f3f4f6', // Match page background
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const ratio = canvasWidth / canvasHeight;
      let imgWidth = pdfWidth - 20; // 10mm margin on each side
      let imgHeight = imgWidth / ratio;

      if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20; // Fit to page height
        imgWidth = imgHeight * ratio;
      }
      
      const x = (pdfWidth - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', x, 10, imgWidth, imgHeight);
      
      const date = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      const safeFullName = (name: string) => name.replace(/\s/g, '_');
      const teacherName = selectedTeacher ? safeFullName(selectedTeacher.fullName) : 'Toan_Truong';
      const fileName = `ThongKe_${isAdmin ? teacherName : safeFullName(currentUser.fullName)}_${date}.pdf`;
      
      pdf.save(fileName);

    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Đã xảy ra lỗi khi xuất file PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="p-6 space-y-8 pb-24 md:pb-6">
      <header className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {title}
          </h2>
          <p className="text-gray-500 text-sm">
            {description}
          </p>
        </div>
        <button
            onClick={handleExportPDF}
            disabled={isExporting || filteredEntries.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Export statistics to PDF"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
        </button>
      </header>

      <div ref={statsContentRef} className="space-y-8 bg-gray-50 p-0 -m-6 pt-8 md:p-0 md:m-0 md:bg-transparent">
        {/* Teacher Filter for Admins */}
        {isAdmin && (
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mx-6 md:mx-0">
            <label htmlFor="teacherFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo giáo viên:
            </label>
            <select
              id="teacherFilter"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              aria-label="Lọc thống kê theo giáo viên"
            >
              <option value="all">Tất cả giáo viên</option>
              {allTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName} ({teacher.username})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-0">
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Tổng số tiết dạy</p>
            <h3 className="text-3xl font-bold text-blue-600 mt-2">{totalPeriods}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Tổng học sinh vắng</p>
            <h3 className="text-3xl font-bold text-orange-600 mt-2">{totalAbsents}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Số lớp đã dạy</p>
            <h3 className="text-3xl font-bold text-purple-600 mt-2">{uniqueClasses}</h3>
          </div>
        </div>

        {/* Charts Grid */}
        {filteredEntries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 md:px-0">
            {/* Weekly Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Số tiết theo Tuần</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                    <Tooltip 
                      cursor={{fill: '#f9fafb'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="periods" name="Số tiết" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Số tiết theo Tháng</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                    <Tooltip 
                      cursor={{fill: '#f9fafb'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="periods" name="Số tiết" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed col-span-full mx-6 md:mx-0">
            <p className="text-gray-400 text-lg">
              Không có dữ liệu thống kê để hiển thị.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
