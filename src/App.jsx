import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';
import { useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkspaceView from './pages/WorkspaceView';
import AgentManagement from './pages/AgentManagement';
import AgentConfiguration from './pages/AgentConfiguration';
import ProjectView from './pages/ProjectView';
import ChatInterface from './pages/ChatInterface';
import Repository from './pages/Repository';
import Settings from './pages/Settings';
import TeamManagement from './pages/TeamManagement';
import ContentHistory from './pages/ContentHistory';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

// Layout
import Layout from './components/Layout/Layout';

function App() {
  const { user, initializeAuth } = useAuthStore();
  const { autoConnectProviders } = useSettingsStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Auto-connect to LLM providers if the user is authenticated
    if (user) {
      console.log('User authenticated, auto-connecting to LLM providers...');
      setTimeout(() => {
        autoConnectProviders().catch(err => {
          console.error('Error auto-connecting to LLM providers:', err);
        });
      }, 1000); // Small delay to ensure UI is loaded first
    }
  }, [user, autoConnectProviders]);

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workspace/:workspaceId" element={<WorkspaceView />} />
            <Route path="/workspace/:workspaceId/agents" element={<AgentManagement />} />
            <Route path="/workspace/:workspaceId/agent/:agentId" element={<AgentConfiguration />} />
            <Route path="/workspace/:workspaceId/project/:projectId" element={<ProjectView />} />
            <Route path="/workspace/:workspaceId/chat/:agentId" element={<ChatInterface />} />
            <Route path="/workspace/:workspaceId/repository" element={<Repository />} />
            <Route path="/workspace/:workspaceId/history" element={<ContentHistory />} />
            <Route path="/workspace/:workspaceId/team" element={<TeamManagement />} />
            <Route path="/workspace/:workspaceId/analytics" element={<AnalyticsDashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" toastOptions={{
          className: 'bg-slate-800 text-white border border-slate-700',
        }} />
      </div>
    </Router>
  );
}

export default App;