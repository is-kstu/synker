"use client"

import React from "react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    type DailySchedule,
    type Employee,
    employeeColors,
    initialDailySchedules,
    employees as initialEmployees,
    type Shift,
} from "@/lib/mock-data-v4"
import { cn } from "@/lib/utils"
import { Building, Clock, Edit3, LogOut, PlusCircle, ShieldX, Trash2, User, Users, X } from "lucide-react"
import { useMemo, useState } from "react"

type AppView = "login" | "generalSchedule" | "mySchedule" | "addShift"
type EditingShiftDetails = { shift: Shift; day: string } | null

export default function MobileAppShell() {
    const [currentView, setCurrentView] = useState<AppView>("login")
    const [loggedInUser, setLoggedInUser] = useState<Employee | null>(null)
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
    const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>(initialDailySchedules)
    const [editingShiftDetails, setEditingShiftDetails] = useState<EditingShiftDetails>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [shiftToDelete, setShiftToDelete] = useState<{ shiftId: string; day: string } | null>(null)

    const handleLogin = (user: Employee) => {
        setLoggedInUser(user)
        setCurrentView(user.role === "manager" ? "generalSchedule" : "mySchedule")
    }

    const handleLogout = () => {
        setLoggedInUser(null)
        setCurrentView("login")
        setEditingShiftDetails(null)
    }

    const handleAddShift = (newShift: Omit<Shift, "id">, day: string) => {
        setDailySchedules((prevSchedules) =>
            prevSchedules.map((scheduleDay) =>
                scheduleDay.day === day
                    ? { ...scheduleDay, shifts: [...scheduleDay.shifts, { ...newShift, id: `shift${Date.now()}` }] }
                    : scheduleDay,
            ),
        )
        setCurrentView("generalSchedule")
    }

    const handleEditRequest = (shift: Shift, day: string) => {
        setEditingShiftDetails({ shift, day })
        setCurrentView("addShift")
    }

    const handleCancelEdit = () => {
        setEditingShiftDetails(null)
        setCurrentView("generalSchedule")
    }

    const handleUpdateShift = (updatedShift: Shift, originalDay: string, newSelectedDay: string) => {
        setDailySchedules((prevSchedules) => {
            let schedules = [...prevSchedules]

            // Удалить из старого дня, если день изменился
            if (originalDay !== newSelectedDay) {
                schedules = schedules.map((scheduleDay) => {
                    if (scheduleDay.day === originalDay) {
                        return {
                            ...scheduleDay,
                            shifts: scheduleDay.shifts.filter((s) => s.id !== updatedShift.id),
                        }
                    }
                    return scheduleDay
                })
            }

            // Добавить/обновить в новом (или том же) дне
            schedules = schedules.map((scheduleDay) => {
                if (scheduleDay.day === newSelectedDay) {
                    const shiftExists = scheduleDay.shifts.some((s) => s.id === updatedShift.id)
                    if (shiftExists) {
                        // Обновить существующую смену
                        return {
                            ...scheduleDay,
                            shifts: scheduleDay.shifts.map((s) => (s.id === updatedShift.id ? updatedShift : s)),
                        }
                    } else {
                        // Добавить как новую смену (если день изменился и ее там не было)
                        return {
                            ...scheduleDay,
                            shifts: [...scheduleDay.shifts, updatedShift],
                        }
                    }
                }
                return scheduleDay
            })
            return schedules
        })
        setEditingShiftDetails(null)
        setCurrentView("generalSchedule")
    }

    const handleDeleteShiftRequest = (shiftId: string, day: string) => {
        setShiftToDelete({ shiftId, day })
        setShowDeleteConfirm(true)
    }

    const confirmDeleteShift = () => {
        if (!shiftToDelete) return
        setDailySchedules((prevSchedules) =>
            prevSchedules.map((scheduleDay) =>
                scheduleDay.day === shiftToDelete.day
                    ? { ...scheduleDay, shifts: scheduleDay.shifts.filter((s) => s.id !== shiftToDelete.shiftId) }
                    : scheduleDay,
            ),
        )
        setShowDeleteConfirm(false)
        setShiftToDelete(null)
    }

    const userMyShifts = useMemo(() => {
        if (!loggedInUser) return []
        return dailySchedules.reduce(
            (acc, daySchedule) => [
                ...acc,
                ...daySchedule.shifts
                    .filter((shift) => shift.employeeId === loggedInUser.id)
                    .map((s) => ({ ...s, day: daySchedule.day })),
            ],
            [] as (Shift & { day: string })[],
        )
    }, [loggedInUser, dailySchedules])

    const renderView = () => {
        switch (currentView) {
            case "login":
                return <LoginPage onLogin={handleLogin} employees={employees} />
            case "generalSchedule":
                if (!loggedInUser) return <UnauthorizedAccess />
                return (
                    <GeneralSchedulePage
                        dailySchedules={dailySchedules}
                        employees={employees}
                        currentUserRole={loggedInUser.role}
                        onEditRequest={handleEditRequest}
                        onDeleteRequest={handleDeleteShiftRequest}
                    />
                )
            case "mySchedule":
                if (!loggedInUser) return <UnauthorizedAccess />
                return <MySchedulePage userShifts={userMyShifts} currentUser={loggedInUser} />
            case "addShift":
                if (loggedInUser?.role !== "manager") return <UnauthorizedAccess />
                return (
                    <AddShiftPage
                        onAddShift={handleAddShift}
                        onUpdateShift={handleUpdateShift}
                        employees={employees}
                        dailySchedules={dailySchedules}
                        shiftToEditDetails={editingShiftDetails}
                        onCancelEdit={handleCancelEdit}
                    />
                )
            default:
                return <LoginPage onLogin={handleLogin} employees={employees} />
        }
    }

    const AppContent = (
        <>
            <header className="bg-zinc-900 text-slate-100 p-5 flex justify-between items-center border-b border-zinc-800 shrink-0">
                <div className="flex items-center">
                    <Building className="w-6 h-6 mr-2.5 text-blue-500" />
                    <h1 className="text-xl font-bold tracking-tight">WorkSync</h1>
                </div>
                {loggedInUser && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-slate-400 hover:bg-zinc-800 hover:text-white rounded-full"
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                )}
            </header>

            <main className="flex-grow overflow-y-auto bg-zinc-900">{renderView()}</main>

            {loggedInUser && (
                <nav className="border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-2 shrink-0">
                    <div className="flex justify-around">
                        {loggedInUser.role === "manager" && (
                            <>
                                <NavButton
                                    icon={<Users />}
                                    label="Команда"
                                    isActive={currentView === "generalSchedule"}
                                    onClick={() => {
                                        handleCancelEdit() // Ensure edit mode is cancelled
                                        setCurrentView("generalSchedule")
                                    }}
                                />
                                <NavButton
                                    icon={<PlusCircle />}
                                    label={editingShiftDetails ? "Изменить" : "Добавить"}
                                    isActive={currentView === "addShift"}
                                    onClick={() => {
                                        // If not editing, cancel any potential stale edit state
                                        if (!editingShiftDetails) handleCancelEdit()
                                        setCurrentView("addShift")
                                    }}
                                />
                            </>
                        )}
                        <NavButton
                            icon={<User />}
                            label="Мой график"
                            isActive={currentView === "mySchedule"}
                            onClick={() => {
                                handleCancelEdit()
                                setCurrentView("mySchedule")
                            }}
                        />
                        {loggedInUser.role === "employee" && (
                            <NavButton
                                icon={<Users />}
                                label="Команда"
                                isActive={currentView === "generalSchedule"}
                                onClick={() => {
                                    handleCancelEdit()
                                    setCurrentView("generalSchedule")
                                }}
                            />
                        )}
                    </div>
                </nav>
            )}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-zinc-800 border-zinc-700 text-slate-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Вы уверены, что хотите удалить эту смену? Это действие необратимо.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setShiftToDelete(null)}
                            className="bg-zinc-700 hover:bg-zinc-600 text-slate-100 border-zinc-600"
                        >
                            Отмена
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteShift} className="bg-red-600 hover:bg-red-700 text-white">
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )

    return (
        <div className="min-h-screen bg-zinc-900 md:bg-slate-900 md:py-8 md:flex md:justify-center md:items-center">
            <div
                className={cn(
                    "w-full flex flex-col bg-zinc-900",
                    "h-screen",
                    "md:h-[780px] md:w-[385px] md:max-h-[90vh]",
                    "md:shadow-2xl md:rounded-[40px] md:overflow-hidden",
                    "md:border-4 md:border-zinc-700",
                )}
            >
                {AppContent}
            </div>
        </div>
    )
}

function GeneralSchedulePage({
    dailySchedules,
    employees,
    currentUserRole,
    onEditRequest,
    onDeleteRequest,
}: {
    dailySchedules: DailySchedule[]
    employees: Employee[]
    currentUserRole: Employee["role"]
    onEditRequest: (shift: Shift, day: string) => void
    onDeleteRequest: (shiftId: string, day: string) => void
}) {
    const dayNameToShort = {
        Понедельник: "Пн",
        Вторник: "Вт",
        Среда: "Ср",
        Четверг: "Чт",
        Пятница: "Пт",
        Суббота: "Сб",
        Воскресенье: "Вс",
    }

    const getEmployeeById = (employeeId: string, employeesList: Employee[]): Employee | undefined => {
        return employeesList.find((employee) => employee.id === employeeId)
    }

    const defaultTabValue = dayNameToShort[dailySchedules[0]?.day] || "Пн"

    return (
        <div className="p-3">
            <Tabs defaultValue={defaultTabValue} className="w-full">
                <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 mb-4 bg-zinc-800 p-1 rounded-xl">
                    {dailySchedules.map((ds) => (
                        <TabsTrigger
                            key={ds.day}
                            value={dayNameToShort[ds.day]}
                            className="text-xs px-1 text-slate-400 data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg"
                        >
                            {dayNameToShort[ds.day]}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {dailySchedules.map((dailySchedule) => (
                    <TabsContent key={dailySchedule.day} value={dayNameToShort[dailySchedule.day]}>
                        <h2 className="text-lg font-bold mb-4 text-slate-200 px-2">{dailySchedule.day}</h2>
                        {dailySchedule.shifts.length === 0 ? (
                            <div className="text-center py-10 px-4 bg-zinc-800 rounded-lg">
                                <p className="text-slate-400">Нет запланированных смен.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dailySchedule.shifts.map((shift) => {
                                    const employee = getEmployeeById(shift.employeeId, employees)
                                    const empColor = employee ? employeeColors[employee.id] : "bg-slate-500"
                                    return (
                                        <Card key={shift.id} className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-md">
                                            <CardContent className="p-4">
                                                <div className="flex items-start space-x-4">
                                                    <Avatar className="w-11 h-11 mt-1 shrink-0">
                                                        <AvatarImage src={employee?.avatarUrl || "/placeholder.svg"} alt={employee?.name} />
                                                        <AvatarFallback className={cn(empColor, "text-white font-bold")}>
                                                            {employee?.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-base text-slate-100">{employee?.name}</p>
                                                        <p className="text-sm text-slate-400 mt-1">{shift.task}</p>
                                                        <div className="flex items-center text-xs text-blue-400 mt-2 font-mono">
                                                            <Clock className="w-3 h-3 mr-1.5" />
                                                            {shift.startTime} - {shift.endTime}
                                                        </div>
                                                    </div>
                                                    {currentUserRole === "manager" && (
                                                        <div className="flex flex-col space-y-2 shrink-0">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                                                                onClick={() => onEditRequest(shift, dailySchedule.day)}
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                                                onClick={() => onDeleteRequest(shift.id, dailySchedule.day)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

function AddShiftPage({
    onAddShift,
    onUpdateShift,
    employees,
    dailySchedules,
    shiftToEditDetails,
    onCancelEdit,
}: {
    onAddShift: (shift: Omit<Shift, "id">, day: string) => void
    onUpdateShift: (updatedShift: Shift, originalDay: string, newSelectedDay: string) => void
    employees: Employee[]
    dailySchedules: DailySchedule[]
    shiftToEditDetails: EditingShiftDetails
    onCancelEdit: () => void
}) {
    const isEditing = !!shiftToEditDetails

    const [employeeId, setEmployeeId] = useState<string>(isEditing ? shiftToEditDetails.shift.employeeId : "")
    const [day, setDay] = useState<string>(isEditing ? shiftToEditDetails.day : dailySchedules[0]?.day || "")
    const [startTime, setStartTime] = useState<string>(isEditing ? shiftToEditDetails.shift.startTime : "09:00")
    const [endTime, setEndTime] = useState<string>(isEditing ? shiftToEditDetails.shift.endTime : "17:00")
    const [task, setTask] = useState<string>(isEditing ? shiftToEditDetails.shift.task : "")

    // Update form fields if shiftToEditDetails changes (e.g., user clicks edit on another shift)
    React.useEffect(() => {
        if (isEditing) {
            setEmployeeId(shiftToEditDetails.shift.employeeId)
            setDay(shiftToEditDetails.day)
            setStartTime(shiftToEditDetails.shift.startTime)
            setEndTime(shiftToEditDetails.shift.endTime)
            setTask(shiftToEditDetails.shift.task)
        } else {
            // Reset form for adding new shift
            setEmployeeId("")
            setDay(dailySchedules[0]?.day || "")
            setStartTime("09:00")
            setEndTime("17:00")
            setTask("")
        }
    }, [shiftToEditDetails, isEditing, dailySchedules])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!employeeId || !day || !task) {
            alert("Пожалуйста, заполните все обязательные поля.")
            return
        }
        if (isEditing) {
            onUpdateShift(
                { id: shiftToEditDetails.shift.id, employeeId, startTime, endTime, task },
                shiftToEditDetails.day, // original day
                day, // new selected day
            )
        } else {
            onAddShift({ employeeId, startTime, endTime, task }, day)
        }
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-100">{isEditing ? "Изменить смену" : "Новая смена"}</h2>
                {isEditing && (
                    <Button variant="ghost" size="icon" onClick={onCancelEdit} className="text-slate-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="employee" className="font-medium text-slate-300">
                        Сотрудник
                    </Label>
                    <Select onValueChange={setEmployeeId} value={employeeId}>
                        <SelectTrigger
                            id="employee"
                            className="mt-2 bg-zinc-800 border-zinc-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        >
                            <SelectValue placeholder="Выберите сотрудника" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-slate-100">
                            {employees
                                .filter((e) => e.role === "employee")
                                .map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id} className="focus:bg-blue-500/20">
                                        {emp.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="day" className="font-medium text-slate-300">
                        День
                    </Label>
                    <Select onValueChange={setDay} value={day}>
                        <SelectTrigger
                            id="day"
                            className="mt-2 bg-zinc-800 border-zinc-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        >
                            <SelectValue placeholder="Выберите день" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700 text-slate-100">
                            {dailySchedules.map((ds) => (
                                <SelectItem key={ds.day} value={ds.day} className="focus:bg-blue-500/20">
                                    {ds.day}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="startTime" className="font-medium text-slate-300">
                            Начало
                        </Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-2 bg-zinc-800 border-zinc-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                    </div>
                    <div>
                        <Label htmlFor="endTime" className="font-medium text-slate-300">
                            Конец
                        </Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="mt-2 bg-zinc-800 border-zinc-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="task" className="font-medium text-slate-300">
                        Задача
                    </Label>
                    <Input
                        id="task"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder="Например, Встреча с клиентом"
                        className="mt-2 bg-zinc-800 border-zinc-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                >
                    {isEditing ? "Сохранить изменения" : "Добавить смену"}
                </Button>
                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancelEdit}
                        className="w-full text-base font-semibold text-slate-300 border-zinc-700 hover:bg-zinc-700 hover:text-slate-100 py-3 rounded-lg"
                    >
                        Отмена
                    </Button>
                )}
            </form>
        </div>
    )
}

// Компоненты NavButton, UnauthorizedAccess, LoginPage, MySchedulePage остаются без изменений
// из предыдущего ответа. Я их здесь опущу для краткости.
const NavButton = ({
    icon,
    label,
    isActive,
    onClick,
}: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) => (
    <Button
        variant="ghost"
        className={cn(
            "flex flex-col items-center h-auto p-2 flex-1 rounded-xl transition-colors duration-200 ease-in-out",
            isActive ? "text-blue-500" : "text-slate-400 hover:bg-zinc-800 hover:text-slate-200",
        )}
        onClick={onClick}
    >
        <div className="w-6 h-6 mb-1">{icon}</div>
        <span className="text-xs font-medium">{label}</span>
    </Button>
)

function UnauthorizedAccess() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <ShieldX className="w-16 h-16 text-red-500/80 mb-6" />
            <h2 className="text-xl font-semibold text-slate-200 mb-2">Доступ запрещен</h2>
            <p className="text-slate-400">У вас нет необходимых прав для этого раздела.</p>
        </div>
    )
}

function LoginPage({ onLogin, employees }: { onLogin: (user: Employee) => void; employees: Employee[] }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = () => {
        const user = employees.find((emp) => emp.username === username)
        if (user && user.password === password) {
            onLogin(user)
        } else {
            setError("Неверное имя пользователя или пароль.")
        }
    }

    return (
        <div className="flex flex-col justify-center h-full p-8">
            <div className="text-center mb-10">
                <Building className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-100">WorkSync</h2>
                <p className="text-slate-400 mt-1">Войдите в свой аккаунт</p>
            </div>
            <div className="space-y-6">
                <div>
                    <Label htmlFor="username" className="font-medium text-slate-300">
                        Имя пользователя
                    </Label>
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="manager_alice"
                        className="mt-2 bg-zinc-800 border-zinc-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                </div>
                <div>
                    <Label htmlFor="password" className="font-medium text-slate-300">
                        Пароль
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="mt-2 bg-zinc-800 border-zinc-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <Button
                    onClick={handleSubmit}
                    className="w-full text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                >
                    Войти
                </Button>
            </div>
        </div>
    )
}

function MySchedulePage({
    userShifts,
    currentUser,
}: { userShifts: (Shift & { day: string })[]; currentUser: Employee }) {
    return (
        <div className="p-3">
            <div className="mb-6 p-4">
                <h2 className="text-2xl font-bold text-slate-100">Мой график</h2>
                <p className="text-slate-400">{currentUser.name}</p>
            </div>

            {userShifts.length === 0 ? (
                <div className="text-center py-10 px-4 bg-zinc-800 rounded-lg">
                    <p className="text-slate-400">У вас нет назначенных смен.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {userShifts.map((shift) => (
                        <Card
                            key={shift.id}
                            className="bg-gradient-to-br from-blue-600/20 to-zinc-800 bg-zinc-800 border border-blue-500/30 rounded-xl shadow-lg"
                        >
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base font-semibold text-slate-100">{shift.task}</CardTitle>
                                <CardDescription className="text-sm text-slate-400 pt-1">{shift.day}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <div className="flex items-center text-sm text-blue-400 font-medium">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {shift.startTime} - {shift.endTime}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
