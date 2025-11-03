import { supabase } from '../supabase';
import { AuditLog } from '../../types';

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
   * Automatically captures user email and name from current session
   */
  async log(entry: LogEntry): Promise<AuditLog> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const logData = {
      ...entry,
      user_email: user.email!,
      user_name: user.user_metadata.full_name || user.email!,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert([logData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get all audit logs for a specific item
   */
  async getByItemId(itemId: number): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('item_id', itemId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get all audit logs for a project (via items)
   */
  async getByProjectId(projectId: number): Promise<AuditLog[]> {
    // First get all item IDs for this project
    const { data: items } = await supabase
      .from('items')
      .select('id')
      .eq('project_id', projectId);
    
    if (!items || items.length === 0) return [];

    const itemIds = items.map(item => item.id);

    // Then get audit logs for those items
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('item_id', itemIds)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};
