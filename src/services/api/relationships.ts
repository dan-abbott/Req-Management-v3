import { db } from '../db';
import { Relationship, RelationshipFormData } from '../../types';

export const relationshipsAPI = {
  /**
   * Get all relationships for a project (via items)
   */
  async getByProjectId(projectId: number): Promise<Relationship[]> {
    const relationships = await db.query<Relationship>(
      `SELECT r.* 
       FROM relationships r
       INNER JOIN items i ON (r.from_id = i.id OR r.to_id = i.id)
       WHERE i.project_id = $1
       ORDER BY r.created_at DESC`,
      [projectId]
    );
    return relationships;
  },

  /**
   * Get relationships for a specific item
   */
  async getByItemId(itemId: number): Promise<{
    outgoing: Relationship[];
    incoming: Relationship[];
  }> {
    const outgoing = await db.query<Relationship>(
      'SELECT * FROM relationships WHERE from_id = $1',
      [itemId]
    );
    
    const incoming = await db.query<Relationship>(
      'SELECT * FROM relationships WHERE to_id = $1',
      [itemId]
    );

    return { outgoing, incoming };
  },

  /**
   * Create a new relationship
   */
  async create(data: RelationshipFormData): Promise<Relationship> {
    const relationship = await db.queryOne<Relationship>(
      `INSERT INTO relationships (from_id, to_id, type, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [data.from_id, data.to_id, data.type]
    );
    
    if (!relationship) throw new Error('Failed to create relationship');
    return relationship;
  },

  /**
   * Delete a relationship
   */
  async delete(id: number): Promise<void> {
    await db.query('DELETE FROM relationships WHERE id = $1', [id]);
  },

  /**
   * Calculate test coverage for a project
   */
  async getTestCoverage(projectId: number): Promise<number> {
    const result = await db.queryOne<{ coverage: string }>(
      `WITH requirements AS (
        SELECT id FROM items 
        WHERE project_id = $1 AND type = 'requirement'
      ),
      tested_requirements AS (
        SELECT DISTINCT r.to_id
        FROM relationships r
        INNER JOIN items i ON r.from_id = i.id
        WHERE r.type = 'tests' 
          AND i.type = 'test-case'
          AND r.to_id IN (SELECT id FROM requirements)
      )
      SELECT 
        CASE 
          WHEN COUNT(requirements.id) = 0 THEN 0
          ELSE ROUND((COUNT(DISTINCT tested_requirements.to_id)::numeric / COUNT(requirements.id)::numeric) * 100, 1)
        END as coverage
      FROM requirements
      LEFT JOIN tested_requirements ON requirements.id = tested_requirements.to_id`,
      [projectId]
    );
    
    return result ? parseFloat(result.coverage) : 0;
  },

  /**
   * Calculate traceability score for a project
   */
  async getTraceabilityScore(projectId: number): Promise<number> {
    const result = await db.queryOne<{ score: string }>(
      `WITH project_items AS (
        SELECT id FROM items WHERE project_id = $1
      ),
      items_with_relationships AS (
        SELECT DISTINCT item_id FROM (
          SELECT from_id as item_id FROM relationships WHERE from_id IN (SELECT id FROM project_items)
          UNION
          SELECT to_id as item_id FROM relationships WHERE to_id IN (SELECT id FROM project_items)
        ) all_items
      )
      SELECT 
        CASE 
          WHEN COUNT(project_items.id) = 0 THEN 0
          ELSE ROUND((COUNT(DISTINCT items_with_relationships.item_id)::numeric / COUNT(project_items.id)::numeric) * 100, 1)
        END as score
      FROM project_items
      LEFT JOIN items_with_relationships ON project_items.id = items_with_relationships.item_id`,
      [projectId]
    );
    
    return result ? parseFloat(result.score) : 0;
  }
};