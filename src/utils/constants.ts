import { ItemType, ItemStatus, Priority, RequirementLevel } from '../types';

// Item type options
export const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'epic', label: 'Epic' },
  { value: 'requirement', label: 'Requirement' },
  { value: 'test-case', label: 'Test Case' },
  { value: 'defect', label: 'Defect' }
];

// Status options by item type
export const STATUS_OPTIONS: Record<ItemType, { value: ItemStatus; label: string }[]> = {
  'epic': [
    { value: 'draft', label: 'Draft' },
    { value: 'in-review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ],
  'requirement': [
    { value: 'draft', label: 'Draft' },
    { value: 'in-review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ],
  'test-case': [
    { value: 'draft', label: 'Draft' },
    { value: 'ready-for-test', label: 'Ready for Test' },
    { value: 'passed', label: 'Passed' },
    { value: 'failed', label: 'Failed' }
  ],
  'defect': [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-process', label: 'In Process' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'backlog', label: 'Backlog' }
  ]
};

// Priority options
export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

// Requirement level options
export const REQUIREMENT_LEVELS: { value: RequirementLevel; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'sub-system', label: 'Sub-system' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'sub-assembly', label: 'Sub-assembly' },
  { value: 'component', label: 'Component' },
  { value: 'sub-component', label: 'Sub-component' },
  { value: 'material', label: 'Material' }
];

// Color mappings for UI
export const TYPE_COLORS: Record<ItemType, string> = {
  'epic': 'bg-purple-100 text-purple-800 border-purple-300',
  'requirement': 'bg-blue-100 text-blue-800 border-blue-300',
  'test-case': 'bg-green-100 text-green-800 border-green-300',
  'defect': 'bg-red-100 text-red-800 border-red-300'
};

export const STATUS_COLORS: Record<ItemStatus, string> = {
  'draft': 'bg-gray-100 text-gray-700',
  'in-review': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
  'ready-for-test': 'bg-blue-100 text-blue-800',
  'passed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'not-started': 'bg-gray-100 text-gray-700',
  'in-process': 'bg-blue-100 text-blue-800',
  'resolved': 'bg-green-100 text-green-800',
  'backlog': 'bg-gray-100 text-gray-700'
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'low': 'text-gray-600',
  'medium': 'text-yellow-600',
  'high': 'text-orange-600',
  'critical': 'text-red-600'
};

export function getItemTypeColor(type: ItemType): string {
  const colors = {
    'epic': 'bg-purple-100 text-purple-800',
    'requirement': 'bg-blue-100 text-blue-800',
    'test-case': 'bg-green-100 text-green-800',
    'defect': 'bg-red-100 text-red-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

export function getItemTypeLabel(type: ItemType): string {
  const labels = {
    'epic': 'Epic',
    'requirement': 'Requirement',
    'test-case': 'Test Case',
    'defect': 'Defect'
  };
  return labels[type] || type;
}

export function getStatusColor(status: ItemStatus): string {
  if (status === 'approved' || status === 'passed') {
    return 'bg-green-100 text-green-800';
  }
  if (status === 'in-review' || status === 'ready-for-test') {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (status === 'rejected' || status === 'failed') {
    return 'bg-red-100 text-red-800';
  }
  if (status === 'in-process') {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: ItemStatus): string {
  const labels = {
    'draft': 'Draft',
    'in-review': 'In Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'ready-for-test': 'Ready for Test',
    'passed': 'Passed',
    'failed': 'Failed',
    'not-started': 'Not Started',
    'in-process': 'In Process',
    'resolved': 'Resolved',
    'backlog': 'Backlog'
  };
  return labels[status] || status;
}

export function getItemTypeColor(type: ItemType): string { ... }
export function getItemTypeLabel(type: ItemType): string { ... }
export function getStatusColor(status: ItemStatus): string { ... }
export function getStatusLabel(status: ItemStatus): string { ... }
