// Tree helper utilities for hierarchical item structure

import { Item, RequirementLevel } from '../types';

export interface TreeNode extends Item {
  children: TreeNode[];
  level: number; // Depth in tree (0 = root)
}

/**
 * Convert flat array of items to tree structure
 */
export function buildTree(items: Item[]): TreeNode[] {
  // Create a map of all items for quick lookup
  const itemMap = new Map<number, TreeNode>();
  
  // Initialize all items as tree nodes
  items.forEach(item => {
    itemMap.set(item.id, {
      ...item,
      children: [],
      level: 0
    });
  });

  // Build parent-child relationships
  const roots: TreeNode[] = [];
  
  items.forEach(item => {
    const node = itemMap.get(item.id)!;
    
    if (item.parent_id && itemMap.has(item.parent_id)) {
      // Has parent - add to parent's children
      const parent = itemMap.get(item.parent_id)!;
      parent.children.push(node);
      node.level = parent.level + 1;
    } else {
      // No parent - this is a root node
      roots.push(node);
    }
  });

  // Sort children by created_at for consistent ordering
  const sortChildren = (node: TreeNode) => {
    node.children.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    node.children.forEach(sortChildren);
  };

  roots.forEach(sortChildren);
  
  return roots;
}

/**
 * Flatten tree back to array (for updates)
 */
export function flattenTree(nodes: TreeNode[]): Item[] {
  const result: Item[] = [];
  
  const traverse = (node: TreeNode) => {
    const { level, ...item } = node; // Remove level, keep Item properties
    result.push(item as Item);
    node.children.forEach(traverse);
  };
  
  nodes.forEach(traverse);
  return result;
}

/**
 * Find a node in the tree by ID
 */
export function findNode(nodes: TreeNode[], id: number): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

/**
 * Get all descendant IDs of a node (for preventing circular references)
 */
export function getDescendantIds(node: TreeNode): number[] {
  const ids: number[] = [node.id];
  node.children.forEach(child => {
    ids.push(...getDescendantIds(child));
  });
  return ids;
}

/**
 * Update parent-child relationships when moving a node
 */
export function moveNode(
  items: Item[],
  movedId: number,
  newParentId: number | null
): Item[] {
  // Prevent moving to own descendant (circular reference)
  const tree = buildTree(items);
  const movedNode = findNode(tree, movedId);
  
  if (movedNode && newParentId) {
    const descendantIds = getDescendantIds(movedNode);
    if (descendantIds.includes(newParentId)) {
      throw new Error('Cannot move item to its own descendant');
    }
  }

  // Update the moved item's parent
  const updatedItems = items.map(item => {
    if (item.id === movedId) {
      return { ...item, parent_id: newParentId || undefined };
    }
    return item;
  });

  // Update children arrays
  const itemMap = new Map(updatedItems.map(item => [item.id, item]));
  
  updatedItems.forEach(item => {
    // Rebuild children array based on parent_id relationships
    item.children = updatedItems
      .filter(child => child.parent_id === item.id)
      .map(child => child.id);
  });

  return updatedItems;
}

/**
 * Get requirement level hierarchy for filtering
 */
export const REQUIREMENT_LEVELS: RequirementLevel[] = [
  'system',
  'sub-system',
  'assembly',
  'sub-assembly',
  'component',
  'sub-component',
  'material'
];

/**
 * Get level index (for level-based expansion)
 */
export function getLevelIndex(level?: RequirementLevel): number {
  if (!level) return -1;
  return REQUIREMENT_LEVELS.indexOf(level);
}

/**
 * Expand tree to a specific requirement level
 */
export function shouldExpandToLevel(
  node: TreeNode,
  targetLevel: RequirementLevel
): boolean {
  // If this is a requirement, check its level
  if (node.type === 'requirement' && node.level) {
    const nodeIndex = getLevelIndex(node.level);
    const targetIndex = getLevelIndex(targetLevel);
    return nodeIndex < targetIndex;
  }
  
  // For non-requirements (epics, tests, defects), expand if depth < 3
  return node.level < 3;
}

/**
 * Get next requirement level (for level suggestion on derivation)
 */
export function getNextLevel(currentLevel?: RequirementLevel): RequirementLevel | null {
  if (!currentLevel) return REQUIREMENT_LEVELS[0];
  
  const currentIndex = getLevelIndex(currentLevel);
  if (currentIndex < REQUIREMENT_LEVELS.length - 1) {
    return REQUIREMENT_LEVELS[currentIndex + 1];
  }
  
  return null;
}

/**
 * Count total nodes in tree (for metrics)
 */
export function countNodes(nodes: TreeNode[]): number {
  let count = nodes.length;
  nodes.forEach(node => {
    count += countNodes(node.children);
  });
  return count;
}

/**
 * Get maximum depth of tree
 */
export function getMaxDepth(nodes: TreeNode[]): number {
  if (nodes.length === 0) return 0;
  
  let maxDepth = 1;
  nodes.forEach(node => {
    const childDepth = node.children.length > 0 
      ? 1 + getMaxDepth(node.children)
      : 1;
    maxDepth = Math.max(maxDepth, childDepth);
  });
  
  return maxDepth;
}
