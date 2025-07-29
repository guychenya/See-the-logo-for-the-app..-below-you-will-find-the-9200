import React from 'react';

function Settings() {
  return (
    <div className="p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
        <p className="text-slate-400 mb-4">
          Application settings and user preferences
        </p>
        <p className="text-slate-500 text-sm">
          This page will contain user settings, workspace preferences, and system configuration.
        </p>
      </div>
    </div>
  );
}

export default Settings;