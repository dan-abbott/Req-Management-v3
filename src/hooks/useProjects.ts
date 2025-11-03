import { useState, useEffect } from 'react';
import { Project, ProjectFormData } from '../types';
import { projectsAPI } from '../services/api/projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: ProjectFormData): Promise<Project> => {
    try {
      setError(null);
      const newProject = await projectsAPI.create(projectData);
      setProjects([newProject, ...projects]);
      return newProject;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateProject = async (id: number, updates: Partial<ProjectFormData>): Promise<Project> => {
    try {
      setError(null);
      const updatedProject = await projectsAPI.update(id, updates);
      setProjects(projects.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteProject = async (id: number): Promise<void> => {
    try {
      setError(null);
      await projectsAPI.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh: fetchProjects
  };
}
