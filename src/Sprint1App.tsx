import { useState } from 'react';
import { Header } from './components/layout/Header';
import { ProjectForm } from './components/projects/ProjectForm';
import { ItemList } from './components/items/ItemList';
import { ItemDetail } from './components/items/ItemDetail';
import { ItemForm } from './components/items/ItemForm';
import { Button } from './components/common/Button';
import { useProjects } from './hooks/useProjects';
import { useItems } from './hooks/useItems';
import { Project, Item, ProjectFormData, ItemFormData } from './types';

/**
 * Sprint 1 Main Application Component
 * 
 * Features:
 * - Project creation and selection
 * - Item CRUD operations (all 4 types)
 * - Simple list view (no tree hierarchy yet)
 * - Item detail panel
 * - Type-specific fields
 * - Basic audit logging (handled automatically in API layer)
 */
export function Sprint1App() {
  // Project state
  const { projects, createProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Items state
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem } = useItems(selectedProject?.id || null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Handlers
  const handleCreateProject = async (data: ProjectFormData) => {
    const newProject = await createProject(data);
    setSelectedProject(newProject);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedItem(null); // Clear selected item when switching projects
  };

  const handleCreateItem = async (data: ItemFormData) => {
    await createItem(data);
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
      // Refresh selected item if it's the one being edited
      if (selectedItem?.id === editingItem.id) {
        // The item will be updated in the list, re-select it
        const updated = items.find(i => i.id === editingItem.id);
        if (updated) setSelectedItem(updated);
      }
    }
  };

  const handleDeleteItem = async (item: Item) => {
    await deleteItem(item.id);
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleCloseItemForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logo, project selector, user profile, and logout */}
      <Header
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        onNewProject={() => setShowProjectForm(true)}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {!selectedProject ? (
          /* No project selected state */
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <svg className="w-24 h-24 mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h2 className="text-2xl font-semibold mb-2">No Project Selected</h2>
            <p className="text-lg mb-6">Select a project from the dropdown or create a new one</p>
            <Button variant="primary" onClick={() => setShowProjectForm(true)}>
              Create Your First Project
            </Button>
          </div>
        ) : (
          /* Project selected - show items */
          <div className="grid grid-cols-12 gap-6">
            {/* Items list */}
            <div className={`${selectedItem ? 'col-span-5' : 'col-span-12'} bg-white rounded-lg shadow`}>
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Items ({items.length})
                </h2>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingItem(null);
                    setShowItemForm(true);
                  }}
                >
                  + New Item
                </Button>
              </div>
              <ItemList
                items={items}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                loading={itemsLoading}
              />
            </div>

            {/* Item detail panel */}
            {selectedItem && (
              <div className="col-span-7 bg-white rounded-lg shadow">
                <ItemDetail
                  item={selectedItem}
                  onClose={() => setSelectedItem(null)}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSubmit={handleCreateProject}
      />

      <ItemForm
        isOpen={showItemForm}
        onClose={handleCloseItemForm}
        onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
        editItem={editingItem}
        parentItems={items}
      />
    </div>
  );
}
