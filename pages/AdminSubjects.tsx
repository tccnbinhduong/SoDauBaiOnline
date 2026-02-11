import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../services/storageService';
import { LessonEntry } from '../types';
import { Modal } from '../components/Modal';

interface SubjectStat {
  name: string;
  entryCount: number;
  teacherCount: number;
  teachers: Set<string>;
}

export const AdminSubjects: React.FC = () => {
  const [entries, setEntries] = useState<LessonEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectStat | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    setEntries(StorageService.getEntries());
  };

  const subjectStats = useMemo(() => {
    const stats = new Map<string, SubjectStat>();

    entries.forEach(entry => {
      const subName = entry.subject.trim();
      if (!subName) return;

      if (!stats.has(subName)) {
        stats.set(subName, {
          name: subName,
          entryCount: 0,
          teacherCount: 0,
          teachers: new Set()
        });
      }

      const stat = stats.get(subName)!;
      stat.entryCount++;
      stat.teachers.add(entry.teacherName);
    });

    return Array.from(stats.values())
      .map(s => ({ ...s, teacherCount: s.teachers.size }))
      .sort((a, b) => b.entryCount - a.entryCount);
  }, [entries]);

  const filteredSubjects = subjectStats.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDeleteClick = (subject: SubjectStat) => {
    setSubjectToDelete(subject);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (subjectToDelete) {
      StorageService.deleteEntriesBySubject(subjectToDelete.name);
      loadEntries();
      alert(`Đã xóa dữ liệu môn ${subjectToDelete.name}.`);
    }
    setIsModalOpen(false);
    setSubjectToDelete(null);
  };

  return (
    <div className="p-6 pb-24 md:pb-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản Lý Môn Học</h2>
          <p className="text-gray-500 text-sm">Danh sách các môn học đã được ghi nhận trong sổ đầu bài</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Tìm kiếm môn học..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <div key={subject.name} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
                {subject.name.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={() => handleDeleteClick(subject)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                title="Xóa dữ liệu môn này"
              >
                🗑️
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-1">{subject.name}</h3>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tổng số tiết đã dạy:</span>
                <span className="font-medium text-gray-900">{subject.entryCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Số giáo viên dạy:</span>
                <span className="font-medium text-gray-900">{subject.teacherCount}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Giáo viên tham gia:</p>
              <div className="flex flex-wrap gap-1">
                {Array.from(subject.teachers).slice(0, 3).map((t, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {t}
                  </span>
                ))}
                {subject.teacherCount > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                    +{subject.teacherCount - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            Không tìm thấy môn học nào.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa môn học"
      >
        {subjectToDelete && `CẢNH BÁO: Bạn sắp xóa toàn bộ ${subjectToDelete.entryCount} mục ghi sổ của môn "${subjectToDelete.name}". Hành động này không thể hoàn tác.`}
      </Modal>
    </div>
  );
};
