import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { ProjectFormData } from '../../types';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

export function ProjectForm({ isOpen, onClose, onSubmit }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    pid: '',
    project_manager: '',
    lead_engineer: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.pid.trim()) {
      newErrors.pid = 'Project ID is required';
    } else if (!/^[A-Z0-9-]+$/.test(formData.pid)) {
      newErrors.pid = 'Project ID must be uppercase letters, numbers, and hyphens only';
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
      
      // Reset form and close
      setFormData({ name: '', pid: '', project_manager: '', lead_engineer: '' });
      setErrors({});
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create project' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', pid: '', project_manager: '', lead_engineer: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          required
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="My Project"
        />

        <Input
          label="Project ID (PID)"
          required
          value={formData.pid}
          onChange={(e) => handleChange('pid', e.target.value.toUpperCase())}
          error={errors.pid}
          placeholder="PROJ-123"
          maxLength={20}
        />

        <Input
          label="Project Manager"
          value={formData.project_manager}
          onChange={(e) => handleChange('project_manager', e.target.value)}
          placeholder="Jane Smith"
        />

        <Input
          label="Lead Engineer"
          value={formData.lead_engineer}
          onChange={(e) => handleChange('lead_engineer', e.target.value)}
          placeholder="John Doe"
        />

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
