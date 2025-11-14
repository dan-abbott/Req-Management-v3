// ItemForm - Fixed parent selection: "None (root level)" now works

import { useState, useEffect } from 'react';
import { ItemFormData, Item, ItemType, ItemStatus, Priority, RequirementLevel } from '../../types';
import {
  ITEM_TYPES,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  REQUIREMENT_LEVELS,
} from '../../utils/constants';

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  item?: Item;
  availableItems?: Item[];
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
      // CRITICAL FIX: Convert empty parent to null
      const submitData = {
        ...formData,
        parent_id: formData.parent_id || null  // Empty/undefined becomes null
      };
      await onSubmit(submitData);
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

  // Get parent options (exclude self and descendants)
  const parentOptions = availableItems.filter(i => {
    if (!item) return true; // New item can have any parent
    if (i.id === item.id) return false; // Can't be parent of itself
    // TODO: Could add logic to prevent circular references
    return true;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {item ? 'Edit Item' : 'New Item'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Type and Parent - SAME LINE */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as ItemType;
                    updateField('type', newType);
                    // Reset status to valid option for new type
                    const validStatuses = STATUS_OPTIONS[newType];
                    if (!validStatuses.some(s => s.value === formData.status)) {
                      updateField('status', validStatuses[0].value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  disabled={!!item} // Can't change type when editing
                  required
                >
                  {ITEM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {availableItems.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Item
                  </label>
                  <select
                    value={formData.parent_id ?? ''}
                    onChange={(e) => {
                      // CRITICAL FIX: Properly convert empty string to null
                      const value = e.target.value;
                      updateField('parent_id', value === '' ? null : Number(value));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  >
                    <option value="">None (root level)</option>
                    {parentOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        #{option.id} - {option.title.substring(0, 40)}{option.title.length > 40 ? '...' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                required
              />
            </div>

            {/* Priority and Status - SAME LINE */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => updateField('priority', e.target.value as Priority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value as ItemStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  required
                >
                  {STATUS_OPTIONS[formData.type].map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type-Specific Fields */}
            {formData.type === 'requirement' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirement Level
                  </label>
                  <select
                    value={formData.level || ''}
                    onChange={(e) => updateField('level', e.target.value as RequirementLevel || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  >
                    <option value="">Select level...</option>
                    {REQUIREMENT_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  />
                </div>
              </div>
            )}

            {formData.type === 'test-case' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Method
                  </label>
                  <select
                    value={formData.test_method || ''}
                    onChange={(e) => updateField('test_method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  >
                    <option value="">Select method...</option>
                    <option value="manual">Manual</option>
                    <option value="automated">Automated</option>
                    <option value="exploratory">Exploratory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tester Email
                  </label>
                  <input
                    type="email"
                    value={formData.tester_email || ''}
                    onChange={(e) => updateField('tester_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                  />
                </div>
              </div>
            )}

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => updateField('owner', e.target.value)}
                placeholder="Name or email"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
              />
            </div>

            {/* Rationale - Only for requirements */}
            {formData.type === 'requirement' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rationale
                </label>
                <textarea
                  value={formData.rationale || ''}
                  onChange={(e) => updateField('rationale', e.target.value)}
                  rows={3}
                  placeholder="Why is this requirement needed?"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#3FB95A] text-white rounded-lg hover:bg-[#35a04d] font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
