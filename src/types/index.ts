// Type definitions for Requirements Management System

export type ItemType = 'epic' | 'requirement' | 'test-case' | 'defect';

export type ItemStatus = 
  | 'draft' 
  | 'in-review' 
  | 'approved' 
  | 'rejected'
  | 'ready-for-test'
  | 'passed'
  | 'failed'
  | 'not-started'
  | 'in-process'
  | 'resolved'
  | 'backlog';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type RequirementLevel = 
  | 'system'
  | 'sub-system'
  | 'assembly'
  | 'sub-assembly'
  | 'component'
  | 'sub-component'
  | 'material';

export interface Project {
  id: number;
  name: string;
  pid: string; // Project ID (acronym)
  project_manager?: string;
  lead_engineer?: string;
  created_at: string;
}

export interface Item {
  id: number;
  project_id: number;
  type: ItemType;
  title: string;
  description?: string;
  rationale?: string; // For requirements
  test_method?: string; // For test cases
  status: ItemStatus;
  priority?: Priority;
  owner?: string;
  reviewer_email?: string;
  tester_email?: string;
  level?: RequirementLevel; // For requirements
  version: number;
  parent_id?: number;
  children: number[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  item_id: number;
  user_email: string;
  user_name: string;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface User {
  email: string;
  name: string;
  avatar_url?: string;
}

// Form data types
export interface ProjectFormData {
  name: string;
  pid: string;
  project_manager?: string;
  lead_engineer?: string;
}

export interface ItemFormData {
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
  parent_id?: number;
}
