import React, { useState, useEffect } from 'react';
import { User, LessonEntry, AppRoute } from '../types';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';

const initialFormData = {
  subject: '',
  className: '',
  session: 'Sáng' as 'Sáng' | 'Chiều' | 'Tối',
  periodSlot: 1,
  duration: 1,
  lessonTopic: '',
  totalStudents: 0,
  absentCount: 0,
  absentNames: '',
  comment: '',
  date: new Date().toISOString().split('T')[0],
};

interface EntryFormProps {
  currentUser: User;
  onNavigate: (route: AppRoute) => void;
  editingEntry: LessonEntry | null;
  onSave: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ currentUser, onNavigate, editingEntry, onSave }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [recentSubjects, setRecentSubjects] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const isEditMode = !!editingEntry;

  useEffect(() => {
    // Populate form if we are in edit mode
    if (isEditMode) {
      setFormData({
        subject: editingEntry.subject,
        className: editingEntry.className,
        session: editingEntry.session || 'Sáng',
        periodSlot: editingEntry.periodSlot,
        duration: editingEntry.duration,
        lessonTopic: editingEntry.lessonTopic,
        totalStudents: editingEntry.totalStudents,
        absentCount: editingEntry.absentCount,
        absentNames: editingEntry.absentNames || '',
        comment: editingEntry.comment,
        date: editingEntry.date,
      });
    } else {
      // Reset form if we switch from editing to creating
      setFormData(initialFormData);
    }

    // Load recent subjects regardless of mode
    const entries = StorageService.getEntries();
    const subjects = new Set(
      entries
        .filter(e => e.teacherId === currentUser.id)
        .map(e => e.subject)
        .filter(s => s.trim().length > 0)
    );
    setRecentSubjects(Array.from(subjects));
  }, [currentUser.id, editingEntry, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'periodSlot' || name === 'duration' || name === 'totalStudents' || name === 'absentCount' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleAISuggest = async () => {
    if (!formData.comment.trim()) return;
    
    setIsGenerating(true);
    const suggestion = await GeminiService.refineComment(
      formData.comment,
      formData.subject || 'Môn học',
      formData.className || 'chung'
    );
    setFormData(prev => ({ ...prev, comment: suggestion }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      const updatedEntry: LessonEntry = {
        ...editingEntry,
        ...formData,
      };
      StorageService.updateEntry(updatedEntry);
      alert('Đã cập nhật sổ đầu bài thành công!');
    } else {
      const newEntry: LessonEntry = {
        id: Date.now().toString(),
        teacherId: currentUser.id,
        teacherName: currentUser.fullName,
        createdAt: Date.now(),
        ...formData
      };
      StorageService.addEntry(newEntry);
      alert('Đã lưu sổ đầu bài thành công!');
    }
    onSave();
  };

  const handleSubjectSelect = (subject: string) => {
    setFormData(prev => ({ ...prev, subject }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto pb-24 md:pb-6">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Chỉnh Sửa Sổ Đầu Bài' : 'Ghi Sổ Đầu Bài'}
        </h2>
        <p className="text-gray-500 text-sm">
          {isEditMode ? 'Cập nhật thông tin cho tiết dạy đã lưu' : 'Điền thông tin tiết dạy của bạn'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Subject Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <label className="block text-lg font-semibold text-gray-800 mb-1">
              {isEditMode ? 'Môn học' : 'Bước 1: Môn học'}
            </label>
             {!isEditMode && <p className="text-sm text-gray-500">Chọn môn đã dạy hoặc nhập môn mới</p>}
          </div>

          {recentSubjects.length > 0 && !isEditMode && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Môn đã dạy gần đây:</p>
              <div className="flex flex-wrap gap-2">
                {recentSubjects.map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubjectSelect(sub)}
                    className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                      formData.subject === sub 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Ví dụ: Toán, Văn, Tiếng Anh..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              required
            />
          </div>
        </div>

        {/* Step 2: Details */}
        {formData.subject.trim() && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 animate-fade-in">
             <div className="border-b border-gray-100 pb-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {isEditMode ? `Chi tiết tiết dạy (${formData.subject})` : `Bước 2: Chi tiết tiết dạy (${formData.subject})`}
                </h3>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Session */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dạy</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buổi</label>
                  <select
                      name="session"
                      value={formData.session}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      required
                  >
                      <option>Sáng</option>
                      <option>Chiều</option>
                      <option>Tối</option>
                  </select>
                </div>
              </div>


              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  placeholder="VD: 10A1"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Period Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiết thứ</label>
                  <input
                    type="number"
                    name="periodSlot"
                    min="1" max="10"
                    value={formData.periodSlot}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiết</label>
                  <input
                    type="number"
                    name="duration"
                    min="1" max="5"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

               {/* Students Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sĩ số</label>
                  <input
                    type="number"
                    name="totalStudents"
                    min="1"
                    value={formData.totalStudents}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vắng</label>
                  <input
                    type="number"
                    name="absentCount"
                    min="0"
                    value={formData.absentCount}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Absent Names - Conditionally rendered */}
            {formData.absentCount > 0 && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên học sinh vắng (nếu có)</label>
                    <input
                        type="text"
                        name="absentNames"
                        value={formData.absentNames}
                        onChange={handleChange}
                        placeholder="VD: Nguyễn A, Trần B"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      *Tên các học sinh cách nhau bởi dấu phẩy.
                    </p>
                </div>
            )}

            {/* Lesson Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học / Nội dung</label>
              <input
                type="text"
                name="lessonTopic"
                value={formData.lessonTopic}
                onChange={handleChange}
                placeholder="Nội dung bài dạy..."
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            {/* Comments with AI */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Nhận xét / Đánh giá</label>
                <button
                  type="button"
                  onClick={handleAISuggest}
                  disabled={isGenerating || !formData.comment}
                  className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                    isGenerating 
                      ? 'bg-gray-100 text-gray-400' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  } transition-colors`}
                >
                  {isGenerating ? '✨ Đang viết...' : '✨ AI Gợi ý'}
                </button>
              </div>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={3}
                placeholder="Nhập sơ lược tình hình lớp (VD: Lớp hơi ồn, nhưng hiểu bài...)"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                *Nhấn "AI Gợi ý" để hệ thống tự động viết lại nhận xét chuyên nghiệp hơn.
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => onNavigate(isEditMode ? AppRoute.HISTORY : AppRoute.DASHBOARD)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md"
              >
                {isEditMode ? 'Cập nhật' : 'Lưu vào sổ'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};