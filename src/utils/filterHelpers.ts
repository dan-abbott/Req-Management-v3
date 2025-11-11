// Filter and Search Utilities (FINAL CORRECTED - uses TreeNode)

import { TreeNode } from '../utils/treeHelpers';
import { ItemType, ItemStatus, Priority } from '../types';

/**
 * Filter tree nodes based on search query
 * Preserves parent nodes to maintain tree structure
 */
export function filterBySearch(nodes: TreeNode[], query: string): TreeNode[] {
  if (!query.trim()) return nodes;

  const lowerQuery = query.toLowerCase();

  const filterNode = (node: TreeNode): TreeNode | null => {
    const matchesSearch = 
      node.title.toLowerCase().includes(lowerQuery) ||
      node.description?.toLowerCase().includes(lowerQuery);

    const filteredChildren = node.children
      .map(filterNode)
      .filter((n): n is TreeNode => n !== null);

    // Include node if it matches OR if any children match
    if (matchesSearch || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren
      };
    }

    return null;
  };

  return nodes
    .map(filterNode)
    .filter((n): n is TreeNode => n !== null);
}

/**
 * Filter tree nodes based on type, status, and priority
 * Preserves parent nodes to maintain tree structure
 */
export function filterByAttributes(
  nodes: TreeNode[],
  types: ItemType[],
  statuses: ItemStatus[],
  priorities: Priority[]
): TreeNode[] {
  const hasFilters = types.length > 0 || statuses.length > 0 || priorities.length > 0;
  if (!hasFilters) return nodes;

  const filterNode = (node: TreeNode): TreeNode | null => {
    const matchesType = types.length === 0 || types.includes(node.type);
    const matchesStatus = statuses.length === 0 || statuses.includes(node.status);
    const matchesPriority = priorities.length === 0 || (node.priority && priorities.includes(node.priority));

    const matchesFilters = matchesType && matchesStatus && matchesPriority;

    const filteredChildren = node.children
      .map(filterNode)
      .filter((n): n is TreeNode => n !== null);

    // Include node if it matches OR if any children match
    if (matchesFilters || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren
      };
    }

    return null;
  };

  return nodes
    .map(filterNode)
    .filter((n): n is TreeNode => n !== null);
}

/**
 * Count total nodes in tree (including children)
 */
export function countNodes(nodes: TreeNode[]): number {
  let count = nodes.length;
  nodes.forEach(node => {
    count += countNodes(node.children);
  });
  return count;
}

/**
 * Increment version number (integer)
 */
export function incrementVersion(version: number): number {
  return version + 1;
}

/**
 * Check if editing an approved item (should reset to draft)
 */
export function shouldResetToDraft(currentStatus: string): boolean {
  return currentStatus === 'approved' || currentStatus === 'passed';
}
