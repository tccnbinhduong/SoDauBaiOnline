import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isTryingAdminLogin = username.toLowerCase() === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = StorageService.login(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng. (Thử: gv01 / admin)');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📚 Sổ Đầu Bài</h1>
          <p className="text-gray-500">Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="Nhập mã giáo viên hoặc 'admin'"
              required
            />
          </div>

          {isTryingAdminLogin && (
            <div className="animate-fade-in">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu Admin
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
          )}


          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Đăng Nhập
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Hệ thống quản lý giáo dục v1.0
        </div>
      </div>
    </div>
  );
};