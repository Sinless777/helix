// convex/schema.ts
import { defineSchema } from 'convex/server';

import accounts from './schemas/account.schema';
import notifications from './schemas/notification.schema';
import oauthStates from './schemas/oauthState.schema';
import profiles from './schemas/profile.schema';
import roles from './schemas/role.schema';
import settings from './schemas/settings.schema';
import tickets from './schemas/ticket.schema';
import waitlist from './schemas/waitlist.schema';

export default defineSchema({
  waitlist,
  profiles,
  settings,
  notifications,
  accounts,
  roles,
  tickets,
  oauthStates,
});
