// convex/schema.ts
import { defineSchema } from 'convex/server'
import waitlist from './schemas/waitlist.schema'
import profiles from './schemas/profile.schema'
import notifications from './schemas/notification.schema'

export default defineSchema({
  waitlist,
  profiles,
  notifications,
})
