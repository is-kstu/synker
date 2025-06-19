export type Employee = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: "manager" | "employee";
  avatarUrl?: string;
};

export type Shift = {
  id: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  task: string;
};

export type DailySchedule = {
  day: string;
  shifts: Shift[];
};

export const employeeColors: Record<string, string> = {
  "emp1": "bg-blue-500",
  "emp2": "bg-green-500",
  "emp3": "bg-purple-500",
  "emp4": "bg-orange-500",
  "emp5": "bg-pink-500",
};

export const employees: Employee[] = [
  {
    id: "mgr1",
    name: "Alice Manager",
    username: "manager_alice",
    password: "pass123",
    role: "manager",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Alice"
  },
  {
    id: "emp1",
    name: "Bob Worker",
    username: "employee_bob",
    password: "pass123",
    role: "employee",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Bob"
  },
  {
    id: "emp2",
    name: "Carol Worker",
    username: "employee_carol",
    password: "pass123",
    role: "employee",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Carol"
  },
  {
    id: "emp3",
    name: "Dave Worker",
    username: "employee_dave",
    password: "pass123",
    role: "employee",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/png?seed=Dave"
  }
];

export const initialDailySchedules: DailySchedule[] = [
  {
    day: "Понедельник",
    shifts: [
      {
        id: "shift1",
        employeeId: "emp1",
        startTime: "09:00",
        endTime: "17:00",
        task: "Работа с клиентами"
      },
      {
        id: "shift2",
        employeeId: "emp2",
        startTime: "10:00",
        endTime: "18:00",
        task: "Обработка заказов"
      }
    ]
  },
  {
    day: "Вторник",
    shifts: [
      {
        id: "shift3",
        employeeId: "emp2",
        startTime: "09:00",
        endTime: "17:00",
        task: "Инвентаризация"
      },
      {
        id: "shift4",
        employeeId: "emp3",
        startTime: "12:00",
        endTime: "20:00",
        task: "Вечерняя смена"
      }
    ]
  },
  {
    day: "Среда",
    shifts: []
  },
  {
    day: "Четверг",
    shifts: [
      {
        id: "shift5",
        employeeId: "emp1",
        startTime: "09:00",
        endTime: "17:00",
        task: "Встречи с поставщиками"
      }
    ]
  },
  {
    day: "Пятница",
    shifts: [
      {
        id: "shift6",
        employeeId: "emp3",
        startTime: "09:00",
        endTime: "17:00",
        task: "Подготовка отчетов"
      }
    ]
  },
  {
    day: "Суббота",
    shifts: []
  },
  {
    day: "Воскресенье",
    shifts: []
  }
]; 