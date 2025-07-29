import React from 'react';
import { useParams } from 'react-router-dom';

function Repository() {
  const { workspaceId } = useParams();

  return (
    <div className="p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Repository</h1>
        <p className="text-slate-400 mb-4">
          Content management and version control for Workspace: {workspaceId}
        </p>
        <p className="text-slate-500 text-sm">
          This page will contain file management, version control, and content organization features.
        </p>
      </div>
    </div>
  );
}

export default Repository;