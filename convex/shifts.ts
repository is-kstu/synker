import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get shifts with optional filters
export const getShifts = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // For demo purposes, create a mock user
    const currentUser = {
      _id: "mock-user" as any,
      role: "manager" as "manager" | "employee",
    };

    let shifts;

    // If employee, can only see their own shifts
    if (currentUser.role === "employee") {
      shifts = await ctx.db
        .query("shifts")
        .withIndex("by_employee", (q) => q.eq("employeeId", currentUser._id))
        .collect();
    } else if (args.userId) {
      // Manager can filter by specific user
      shifts = await ctx.db
        .query("shifts")
        .withIndex("by_employee", (q) => q.eq("employeeId", args.userId!))
        .collect();
    } else {
      shifts = await ctx.db.query("shifts").collect();
    }

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      shifts = shifts.filter((shift) => {
        if (args.startDate && shift.day < args.startDate) return false;
        if (args.endDate && shift.day > args.endDate) return false;
        return true;
      });
    }

    // Get user details for each shift
    const shiftsWithUsers = await Promise.all(
      shifts.map(async (shift) => {
        const user = await ctx.db.get(shift.employeeId);
        return {
          id: shift._id,
          employeeId: shift.employeeId,
          userName: user?.name || "Unknown",
          date: shift.day,
          startTime: shift.startTime,
          endTime: shift.endTime,
          task: shift.task,
          createdAt: shift._creationTime,
        };
      })
    );

    return shiftsWithUsers.sort((a, b) => a.date.localeCompare(b.date));
  },
});

// Get shift by ID
export const getShiftById = query({
  args: {
    shiftId: v.id("shifts"),
  },
  handler: async (ctx, args) => {
    // For demo purposes, create a mock user
    const currentUser = {
      _id: "mock-user" as any,
      role: "manager" as "manager" | "employee",
    };

    const shift = await ctx.db.get(args.shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }

    // Employees can only view their own shifts
    if (
      currentUser.role === "employee" &&
      shift.employeeId !== currentUser._id
    ) {
      throw new Error("Access denied");
    }

    const user = await ctx.db.get(shift.employeeId);

    return {
      id: shift._id,
      employeeId: shift.employeeId,
      userName: user?.name || "Unknown",
      date: shift.day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      task: shift.task,
      createdAt: shift._creationTime,
    };
  },
});

export const getShiftsByDay = query({
  args: {
    day: v.string(), // YYYY-MM-DD string
  },
  handler: async (ctx, args) => {
    // ... (implementation remains the same)
  },
});

// --- NEW AND IMPROVED QUERY ---
// Get all shifts within a given date range
export const getShiftsByDateRange = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // Fetch all shifts that fall within the start and end dates
    const shiftsInRange = await ctx.db
      .query("shifts")
      .withIndex("by_day", (q) =>
        q.gte("day", args.startDate).lte("day", args.endDate)
      )
      .collect();

    // For each shift, fetch the corresponding employee's name
    const shiftsWithEmployeeData = await Promise.all(
      shiftsInRange.map(async (shift) => {
        const employee = await ctx.db.get(shift.employeeId);
        return {
          ...shift, // Spread all original shift data
          employeeName: employee?.name ?? "Unknown Member",
        };
      })
    );

    return shiftsWithEmployeeData;
  },
});
// Get shifts for a specific employee
export const getShiftsByEmployee = query({
  args: {
    employeeId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const shifts = await ctx.db
      .query("shifts")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    return shifts.map((shift) => ({
      id: shift._id,
      employeeId: shift.employeeId,
      day: shift.day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      task: shift.task,
    }));
  },
});

// Create a new shift
export const createShift = mutation({
  args: {
    employeeId: v.id("users"),
    day: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    task: v.string(),
  },
  handler: async (ctx, args) => {
    // For demo purposes, skip auth check
    // In production, check if the user is a manager

    const shiftId = await ctx.db.insert("shifts", {
      employeeId: args.employeeId,
      day: args.day,
      startTime: args.startTime,
      endTime: args.endTime,
      task: args.task,
    });

    return shiftId;
  },
});

// Delete a shift
export const deleteShift = mutation({
  args: {
    shiftId: v.id("shifts"),
  },
  handler: async (ctx, args) => {
    // For demo purposes, skip auth check
    // In production, check if the user is a manager

    await ctx.db.delete(args.shiftId);
  },
});

// Update a shift
export const updateShift = mutation({
  args: {
    shiftId: v.id("shifts"),
    employeeId: v.optional(v.id("users")),
    day: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    task: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For demo purposes, skip auth check
    // In production, check if the user is a manager

    const updates: any = {};
    if (args.employeeId !== undefined) updates.employeeId = args.employeeId;
    if (args.day !== undefined) updates.day = args.day;
    if (args.startTime !== undefined) updates.startTime = args.startTime;
    if (args.endTime !== undefined) updates.endTime = args.endTime;
    if (args.task !== undefined) updates.task = args.task;

    await ctx.db.patch(args.shiftId, updates);
  },
});

// Helper to get the start of a given day in YYYY-MM-DD format
const getDayString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export const getShiftsForWeek = query({
  args: {
    // We'll pass the timestamp for the start of the week from the client
    startOfWeekMs: v.number(),
  },
  handler: async (ctx, args) => {
    const startOfWeek = new Date(args.startOfWeekMs);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    // Convert dates to YYYY-MM-DD strings to match the schema
    const startDateString = getDayString(startOfWeek);
    const endDateString = getDayString(endOfWeek);

    // Query shifts within the date range using string comparison
    const shiftsInWeek = await ctx.db
      .query("shifts")
      .withIndex("by_day", (q) =>
        q
          .gte("day", startDateString)
          .lt("day", endDateString)
      )
      .collect();

    // Now, we fetch the user for each shift and combine the data.
    // This is more efficient than fetching users one-by-one in a loop.
    const shiftsWithEmployees = await Promise.all(
      shiftsInWeek.map(async (shift) => {
        const employee = await ctx.db.get(shift.employeeId);
        return {
          ...shift,
          // Safely add the employee name, or a fallback
          employeeName: employee?.name ?? "Unknown User",
        };
      })
    );

    return shiftsWithEmployees;
  },
});

// Migration to remove shifts with incorrect date format
export const migrateDateFormats = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all shifts
    const allShifts = await ctx.db.query("shifts").collect();
    
    let deletedCount = 0;
    
    for (const shift of allShifts) {
      // Check if the date format is dd.mm.yyyy (contains dots)
      if (shift.day.includes('.')) {
        await ctx.db.delete(shift._id);
        deletedCount++;
      }
    }
    
    return `Migration completed. Deleted ${deletedCount} shifts with incorrect date format.`;
  },
});
