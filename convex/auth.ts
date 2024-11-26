import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const createDemoSession = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a new demo user with session timestamp
    const sessionId = Date.now().toString();
    const userId = await ctx.db.insert("users", {
      name: `Demo User ${sessionId}`,
      email: `demo_${sessionId}@example.com`,
      isDemo: true,
      createdAt: Date.now(),
      sessionId: sessionId, // Add sessionId to track the session
    });

    return { userId, sessionId };
  },
});

export const getCurrentSession = query({
  args: { sessionId: v.optional(v.string()) },
  handler: async (ctx, { sessionId }) => {
    if (!sessionId) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("isDemo"), true),
          q.eq(q.field("sessionId"), sessionId)
        )
      )
      .first();

    return user;
  },
});

export const clearDemoSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    // Find the demo user
    const demoUser = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("isDemo"), true),
          q.eq(q.field("sessionId"), sessionId)
        )
      )
      .first();

    if (!demoUser) return;

    // Delete all cart items for this user
    const cartItems = await ctx.db
      .query("cart")
      .filter((q) => q.eq(q.field("userId"), demoUser._id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    // Delete the demo user
    await ctx.db.delete(demoUser._id);
  },
});

export const getUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user;
  },
});

export const logout = mutation({
  args: {},
  handler: async (ctx) => {
    return true;
  },
}); 