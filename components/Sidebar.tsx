import React from 'react';
import { AppRoute, User } from '../types';

interface SidebarProps {
  currentUser: User;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentRoute, onNavigate, onLogout }) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const teacherMenu = [
    { id: AppRoute.DASHBOARD, label: 'Tổng quan', icon: '🏠' },
    { id: AppRoute.ENTRY, label: 'Ghi Sổ', icon: '✍️' },
    { id: AppRoute.HISTORY, label: 'Lịch sử', icon: '📜' },
    { id: AppRoute.STATS, label: 'Thống kê', icon: '📊' },
  ];

  const adminMenu = [
    { id: AppRoute.DASHBOARD, label: 'Tổng quan', icon: '🏠' },
    { id: AppRoute.ADMIN_TEACHERS, label: 'QL Giáo Viên', icon: '👥' },
    { id: AppRoute.ADMIN_SUBJECTS, label: 'QL Môn Học', icon: '📚' },
    { id: AppRoute.STATS, label: 'Thống kê toàn trường', icon: '📊' },
  ];

  const menuItems = isAdmin ? adminMenu : teacherMenu;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-10 hidden md:flex">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <span className="text-2xl">📚</span> Sổ Đầu Bài
        </h1>
        <p className="text-sm text-gray-500 mt-1">Xin chào, {currentUser.fullName}</p>
        {isAdmin && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentRoute === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>
  );
};