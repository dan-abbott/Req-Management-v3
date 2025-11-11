// Sprint 3 App - Search, Filters & Enhanced Item Management

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
import { Project, Item, ItemFormData, ItemType, ItemStatus, ItemPriority, TreeNode } from './types';
import { itemsAPI } from './services/api/items';
import { moveNode } from './utils/treeHelpers';
import { filterBySearch, filterByAttributes, countNodes, incrementVersion, shouldResetToDraft } from './utils/filterHelpers';
import { Plus, FolderOpen } from 'lucide-react';

export function Sprint3App() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading, createProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { items, loading: itemsLoading, refreshItems } = useItems(selectedProject?.id || null);
  
  // UI State
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ItemType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ItemStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<ItemPriority[]>([]);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  // Apply filters and search
  const filteredItems = (() => {
    let filtered = items;
    
    // Apply attribute filters first
    filtered = filterByAttributes(filtered, selectedTypes, selectedStatuses, selectedPriorities);
    
    // Then apply search
    filtered = filterBySearch(filtered, searchQuery);
    
    return filtered;
  })();

  const totalCount = countNodes(items);
  const filteredCount = countNodes(filteredItems);

  const selectedItem = selectedItemId
    ? findItemById(items, selectedItemId)
    : null;

  if (!user) {
    return <LoginPage />;
  }

  // Handlers
  const handleProjectSubmit = async (data: Partial<Project>) => {
    await createProject(data);
    setShowProjectForm(false);
  };

  const handleCreateItem = async (data: ItemFormData) => {
    if (!selectedProject) return;

    const newItem = {
      ...data,
      project_id: selectedProject.id,
      version: '1.0',
      created_by: user.email,
    };

    await itemsAPI.create(newItem as Partial<Item>);
    await refreshItems();
    setShowItemForm(false);
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (!editingItem) return;

    // Increment version
    const newVersion = incrementVersion(editingItem.version);

    // Reset status if editing approved/passed item
    let newStatus = data.status;
    if (shouldResetToDraft(editingItem.status)) {
      newStatus = 'Draft';
    }

    const updates = {
      ...data,
      version: newVersion,
      status: newStatus,
    } as Partial<Item>;

    await itemsAPI.update(editingItem.id, updates);
    await refreshItems();
    setEditingItem(null);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  const handleDelete = (item: Item) => {
    setDeletingItem(item);
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    await itemsAPI.delete(deletingItem.id);
    await refreshItems();
    setDeletingItem(null);
    setSelectedItemId(null);
  };

  const handleMoveItem = async (nodeId: number, newParentId: number | null) => {
    const updatedTree = moveNode(items, nodeId, newParentId);
    if (updatedTree) {
      await itemsAPI.update(nodeId, { parent_id: newParentId } as Partial<Item>);
      await refreshItems();
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
      <Header user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Project Selection & Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p.id === Number(e.target.value));
                    setSelectedProject(project || null);
                  }}
                  className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                  disabled={projectsLoading}
                >
                  {projects.length === 0 ? (
                    <option value="">No projects</option>
                  ) : (
                    projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProjectForm(true)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                New Project
              </button>
              <button
                onClick={() => setShowItemForm(true)}
                disabled={!selectedProject}
                className="px-4 py-2 bg-fresh-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                New Item
              </button>
            </div>
          </div>
        </div>

        {selectedProject && (
          <>
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
                ) : filteredItems.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    {items.length === 0 ? (
                      'No items yet. Create your first item!'
                    ) : (
                      'No items match your filters.'
                    )}
                  </div>
                ) : (
                  <ItemTree
                    items={filteredItems}
                    selectedId={selectedItemId}
                    onSelect={setSelectedItemId}
                    onMove={handleMoveItem}
                    expandedNodes={expandedNodes}
                    onExpandedChange={setExpandedNodes}
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
function findItemById(nodes: TreeNode[], id: number): Item | null {
  for (const node of nodes) {
    if (node.id === id) return node as Item;
    const found = findItemById(node.children, id);
    if (found) return found;
  }
  return null;
}
