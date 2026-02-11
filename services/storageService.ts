import { LessonEntry, User } from '../types';
import { MOCK_USERS, INITIAL_ENTRIES } from '../constants';

const KEYS = {
  USER: 'sdb_user',
  ENTRIES: 'sdb_entries',
  USERS_LIST: 'sdb_users_list'
};

export const StorageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS_LIST);
    if (!data) {
      localStorage.setItem(KEYS.USERS_LIST, JSON.stringify(MOCK_USERS));
      return MOCK_USERS;
    }
    return JSON.parse(data);
  },

  addUser: (user: User) => {
    const users = StorageService.getUsers();
    // Check if username exists
    if (users.some(u => u.username === user.username)) {
      throw new Error('Tên đăng nhập đã tồn tại');
    }
    const newUsers = [...users, user];
    localStorage.setItem(KEYS.USERS_LIST, JSON.stringify(newUsers));
  },

  deleteUser: (id: string) => {
    const users = StorageService.getUsers();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS_LIST, JSON.stringify(newUsers));
  },

  login: (username: string, password?: string): User | null => {
    const users = StorageService.getUsers();
    const user = users.find(u => u.username === username);

    if (user) {
      // If user is admin, password is required and must match
      if (user.role === 'ADMIN') {
        if (user.password === password) {
          localStorage.setItem(KEYS.USER, JSON.stringify(user));
          return user;
        }
        return null; // Wrong password for admin
      } else {
        // Teacher login doesn't require password
        localStorage.setItem(KEYS.USER, JSON.stringify(user));
        return user;
      }
    }
    return null; // User not found
  },

  logout: () => {
    localStorage.removeItem(KEYS.USER);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  changePassword: (userId: string, newPassword: string) => {
    const users = StorageService.getUsers();
    const userIndex = users.findIndex(u => u.id === userId && u.role === 'ADMIN');
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem(KEYS.USERS_LIST, JSON.stringify(users));

      // Also update current logged in user session if it's the same user
      const currentUser = StorageService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
          currentUser.password = newPassword;
          localStorage.setItem(KEYS.USER, JSON.stringify(currentUser));
      }
    } else {
        throw new Error('Không tìm thấy người dùng quản trị.');
    }
  },

  getEntries: (): LessonEntry[] => {
    const data = localStorage.getItem(KEYS.ENTRIES);
    if (!data) {
      // Initialize with mock data if empty
      localStorage.setItem(KEYS.ENTRIES, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    return JSON.parse(data);
  },

  addEntry: (entry: LessonEntry) => {
    const entries = StorageService.getEntries();
    const newEntries = [entry, ...entries];
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(newEntries));
  },
  
  updateEntry: (updatedEntry: LessonEntry) => {
    const entries = StorageService.getEntries();
    const index = entries.findIndex(e => e.id === updatedEntry.id);
    if (index !== -1) {
      entries[index] = updatedEntry;
      localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
    }
  },

  deleteEntry: (id: string) => {
    const entries = StorageService.getEntries();
    const newEntries = entries.filter(e => e.id !== id);
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(newEntries));
  },
  
  deleteEntriesBySubject: (subject: string) => {
    const entries = StorageService.getEntries();
    const newEntries = entries.filter(e => e.subject !== subject);
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(newEntries));
  }
};