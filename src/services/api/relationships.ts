import { supabase } from '../supabase';
import { Relationship, RelationshipFormData, RelationshipWithItem, Item } from '../../types';

export const relationshipsAPI = {
  /**
   * Get all relationships for an item (both outgoing and incoming)
   */
  async getByItemId(itemId: number): Promise<{ outgoing: RelationshipWithItem[]; incoming: RelationshipWithItem[] }> {
    // Get outgoing relationships (from this item)
    const { data: outgoing, error: outgoingError } = await supabase
      .from('relationships')
      .select('*, to_item:items!to_id(*)')
      .eq('from_id', itemId);
    
    if (outgoingError) throw outgoingError;

    // Get incoming relationships (to this item)
    const { data: incoming, error: incomingError } = await supabase
      .from('relationships')
      .select('*, from_item:items!from_id(*)')
      .eq('to_id', itemId);
    
    if (incomingError) throw incomingError;

    return {
      outgoing: (outgoing || []).map(r => ({
        ...r,
        to_item: r.to_item as Item
      })) as RelationshipWithItem[],
      incoming: (incoming || []).map(r => ({
        ...r,
        from_item: r.from_item as Item
      })) as RelationshipWithItem[]
    };
  },

  /**
   * Get all relationships for a project
   */
  async getByProjectId(projectId: number): Promise<Relationship[]> {
    // Get all items in the project first
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id')
      .eq('project_id', projectId);
    
    if (itemsError) throw itemsError;
    
    const itemIds = items.map(i => i.id);
    
    if (itemIds.length === 0) return [];

    // Get all relationships where from_id or to_id is in this project
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .or(`from_id.in.(${itemIds.join(',')}),to_id.in.(${itemIds.join(',')})`);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new relationship
   */
  async create(relationshipData: RelationshipFormData): Promise<Relationship> {
    const { data, error } = await supabase
      .from('relationships')
      .insert([{
        from_id: relationshipData.from_id,
        to_id: relationshipData.to_id,
        type: relationshipData.type,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a relationship
   */
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  /**
   * Check if a relationship already exists
   */
  async exists(fromId: number, toId: number, type: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('relationships')
      .select('id')
      .eq('from_id', fromId)
      .eq('to_id', toId)
      .eq('type', type)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  },

  /**
   * Calculate test coverage for a project
   * Returns percentage of requirements that have test cases
   */
  async calculateTestCoverage(projectId: number): Promise<number> {
    // Get all requirements in project
    const { data: requirements, error: reqError } = await supabase
      .from('items')
      .select('id')
      .eq('project_id', projectId)
      .eq('type', 'requirement');
    
    if (reqError) throw reqError;
    
    if (!requirements || requirements.length === 0) return 0;

    const requirementIds = requirements.map(r => r.id);

    // Get count of requirements with 'tests' relationships
    const { data: withTests, error: testsError } = await supabase
      .from('relationships')
      .select('from_id')
      .in('from_id', requirementIds)
      .eq('type', 'tests');
    
    if (testsError) throw testsError;

    // Get unique requirement IDs that have tests
    const uniqueRequirementsWithTests = new Set(withTests?.map(r => r.from_id) || []);
    
    return Math.round((uniqueRequirementsWithTests.size / requirements.length) * 100);
  },

  /**
   * Calculate traceability score for a project
   * Returns percentage of items that have any relationships
   */
  async calculateTraceabilityScore(projectId: number): Promise<number> {
    // Get all items in project
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id')
      .eq('project_id', projectId);
    
    if (itemsError) throw itemsError;
    
    if (!items || items.length === 0) return 0;

    const itemIds = items.map(i => i.id);

    // Get all relationships for these items
    const { data: relationships, error: relError } = await supabase
      .from('relationships')
      .select('from_id, to_id')
      .or(`from_id.in.(${itemIds.join(',')}),to_id.in.(${itemIds.join(',')})`);
    
    if (relError) throw relError;

    // Get unique item IDs that have relationships
    const itemsWithRelationships = new Set<number>();
    relationships?.forEach(r => {
      if (itemIds.includes(r.from_id)) itemsWithRelationships.add(r.from_id);
      if (itemIds.includes(r.to_id)) itemsWithRelationships.add(r.to_id);
    });
    
    return Math.round((itemsWithRelationships.size / items.length) * 100);
  }
};
