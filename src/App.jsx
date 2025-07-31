import React, { useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

// Components
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const WorkspaceView = React.lazy(() => import('./pages/WorkspaceView'));
const AgentManagement = React.lazy(() => import('./pages/AgentManagement'));
const AgentConfiguration = React.lazy(() => import('./pages/AgentConfiguration'));
const ProjectView = React.lazy(() => import('./pages/ProjectView'));
const ChatInterface = React.lazy(() => import('./pages/ChatInterface'));
const Repository = React.lazy(() => import('./pages/Repository'));
const Settings = React.lazy(() => import('./pages/Settings'));
const TeamManagement = React.lazy(() => import('./pages/TeamManagement'));
const ContentHistory = React.lazy(() => import('./pages/ContentHistory'));
const AnalyticsDashboard = React.lazy(() => import('./pages/AnalyticsDashboard'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  const { user, initializeAuth } = useAuthStore();

  useEffect(() => {
    try {
      initializeAuth();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }, [initializeAuth]);

  if (!user) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Login />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-900">
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/workspace/:workspaceId" element={<WorkspaceView />} />
                <Route path="/workspace/:workspaceId/agents" element={<AgentManagement />} />
                <Route path="/workspace/:workspaceId/agent/:agentId" element={<AgentConfiguration />} />
                <Route path="/workspace/:workspaceId/project/:projectId" element={<ProjectView />} />
                <Route path="/workspace/:workspaceId/chat/:agentId" element={<ChatInterface />} />
                <Route path="/workspace/:workspaceId/repository" element={<Repository />} />
                <Route path="/workspace/:workspaceId/history" element={<ContentHistory />} />
                <Route path="/workspace/:workspaceId/team" element={<TeamManagement />} />
                <Route path="/workspace/:workspaceId/analytics" element={<AnalyticsDashboard />} />
              </Routes>
            </Suspense>
          </Layout>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'bg-slate-800 text-white border border-slate-700',
              duration: 4000,
            }} 
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;