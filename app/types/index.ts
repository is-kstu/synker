import { Id } from '@/convex/_generated/dataModel';

export type AppView = "login" | "generalSchedule" | "mySchedule" | "addShift";

export type UserRole = "manager" | "employee";

export interface User {
  id: Id<'users'>;
  name: string;
  avatarUrl: string;
  role: UserRole;
}

export interface Shift {
  _id: Id<'shifts'>;
  employeeId: Id<'users'>;
  day: string;
  startTime: string;
  endTime: string;
  task: string;
  employee?: {
    name: string;
  };
}

export interface DailySchedule {
  day: string;
  shifts: Shift[];
}

export interface WeekDay {
  date: Date;
  dateKey: string;
  dayShifts: Shift[];
}

export interface WeekRange {
  start: Date;
  end: Date;
  startFormatted: string;
  endFormatted: string;
  dateRange: string;
}

export type SubmissionStatus = 'idle' | 'success' | 'error';

export interface LoginFormData {
  username: string;
  password: string;
}

export interface ShiftFormData {
  employeeId: Id<'users'> | '';
  day: string;
  startTime: string;
  endTime: string;
  task: string;
} 