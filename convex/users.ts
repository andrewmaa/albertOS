import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), userId as Id<"users">))
      .first();
    
    return user ? {
      id: user._id,
      name: user.name,
      email: user.email,
    } : null;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { name, email }) => {
    return await ctx.db.insert("users", {
      name,
      email,
    });
  },
}); 