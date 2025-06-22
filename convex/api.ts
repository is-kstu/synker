// convex/api.ts
import { createApi } from "convex/server";
import { getShiftsForWeek } from "./shifts";

export const api = createApi({
  queries: {
    getShiftsForWeek,
    // ...other queries
  },
  // ...mutations
});
