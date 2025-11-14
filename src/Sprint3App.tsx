// Sprint3App.tsx - Complete working version with all fixes

import { useState, useEffect } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import { useProjects } from './hooks/useProjects';
import { useItems } from './hooks/useItems';
import { itemsAPI } from './services/api/items';
import { Item, ItemFormData, ItemType, ItemStatus, Priority } from './types';

// Components
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { ResizablePanels } from './components/layout/ResizablePanels';
import { SearchBar } from './components/items/SearchBar';
import FilterBar from './components/items/FilterBar';
import { ItemTree } from './components/items/ItemTree';
import { ItemDetail } from './components/items/ItemDetail';
import { ItemForm } from './components/items/ItemForm';
import DeleteConfirmation from './components/items/DeleteConfirmation';
import { Plus } from 'lucide-react';

function Sprint3App() {
  const { user, loading: authLoading } = useAuth();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Items hook
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem, refresh } = useItems(selectedProject?.id || null);

  // UI State
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ItemType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ItemStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Apply filters - inline filtering to match Item[] type
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

  const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) || null : null;

  // === HANDLERS ===

  const handleCreateItem = async (formData: ItemFormData) => {
    if (!selectedProject) return;

    await createItem({
      ...formData,
      project_id: selectedProject.id,
    } as any); // Type assertion for project_id
    await refresh();
    setShowItemForm(false);
  };

  const handleUpdateItem = async (formData: ItemFormData) => {
    if (!editingItem) return;

    const newVersion = editingItem.version + 1;
    const newStatus = editingItem.status === 'approved' ? 'draft' : formData.status;

    // CRITICAL FIX: Convert undefined to null for database
    const updateData = {
      ...formData,
      version: newVersion,
      status: newStatus,
      parent_id: formData.parent_id === undefined ? null : formData.parent_id
    };

    await updateItem(editingItem.id, updateData as Partial<Item>);
    await refresh();
    setEditingItem(null);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setSelectedItemId(null);
  };

  const handleDeleteClick = (item: Item) => {
    setDeletingItem(item);
  };

  const handleConfirmDelete = async (deleteChildren: boolean, newParentId?: number | null) => {
    if (!deletingItem) return;

    try {
      if (deleteChildren) {
        // CASCADE DELETE: Delete item and all its children
        const childrenToDelete = items.filter(i => i.parent_id === deletingItem.id);
        
        // Delete children first
        for (const child of childrenToDelete) {
          await deleteItem(child.id);
        }
        
        // Then delete the parent
        await deleteItem(deletingItem.id);
      } else if (newParentId !== undefined) {
        // REASSIGN: Move children to new parent (could be null for root)
        const childrenToReassign = items.filter(i => i.parent_id === deletingItem.id);
        
        // Update all children with new parent
        for (const child of childrenToReassign) {
          await itemsAPI.update(child.id, { 
            parent_id: newParentId 
          } as Partial<Item>);
        }
        
        // Then delete the item
        await deleteItem(deletingItem.id);
      } else {
        // SIMPLE DELETE: No children, just delete the item
        await deleteItem(deletingItem.id);
      }

      setDeletingItem(null);
      setSelectedItemId(null);
      await refresh();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
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

  // === RENDER ===

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onNewProject={() => {/* Optional: Add project creation */}}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanels
          left={
            <div className="h-full flex flex-col bg-white border-r border-gray-200">
              {/* Search & Filters */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Items ({filteredItems.length} of {items.length})
                  </h2>
                  <button
                    onClick={() => setShowItemForm(true)}
                    className="p-1.5 bg-[#3FB95A] text-white rounded hover:bg-[#35a04d] transition-colors"
                    title="New Item"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  itemCount={filteredItems.length}
                  totalCount={items.length}
                />

                <FilterBar
                  selectedTypes={selectedTypes}
                  selectedStatuses={selectedStatuses}
                  selectedPriorities={selectedPriorities}
                  onTypesChange={setSelectedTypes}
                  onStatusesChange={setSelectedStatuses}
                  onPrioritiesChange={setSelectedPriorities}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Item Tree */}
              <div className="flex-1 overflow-auto">
                {itemsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading items...</div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="text-4xl mb-2">📋</div>
                    <div className="text-sm">No items found</div>
                  </div>
                ) : (
                  <ItemTree
                    items={filteredItems}
                    selectedId={selectedItemId}
                    onSelect={setSelectedItemId}
                    onMove={handleItemMove}
                  />
                )}
              </div>
            </div>
          }
          right={
            <div className="h-full bg-white">
              {selectedItem ? (
                <ItemDetail
                  item={selectedItem}
                  onClose={() => setSelectedItemId(null)}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <div className="text-lg font-medium">Select an item</div>
                    <div className="text-sm">Click an item to view details</div>
                  </div>
                </div>
              )}
            </div>
          }
          defaultLeftWidth={40}
          minLeftWidth={30}
          maxLeftWidth={60}
        />
      </div>

      {/* Modals */}
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

      {deletingItem && (
        <DeleteConfirmation
          item={deletingItem}
          allItems={items}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}

export default Sprint3App;
