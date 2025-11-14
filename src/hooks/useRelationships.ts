import { useState, useEffect, useCallback } from 'react';
import { RelationshipWithItem, RelationshipFormData } from '../types';
import { relationshipsAPI } from '../services/api/relationships';

interface UseRelationshipsReturn {
  outgoing: RelationshipWithItem[];
  incoming: RelationshipWithItem[];
  loading: boolean;
  error: string | null;
  createRelationship: (data: RelationshipFormData) => Promise<void>;
  deleteRelationship: (id: number) => Promise<void>;
  refreshRelationships: () => Promise<void>;
}

export function useRelationships(itemId: number | null): UseRelationshipsReturn {
  const [outgoing, setOutgoing] = useState<RelationshipWithItem[]>([]);
  const [incoming, setIncoming] = useState<RelationshipWithItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationships = useCallback(async () => {
    if (!itemId) {
      setOutgoing([]);
      setIncoming([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await relationshipsAPI.getByItemId(itemId);
      setOutgoing(data.outgoing);
      setIncoming(data.incoming);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch relationships');
      console.error('Error fetching relationships:', err);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  const createRelationship = async (data: RelationshipFormData) => {
    try {
      // Check if relationship already exists
      const exists = await relationshipsAPI.exists(data.from_id, data.to_id, data.type);
      if (exists) {
        throw new Error('This relationship already exists');
      }

      await relationshipsAPI.create(data);
      await fetchRelationships();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create relationship';
      setError(message);
      throw err;
    }
  };

  const deleteRelationship = async (id: number) => {
    try {
      await relationshipsAPI.delete(id);
      await fetchRelationships();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete relationship';
      setError(message);
      throw err;
    }
  };

  return {
    outgoing,
    incoming,
    loading,
    error,
    createRelationship,
    deleteRelationship,
    refreshRelationships: fetchRelationships
  };
}
