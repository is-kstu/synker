import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    username: v.string(),
    password: v.string(),
    role: v.union(v.literal("manager"), v.literal("employee")),
    avatarUrl: v.optional(v.string()),
  })
    .index("by_username", ["username"])
    .index("by_role", ["role"]),
  shifts: defineTable({
    employeeId: v.id("users"),
    day: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    task: v.string(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_day", ["day"]),
});
