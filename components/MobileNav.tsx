import React from 'react';
import { AppRoute, User } from '../types';
import { StorageService } from '../services/storageService';

interface MobileNavProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentRoute, onNavigate }) => {
  const currentUser = StorageService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const teacherMenu = [
    { id: AppRoute.DASHBOARD, label: 'Tổng quan', icon: '🏠' },
    { id: AppRoute.ENTRY, label: 'Ghi Sổ', icon: '✍️' },
    { id: AppRoute.HISTORY, label: 'Lịch sử', icon: '📜' },
    { id: AppRoute.STATS, label: 'Thống kê', icon: '📊' },
  ];

  const adminMenu = [
    { id: AppRoute.DASHBOARD, label: 'Tổng quan', icon: '🏠' },
    { id: AppRoute.ADMIN_TEACHERS, label: 'Giáo Viên', icon: '👥' },
    { id: AppRoute.ADMIN_SUBJECTS, label: 'Môn Học', icon: '📚' },
    { id: AppRoute.STATS, label: 'Báo cáo', icon: '📊' },
  ];

  const menuItems = isAdmin ? adminMenu : teacherMenu;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg ${
              currentRoute === item.id ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};