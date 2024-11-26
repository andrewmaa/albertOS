import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    isDemo: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    sessionId: v.optional(v.string()),
  }),
  
  courses: defineTable({
    name: v.string(),
    code: v.string(),
    instructor: v.string(),
    schedule: v.string(),
    location: v.string(),
    courseType: v.string(),
    section: v.string(),
    classNumber: v.string(),
    description: v.string(),
    subjectCode: v.string(),
    capacity: v.number(),
    enrolled: v.number(),
  }),

  cart: defineTable({
    userId: v.optional(v.id("users")),
    courseId: v.string(),
    name: v.string(),
    code: v.string(),
    instructor: v.string(),
    schedule: v.string(),
    location: v.string(),
    courseType: v.string(),
    section: v.string(),
    classNumber: v.string(),
    description: v.string(),
    subjectCode: v.string(),
    capacity: v.float64(),
    enrolled: v.float64(),
  }),

  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.string(),
  }),
}); 