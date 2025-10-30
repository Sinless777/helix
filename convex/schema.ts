// convex/schema.ts
import { defineSchema } from 'convex/server'
import waitlist from './schemas/waitlist.schema'
import profiles from './schemas/profile.schema'
import notifications from './schemas/notification.schema'
import settings from './schemas/settings.schema'
import accounts from './schemas/account.schema'
import roles from './schemas/role.schema'
import tickets from './schemas/ticket.schema'
import oauthStates from './schemas/oauthState.schema'

export default defineSchema({
  waitlist,
  profiles,
  settings,
  notifications,
  accounts,
  roles,
  tickets,
  oauthStates,
})
