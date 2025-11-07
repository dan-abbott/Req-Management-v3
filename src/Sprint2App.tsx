// Sprint2App - Complete TypeScript fix for parent_id handling

import { useState } from 'react';
import { supabase } from './services/supabase';
import { Header } from './components/layout/Header';
import { ItemTree } from './components/items/ItemTree';
import { ItemPanel } from './components/items/ItemPanel';
import { ItemForm } from './components/items/ItemForm';
import { ProjectForm } from './components/projects/ProjectForm';
import { useProjects } from './hooks/useProjects';
import { useItems } from './hooks/useItems';
import { Project, ItemFormData, Item } from './types';
import { moveNode } from './utils/treeHelpers';
import { itemsAPI } from './services/api/items';

export function Sprint2App() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const { projects, loading: projectsLoading, createProject, refresh: refreshProjects } = useProjects();
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, refresh } = useItems(selectedProjectId);

  const selectedItem = items.find(item => item.id === selectedItemId) || null;

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setSelectedItemId(null);
  };

  const handleProjectSubmit = async (data: any) => {
    await createProject(data);
    await refreshProjects();
    setShowProjectForm(false);
  };

  const handleCreateItem = async (data: ItemFormData) => {
    await createItem(data);
    setShowItemForm(false);
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (editingItem) {
      console.log('Updating item with data:', data);
      
      // Handle parent_id separately if undefined (meaning "no parent")
      if (data.parent_id === undefined) {
        // Use itemsAPI.update directly with type assertion for null
        await itemsAPI.update(editingItem.id, { parent_id: null } as Partial<Item>);
      }
      
      // Update the rest of the item data
      await updateItem(editingItem.id, data);
      setEditingItem(null);
      
      // Force refresh to ensure we see the change
      await refresh();
    }
  };

  const handleMoveItem = async (movedId: number, newParentId: number | null) => {
    try {
      console.log('Moving item:', movedId, 'to parent:', newParentId);
      
      // Optimistically update UI
      moveNode(items, movedId, newParentId);
      
      // Update database with type assertion for null values
      await itemsAPI.update(movedId, { parent_id: newParentId } as Partial<Item>);

      await refresh();
    } catch (error) {
      console.error('Move failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to move item. ' + message);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
      setSelectedItemId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={() => setShowProjectForm(true)}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedProjectId ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg mb-2">Select a project to get started</p>
            <p className="text-sm">or create a new one using the button above</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Items
              </h1>
              <button
                onClick={() => setShowItemForm(true)}
                className="px-4 py-2 bg-[#3FB95A] text-white rounded hover:bg-[#359647] transition-colors"
              >
                + New Item
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {itemsLoading ? (
                  <div className="text-gray-500 text-center py-8">Loading items...</div>
                ) : items.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    No items yet. Create your first item!
                  </div>
                ) : (
                  <ItemTree
                    items={items}
                    selectedId={selectedItemId}
                    onSelect={setSelectedItemId}
                    onMove={handleMoveItem}
                  />
                )}
              </div>

              <div>
                {selectedItem && (
                  <ItemPanel
                    item={selectedItem}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSubmit={handleProjectSubmit}
      />

      <ItemForm
        isOpen={showItemForm}
        onClose={() => setShowItemForm(false)}
        onSubmit={handleCreateItem}
        availableItems={items}
      />

      {editingItem && (
        <ItemForm
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdateItem}
          item={editingItem}
          availableItems={items}
        />
      )}
    </div>
  );
}
