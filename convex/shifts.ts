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
    const currentUser = { _id: "mock-user" as any, role: "manager" as "manager" | "employee" };

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
      shifts = shifts.filter(shift => {
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
    const currentUser = { _id: "mock-user" as any, role: "manager" as "manager" | "employee" };

    const shift = await ctx.db.get(args.shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }

    // Employees can only view their own shifts
    if (currentUser.role === "employee" && shift.employeeId !== currentUser._id) {
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

// Get all shifts for a specific day
export const getShiftsByDay = query({
  args: {
    day: v.string(),
  },
  handler: async (ctx, args) => {
    const shifts = await ctx.db
      .query("shifts")
      .withIndex("by_day", (q) => q.eq("day", args.day))
      .collect();

    return shifts.map(shift => ({
      id: shift._id,
      employeeId: shift.employeeId,
      day: shift.day,
      startTime: shift.startTime,
      endTime: shift.endTime,
      task: shift.task,
    }));
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

    return shifts.map(shift => ({
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
