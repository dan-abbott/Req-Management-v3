import { useState, useEffect } from 'react';
import { Item, ItemFormData } from '../types';
import { itemsAPI } from '../services/api/items';

export function useItems(projectId: number | null) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [projectId]);

  const fetchItems = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await itemsAPI.getByProject(projectId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData: ItemFormData): Promise<Item> => {
    if (!projectId) throw new Error('No project selected');

    try {
      setError(null);
      const newItem = await itemsAPI.create(itemData, projectId);
      setItems([...items, newItem]);
      return newItem;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create item';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateItem = async (id: number, updates: Partial<ItemFormData>): Promise<Item> => {
    try {
      setError(null);
      const updatedItem = await itemsAPI.update(id, updates);
      setItems(items.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteItem = async (id: number): Promise<void> => {
    try {
      setError(null);
      await itemsAPI.delete(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchItems
  };
}
