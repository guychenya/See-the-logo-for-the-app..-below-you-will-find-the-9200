import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';
import LLMSettings from '../components/Settings/LLMSettings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBrain, FiSettings, FiBell, FiLock, FiUser } = FiIcons;

function Settings() {
  const { appSettings, updateAppSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('llm');

  const tabs = [
    { id: 'llm', label: 'LLM Providers', icon: FiBrain },
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'privacy', label: 'Privacy', icon: FiLock },
    { id: 'profile', label: 'Profile', icon: FiUser }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">General Settings</h2>
        <p className="text-slate-400">Configure your application preferences</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <div>
            <h3 className="text-white font-medium">Auto-save</h3>
            <p className="text-slate-400 text-sm">Automatically save changes as you work</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={appSettings.autoSave}
              onChange={(e) => updateAppSettings({ autoSave: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <div>
            <h3 className="text-white font-medium">Debug Mode</h3>
            <p className="text-slate-400 text-sm">Enable detailed logging for troubleshooting</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={appSettings.enableDebugMode}
              onChange={(e) => updateAppSettings({ enableDebugMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium">Max Chat History</h3>
            <span className="text-indigo-400 text-sm">{appSettings.maxChatHistory}</span>
          </div>
          <p className="text-slate-400 text-sm mb-4">Maximum number of messages to keep in chat history</p>
          <input
            type="range"
            min="50"
            max="500"
            step="50"
            value={appSettings.maxChatHistory}
            onChange={(e) => updateAppSettings({ maxChatHistory: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>50</span>
            <span>500</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Notification Settings</h2>
        <p className="text-slate-400">Control how you receive notifications</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <div>
            <h3 className="text-white font-medium">Enable Notifications</h3>
            <p className="text-slate-400 text-sm">Receive notifications for important events</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={appSettings.enableNotifications}
              onChange={(e) => updateAppSettings({ enableNotifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4">Notification Types</h3>
          <div className="space-y-3">
            {[
              { id: 'agent_completion', label: 'Agent task completion', enabled: true },
              { id: 'new_messages', label: 'New chat messages', enabled: true },
              { id: 'system_updates', label: 'System updates', enabled: false },
              { id: 'team_invites', label: 'Team invitations', enabled: true }
            ].map(notification => (
              <div key={notification.id} className="flex items-center justify-between">
                <span className="text-slate-300">{notification.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={notification.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Privacy & Security</h2>
        <p className="text-slate-400">Manage your privacy and security preferences</p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4">Data Collection</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-300">Analytics</span>
                <p className="text-slate-400 text-sm">Help improve ApexSprite by sharing usage data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-300">Error Reporting</span>
                <p className="text-slate-400 text-sm">Automatically report errors to help us fix issues</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-4">Data Management</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <span className="text-white font-medium">Export Data</span>
              <p className="text-slate-400 text-sm">Download all your workspace data</p>
            </button>
            <button className="w-full text-left p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <span className="text-white font-medium">Clear Cache</span>
              <p className="text-slate-400 text-sm">Clear stored data and reset preferences</p>
            </button>
            <button className="w-full text-left p-3 bg-red-600/20 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors">
              <span className="text-red-400 font-medium">Delete Account</span>
              <p className="text-red-400/70 text-sm">Permanently delete your account and all data</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
        <p className="text-slate-400">Manage your profile information</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">JD</span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">John Doe</h3>
            <p className="text-slate-400">john.doe@example.com</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
            <textarea
              defaultValue="AI enthusiast and workspace automation expert."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="3"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'llm':
        return <LLMSettings />;
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'profile':
        return renderProfileSettings();
      default:
        return <LLMSettings />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 bg-slate-800 border border-slate-700 rounded-lg p-4">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Settings;