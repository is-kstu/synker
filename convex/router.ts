import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Auth endpoints
http.route({
  path: "/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { username, password } = body;

      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: "Username and password are required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const user = await ctx.runMutation(api.users.loginUser, { username, password });
      
      // In a real app, you'd generate a JWT token here
      const token = `mock-jwt-token-${user.id}`;

      return new Response(
        JSON.stringify({ token, user }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Login failed" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

http.route({
  path: "/auth/me",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      // In a real app, you'd verify the JWT token from the Authorization header
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Authorization token required" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      const user = await ctx.runQuery(api.users.getCurrentUser, {});
      if (!user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ user }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Failed to get user" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Users endpoints
http.route({
  path: "/users",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const role = url.searchParams.get("role");
      
      const users = await ctx.runQuery(api.users.getUsers, {
        role: role as "manager" | "employee" | undefined,
      });

      return new Response(
        JSON.stringify(users),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Failed to get users" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

http.route({
  path: "/users",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { name, username, password, role, avatarUrl } = body;

      const userId = await ctx.runMutation(api.users.createUser, {
        name,
        username,
        password,
        role,
        avatarUrl,
      });

      return new Response(
        JSON.stringify({ id: userId }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create user" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Shifts endpoints
http.route({
  path: "/shifts",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const userId = url.searchParams.get("userId");

      const shifts = await ctx.runQuery(api.shifts.getShifts, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        userId: userId ? (userId as any) : undefined,
      });

      return new Response(
        JSON.stringify(shifts),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Failed to get shifts" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

http.route({
  path: "/shifts",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { employeeId, day, startTime, endTime, task } = body;

      const shiftId = await ctx.runMutation(api.shifts.createShift, {
        employeeId,
        day,
        startTime,
        endTime,
        task,
      });

      return new Response(
        JSON.stringify({ id: shiftId }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create shift" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
