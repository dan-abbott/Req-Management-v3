import { supabase } from '../supabase';
import { Item, ItemFormData } from '../../types';
import { auditLogAPI } from './auditLog';

export const itemsAPI = {
  /**
   * Fetch all items for a project
   */
  async getByProject(projectId: number): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single item by ID
   */
  async getById(id: number): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new item with audit logging
   */
  async create(itemData: ItemFormData, projectId: number): Promise<Item> {
    // Prepare item data
    const newItem = {
      ...itemData,
      project_id: projectId,
      version: 1,
      children: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert item
    const { data, error } = await supabase
      .from('items')
      .insert([newItem])
      .select()
      .single();
    
    if (error) throw error;

    // Create audit log
    await auditLogAPI.log({
      item_id: data.id,
      action: 'create',
      new_value: data.title
    });

    // If this item has a parent, update parent's children array
    if (itemData.parent_id) {
      await this.updateParentChildren(itemData.parent_id, data.id, 'add');
    }

    return data;
  },

  /**
   * Update an existing item with field-level audit logging
   */
  async update(id: number, updates: Partial<ItemFormData>): Promise<Item> {
    // Get current item to compare changes
    const currentItem = await this.getById(id);

    // Prepare updates with incremented version
    const itemUpdates = {
      ...updates,
      version: currentItem.version + 1,
      updated_at: new Date().toISOString()
    };

    // Update item
    const { data, error } = await supabase
      .from('items')
      .update(itemUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Create audit logs for each changed field
    for (const [key, newValue] of Object.entries(updates)) {
      const oldValue = currentItem[key as keyof Item];
      
      if (oldValue !== newValue) {
        await auditLogAPI.log({
          item_id: id,
          action: 'update',
          field_name: key,
          old_value: String(oldValue || ''),
          new_value: String(newValue || '')
        });
      }
    }

    return data;
  },

  /**
   * Delete an item with audit logging
   */
  async delete(id: number): Promise<void> {
    // Get item details before deleting
    const item = await this.getById(id);

    // Remove from parent's children array if it has a parent
    if (item.parent_id) {
      await this.updateParentChildren(item.parent_id, id, 'remove');
    }

    // Delete item (cascade deletes children, relationships, comments, audit logs)
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  /**
   * Helper: Update parent's children array
   */
  async updateParentChildren(
    parentId: number, 
    childId: number, 
    operation: 'add' | 'remove'
  ): Promise<void> {
    const parent = await this.getById(parentId);
    
    let newChildren: number[];
    if (operation === 'add') {
      newChildren = [...parent.children, childId];
    } else {
      newChildren = parent.children.filter(id => id !== childId);
    }

    await supabase
      .from('items')
      .update({ children: newChildren })
      .eq('id', parentId);
  },

  /**
   * Get default status for an item type
   */
  getDefaultStatus(type: string): string {
    const defaults: Record<string, string> = {
      'epic': 'draft',
      'requirement': 'draft',
      'test-case': 'draft',
      'defect': 'not-started'
    };
    return defaults[type] || 'draft';
  }
};
