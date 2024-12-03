import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// API constants
const API_BASE = "https://nyu.a1liu.com";
const TERM = "fa2022";

// Helper function to get or create a session user
async function getCurrentSessionUser(ctx: any, sessionId: string | undefined) {
  if (!sessionId) {
    // Create a new demo user
    const userId = await ctx.db.insert("users", {
      name: `Demo User ${Date.now()}`,
      email: `demo_${Date.now()}@example.com`,
      isDemo: true,
      createdAt: Date.now(),
      sessionId: Date.now().toString(),
    });
    return userId;
  }

  // Get existing user by sessionId
  const user = await ctx.db
    .query("users")
    .filter((q: any) => 
      q.and(
        q.eq(q.field("isDemo"), true),
        q.eq(q.field("sessionId"), sessionId)
      )
    )
    .first();

  if (user) {
    return user._id;
  }

  // Create new user if none found
  return await ctx.db.insert("users", {
    name: `Demo User ${Date.now()}`,
    email: `demo_${Date.now()}@example.com`,
    isDemo: true,
    createdAt: Date.now(),
    sessionId: sessionId,
  });
}

// Add interfaces for the API response
interface Meeting {
  beginDate: string;
  minutesDuration: number;
  endDate: string;
  beginDateLocal: string;
  endDateLocal: string;
}

interface Section {
  registrationNumber: string;
  code: string;
  instructors: string[];
  type: string;
  meetings: Meeting[];
  location: string;
  maxUnits: number;
  minUnits: number;
  status: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  sections: {
    instructor: string;
    schedule: string;
    location: string;
    courseType: string;
    section: string;
    classNumber: string;
    status: string;
  }[];
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
}

export const searchCourses = action({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    try {
      const apiUrl = `${API_BASE}/api/search/${TERM}?query=${encodeURIComponent(searchTerm)}`;
      console.log(`Fetching: ${apiUrl}`);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const courses = await response.json();
      
      return courses
        .map((course: any) => {
          // Process sections
          const sections = (course.sections || []).map((section: Section) => {
            const meetings = section.meetings || [];
            
            // Format schedule from meetings
            let schedule = "TBA";
            if (meetings.length > 0) {
              const days = meetings.map((meeting: Meeting) => {
                const date = new Date(meeting.beginDate);
                const day = date.getUTCDay();
                return day === 1 ? 'M' : 
                       day === 2 ? 'T' : 
                       day === 3 ? 'W' : 
                       day === 4 ? 'Th' : 
                       day === 5 ? 'F' : '';
              }).filter(Boolean).join(' ');

              const firstMeeting = meetings[0];
              const beginTime = new Date(firstMeeting.beginDate).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              
              const beginDate = new Date(firstMeeting.beginDate);
              const endDate = new Date(beginDate.getTime() + firstMeeting.minutesDuration * 60000);
              const endTime = endDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });

              schedule = `${days} ${beginTime} - ${endTime}`;
            }

            return {
              instructor: section.instructors?.length > 0 ? section.instructors.join(", ") : "TBA",
              schedule,
              location: section.location || "TBA",
              courseType: section.type || "In-Person",
              section: section.code || "001",
              classNumber: section.registrationNumber?.toString() || "",
              status: section.status || "Open"
            };
          });

          return {
            _id: course.deptCourseId?.toString(),
            name: course.name,
            code: `${course.subjectCode} ${course.deptCourseId}`,
            description: course.description || "No description available",
            sections
          };
        })
        .sort((a: Course, b: Course) => {
          const aId = parseInt(a.code.split(' ')[1]);
          const bId = parseInt(b.code.split(' ')[1]);
          return aId - bId;
        });

    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  },
});

export const addToCart = mutation({
  args: {
    course: v.object({
      courseId: v.string(),
      description: v.string(),
      name: v.string(),
      code: v.string(),
      instructor: v.string(),
      schedule: v.string(),
      location: v.string(),
      courseType: v.string(),
      section: v.string(),
      classNumber: v.string(),
      subjectCode: v.string(),
      capacity: v.number(),
      enrolled: v.number(),
    }),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, { course, sessionId }) => {
    try {
      const userId = await getCurrentSessionUser(ctx, sessionId);
      console.log("Using session user:", userId);

      // Check if course already exists in cart
      const existingItem = await ctx.db
        .query("cart")
        .filter((q) => 
          q.and(
            q.eq(q.field("userId"), userId),
            q.eq(q.field("classNumber"), course.classNumber)
          )
        )
        .first();

      if (existingItem) {
        console.log("Course already in cart");
        return existingItem;
      }

      // Add to cart with the session user ID
      const cartItem = await ctx.db.insert("cart", {
        userId,
        courseId: course.courseId,
        name: course.name,
        code: course.code,
        instructor: course.instructor,
        schedule: course.schedule,
        location: course.location,
        courseType: course.courseType,
        section: course.section,
        classNumber: course.classNumber,
        description: course.description,
        subjectCode: course.subjectCode,
        capacity: course.capacity,
        enrolled: course.enrolled,
      });

      console.log("Added to cart:", cartItem);
      return cartItem;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },
});

export const getCartItems = query({
  args: { sessionId: v.optional(v.string()) },
  handler: async (ctx, { sessionId }) => {
    if (!sessionId) {
      console.log("No session ID provided");
      return [];
    }

    // Get user by sessionId
    const user = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("isDemo"), true),
          q.eq(q.field("sessionId"), sessionId)
        )
      )
      .first();
    
    if (!user) {
      console.log("No user found for session");
      return [];
    }

    const items = await ctx.db
      .query("cart")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    console.log("Retrieved cart items for session:", { sessionId, items });
    return items;
  },
});

export const removeFromCart = mutation({
  args: { 
    courseId: v.string(),
    sessionId: v.optional(v.string())
  },
  handler: async (ctx, { courseId, sessionId }) => {
    if (!sessionId) {
      console.log("No session ID provided");
      return false;
    }

    // Get user by sessionId
    const user = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("isDemo"), true),
          q.eq(q.field("sessionId"), sessionId)
        )
      )
      .first();
    
    if (!user) {
      console.log("No user found for session");
      return false;
    }

    // Find and delete the cart item
    const cartItems = await ctx.db
      .query("cart")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("classNumber"), courseId)
        )
      )
      .collect();

    console.log("Found cart items to remove:", cartItems);

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
      console.log("Deleted cart item:", item._id);
    }

    return true;
  },
});

export const validateSchedule = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Get all cart items
      const cartItems = await ctx.db.query("cart").collect();
      if (!cartItems?.length) return { valid: false, error: "Cart is empty" };

      // Check for duplicate courses
      const courseIds = cartItems.map(item => item.code);
      const uniqueCourseIds = new Set(courseIds);
      if (courseIds.length !== uniqueCourseIds.size) {
        return {
          valid: false,
          error: "Cannot enroll in multiple sections of the same course"
        };
      }

      // Check for time conflicts
      for (let i = 0; i < cartItems.length; i++) {
        for (let j = i + 1; j < cartItems.length; j++) {
          const schedule1 = parseSchedule(cartItems[i].schedule);
          const schedule2 = parseSchedule(cartItems[j].schedule);

          if (hasTimeConflict(schedule1, schedule2)) {
            return {
              valid: false,
              error: `Time conflict between ${cartItems[i].name} and ${cartItems[j].name}`
            };
          }
        }
      }

      return {
        valid: true,
        message: "Schedule validated successfully!"
      };
    } catch (error) {
      return {
        valid: false,
        error: "Failed to validate schedule"
      };
    }
  }
});

// Helper functions
interface ParsedSchedule {
  days: string[];
  startTime: number;
  endTime: number;
}

function parseSchedule(schedule: string): ParsedSchedule {
  // Example schedule: "M W 12:00 PM - 1:15 PM"
  const [daysStr, timeStr] = schedule.split(' ', 2);
  const days = daysStr.split(' ');
  
  const [startStr, endStr] = timeStr.split(' - ');
  const startTime = new Date(`1970/01/01 ${startStr}`).getTime();
  const endTime = new Date(`1970/01/01 ${endStr}`).getTime();

  return { days, startTime, endTime };
}

function hasTimeConflict(schedule1: ParsedSchedule, schedule2: ParsedSchedule): boolean {
  // Check if any days overlap
  const commonDays = schedule1.days.filter(day => schedule2.days.includes(day));
  if (commonDays.length === 0) return false;

  // Check if times overlap
  return !(
    schedule1.endTime <= schedule2.startTime ||
    schedule2.endTime <= schedule1.startTime
  );
}

export const getRegisteredCourses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;
    
    const enrollments = await ctx.db
      .query("enrollments")
      .filter((q) => q.eq(q.field("userId"), userId as Id<"users">))
      .collect();

    // Since courseId is now a string, we need to query courses differently
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await ctx.db
          .query("courses")
          .filter((q) => q.eq(q.field("_id"), enrollment.courseId))
          .first();
        return course;
      })
    );

    return courses.filter((course): course is NonNullable<typeof course> => 
      course !== null
    );
  },
}); 