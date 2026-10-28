// Records a handler or admin action in the audit log.
import { AuditLog } from '../models/AuditLog.js';

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
