// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// ---------- Profile Enums ----------
import { GenderValues } from '../content/constants/profile/gender.enum'
import { SexValues } from '../content/constants/profile/sex.enum'
import { SexualityValues } from '../content/constants/profile/sexuality.enum'
import { GradeLevelValues } from '../content/constants/profile/grade-level.enum'
import { CountryValues } from '../content/constants/profile/country.enum'

export default defineSchema({
  waitlist: defineTable({
    email: v.string(),                 // normalized lower-case email
    date: v.string(),                  // YYYY-MM-DD (UTC slice)
    time: v.string(),                  // HH:mm:ss (UTC slice)
    userId: v.union(v.string(), v.null()),
    createdAt: v.number(),             // ms since epoch (Date.now())
  })
    .index('by_email', ['email'])
    .index('by_createdAt', ['createdAt']),

  // New Profiles Table
  profiles: defineTable({
    // Required foreign key to your auth system user id (e.g., Clerk userId)
    userId: v.string(),

    // Names
    firstName: v.string(),
    middleName: v.optional(v.string()),
    lastName: v.string(),

    // Identity enums
    gender: v.union(...(GenderValues as string[]).map((g: string) => v.literal(g))),
    sex: v.union(...(SexValues as string[]).map((s: string) => v.literal(s))),
    sexuality: v.union(...(SexualityValues as string[]).map((s: string) => v.literal(s))),

    // Optional custom identity fields
    genderCustom: v.optional(v.string()),
    sexCustom: v.optional(v.string()),
    sexualityCustom: v.optional(v.string()),

    // Profile content
    bio: v.optional(v.string()),
    profession: v.optional(v.string()),

    // Education level
    gradeLevel: v.union(...(GradeLevelValues as string[]).map((g: string) => v.literal(g))),

    // Country (ISO alpha-2 or full name)
    country: v.union(...(CountryValues as string[]).map((c: string) => v.literal(c))),

    // Timestamps
    createdAt: v.number(), // Date.now()
    updatedAt: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('by_country', ['country'])
    .index('by_gradeLevel', ['gradeLevel']),
})
