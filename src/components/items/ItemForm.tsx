import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Item, ItemFormData, ItemType } from '../../types';
import { 
  ITEM_TYPES, 
  STATUS_OPTIONS, 
  PRIORITY_OPTIONS, 
  REQUIREMENT_LEVELS 
} from '../../utils/constants';
import { itemsAPI } from '../../services/api/items';

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  editItem?: Item | null;
  parentItems?: Item[]; // For parent selection
}

export function ItemForm({ isOpen, onClose, onSubmit, editItem, parentItems = [] }: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    type: 'requirement',
    title: '',
    description: '',
    status: 'draft',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (editItem) {
      setFormData({
        type: editItem.type,
        title: editItem.title,
        description: editItem.description,
        rationale: editItem.rationale,
        test_method: editItem.test_method,
        status: editItem.status,
        priority: editItem.priority,
        owner: editItem.owner,
        reviewer_email: editItem.reviewer_email,
        tester_email: editItem.tester_email,
        level: editItem.level,
        parent_id: editItem.parent_id
      });
    } else {
      // Reset for new item
      setFormData({
        type: 'requirement',
        title: '',
        description: '',
        status: 'draft',
        priority: 'medium'
      });
    }
  }, [editItem, isOpen]);

  // Update status options when type changes
  useEffect(() => {
    if (!editItem) {
      // For new items, set default status for type
      setFormData(prev => ({
        ...prev,
        status: itemsAPI.getDefaultStatus(prev.type) as any
      }));
    }
  }, [formData.type, editItem]);

  const handleChange = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save item' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'requirement',
      title: '',
      description: '',
      status: 'draft',
      priority: 'medium'
    });
    setErrors({});
    onClose();
  };

  const currentStatusOptions = STATUS_OPTIONS[formData.type as ItemType];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={editItem ? 'Edit Item' : 'Create New Item'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type - disabled when editing */}
        <Select
          label="Type"
          required
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={ITEM_TYPES}
          disabled={!!editItem}
        />

        {/* Title */}
        <Input
          label="Title"
          required
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="Enter item title"
        />

        {/* Description */}
        <TextArea
          label="Description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Detailed description..."
        />

        {/* Requirement-specific: Rationale */}
        {formData.type === 'requirement' && (
          <TextArea
            label="Rationale"
            value={formData.rationale || ''}
            onChange={(e) => handleChange('rationale', e.target.value)}
            placeholder="Justification for this requirement..."
          />
        )}

        {/* Requirement-specific: Level */}
        {formData.type === 'requirement' && (
          <Select
            label="Requirement Level"
            value={formData.level || ''}
            onChange={(e) => handleChange('level', e.target.value)}
            options={[{ value: '', label: 'Select level...' }, ...REQUIREMENT_LEVELS]}
          />
        )}

        {/* Test Case-specific: Test Method */}
        {formData.type === 'test-case' && (
          <TextArea
            label="Test Method"
            value={formData.test_method || ''}
            onChange={(e) => handleChange('test_method', e.target.value)}
            placeholder="Test procedure or URL to test document..."
          />
        )}

        {/* Status */}
        <Select
          label="Status"
          required
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={currentStatusOptions}
        />

        {/* Priority */}
        <Select
          label="Priority"
          value={formData.priority || ''}
          onChange={(e) => handleChange('priority', e.target.value)}
          options={[{ value: '', label: 'Select priority...' }, ...PRIORITY_OPTIONS]}
        />

        {/* Owner */}
        <Input
          label="Owner"
          value={formData.owner || ''}
          onChange={(e) => handleChange('owner', e.target.value)}
          placeholder="Assigned owner name"
        />

        {/* Requirement/Epic: Reviewer Email */}
        {(formData.type === 'requirement' || formData.type === 'epic') && (
          <Input
            label="Reviewer Email"
            type="email"
            value={formData.reviewer_email || ''}
            onChange={(e) => handleChange('reviewer_email', e.target.value)}
            placeholder="reviewer@example.com"
          />
        )}

        {/* Test Case: Tester Email */}
        {formData.type === 'test-case' && (
          <Input
            label="Tester Email"
            type="email"
            value={formData.tester_email || ''}
            onChange={(e) => handleChange('tester_email', e.target.value)}
            placeholder="tester@example.com"
          />
        )}

        {/* Parent Selection (if items provided) */}
        {parentItems.length > 0 && (
          <Select
            label="Parent Item"
            value={String(formData.parent_id || '')}
            onChange={(e) => handleChange('parent_id', e.target.value ? Number(e.target.value) : undefined)}
            options={[
              { value: '', label: 'No parent (root level)' },
              ...parentItems.map(item => ({
                value: String(item.id),
                label: `${item.type}: ${item.title}`
              }))
            ]}
          />
        )}

        {/* Error message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : editItem ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
