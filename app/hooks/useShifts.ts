import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useMemo } from 'react';
import { Shift, WeekDay } from '../types';
import { getWeekRange } from '../utils/dateUtils';

export const useShifts = (weekOffset: number = 0) => {
  const weekRange = getWeekRange(weekOffset);
  
  const shifts = useQuery(api.shifts.getShiftsByDateRange, {
    startDate: weekRange.dateRange.split(' - ')[0],
    endDate: weekRange.dateRange.split(' - ')[1],
  });

  const groupedShifts = useMemo(() => {
    if (!shifts) return {};

    const grouped: { [key: string]: Shift[] } = {};
    shifts.forEach((shift: Shift) => {
      const dateKey = new Date(shift.day).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(shift);
    });
    return grouped;
  }, [shifts]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekRange.start);
      date.setDate(weekRange.start.getDate() + i);
      const dateKey = date.toDateString();
      const dayShifts = groupedShifts[dateKey] || [];
      return { date, dateKey, dayShifts } as WeekDay;
    });
  }, [groupedShifts, weekRange]);

  const daysWithTasks = weekDays.filter(({ dayShifts }) => dayShifts.length > 0);

  return {
    shifts,
    weekDays,
    daysWithTasks,
    weekRange,
    isLoading: !shifts,
  };
};

export const useEmployeeShifts = (employeeId: Id<'users'>) => {
  const shifts = useQuery(api.shifts.getShiftsByEmployee, { employeeId });
  
  const groupedShifts = useMemo(() => {
    if (!shifts) return {};

    const grouped: { [key: string]: Shift[] } = {};
    shifts.forEach((shift: Shift) => {
      const shiftDate = new Date(shift.day);
      const dateKey = shiftDate.toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(shift);
    });
    return grouped;
  }, [shifts]);

  return {
    shifts,
    groupedShifts,
    isLoading: !shifts,
  };
};

export const useShiftMutations = () => {
  const createShift = useMutation(api.shifts.createShift);
  
  return {
    createShift,
  };
}; 