import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiSave, FiTrash2 } = FiIcons;

function WorkspaceEditModal({ workspaceId, onClose }) {
  const { workspaces, updateWorkspace, deleteWorkspace } = useWorkspaceStore();
  const [workspace, setWorkspace] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'indigo'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const colors = [
    { name: 'indigo', class: 'bg-indigo-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'yellow', class: 'bg-yellow-500' }
  ];

  useEffect(() => {
    if (workspaceId) {
      const workspaceData = workspaces.find(w => w.id === workspaceId);
      if (workspaceData) {
        setWorkspace(workspaceData);
        setFormData({
          name: workspaceData.name,
          description: workspaceData.description,
          color: workspaceData.color
        });
      }
    }
  }, [workspaceId, workspaces]);

  const handleSave = () => {
    if (!workspace) return;
    
    updateWorkspace(workspace.id, formData);
    onClose();
  };

  const handleDelete = () => {
    if (!workspace) return;
    
    deleteWorkspace(workspace.id);
    onClose();
  };

  if (!workspace) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Workspace</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter workspace name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="3"
              placeholder="Describe your workspace"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map(color => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.name }))}
                  className={`w-8 h-8 rounded-lg ${color.class} ${
                    formData.color === color.name ? 'ring-2 ring-white' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Workspace Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{workspace.agents}</div>
                <div className="text-xs text-slate-400">Agents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{workspace.projects}</div>
                <div className="text-xs text-slate-400">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{workspace.members}</div>
                <div className="text-xs text-slate-400">Members</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-700">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-400 hover:text-red-300 flex items-center gap-2"
            >
              <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              Delete Workspace
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Delete Workspace</h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete this workspace? This action cannot be undone and will permanently remove all agents, projects, and data associated with this workspace.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Workspace
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default WorkspaceEditModal;