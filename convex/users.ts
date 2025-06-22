import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const authUser = await ctx.db.get(userId);
    if (!authUser) {
      return null;
    }

    // For now, return a mock user since we're using simple auth
    // In production, you'd link this to the auth system properly
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), "manager"))
      .first();

    return user;
  },
});

// Login with username/password
export const loginUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user || user.password !== args.password) {
      throw new Error("Invalid credentials");
    }

    return {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  },
});

// Get all users (managers only) or filter by role
export const getUsers = query({
  args: {
    role: v.optional(v.union(v.literal("manager"), v.literal("employee"))),
  },
  handler: async (ctx, args) => {
    // For demo purposes, skip auth check
    // In production, implement proper authentication

    let users;
    
    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }
    return users.map(user => ({
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user._creationTime,
    }));
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // For demo purposes, skip auth check

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user._creationTime,
    };
  },
});

// Create user (managers only)
export const createUser = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    password: v.string(),
    role: v.union(v.literal("manager"), v.literal("employee")),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For demo purposes, skip auth check

    // Check if username already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUser) {
      throw new Error("Username already exists");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      username: args.username,
      password: args.password, // In production, hash this
      role: args.role,
      avatarUrl: args.avatarUrl,
    });

    return userId;
  },
});

// Update user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    role: v.optional(v.union(v.literal("manager"), v.literal("employee"))),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For demo purposes, skip auth check

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check username uniqueness if updating username
    if (args.username && args.username !== user.username) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username!))
        .first();

      if (existingUser) {
        throw new Error("Username already exists");
      }
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.username !== undefined) updates.username = args.username;
    if (args.password !== undefined) updates.password = args.password;
    if (args.role !== undefined) updates.role = args.role;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(args.userId, updates);
    return args.userId;
  },
});

// Initialize with mock data
export const initializeMockData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      return "Mock data already exists";
    }

    // Create manager
    const managerId = await ctx.db.insert("users", {
      name: "Иван Менеджер",
      username: "менеджер",
      password: "password123",
      role: "manager",
    });

    // Create employees
    const employee1Id = await ctx.db.insert("users", {
      name: "Алиса Сотрудник",
      username: "алиса",
      password: "password123",
      role: "employee",
    });

    const employee2Id = await ctx.db.insert("users", {
      name: "Борис Сотрудник",
      username: "борис",
      password: "password123",
      role: "employee",
    });

    // Create some sample shifts
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await ctx.db.insert("shifts", {
      employeeId: employee1Id,
      day: today.toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "17:00",
      task: "Поддержка клиентов",
    });

    await ctx.db.insert("shifts", {
      employeeId: employee2Id,
      day: tomorrow.toISOString().split('T')[0],
      startTime: "10:00",
      endTime: "18:00",
      task: "Ввод данных",
    });

    return "Mock data initialized successfully";
  },
});
