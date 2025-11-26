import { db } from '../db';
import { Project, ProjectFormData } from '../../types';

export const projectsAPI = {
  /**
   * Fetch all projects ordered by creation date (newest first)
   */
  async getAll(): Promise<Project[]> {
    const projects = await db.query<Project>(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    return projects;
  },

  /**
   * Get a single project by ID
   */
  async getById(id: number): Promise<Project> {
    const project = await db.queryOne<Project>(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    
    if (!project) throw new Error('Project not found');
    return project;
  },

  /**
   * Create a new project
   */
  async create(projectData: ProjectFormData): Promise<Project> {
    const result = await db.queryOne<Project>(
      `INSERT INTO projects (name, pid, project_manager, lead_engineer, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [
        projectData.name,
        projectData.pid,
        projectData.project_manager || null,
        projectData.lead_engineer || null
      ]
    );
    
    if (!result) throw new Error('Failed to create project');
    return result;
  },

  /**
   * Update an existing project
   */
  async update(id: number, updates: Partial<ProjectFormData>): Promise<Project> {
    const result = await db.queryOne<Project>(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           pid = COALESCE($2, pid),
           project_manager = COALESCE($3, project_manager),
           lead_engineer = COALESCE($4, lead_engineer)
       WHERE id = $5
       RETURNING *`,
      [
        updates.name || null,
        updates.pid || null,
        updates.project_manager || null,
        updates.lead_engineer || null,
        id
      ]
    );
    
    if (!result) throw new Error('Project not found');
    return result;
  },

  /**
   * Delete a project (cascade deletes all items)
   */
  async delete(id: number): Promise<void> {
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
  }
};