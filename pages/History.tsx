import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { User, LessonEntry } from '../types';
import { StorageService } from '../services/storageService';
import { Modal } from '../components/Modal';

interface HistoryProps {
  currentUser: User;
  onEdit: (entry: LessonEntry) => void;
  onDelete: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ currentUser, onEdit, onDelete }) => {
  const entries = StorageService.getEntries().filter(e => e.teacherId === currentUser.id);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const classNames = useMemo(() => {
    const uniqueClasses = new Set(entries.map(e => e.className.trim()).filter(Boolean));
    return ['all', ...Array.from(uniqueClasses).sort()];
  }, [entries]);

  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(entries.map(e => e.subject.trim()).filter(Boolean));
    return ['all', ...Array.from(uniqueSubjects).sort()];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const classMatch = selectedClass === 'all' || e.className === selectedClass;
      const subjectMatch = selectedSubject === 'all' || e.subject === selectedSubject;
      let dateMatch = true;
      if (dateRange.start) {
        dateMatch = dateMatch && e.date >= dateRange.start;
      }
      if (dateRange.end) {
        dateMatch = dateMatch && e.date <= dateRange.end;
      }
      return classMatch && subjectMatch && dateMatch;
    });
  }, [entries, selectedClass, selectedSubject, dateRange]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setSelectedClass('all');
    setSelectedSubject('all');
    setDateRange({ start: '', end: '' });
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      onDelete(entryToDelete);
    }
    setIsModalOpen(false);
    setEntryToDelete(null);
  };

  const handleExportExcel = () => {
    if (filteredEntries.length === 0 || isExporting) return;

    setIsExporting(true);

    try {
      const dataToExport = filteredEntries.map(entry => ({
        'Ngày dạy': new Date(entry.date).toLocaleDateString('vi-VN'),
        'Buổi dạy': entry.session || '',
        'Môn học': entry.subject,
        'Lớp': entry.className,
        'Tiết': entry.periodSlot,
        'Số tiết': entry.duration,
        'Tên bài học': entry.lessonTopic,
        'Sĩ số': entry.totalStudents,
        'Vắng': entry.absentCount,
        'Tên HS vắng': entry.absentNames || '',
        'Nhận xét': entry.comment,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'LichSuGiangDay');

      // Set column widths for better readability
      const columnWidths = [
        { wch: 12 }, // Ngày dạy
        { wch: 10 }, // Buổi dạy
        { wch: 15 }, // Môn học
        { wch: 10 }, // Lớp
        { wch: 8 },  // Tiết
        { wch: 8 },  // Số tiết
        { wch: 30 }, // Tên bài học
        { wch: 8 },  // Sĩ số
        { wch: 8 },  // Vắng
        { wch: 25 }, // Tên HS vắng
        { wch: 40 }, // Nhận xét
      ];
      worksheet['!cols'] = columnWidths;

      const safeFullName = currentUser.fullName.replace(/\s/g, '_');
      const date = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      const fileName = `LichSuGiangDay_${safeFullName}_${date}.xlsx`;

      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error("Error exporting Excel file:", error);
      alert("Đã có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại.");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    }
  };

  const hasFilters = classNames.length > 2 || subjects.length > 2 || entries.length > 0;

  return (
    <div className="p-6 pb-24 md:pb-6">
      <header className="mb-6 flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lịch Sử Giảng Dạy</h2>
          <p className="text-gray-500 text-sm">Danh sách các tiết đã ghi vào sổ</p>
        </div>
        <button
            onClick={handleExportExcel}
            disabled={isExporting || filteredEntries.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Xuất lịch sử ra file Excel"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
        </button>
      </header>

      {hasFilters && (
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-6 flex-wrap">
            {classNames.length > 2 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600 mr-2 shrink-0">Lọc theo lớp:</span>
                <div className="flex flex-wrap gap-2">
                  {classNames.map(className => (
                    <button
                      key={className}
                      onClick={() => setSelectedClass(className)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                        selectedClass === className
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {className === 'all' ? 'Tất cả' : className}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {subjects.length > 2 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600 mr-2 shrink-0">Lọc theo môn:</span>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(subject => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                        selectedSubject === subject
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {subject === 'all' ? 'Tất cả' : subject}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600 mr-2 shrink-0">Lọc theo ngày:</span>
                <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white" />
                <span className="text-gray-500">đến</span>
                <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white" />
              </div>
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline md:ml-auto px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors">Xóa bộ lọc</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Ngày</th>
                <th className="px-6 py-3">Buổi</th>
                <th className="px-6 py-3">Môn học</th>
                <th className="px-6 py-3">Lớp</th>
                <th className="px-6 py-3">Nội dung</th>
                <th className="px-6 py-3">Nhận xét</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">{new Date(entry.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-6 py-4 text-gray-600">{entry.session || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{entry.subject}</td>
                  <td className="px-6 py-4 text-gray-600">{entry.className} (Tiết {entry.periodSlot})</td>
                  <td className="px-6 py-4 text-gray-600">{entry.lessonTopic}</td>
                  <td className="px-6 py-4 text-gray-500 italic text-xs">{entry.comment || "N/A"}</td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => onEdit(entry)} className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 border border-blue-200">Sửa</button>
                    <button onClick={() => handleDeleteClick(entry.id)} className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 border border-red-200">Xóa</button>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Không có dữ liệu nào khớp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
      >
        Bạn có chắc chắn muốn xóa mục sổ đầu bài này không? Hành động này không thể hoàn tác.
      </Modal>
    </div>
  );
};