import { LessonEntry, User } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'gv01', fullName: 'Nguyễn Văn A', role: 'TEACHER' },
  { id: 'u2', username: 'gv02', fullName: 'Trần Thị B', role: 'TEACHER' },
  { id: 'admin', username: 'admin', fullName: 'Quản Trị Viên', role: 'ADMIN', password: 'tccnbd' },
];

export const SUBJECTS = [
  'Toán', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Ngữ Văn', 
  'Lịch Sử', 'Địa Lý', 'Tiếng Anh', 'Tin Học', 'GDCD', 'Công Nghệ'
];

export const INITIAL_ENTRIES: LessonEntry[] = [
  {
    id: 'e1',
    teacherId: 'u1',
    teacherName: 'Nguyễn Văn A',
    subject: 'Toán',
    className: '10A1',
    session: 'Sáng',
    periodSlot: 1,
    duration: 1,
    lessonTopic: 'Phương trình bậc hai',
    totalStudents: 40,
    absentCount: 0,
    absentNames: '',
    comment: 'Lớp trật tự, chú ý nghe giảng.',
    date: new Date().toISOString().split('T')[0],
    createdAt: Date.now()
  },
  {
    id: 'e2',
    teacherId: 'u1',
    teacherName: 'Nguyễn Văn A',
    subject: 'Toán',
    className: '10A2',
    session: 'Chiều',
    periodSlot: 3,
    duration: 1,
    lessonTopic: 'Hệ phương trình',
    totalStudents: 38,
    absentCount: 2,
    absentNames: 'Lê Thị C, Hoàng Văn D',
    comment: 'Một số em còn nói chuyện riêng.',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    createdAt: Date.now() - 86400000
  }
];