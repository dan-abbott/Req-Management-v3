// ItemForm - FIXED with proper modal backdrop

import { useState, useEffect } from 'react';
import { Item, ItemType, ItemStatus, ItemFormData, RequirementLevel } from '../../types';
import { ITEM_TYPES, STATUS_OPTIONS, PRIORITY_OPTIONS, REQUIREMENT_LEVELS } from '../../utils/constants';

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  item?: Item; // For editing
  availableItems?: Item[]; // For parent selection
}

export function ItemForm({ isOpen, onClose, onSubmit, item, availableItems = [] }: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    type: item?.type || 'requirement',
    title: item?.title || '',
    description: item?.description || '',
    rationale: item?.rationale || '',
    test_method: item?.test_method || '',
    status: item?.status || 'draft',
    priority: item?.priority || 'medium',
    owner: item?.owner || '',
    reviewer_email: item?.reviewer_email || '',
    tester_email: item?.tester_email || '',
    level: item?.level,
    parent_id: item?.parent_id
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form when item changes (for edit mode)
  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type,
        title: item.title,
        description: item.description || '',
        rationale: item.rationale || '',
        test_method: item.test_method || '',
        status: item.status,
        priority: item.priority || 'medium',
        owner: item.owner || '',
        reviewer_email: item.reviewer_email || '',
        tester_email: item.tester_email || '',
        level: item.level,
        parent_id: item.parent_id
      });
    } else {
      // Reset for new item
      setFormData({
        type: 'requirement',
        title: '',
        description: '',
        rationale: '',
        test_method: '',
        status: 'draft',
        priority: 'medium',
        owner: '',
        reviewer_email: '',
        tester_email: '',
        level: undefined,
        parent_id: undefined
      });
    }
  }, [item, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  // Get available parent items (exclude self and descendants for edit)
  const parentOptions = availableItems.filter(i => {
    if (!item) return true; // Creating new - all items available
    return i.id !== item.id; // Exclude self when editing
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Edit Item' : 'Create New Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value as ItemType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
              required
            >
              {ITEM_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
              required
              placeholder="Enter item title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A] resize-none"
              rows={3}
              placeholder="Describe the item..."
            />
          </div>

          {/* Grid for Status, Priority, Owner */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value as ItemStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
              >
                {STATUS_OPTIONS[formData.type].map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => updateField('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
              >
                {PRIORITY_OPTIONS.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => updateField('owner', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                placeholder="Owner name"
              />
            </div>
          </div>

          {/* Conditional Fields Based on Type */}
          {formData.type === 'requirement' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rationale
                </label>
                <textarea
                  value={formData.rationale || ''}
                  onChange={(e) => updateField('rationale', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A] resize-none"
                  rows={2}
                  placeholder="Why is this requirement needed?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={formData.level || ''}
                  onChange={(e) => updateField('level', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                >
                  <option value="">Select level...</option>
                  {REQUIREMENT_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reviewer Email
                </label>
                <input
                  type="email"
                  value={formData.reviewer_email || ''}
                  onChange={(e) => updateField('reviewer_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  placeholder="reviewer@example.com"
                />
              </div>
            </>
          )}

          {formData.type === 'test-case' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Method
                </label>
                <textarea
                  value={formData.test_method || ''}
                  onChange={(e) => updateField('test_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A] resize-none"
                  rows={2}
                  placeholder="How to execute this test..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tester Email
                </label>
                <input
                  type="email"
                  value={formData.tester_email || ''}
                  onChange={(e) => updateField('tester_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  placeholder="tester@example.com"
                />
              </div>
            </>
          )}

          {/* Parent Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Item
            </label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) => updateField('parent_id', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
            >
              <option value="">None (root level)</option>
              {parentOptions.map(parentItem => (
                <option key={parentItem.id} value={parentItem.id}>
                  {parentItem.type.toUpperCase()} #{parentItem.id} - {parentItem.title}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#3FB95A] text-white rounded-lg hover:bg-[#35a04d] disabled:bg-gray-400 transition-colors font-medium"
            >
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
