export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'TEACHER' | 'ADMIN';
  password?: string;
}

export interface LessonEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string; // Tên môn học
  className: string; // Lớp dạy
  session: 'Sáng' | 'Chiều' | 'Tối'; // Buổi dạy
  periodSlot: number; // Tiết thứ mấy (1-10)
  duration: number; // Số tiết (1, 2...)
  lessonTopic: string; // Tên bài học
  totalStudents: number; // Sĩ số
  absentCount: number; // Vắng
  absentNames?: string; // Tên học sinh vắng (cách nhau bởi dấu phẩy)
  comment: string; // Nhận xét
  date: string; // ISO Date string YYYY-MM-DD
  createdAt: number;
}

export type PeriodStat = {
  name: string; // Week or Month name
  count: number; // Total periods
};

export enum AppRoute {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  ENTRY = 'entry',
  HISTORY = 'history',
  STATS = 'stats',
  ADMIN_TEACHERS = 'admin_teachers',
  ADMIN_SUBJECTS = 'admin_subjects'
}