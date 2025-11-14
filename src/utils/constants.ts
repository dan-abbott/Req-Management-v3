import { ItemType, ItemStatus, Priority, RequirementLevel, RelationshipType } from '../types';

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

// Sprint 4: Relationship type options
export const RELATIONSHIP_TYPES: { value: RelationshipType; label: string; description: string }[] = [
  { 
    value: 'tests', 
    label: 'Tests', 
    description: 'Test case validates a requirement' 
  },
  { 
    value: 'depends-on', 
    label: 'Depends On', 
    description: 'This item requires another item to be completed first' 
  },
  { 
    value: 'derives-from', 
    label: 'Derives From', 
    description: 'This item is decomposed or refined from another item' 
  },
  { 
    value: 'relates-to', 
    label: 'Relates To', 
    description: 'General association between items' 
  }
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

// Sprint 4: Relationship type colors
export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  'tests': 'bg-green-100 text-green-800',
  'depends-on': 'bg-orange-100 text-orange-800',
  'derives-from': 'bg-blue-100 text-blue-800',
  'relates-to': 'bg-gray-100 text-gray-800'
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

// Sprint 4: Relationship type helpers
export function getRelationshipTypeLabel(type: RelationshipType): string {
  const labels = {
    'tests': 'Tests',
    'depends-on': 'Depends On',
    'derives-from': 'Derives From',
    'relates-to': 'Relates To'
  };
  return labels[type] || type;
}

export function getRelationshipTypeColor(type: RelationshipType): string {
  return RELATIONSHIP_COLORS[type] || 'bg-gray-100 text-gray-800';
}

// Sprint 4: Get next level down in requirement hierarchy
export function getNextRequirementLevel(currentLevel?: RequirementLevel): RequirementLevel | null {
  if (!currentLevel) return 'system';
  
  const levelOrder: RequirementLevel[] = [
    'system',
    'sub-system',
    'assembly',
    'sub-assembly',
    'component',
    'sub-component',
    'material'
  ];
  
  const currentIndex = levelOrder.indexOf(currentLevel);
  if (currentIndex === -1 || currentIndex === levelOrder.length - 1) {
    return null; // Already at lowest level or invalid
  }
  
  return levelOrder[currentIndex + 1];
}
