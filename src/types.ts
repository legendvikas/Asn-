export type UserRole = 'admin' | 'parent' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentId?: string; // For parents
  assignedClass?: string; // For teachers
  createdAt: number;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  contact: string;
  parentEmail?: string;
  createdAt: number;
}

export interface Attendance {
  id: string;
  date: string; // yyyy-mm-dd
  studentId: string;
  status: 'present' | 'absent';
}

export interface Result {
  id: string;
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  term: string;
  date: string;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  status: 'paid' | 'unpaid';
  dueDate: string;
  month: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  contact: string;
  assignedClass?: string;
  subjects?: string[];
  createdAt: number;
}

export interface SchoolSettings {
  schoolName: string;
  contact: string;
  address: string;
  updatedAt: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}
