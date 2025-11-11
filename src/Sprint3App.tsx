// Sprint 3 App - FINAL CORRECTED VERSION
// Uses TreeNode (not Item) after buildTree(), correct status types

import { useEffect, useState } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { ProjectForm } from './components/projects/ProjectForm';
import { ItemForm } from './components/items/ItemForm';
import { ItemDetail } from './components/items/ItemDetail';
import { ItemTree } from './components/items/ItemTree';
import { SearchBar } from './components/items/SearchBar';
import { FilterBar } from './components/items/FilterBar';
import { DeleteConfirmation } from './components/items/DeleteConfirmation';
import { useProjects } from './hooks/useProjects';
import { useItems } from './hooks/useItems';
import { Project, ItemFormData, ItemType, ItemStatus, Priority } from './types';
import { TreeNode, buildTree, moveNode as moveNodeHelper } from './utils/treeHelpers';
import { itemsAPI } from './services/api/items';
import { filterBySearch, filterByAttributes, countNodes, incrementVersion, shouldResetToDraft } from './utils/filterHelpers';
import { Plus, FolderOpen } from 'lucide-react';

export function Sprint3App() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading, createProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { items, loading: itemsLoading, refresh } = useItems(selectedProject?.id || null);
  
  // UI State
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<TreeNode | null>(null);
  const [deletingItem, setDeletingItem] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

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

  // Build tree from flat items
  const tree = buildTree(items);
  
  // Apply filters and search
  const filteredTree = (() => {
    let filtered = tree;
    
    // Apply attribute filters first
    filtered = filterByAttributes(filtered, selectedTypes, selectedStatuses, selectedPriorities);
    
    // Then apply search
    filtered = filterBySearch(filtered, searchQuery);
    
    return filtered;
  })();

  const totalCount = countNodes(tree);
  const filteredCount = countNodes(filteredTree);

  const selectedItem = selectedItemId
    ? findItemById(tree, selectedItemId)
    : null;

  if (!user) {
    return <LoginPage />;
  }

  // Handlers
  const handleProjectSubmit = async (data: { name: string; pid: string; project_manager?: string; lead_engineer?: string }) => {
    await createProject(data);
    setShowProjectForm(false);
  };

  const handleCreateItem = async (data: ItemFormData) => {
    if (!selectedProject) return;

    await itemsAPI.create(data, selectedProject.id);
    await refresh();
    setShowItemForm(false);
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (!editingItem) return;

    // Increment version
    const newVersion = incrementVersion(editingItem.version);

    // Reset status if editing approved/passed item
    let newStatus = data.status;
    if (shouldResetToDraft(editingItem.status)) {
      newStatus = 'draft';
    }

    await itemsAPI.update(editingItem.id, {
      ...data,
      version: newVersion,
      status: newStatus,
    });
    
    await refresh();
    setEditingItem(null);
  };

  const handleEdit = (item: TreeNode) => {
    setEditingItem(item);
  };

  const handleDelete = (item: TreeNode) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    await itemsAPI.delete(deletingItem.id);
    await refresh();
    setDeletingItem(null);
    setSelectedItemId(null);
  };

  const handleMoveItem = async (nodeId: number, newParentId: number | null) => {
    try {
      // Update in database
      await itemsAPI.update(nodeId, { parent_id: newParentId || undefined });
      await refresh();
    } catch (error) {
      console.error('Failed to move item:', error);
      throw error;
    }
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onNewProject={() => setShowProjectForm(true)}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {selectedProject && (
          <>
            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowItemForm(true)}
                className="px-4 py-2 bg-fresh-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Item
              </button>
            </div>

            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              itemCount={filteredCount}
              totalCount={totalCount}
            />

            {/* Filter Bar */}
            <FilterBar
              selectedTypes={selectedTypes}
              selectedStatuses={selectedStatuses}
              selectedPriorities={selectedPriorities}
              onTypeChange={setSelectedTypes}
              onStatusChange={setSelectedStatuses}
              onPriorityChange={setSelectedPriorities}
              onClearAll={handleClearFilters}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Tree View */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
                {itemsLoading ? (
                  <div className="text-gray-500 text-center py-8">Loading items...</div>
                ) : filteredTree.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    {tree.length === 0 ? (
                      'No items yet. Create your first item!'
                    ) : (
                      'No items match your filters.'
                    )}
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

              {/* Detail Panel */}
              <div>
                {selectedItem ? (
                  <ItemDetail
                    item={selectedItem}
                    onClose={() => setSelectedItemId(null)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                    Select an item to view details
                  </div>
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

      {deletingItem && (
        <DeleteConfirmation
          item={deletingItem}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </div>
  );
}

// Helper function to find item in tree
function findItemById(nodes: TreeNode[], id: number): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findItemById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}
