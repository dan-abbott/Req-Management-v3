import { useState, useRef, useEffect } from 'react';
import { Project } from '../../types';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

export function ProjectSelector({
  projects,
  selectedProject,
  onSelectProject,
  onNewProject
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.pid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (project: Project) => {
    onSelectProject(project);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected project display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3FB95A] min-w-[250px]"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <div className="flex-1 text-left">
          {selectedProject ? (
            <div>
              <div className="font-medium text-sm">{selectedProject.name}</div>
              <div className="text-xs text-gray-500">{selectedProject.pid}</div>
            </div>
          ) : (
            <div className="text-gray-500">Select a project</div>
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Search input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3FB95A]"
              autoFocus
            />
          </div>

          {/* Project list */}
          <div className="overflow-y-auto flex-1">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleSelect(project)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                    ${selectedProject?.id === project.id ? 'bg-[#3FB95A]/10' : ''}
                  `}
                >
                  <div className="font-medium text-sm">{project.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{project.pid}</span>
                    {project.project_manager && (
                      <span>• PM: {project.project_manager}</span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No projects found
              </div>
            )}
          </div>

          {/* New project button */}
          <button
            onClick={() => {
              setIsOpen(false);
              onNewProject();
            }}
            className="flex items-center gap-2 px-4 py-3 border-t hover:bg-gray-50 text-[#3FB95A] font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>
      )}
    </div>
  );
}
