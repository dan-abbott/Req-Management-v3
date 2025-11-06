// Sprint 2 App - Hierarchical Tree View with Drag & Drop (FULLY FIXED)

import { useEffect, useState } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { ProjectForm } from './components/projects/ProjectForm';
import { ItemForm } from './components/items/ItemForm';
import { ItemDetail } from './components/items/ItemDetail';
import { ItemTree } from './components/items/ItemTree';
import { useProjects } from './hooks/useProjects';
import { useItems } from './hooks/useItems';
import { Project, Item, ItemFormData } from './types';
import { itemsAPI } from './services/api/items';
import { moveNode } from './utils/treeHelpers';
import { Plus } from 'lucide-react';

export function Sprint2App() {
  const { user, loading: authLoading } = useAuth();
  const { projects, createProject } = useProjects();
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, refresh } = useItems(selectedProjectId);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Auto-select first project on load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Loading states
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Get selected project
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // Handle project selection (Header expects Project object)
  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setSelectedItemId(null); // Clear selection when switching projects
  };

  // Handle new project button
  const handleNewProject = () => {
    setShowProjectForm(true);
  };

  // Handle project creation
  const handleProjectSubmit = async (data: Omit<Project, 'id' | 'created_at'>) => {
    const newProject = await createProject(data);
    setSelectedProjectId(newProject.id);
    setShowProjectForm(false);
  };

  // Handle item creation
  const handleCreateItem = async (data: ItemFormData) => {
    await createItem(data);
    setShowItemForm(false);
  };

  // Handle item update
  const handleUpdateItem = async (data: ItemFormData) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
      setEditingItem(null);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (item: Item) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      await deleteItem(item.id);
      setSelectedItemId(null);
    }
  };

  // Handle drag-and-drop move
  const handleMoveItem = async (movedId: number, newParentId: number | null) => {
    try {
      // Validate move
      moveNode(items, movedId, newParentId);
      
      // Update database
      await itemsAPI.update(movedId, { 
        parent_id: newParentId || undefined 
      });

      // Refresh to ensure consistency
      await refresh();
    } catch (error) {
      console.error('Move failed:', error);
      throw error;
    }
  };

  // Get selected item
  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Tree View */}
        <div className={`${selectedItemId ? 'w-2/3' : 'w-full'} border-r border-gray-200 flex flex-col`}>
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedProject?.name || 'Select a Project'}
              </h2>
              <button
                onClick={() => setShowItemForm(true)}
                disabled={!selectedProjectId}
                className="flex items-center gap-2 px-4 py-2 bg-fresh-600 text-white rounded hover:bg-fresh-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Item
              </button>
            </div>
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-hidden">
            {selectedProjectId ? (
              itemsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fresh-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading items...</p>
                  </div>
                </div>
              ) : (
                <ItemTree
                  items={items}
                  selectedId={selectedItemId}
                  onSelect={setSelectedItemId}
                  onMove={handleMoveItem}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-6xl mb-4">📁</div>
                <div className="text-lg font-medium">No project selected</div>
                <div className="text-sm">Select a project from the header</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        {selectedItemId && selectedItem && (
          <div className="w-1/3 bg-white overflow-y-auto">
            <ItemDetail
              item={selectedItem}
              onClose={() => setSelectedItemId(null)}
              onEdit={(item) => setEditingItem(item)}
              onDelete={handleDeleteItem}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showProjectForm && (
        <ProjectForm
          isOpen={showProjectForm}
          onClose={() => setShowProjectForm(false)}
          onSubmit={handleProjectSubmit}
        />
      )}

      {showItemForm && selectedProjectId && (
        <ItemForm
          isOpen={showItemForm}
          onClose={() => setShowItemForm(false)}
          onSubmit={handleCreateItem}
        />
      )}

      {editingItem && selectedProjectId && (
        <ItemForm
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdateItem}
        />
      )}
    </div>
  );
}
