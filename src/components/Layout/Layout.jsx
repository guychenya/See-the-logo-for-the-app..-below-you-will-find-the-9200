import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function Layout({ children }) {
  const location = useLocation();
  
  // Check if current route is a chat interface
  const isChatInterface = location.pathname.includes('/chat/');
  
  if (isChatInterface) {
    // For chat interface, use full screen layout without sidebar and header
    return (
      <div className="h-screen bg-slate-900">
        {children}
      </div>
    );
  }

  // Default layout with sidebar and header
  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;