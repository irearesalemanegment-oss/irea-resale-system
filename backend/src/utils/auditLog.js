const db = require('../database/pool');

const logAudit = async (req, action, entityType, entityId, entityName, oldValues = null, newValues = null, details = '') => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, entity_name, old_values, new_values, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        req.user?.id,
        req.user?.full_name || req.user?.email,
        req.user?.role_name,
        action,
        entityType,
        entityId,
        entityName,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        details,
        req.ip || req.connection?.remoteAddress
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = { logAudit };
