// One-line helper to record a handler or admin action in the AuditLog.
// Example: writeAudit(req.user, 'CLAIM_APPROVED', 'Claim', claim._id, 'ID seen').
import { AuditLog } from '../models/AuditLog.js';

// Save who did what to which record.
export async function writeAudit(user, action, targetType, targetId, details = '') {
  await AuditLog.create({
    actorId: user._id,
    actorRole: user.role,
    action,
    targetType,
    targetId,
    details,
  });
}
