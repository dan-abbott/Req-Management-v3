import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Project, Item, ItemType, ItemStatus, Priority, ItemFormData } from './types';
import { useProjects } from './hooks/useProjects';
import { useItems } from './hooks/useItems';
import { itemsAPI } from './services/api';
import Header from './components/layout/Header';
import ProjectSelector from './components/projects/ProjectSelector';
import ItemTree from './components/items/ItemTree';
import ItemForm from './components/items/ItemForm';
import ItemDetail from './components/items/ItemDetail';
import LoginPage from './pages/LoginPage';
import SearchBar from './components/items/SearchBar';
import FilterBar from './components/items/FilterBar';
import DeleteConfirmation from './components/items/DeleteConfirmation';

function Sprint3App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ItemType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ItemStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([]);

  const { projects, addProject } = useProjects();
  const { items, addItem, updateItem, deleteItem, refreshItems } = useItems(selectedProjectId);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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

  const handleSaveItem = async (formData: ItemFormData) => {
    if (!selectedProjectId) return;

    try {
      if (editingItem) {
        // Increment version
        const newVersion = editingItem.version + 1;
        
        // Reset status to draft if item was approved
        const newStatus = editingItem.status === 'approved' ? 'draft' : formData.status;

        await updateItem(editingItem.id, {
          ...formData,
          version: newVersion,
          status: newStatus
        } as Partial<Item>);
      } else {
        await addItem({
          ...formData,
          project_id: selectedProjectId
        });
      }
      
      setShowItemForm(false);
      setEditingItem(null);
      await refreshItems();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setShowItemForm(true);
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
      await refreshItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleItemMove = async (itemId: number, newParentId: number | null) => {
    try {
      await itemsAPI.update(itemId, { 
        parent_id: newParentId 
      } as Partial<Item>);
      await refreshItems();
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

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={session.user}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProjectId}
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Tree View */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <button
              onClick={() => {
                setShowItemForm(true);
                setEditingItem(null);
              }}
              disabled={!selectedProjectId}
              className="w-full bg-fresh-500 text-white px-4 py-2 rounded hover:bg-fresh-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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

          {/* Tree View */}
          <div className="flex-1 overflow-auto p-4">
            {selectedProjectId ? (
              <ItemTree
                items={filteredItems}
                selectedItemId={selectedItemId}
                onItemSelect={setSelectedItemId}
                onItemMove={handleItemMove}
              />
            ) : (
              <div className="text-gray-500 text-center py-8">
                Select a project to view items
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Detail/Form View */}
        <div className="flex-1 overflow-auto">
          {showItemForm ? (
            <div className="p-6">
              <ItemForm
                projectId={selectedProjectId!}
                items={items}
                editingItem={editingItem}
                onSave={handleSaveItem}
                onCancel={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                }}
              />
            </div>
          ) : selectedItem ? (
            <ItemDetail
              item={selectedItem}
              allItems={items}
              onEdit={handleEditItem}
              onDelete={handleDeleteClick}
              onClose={() => setSelectedItemId(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an item to view details
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteConfirmation
          item={itemToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}

export default Sprint3App;
