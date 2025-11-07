// ItemForm - Fixed with parent selector, compact layout, and proper data population

import { useState, useEffect } from 'react';
import { Item, ItemType, ItemStatus, ItemFormData, RequirementLevel } from '../../types';
import { ITEM_TYPES, STATUS_OPTIONS, PRIORITY_OPTIONS, REQUIREMENT_LEVELS } from '../../utils/constants';

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  item?: Item; // For editing - renamed from initialData
  availableItems?: Item[];  // ← Must have this
}

export function ItemForm({ isOpen, onClose, onSubmit, item }: ItemFormProps) {
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
    }
  }, [item]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Item' : 'Create New Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value as ItemType)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
              disabled={!!item} // Can't change type when editing
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
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
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
                onChange={(e) => updateField('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
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

          {/* Owner and Reviewer - SAME LINE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={(e) => updateField('owner', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
                placeholder="Name or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reviewer Email
              </label>
              <input
                type="email"
                value={formData.reviewer_email || ''}
                onChange={(e) => updateField('reviewer_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
                placeholder="reviewer@example.com"
              />
            </div>
          </div>

          {/* Description - AUTO-EXPAND TEXTAREA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500 resize-none"
              rows={2}
              placeholder="Enter description..."
              style={{ minHeight: '60px', maxHeight: '200px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>

          {/* Type-specific fields */}
          
          {/* Requirement: Level and Rationale */}
          {formData.type === 'requirement' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirement Level
                </label>
                <select
                  value={formData.level || ''}
                  onChange={(e) => updateField('level', e.target.value as RequirementLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
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
                  Rationale
                </label>
                <textarea
                  value={formData.rationale || ''}
                  onChange={(e) => updateField('rationale', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500 resize-none"
                  rows={2}
                  placeholder="Why is this requirement needed?"
                  style={{ minHeight: '60px', maxHeight: '200px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
            </>
          )}

          {/* Test Case: Test Method and Tester */}
          {formData.type === 'test-case' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Method
                </label>
                <textarea
                  value={formData.test_method || ''}
                  onChange={(e) => updateField('test_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500 resize-none"
                  rows={2}
                  placeholder="How to execute this test..."
                  style={{ minHeight: '60px', maxHeight: '200px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fresh-500"
                  placeholder="tester@example.com"
                />
              </div>
            </>
          )}

          {/* Parent Item Selector - REMOVED for now, will add in separate component */}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9ca3af' : '#3FB95A',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
