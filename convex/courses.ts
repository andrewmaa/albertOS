import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// API constants
const SCHEDGE_API = "https://schedge.a1liu.com";
const TERM_YEAR = "2022";
const TERM_SEMESTER = "fa";
const TERM = `${TERM_YEAR}/${TERM_SEMESTER}`;

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

export const searchCourses = action({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    try {
      const [subject, school] = searchTerm.split("-");
      if (!subject || !school) return [];

      const apiUrl = `${SCHEDGE_API}/${TERM}/${school}/${subject}?full=true`;
      console.log(`Fetching: ${apiUrl}`);

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const courses = await response.json();
      console.log("Raw API response:", courses); // Debug log
      
      return courses
        .map((course: any) => {
          const section = course.sections?.[0] || {};
          console.log("Processing section:", section); // Debug log
          
          // Format schedule
          let scheduleString = "TBA";
          if (section.meetings && Array.isArray(section.meetings) && section.meetings.length > 0) {
            const validMeetings = section.meetings.filter((meeting: any) => 
              meeting && meeting.beginDate && meeting.minutesDuration
            );

            if (validMeetings.length > 0) {
              scheduleString = validMeetings
                .map((meeting: any) => {
                  try {
                    // Parse the beginDate string
                    const date = new Date(meeting.beginDate);
                    // Get day of week (Mon, Tue, etc.)
                    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                    
                    // Parse time from the string (assuming format "2022-09-01 12:30:00")
                    const timeStr = meeting.beginDate.split(' ')[1];
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    
                    // Calculate end time
                    const endMinutes = minutes + meeting.minutesDuration;
                    const endHours = hours + Math.floor(endMinutes / 60);
                    const finalMinutes = endMinutes % 60;

                    // Format times
                    const formatTime = (h: number, m: number) => {
                      const period = h >= 12 ? 'PM' : 'AM';
                      const hour = h % 12 || 12;
                      return `${hour}:${m.toString().padStart(2, '0')}${period}`;
                    };

                    const startTime = formatTime(hours, minutes);
                    const endTime = formatTime(endHours, finalMinutes);

                    return `${day} ${startTime}-${endTime}`;
                  } catch (error) {
                    console.error("Error formatting meeting:", error, meeting);
                    return null;
                  }
                })
                .filter(Boolean)
                .join(", ");
            }
          }

          // Format location
          const location = section.location || "TBA";

          console.log("Formatted schedule:", scheduleString); // Debug log
          console.log("Formatted location:", location); // Debug log

          return {
            _id: section.registrationNumber?.toString(),
            name: course.name,
            code: `${subject}-${school}-${course.deptCourseId}`,
            description: course.description || "No description available",
            instructor: (section.instructors || []).join(", ") || "TBA",
            schedule: scheduleString,
            location: location,
            courseType: section.type || "In-Person",
            section: section.code || "001",
            classNumber: section.registrationNumber?.toString(),
            subjectCode: `${subject}-${school}`,
            capacity: section.maxUnits || 0,
            enrolled: section.minUnits || 0,
            courseNumber: parseInt(course.deptCourseId) || 0,
          };
        })
        .filter(Boolean) // Remove any null results
        .sort((a: { courseNumber: number }, b: { courseNumber: number }) => {
          return a.courseNumber - b.courseNumber;
        })
        .map(({ courseNumber, ...course }: { courseNumber: number, [key: string]: any }) => course);
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

export const validateSchedule = action({
  args: { registrationNumbers: v.array(v.string()) },
  handler: async (ctx, { registrationNumbers }) => {
    try {
      // Here you would implement schedule validation logic
      // For now, we'll just return success
      return {
        valid: true,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        error: "Failed to validate schedule"
      };
    }
  },
});

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