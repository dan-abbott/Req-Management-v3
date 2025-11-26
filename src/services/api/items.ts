import { db } from '../db';
import { Item, ItemFormData } from '../../types';
import { auditLogAPI } from './auditLog';

export const itemsAPI = {
  /**
   * Fetch all items for a project
   */
  async getByProject(projectId: number): Promise<Item[]> {
    const items = await db.query<Item>(
      'SELECT * FROM items WHERE project_id = $1 ORDER BY created_at ASC',
      [projectId]
    );
    return items;
  },

  /**
   * Get a single item by ID
   */
  async getById(id: number): Promise<Item> {
    const item = await db.queryOne<Item>(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );
    
    if (!item) throw new Error('Item not found');
    return item;
  },

  /**
   * Create a new item with audit logging
   */
  async create(itemData: ItemFormData, projectId: number): Promise<Item> {
    const newItem = await db.queryOne<Item>(
      `INSERT INTO items (
        project_id, type, title, description, rationale, test_method,
        status, priority, owner, reviewer_email, tester_email, level,
        version, parent_id, children, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        projectId,
        itemData.type,
        itemData.title,
        itemData.description || null,
        itemData.rationale || null,
        itemData.test_method || null,
        itemData.status,
        itemData.priority || null,
        itemData.owner || null,
        itemData.reviewer_email || null,
        itemData.tester_email || null,
        itemData.level || null,
        1, // version
        itemData.parent_id || null,
        [] // children array
      ]
    );
    
    if (!newItem) throw new Error('Failed to create item');

    // Create audit log
    await auditLogAPI.log({
      item_id: newItem.id,
      action: 'create',
      new_value: newItem.title
    });

    // If this item has a parent, update parent's children array
    if (itemData.parent_id) {
      await this.updateParentChildren(itemData.parent_id, newItem.id, 'add');
    }

    return newItem;
  },

  /**
   * Update an existing item with field-level audit logging
   */
  async update(id: number, updates: Partial<ItemFormData>): Promise<Item> {
    // Get current item to compare changes
    const currentItem = await this.getById(id);

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.rationale !== undefined) {
      fields.push(`rationale = $${paramIndex++}`);
      values.push(updates.rationale);
    }
    if (updates.test_method !== undefined) {
      fields.push(`test_method = $${paramIndex++}`);
      values.push(updates.test_method);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push(`priority = $${paramIndex++}`);
      values.push(updates.priority);
    }
    if (updates.owner !== undefined) {
      fields.push(`owner = $${paramIndex++}`);
      values.push(updates.owner);
    }
    if (updates.reviewer_email !== undefined) {
      fields.push(`reviewer_email = $${paramIndex++}`);
      values.push(updates.reviewer_email);
    }
    if (updates.tester_email !== undefined) {
      fields.push(`tester_email = $${paramIndex++}`);
      values.push(updates.tester_email);
    }
    if (updates.level !== undefined) {
      fields.push(`level = $${paramIndex++}`);
      values.push(updates.level);
    }
    if (updates.parent_id !== undefined) {
      fields.push(`parent_id = $${paramIndex++}`);
      values.push(updates.parent_id);
    }

    // Always update version and updated_at
    fields.push(`version = version + 1`);
    fields.push(`updated_at = NOW()`);
    
    values.push(id);

    const updatedItem = await db.queryOne<Item>(
      `UPDATE items SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (!updatedItem) throw new Error('Item not found');

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

    return updatedItem;
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
    await db.query('DELETE FROM items WHERE id = $1', [id]);
  },

  /**
   * Helper: Update parent's children array
   */
  async updateParentChildren(
    parentId: number, 
    childId: number, 
    operation: 'add' | 'remove'
  ): Promise<void> {
    if (operation === 'add') {
      await db.query(
        'UPDATE items SET children = array_append(children, $1) WHERE id = $2',
        [childId, parentId]
      );
    } else {
      await db.query(
        'UPDATE items SET children = array_remove(children, $1) WHERE id = $2',
        [childId, parentId]
      );
    }
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