// Utility functions for constants (additions to existing constants.ts)

import { ItemType, ItemStatus, Priority } from '../types';

// Add these functions to your existing src/utils/constants.ts file

/**
 * Get color classes for item type badge
 */
export function getItemTypeColor(type: ItemType): string {
  const colors = {
    'epic': 'bg-purple-100 text-purple-800',
    'requirement': 'bg-blue-100 text-blue-800',
    'test-case': 'bg-green-100 text-green-800',
    'defect': 'bg-red-100 text-red-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Get display label for item type
 */
export function getItemTypeLabel(type: ItemType): string {
  const labels = {
    'epic': 'Epic',
    'requirement': 'Requirement',
    'test-case': 'Test Case',
    'defect': 'Defect'
  };
  return labels[type] || type;
}

/**
 * Get color classes for status badge
 */
export function getStatusColor(status: ItemStatus): string {
  // Approved, passed = green
  if (status === 'approved' || status === 'passed') {
    return 'bg-green-100 text-green-800';
  }
  
  // In review, ready for test = yellow
  if (status === 'in-review' || status === 'ready-for-test') {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  // Rejected, failed = red
  if (status === 'rejected' || status === 'failed') {
    return 'bg-red-100 text-red-800';
  }
  
  // In process = blue
  if (status === 'in-process') {
    return 'bg-blue-100 text-blue-800';
  }
  
  // Draft, not started, resolved, backlog = gray
  return 'bg-gray-100 text-gray-800';
}

/**
 * Get display label for status
 */
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

/**
 * Get color class for priority text
 */
export function getPriorityColor(priority: Priority): string {
  const colors = {
    'critical': 'text-red-600',
    'high': 'text-orange-600',
    'medium': 'text-yellow-600',
    'low': 'text-gray-500'
  };
  return colors[priority] || 'text-gray-500';
}
