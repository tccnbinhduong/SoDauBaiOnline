import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storageService';
import { Modal } from '../components/Modal';

const ChangePasswordForm: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      const adminUser = StorageService.getCurrentUser();
      if (adminUser && adminUser.role === 'ADMIN') {
        StorageService.changePassword(adminUser.id, newPassword);
        setMessage('Đổi mật khẩu thành công!');
        setNewPassword('');
        setConfirmPassword('');
        // Hide success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Không thể thực hiện hành động này.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Đổi Mật Khẩu Admin</h3>
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Ít nhất 6 ký tự"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}
        {message && <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md">{message}</p>}

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Lưu Thay Đổi
        </button>
      </form>
    </div>
  );
};


export const AdminTeachers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ username: '', fullName: '' });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(StorageService.getUsers());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.fullName) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      StorageService.addUser({
        id: Date.now().toString(),
        username: formData.username,
        fullName: formData.fullName,
        role: 'TEACHER'
      });
      setFormData({ username: '', fullName: '' });
      setError('');
      loadUsers();
      alert('Thêm giáo viên thành công!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      StorageService.deleteUser(userToDelete);
      loadUsers();
    }
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="p-6 pb-24 md:pb-6">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Giáo Viên</h2>
        <p className="text-gray-500 text-sm">Thêm, xóa tài khoản giáo viên và quản lý tài khoản admin</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin actions column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Add Teacher Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thêm Giáo Viên Mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Giáo Viên / Tên đăng nhập</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="VD: gv10"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Giáo Viên (Họ và Tên)</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="VD: Phạm Văn C"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm Tài Khoản
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <ChangePasswordForm />
        </div>

        {/* Teachers List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-700">Danh sách giáo viên ({users.filter(u => u.role === 'TEACHER').length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Họ tên</th>
                    <th className="px-6 py-3">Tên đăng nhập</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.filter(u => u.role === 'TEACHER').map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                      <td className="px-6 py-4 text-gray-500">{user.username}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-xs font-medium border border-red-200 hover:border-red-300"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => u.role === 'TEACHER').length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                        Chưa có giáo viên nào trong hệ thống.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa giáo viên"
      >
        Bạn có chắc chắn muốn xóa tài khoản giáo viên này? Hành động này không thể hoàn tác.
      </Modal>
    </div>
  );
};