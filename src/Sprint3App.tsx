import { useState, useEffect } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { ItemTree } from './components/items/ItemTree';
import { ItemForm } from './components/items/ItemForm';
import { ItemDetail } from './components/items/ItemDetail';
import { ProjectForm } from './components/projects/ProjectForm';
import { useProjects } from './hooks/useProjects';
import { useItems } from './hooks/useItems';
import { Item, ItemType, ItemStatus, Priority, ItemFormData, Project } from './types';
import { itemsAPI } from './services/api/items';
import SearchBar from './components/items/SearchBar';
import FilterBar from './components/items/FilterBar';
import DeleteConfirmation from './components/items/DeleteConfirmation';

export function Sprint3App() {
  const { user, loading: authLoading } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ItemType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ItemStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);

  const { projects, createProject, refresh: refreshProjects } = useProjects();
  const { items, createItem, updateItem, deleteItem, refresh } = useItems(selectedProjectId);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // Filter items
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesDescription = item.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) {
      return false;
    }

    // Status filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(item.status)) {
      return false;
    }

    // Priority filter
    if (selectedPriorities.length > 0) {
      if (!item.priority || !selectedPriorities.includes(item.priority)) {
        return false;
      }
    }

    return true;
  });

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setSelectedItemId(null);
  };

  const handleCreateProject = async (data: any) => {
    await createProject(data);
    await refreshProjects();
    setShowProjectForm(false);
  };

  const handleCreateItem = async (formData: ItemFormData) => {
    if (!selectedProjectId) return;
    await createItem(formData);
    await refresh();
  };

  const handleUpdateItem = async (formData: ItemFormData) => {
    if (!editingItem) return;

    // Increment version
    const newVersion = editingItem.version + 1;
    
    // Reset status to draft if item was approved
    const newStatus = editingItem.status === 'approved' ? 'draft' : formData.status;

    await updateItem(editingItem.id, {
      ...formData,
      version: newVersion,
      status: newStatus
    } as Partial<ItemFormData>);
    await refresh();
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setSelectedItemId(null);
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete.id);
      setItemToDelete(null);
      setSelectedItemId(null);
      await refresh();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleItemMove = async (itemId: number, newParentId: number | null) => {
    try {
      await itemsAPI.update(itemId, { 
        parent_id: newParentId 
      } as Partial<Item>);
      await refresh();
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
  };

  const selectedItem = items.find(item => item.id === selectedItemId) || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        onNewProject={() => setShowProjectForm(true)}
      />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Tree View - WIDENED */}
        <div className="w-[600px] bg-white border-r border-gray-200 flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <button
              onClick={() => setShowItemForm(true)}
              disabled={!selectedProjectId}
              className="w-full bg-[#3FB95A] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#35a04d] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              + New Item
            </button>

            {/* Search Bar */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              itemCount={filteredItems.length}
            />

            {/* Filter Bar */}
            <FilterBar
              selectedTypes={selectedTypes}
              onTypesChange={setSelectedTypes}
              selectedStatuses={selectedStatuses}
              onStatusesChange={setSelectedStatuses}
              selectedPriorities={selectedPriorities}
              onPrioritiesChange={setSelectedPriorities}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Tree View - With proper filtering */}
          <div className="flex-1 overflow-auto p-4">
            {selectedProjectId ? (
              filteredItems.length > 0 ? (
                <ItemTree
                  items={filteredItems}
                  selectedId={selectedItemId}
                  onSelect={setSelectedItemId}
                  onMove={handleItemMove}
                />
              ) : (
                <div className="text-gray-500 text-center py-8">
                  {items.length === 0 
                    ? 'No items yet. Create your first item!' 
                    : 'No items match your filters.'}
                </div>
              )
            ) : (
              <div className="text-gray-500 text-center py-8">
                Select a project to view items
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <ItemDetail
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Item Form Modal */}
      <ItemForm
        isOpen={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateItem}
        availableItems={items}
      />

      {/* Edit Item Form Modal */}
      {editingItem && (
        <ItemForm
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdateItem}
          item={editingItem}
          availableItems={items}
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteConfirmation
          item={itemToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => setShowProjectForm(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}

export default Sprint3App;
