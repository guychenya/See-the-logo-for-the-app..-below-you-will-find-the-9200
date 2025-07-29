import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiSearch, FiMoreHorizontal, FiMail, FiUser, FiShield, FiX, FiCheck } = FiIcons;

function TeamManagement() {
  const { workspaceId } = useParams();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  // Mock team members data
  const teamMembers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      joinedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      lastActive: new Date(Date.now() - 1800000).toISOString(),
      status: 'active'
    },
    {
      id: '3',
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      joinedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastActive: new Date(Date.now() - 7200000).toISOString(),
      status: 'active'
    },
    {
      id: '4',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      joinedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      status: 'inactive'
    }
  ];

  // Mock pending invitations
  const pendingInvitations = [
    {
      id: '1',
      email: 'mike.wilson@example.com',
      role: 'member',
      invitedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      invitedBy: 'John Doe'
    }
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-indigo-500';
      case 'admin': return 'bg-green-500';
      case 'member': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  const handleInvite = (e) => {
    e.preventDefault();
    // Handle invitation logic here
    console.log('Inviting:', inviteEmail, 'as', inviteRole);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('member');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-slate-400">Manage workspace members and permissions</p>
        </div>
        
        <motion.button
          onClick={() => setShowInviteModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 lg:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Invite Member
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm mb-2">Total Members</h3>
          <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm mb-2">Active Members</h3>
          <p className="text-2xl font-bold text-white">{teamMembers.filter(m => m.status === 'active').length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm mb-2">Pending Invites</h3>
          <p className="text-2xl font-bold text-white">{pendingInvitations.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm mb-2">Admin Users</h3>
          <p className="text-2xl font-bold text-white">{teamMembers.filter(m => m.role === 'admin' || m.role === 'owner').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <SafeIcon 
            icon={FiSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
          />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg mb-6">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Team Members</h2>
        </div>
        <div className="divide-y divide-slate-700">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(member.status)}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{member.name}</h3>
                    <p className="text-slate-400 text-sm">{member.email}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                    <p className="text-slate-400 text-xs mt-1">
                      Last active {formatDistanceToNow(new Date(member.lastActive), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {member.role !== 'owner' && (
                    <button className="text-slate-400 hover:text-white p-2">
                      <SafeIcon icon={FiMoreHorizontal} className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">Pending Invitations</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiMail} className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{invitation.email}</h3>
                    <p className="text-slate-400 text-sm">
                      Invited by {invitation.invitedBy} • {formatDistanceToNow(new Date(invitation.invitedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getRoleBadgeColor(invitation.role)}`}>
                    {invitation.role}
                  </span>
                  <button className="text-red-400 hover:text-red-300 text-sm">
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Invite Team Member</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="mt-1 text-xs text-slate-400">
                  Members can view and interact with agents. Admins can manage workspace settings.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default TeamManagement;