// convex/profile.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server"; // use generated helpers for proper arg typing
import { defineSchema, defineTable } from "convex/server";

import { GenderValues } from "../content/constants/profile/gender.enum";
import { SexValues } from "../content/constants/profile/sex.enum";
import { SexualityValues } from "../content/constants/profile/sexuality.enum";
import { GradeLevelValues } from "../content/constants/profile/grade-level.enum";
import { Country } from "../content/constants/profile/country.enum";

// ---------- Types ----------
export type Profile = {
  _id: string;
  _creationTime: number;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: (typeof GenderValues)[number];
  sex: (typeof SexValues)[number];
  sexuality: (typeof SexualityValues)[number];
  genderCustom?: string;
  sexCustom?: string;
  sexualityCustom?: string;
  bio?: string;
  profession?: string;
  gradeLevel: (typeof GradeLevelValues)[number];
  country: (typeof Country)[keyof typeof Country];
  createdAt: number;
  updatedAt: number;
};

// ---------- Queries ----------
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // Cast db to any to avoid older generated types (e.g., only 'waitlist') blocking new table/index names
    const db = (ctx as any).db;
    const profile = await db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .unique();
    return profile ?? null;
  },
});

// ---------- Mutations ----------
// Upsert by userId. Validates enum literals and preserves unknown “custom” labels.
export const upsert = mutation({
  args: {
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    middleName: v.optional(v.string()),

    gender: v.union(
      ...(GenderValues as string[]).map((g: string) => v.literal(g))
    ),
    sex: v.union(...(SexValues as string[]).map((s: string) => v.literal(s))),
    sexuality: v.union(
      ...(SexualityValues as string[]).map((s: string) => v.literal(s))
    ),
    genderCustom: v.optional(v.string()),
    sexCustom: v.optional(v.string()),
    sexualityCustom: v.optional(v.string()),

    bio: v.optional(v.string()),
    profession: v.optional(v.string()),

    gradeLevel: v.union(
      ...(GradeLevelValues as string[]).map((g: string) => v.literal(g))
    ),
    country: v.union(
      ...(Object.values(Country) as string[]).map((c: string) => v.literal(c))
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const db = (ctx as any).db;

    const existing = await db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .unique();

    if (!existing) {
      const _id = await db.insert("profiles", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
      return { _id, created: true };
    }

    await db.patch(existing._id, {
      ...args,
      updatedAt: now,
    });

    return { _id: existing._id, created: false };
  },
});

// Partial update (patch)
export const patch = mutation({
  args: {
    userId: v.string(),
    // All fields optional for patch (but keep enum constraints)
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    gender: v.optional(
      v.union(...(GenderValues as string[]).map((g: string) => v.literal(g)))
    ),
    sex: v.optional(
      v.union(...(SexValues as string[]).map((s: string) => v.literal(s)))
    ),
    sexuality: v.optional(
      v.union(
        ...(SexualityValues as string[]).map((s: string) => v.literal(s))
      )
    ),
    genderCustom: v.optional(v.string()),
    sexCustom: v.optional(v.string()),
    sexualityCustom: v.optional(v.string()),
    bio: v.optional(v.string()),
    profession: v.optional(v.string()),
    gradeLevel: v.optional(
      v.union(
        ...(GradeLevelValues as string[]).map((g: string) => v.literal(g))
      )
    ),
    country: v.optional(
      v.union(
        ...(Object.values(Country) as string[]).map((c: string) => v.literal(c))
      )
    ),
  },
  handler: async (ctx, { userId, ...updates }) => {
    const now = Date.now();
    const db = (ctx as any).db;

    const existing = await db
      .query("profiles")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .unique();
    if (!existing) {
      throw new Error("Profile not found");
    }
    await db.patch(existing._id, { ...updates, updatedAt: now });
    return { _id: existing._id };
  },
});
