// Fixed lists shared by every module, like categories and statuses.
export const ROLES = ['student', 'staff', 'handler', 'admin'];

export const CATEGORIES = [
  'id_card',
  'phone',
  'laptop',
  'wallet',
  'keys',
  'bottle',
  'bag',
  'earbuds',
  'books',
  'other',
];

export const COLORS = [
  'black',
  'white',
  'grey',
  'silver',
  'red',
  'maroon',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'navy',
  'purple',
  'pink',
  'brown',
  'beige',
  'gold',
  'multicolor',
];

export const FOUND_STATUS = [
  'posted',
  'in_custody',
  'claim_pending',
  'verified',
  'released',
  'transferred_admin',
  'expired',
  'donated',
];

export const LOST_STATUS = ['open', 'matched', 'claim_in_progress', 'recovered', 'closed'];

export const CLAIM_STATUS = [
  'answering',
  'locked',
  'awaiting_handler',
  'approved',
  'rejected',
  'released',
  'cancelled',
];

export const CUSTODY_ACTIONS = [
  'POSTED',
  'DROPPED_AT_DESK',
  'RECEIVED_BY_HANDLER',
  'STORED',
  'CLAIM_SUBMITTED',
  'VERIFICATION_PASSED',
  'VERIFICATION_FAILED',
  'LOCKED_OUT',
  'APPROVED',
  'REJECTED',
  'RELEASED',
  'TRANSFERRED_TO_ADMIN',
  'EXPIRED',
  'DONATED',
];

export const NOTIFICATION_TYPES = [
  'MATCH_FOUND',
  'ITEM_STATUS',
  'CLAIM_UPDATE',
  'HANDOVER_READY',
  'ITEM_EXPIRING',
  'ACCOUNT_FLAGGED',
];
