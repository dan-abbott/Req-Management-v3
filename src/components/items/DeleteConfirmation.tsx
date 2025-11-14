// DeleteConfirmation - Enhanced with child item handling

import { useState } from 'react';
import { Item } from '../../types';

interface DeleteConfirmationProps {
  item: Item;
  allItems: Item[]; // Need this to check for children
  onConfirm: (deleteChildren: boolean, newParentId?: number | null) => void;
  onCancel: () => void;
}

export function DeleteConfirmation({ item, allItems, onConfirm, onCancel }: DeleteConfirmationProps) {
  const [deleteOption, setDeleteOption] = useState<'cascade' | 'reassign' | 'root'>('cascade');
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>();

  // Find children of this item
  const children = allItems.filter(i => i.parent_id === item.id);
  const hasChildren = children.length > 0;

  // Get potential new parents (exclude self and descendants)
  const potentialParents = allItems.filter(i => {
    if (i.id === item.id) return false; // Can't be own parent
    if (i.parent_id === item.id) return false; // Don't show direct children
    // TODO: Could add logic to exclude all descendants
    return true;
  });

  const handleConfirm = () => {
    if (hasChildren) {
      if (deleteOption === 'cascade') {
        onConfirm(true); // Delete children too
      } else if (deleteOption === 'root') {
        onConfirm(false, null); // Move children to root
      } else if (deleteOption === 'reassign' && selectedParentId) {
        onConfirm(false, selectedParentId); // Move children to selected parent
      } else {
        return; // Reassign selected but no parent chosen
      }
    } else {
      onConfirm(false); // No children, simple delete
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      epic: 'bg-purple-100 text-purple-800 border-purple-300',
      requirement: 'bg-blue-100 text-blue-800 border-blue-300',
      'test-case': 'bg-green-100 text-green-800 border-green-300',
      defect: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Delete Item?
          </h2>

          {/* Item Info */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getTypeColor(item.type)}`}>
                {item.type === 'test-case' ? 'Test Case' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </span>
              <span className="text-sm text-gray-500">#{item.id}</span>
            </div>
            
            <div className="font-medium text-gray-900">{item.title}</div>
            
            {item.description && (
              <div className="text-sm text-gray-600 line-clamp-2">
                {item.description}
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action cannot be undone. The item will be permanently deleted.
            </p>
          </div>

          {/* Children Handling Options */}
          {hasChildren && (
            <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="font-medium text-gray-900 mb-3">
                This item has {children.length} child item{children.length !== 1 ? 's' : ''}
              </div>
              
              <div className="space-y-3">
                {/* Option 1: Delete Children */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="cascade"
                    checked={deleteOption === 'cascade'}
                    onChange={() => setDeleteOption('cascade')}
                    className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Delete all children</div>
                    <div className="text-sm text-gray-600">
                      Permanently delete this item and all {children.length} child item{children.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </label>

                {/* Option 2: Move to Root */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="root"
                    checked={deleteOption === 'root'}
                    onChange={() => setDeleteOption('root')}
                    className="mt-1 w-4 h-4 text-[#3FB95A] focus:ring-[#3FB95A]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Move children to root level</div>
                    <div className="text-sm text-gray-600">
                      Keep child items but remove their parent (move to top level)
                    </div>
                  </div>
                </label>

                {/* Option 3: Reassign to New Parent */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="reassign"
                    checked={deleteOption === 'reassign'}
                    onChange={() => setDeleteOption('reassign')}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Reassign to new parent</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Move child items to a different parent
                    </div>
                    
                    {deleteOption === 'reassign' && (
                      <select
                        value={selectedParentId || ''}
                        onChange={(e) => setSelectedParentId(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                      >
                        <option value="">Select new parent...</option>
                        {potentialParents.map(parent => (
                          <option key={parent.id} value={parent.id}>
                            #{parent.id} - {parent.title.substring(0, 50)}{parent.title.length > 50 ? '...' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleteOption === 'reassign' && !selectedParentId}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmation;
