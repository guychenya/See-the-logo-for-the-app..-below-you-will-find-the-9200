import React from 'react';
import { useParams } from 'react-router-dom';

function ProjectView() {
  const { workspaceId, projectId } = useParams();

  return (
    <div className="p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Project View</h1>
        <p className="text-slate-400 mb-4">
          Project management interface for Project ID: {projectId}
        </p>
        <p className="text-slate-500 text-sm">
          This page will contain project details, tasks, and collaboration features.
        </p>
      </div>
    </div>
  );
}

export default ProjectView;