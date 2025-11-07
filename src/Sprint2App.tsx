// Sprint 2 App - Fixed to properly handle null parent_id updates

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

export function Sprint2App() {
  const { user, loading: authLoading } = useAuth();
  const { projects, createProject } = useProjects();
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, refresh } = useItems(selectedProjectId);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

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

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setSelectedItemId(null);
  };

  const handleNewProject = () => {
    setShowProjectForm(true);
  };

  const handleProjectSubmit = async (data: Omit<Project, 'id' | 'created_at'>) => {
    const newProject = await createProject(data);
    setSelectedProjectId(newProject.id);
    setShowProjectForm(false);
  };

  const handleCreateItem = async (data: ItemFormData) => {
    await createItem(data);
    setShowItemForm(false);
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (editingItem) {
      // IMPORTANT: Explicitly handle parent_id
      // If parent_id is undefined in formData, set it to null for the API
      const updateData = {
        ...data,
        parent_id: data.parent_id === undefined ? null : data.parent_id
      };
      
      console.log('Updating item with data:', updateData);
      
      await updateItem(editingItem.id, updateData);
      setEditingItem(null);
      
      // Force refresh to ensure we see the change
      await refresh();
    }
  };

  const handleDeleteItem = async (item: Item) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      await deleteItem(item.id);
      setSelectedItemId(null);
    }
  };

  const handleMoveItem = async (movedId: number, newParentId: number | null) => {
    try {
      console.log('Moving item:', movedId, 'to parent:', newParentId);
      
      // Validate move
      moveNode(items, movedId, newParentId);
      
      // Update database - explicitly set parent_id to null if that's what we want
      await itemsAPI.update(movedId, { 
        parent_id: newParentId === null ? null : newParentId
      });

      // Refresh to ensure consistency
      await refresh();
    } catch (error) {
      console.error('Move failed:', error);
      throw error;
    }
  };

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
      />

      <div className="h-[calc(100vh-64px)]">
        {/* Project Title Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            {selectedProject?.name || 'Select a Project'}
          </h1>
          
          <button
            onClick={() => setShowItemForm(true)}
            disabled={!selectedProjectId}
            style={{
              backgroundColor: selectedProjectId ? '#3FB95A' : '#d1d5db',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              fontSize: '16px',
              cursor: selectedProjectId ? 'pointer' : 'not-allowed',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              if (selectedProjectId) {
                e.currentTarget.style.backgroundColor = '#2fa849';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedProjectId) {
                e.currentTarget.style.backgroundColor = '#3FB95A';
              }
            }}
          >
            + New Item
          </button>
        </div>

        {/* Content Area */}
        <div className="flex h-[calc(100%-73px)]">
          <div className={`${selectedItemId ? 'w-2/3' : 'w-full'} border-r border-gray-200 flex flex-col bg-white`}>
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
      </div>

      {/* Modals */}
      {showProjectForm && (
        <ProjectForm
          isOpen={showProjectForm}
          onClose={() => setShowProjectForm(false)}
          onSubmit={handleProjectSubmit}
        />
      )}

      {showItemForm && (
        <ItemForm
          isOpen={showItemForm}
          onClose={() => setShowItemForm(false)}
          onSubmit={handleCreateItem}
          availableItems={items}
        />
      )}

      {editingItem && (
        <ItemForm
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdateItem}
          item={editingItem}
          availableItems={items}
        />
      )}
    </div>
  );
}
