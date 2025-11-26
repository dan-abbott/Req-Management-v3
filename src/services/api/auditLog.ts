import { db } from '../db';
import { AuditLog } from '../../types';
import { getCurrentUser } from '../auth';

interface LogEntry {
  item_id: number;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
}

export const auditLogAPI = {
  /**
   * Create an audit log entry
   * Gets user info from Clerk
   */
  async log(entry: LogEntry): Promise<AuditLog> {
    const user = getCurrentUser();

    const logEntry = await db.queryOne<AuditLog>(
      `INSERT INTO audit_logs (
        item_id, user_email, user_name, action, field_name, old_value, new_value, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        entry.item_id,
        user.email,
        user.name,
        entry.action,
        entry.field_name || null,
        entry.old_value || null,
        entry.new_value || null
      ]
    );
    
    if (!logEntry) throw new Error('Failed to create audit log');
    return logEntry;
  },

  /**
   * Get all audit logs for a specific item
   */
  async getByItemId(itemId: number): Promise<AuditLog[]> {
    const logs = await db.query<AuditLog>(
      'SELECT * FROM audit_logs WHERE item_id = $1 ORDER BY timestamp DESC',
      [itemId]
    );
    return logs;
  },

  /**
   * Get all audit logs for a project (via items)
   */
  async getByProjectId(projectId: number): Promise<AuditLog[]> {
    const logs = await db.query<AuditLog>(
      `SELECT al.* 
       FROM audit_logs al
       INNER JOIN items i ON al.item_id = i.id
       WHERE i.project_id = $1
       ORDER BY al.timestamp DESC`,
      [projectId]
    );
    return logs;
  }
};