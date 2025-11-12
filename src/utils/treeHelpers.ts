// Tree helper utilities - FIXED VERSION

import { Item, RequirementLevel, ItemType, ItemStatus, Priority } from '../types';

// TreeNode - Explicitly separate from Item to avoid type conflicts
export interface TreeNode {
  // Core Item properties (copied, not extended to avoid conflicts)
  id: number;
  project_id: number;
  type: ItemType;
  title: string;
  description?: string;
  rationale?: string;
  test_method?: string;
  status: ItemStatus;
  priority?: Priority;
  owner?: string;
  reviewer_email?: string;
  tester_email?: string;
  level?: RequirementLevel;
  version: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  
  // Tree-specific properties  
  children: TreeNode[];  // Array of TreeNode objects, NOT number[]
  depth: number;         // Tree depth (0 = root)
}

/**
 * Convert flat array of items to tree structure
 * FIXED: Properly handles TreeNode.children as TreeNode[] not number[]
 */
export function buildTree(items: Item[]): TreeNode[] {
  // Create a map of all items for quick lookup
  const itemMap = new Map<number, TreeNode>();
  
  // Initialize all items as tree nodes with empty TreeNode[] children
  items.forEach(item => {
    itemMap.set(item.id, {
      // Copy all Item properties
      id: item.id,
      project_id: item.project_id,
      type: item.type,
      title: item.title,
      description: item.description,
      rationale: item.rationale,
      test_method: item.test_method,
      status: item.status,
      priority: item.priority,
      owner: item.owner,
      reviewer_email: item.reviewer_email,
      tester_email: item.tester_email,
      level: item.level,
      version: item.version,
      parent_id: item.parent_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Add tree properties
      children: [],  // Empty TreeNode[] array
      depth: 0
    });
  });

  // Build parent-child relationships
  const roots: TreeNode[] = [];
  
  items.forEach(item => {
    const node = itemMap.get(item.id)!;
    
    if (item.parent_id && itemMap.has(item.parent_id)) {
      // Has parent - add to parent's children
      const parent = itemMap.get(item.parent_id)!;
      parent.children.push(node);  // Push TreeNode to TreeNode[]
      node.depth = parent.depth + 1;
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
    node.children.forEach(sortChildren);  // Recursive sort
  };

  roots.forEach(sortChildren);
  
  return roots;
}

/**
 * Find a node in the tree by ID
 */
export function findNode(nodes: TreeNode[], id: number): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);  // node.children is TreeNode[]
    if (found) return found;
  }
  return null;
}

/**
 * Get all descendant IDs of a node (for preventing circular references)
 */
export function getDescendantIds(node: TreeNode): number[] {
  const ids: number[] = [node.id];
  node.children.forEach(child => {  // child is TreeNode
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
  return items.map(item => {
    if (item.id === movedId) {
      return { ...item, parent_id: newParentId || undefined };
    }
    return item;
  });
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
  return node.depth < 3;
}

/**
 * Get next requirement level (for level suggestion on derivation)
 */
export function getNextLevel(currentLevel?: RequirementLevel): RequirementLevel | undefined {
  if (!currentLevel) return 'system';
  
  const currentIndex = getLevelIndex(currentLevel);
  if (currentIndex < 0 || currentIndex >= REQUIREMENT_LEVELS.length - 1) {
    return undefined;
  }
  
  return REQUIREMENT_LEVELS[currentIndex + 1];
}
