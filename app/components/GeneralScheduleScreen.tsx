import React, { useMemo, useState } from "react";

// --- Interfaces and Icon Components remain the same ---

interface Shift {
  member: string;
  shift: string;
  time: string;
}

// This interface represents the raw data from your Convex query
interface FetchedShift {
  _id: string;
  employeeId: string;
  employeeName: string; // Added from our updated query
  day: string;
  startTime: string;
  endTime: string;
  task: string;
}

// This is the shape of the prop coming from the parent component
interface DailySchedule {
  day: string;
  shifts: FetchedShift[];
}

interface GeneralScheduleScreenProps {
  dailySchedules: DailySchedule[];
  // You passed this prop, so we'll add it.
  // You can use it for conditional rendering (e.g., edit buttons for managers)
  currentUserRole?: "manager" | "employee";
}

const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

// --- Main Component ---
export default function GeneralScheduleScreen({
  dailySchedules,
}: GeneralScheduleScreenProps) {
  // We can initialize the date to today or a specific start date
  const [currentWeek, setCurrentWeek] = useState(new Date("2025-07-15"));

  // --- NEW: Transform prop data into the component's desired format ---
  const scheduleMap = useMemo(() => {
    const map: { [date: string]: Shift[] } = {};
    if (!dailySchedules) return map;

    for (const daySchedule of dailySchedules) {
      if (daySchedule.shifts && daySchedule.shifts.length > 0) {
        // The key is the date string, e.g., "2025-07-16"
        map[daySchedule.day] = daySchedule.shifts.map((s) => ({
          // Map the fetched data to the component's internal `Shift` interface
          member: s.employeeName,
          shift: s.task, // Assuming 'task' corresponds to the shift name
          time: `${s.startTime}-${s.endTime}`,
        }));
      }
    }
    return map;
  }, [dailySchedules]);

  // --- Date and Schedule Logic (mostly unchanged) ---
  const getWeekDates = (startDate: Date): Date[] => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    // getMonth() is 0-indexed, so we add 1. Pad with a '0' if it's a single digit.
    const month = String(date.getMonth() + 1).padStart(2, "0");
    // Pad with a '0' if it's a single digit.
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const formatDayHeader = (date: Date): string =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const weekDates = getWeekDates(currentWeek);
  // MODIFIED: Use the new `scheduleMap`
  const weekHasShifts = weekDates.some(
    (date) => (scheduleMap[formatDateKey(date)] || []).length > 0
  );

  // --- Render Functions for UI components (mostly unchanged) ---
  const renderHeader = () => (
    <div style={styles.header}>
      <div style={styles.headerContent}>
        <h1 style={styles.headerTitle}>Weekly Schedule</h1>
        <p style={styles.headerSubtitle}>
          Review and manage the team's upcoming shifts.
        </p>
      </div>
    </div>
  );

  const renderWeekSelector = () => (
    <div style={styles.weekSelector}>
      <button style={styles.weekArrow} onClick={() => navigateWeek("prev")}>
        <ChevronLeftIcon />
      </button>
      <div style={styles.weekInfo}>
        <span style={styles.weekTitle}>
          {currentWeek.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <span style={styles.weekSubtitle}>
          {`Week of ${currentWeek.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`}
        </span>
      </div>
      <button style={styles.weekArrow} onClick={() => navigateWeek("next")}>
        <ChevronRightIcon />
      </button>
    </div>
  );

  const renderSchedule = () => (
    <div style={styles.scrollContainer}>
      {!weekHasShifts ? (
        <div style={styles.emptyWeekCard}>
          <p style={styles.emptyWeekText}>
            There are no shifts scheduled for this week.
          </p>
        </div>
      ) : (
        weekDates.map((date) => {
          const dateKey = formatDateKey(date);
          // MODIFIED: Use the new `scheduleMap`
          const daySchedule = scheduleMap[dateKey] || [];
          if (daySchedule.length === 0) return null;

          return (
            <div key={dateKey} style={styles.daySection}>
              <h2 style={styles.dayHeader}>{formatDayHeader(date)}</h2>
              {daySchedule.map((shift, index) => (
                <div key={index} style={styles.shiftCard}>
                  <h3 style={styles.shiftTitle}>{shift.member}</h3>
                  <div style={styles.timeContainer}>
                    <ClockIcon />
                    <span style={styles.timeText}>
                      {shift.shift} • {shift.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {renderHeader()}
      {renderWeekSelector()}
      {renderSchedule()}
    </div>
  );
}

// --- Style Definitions (remain the same) ---
const colors = {
  background: "#0D1117",
  backgroundLight: "#161B22",
  text: {
    primary: "#C9D1D9",
    secondary: "#8B949E",
    accent: "#58A6FF",
  },
  border: "#30363D",
};

const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    xxl: 24,
  },
  weights: {
    regular: "400",
    semibold: "600",
    bold: "700",
  },
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: colors.background,
    color: colors.text.primary,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: 12,
    maxWidth: 600,
    margin: "0 auto",
  },
  header: {
    padding: 12,
    flexShrink: 0,
  },
  headerContent: {
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: "#ffffff",
    marginBottom: 4,
    margin: 0,
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    fontWeight: typography.weights.regular,
    margin: 0,
  },
  weekSelector: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 20px",
    backgroundColor: colors.backgroundLight,
    margin: "0 16px",
    borderRadius: 16,
    marginBottom: 20,
    flexShrink: 0,
  },
  weekArrow: {
    padding: 8,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.text.accent,
    display: "flex",
    alignItems: "center",
  },
  weekInfo: {
    flex: 1,
    textAlign: "center",
  },
  weekTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.accent,
    display: "block",
    marginBottom: 2,
  },
  weekSubtitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.text.secondary,
    display: "block",
  },
  scrollContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "0 16px",
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginBottom: 12,
    textTransform: "capitalize",
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: 8,
  },
  shiftCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 16,
    padding: "18px 20px",
    marginBottom: 12,
    backgroundColor: colors.backgroundLight,
  },
  shiftTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 12,
    margin: 0,
  },
  timeContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.accent,
    fontWeight: typography.weights.regular,
  },
  emptyWeekCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 32,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyWeekText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
};
