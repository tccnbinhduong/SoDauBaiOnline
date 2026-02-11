import React from 'react';
import { User, AppRoute } from '../types';
import { StorageService } from '../services/storageService';

interface DashboardProps {
  currentUser: User;
  onNavigate: (route: AppRoute) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onNavigate }) => {
  const entries = StorageService.getEntries().filter(e => e.teacherId === currentUser.id);
  const today = new Date().toISOString().split('T')[0];
  const todaysEntries = entries.filter(e => e.date === today);

  return (
    <div className="p-6 pb-24 md:pb-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h2 className="text-3xl font-bold mb-2">Xin chào, thầy/cô {currentUser.fullName}! 👋</h2>
        <p className="opacity-90">Chúc thầy/cô một ngày làm việc hiệu quả.</p>
        
        <div className="mt-6 flex gap-4">
          <button 
            onClick={() => onNavigate(AppRoute.ENTRY)}
            className="bg-white text-blue-700 px-6 py-2.5 rounded-lg font-semibold shadow hover:bg-blue-50 transition-colors"
          >
            + Ghi Sổ Ngay
          </button>
          <button 
            onClick={() => onNavigate(AppRoute.STATS)}
            className="bg-blue-500 bg-opacity-30 border border-white border-opacity-30 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-opacity-40 transition-colors"
          >
            Xem Thống Kê
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-4">Hôm nay ({new Date().toLocaleDateString('vi-VN')})</h3>
      
      {todaysEntries.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-600">Chưa có tiết dạy nào được ghi nhận hôm nay.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todaysEntries.map(entry => (
            <div key={entry.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                    Tiết {entry.periodSlot}
                  </span>
                  <span className="text-gray-400 text-xs">{entry.subject}</span>
                </div>
                <h4 className="font-bold text-lg text-gray-800 mb-1">{entry.className}</h4>
                <p className="text-gray-600 text-sm line-clamp-2">{entry.lessonTopic}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                <span>Sĩ số: {entry.totalStudents}</span>
                <span>Vắng: {entry.absentCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8">
         <h3 className="text-xl font-bold text-gray-800 mb-4">Truy cập nhanh</h3>
         <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onNavigate(AppRoute.HISTORY)} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 text-left">
                <span className="text-2xl block mb-2">📜</span>
                <span className="font-medium text-gray-700">Xem lại lịch sử</span>
            </button>
             <button onClick={() => onNavigate(AppRoute.STATS)} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 text-left">
                <span className="text-2xl block mb-2">📈</span>
                <span className="font-medium text-gray-700">Báo cáo tuần này</span>
            </button>
         </div>
      </div>
    </div>
  );
};