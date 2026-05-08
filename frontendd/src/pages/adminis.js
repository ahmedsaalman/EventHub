import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useUser } from '../context/Usercontext';
import { useRouter } from "next/router";
import { API_BASE_URL, apiUrl } from "@/lib/api";
import { 
  UsersIcon, 
  CalendarIcon, 
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  TicketIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function AdminPanel() {
  const { user, logout } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [actions, setActions] = useState([]);
  
  // Removed total_revenue from state
  const [stats, setStats] = useState({
    total_users: 0,
    total_organizers: 0,
    total_viewers: 0,
    active_users: 0,
    inactive_users: 0,
    total_events: 0,
    published_events: 0,
    unpublished_events: 0,
    total_orders: 0
  });

  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    type: null, 
    id: null, 
    name: '' 
  });
  
  const router = useRouter();
  const API = apiUrl("/api/adminis");

  // Single Responsibility: central auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }, []);

  // Single Responsibility: unified notifications
  const notify = useCallback((type, message) => {
    if (type === 'success') setSuccess(message);
    if (type === 'error') setError(message);
    if (type === 'success') setTimeout(() => setSuccess(null), 3000);
  }, []);

  // Single Responsibility: centralized auth error handling
  const handleAuthError = useCallback((error) => {
    if (error.response?.status === 401) {
      handleLogout();
      return true;
    }
    return false;
  }, []);

  // Wrapper for API calls with auth + error handling
  const fetchWithAuth = useCallback(async (fn) => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (err) {
      if (!handleAuthError(err)) {
        notify('error', err.response?.data?.detail || 'Request failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, notify]);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || userLocal.role !== 'admin') {
      router.push('/login');
      return;
    }
    setAuthLoading(false);
  }, [router]);


  const loadStats = useCallback(async () => {
    const res = await fetchWithAuth(() => axios.get(`${API}/dashboard/`, getAuthHeaders()));
    setStats(res.data);
  }, [API, fetchWithAuth, getAuthHeaders]);

  const loadUsers = useCallback(async () => {
    const params = {};
    if (roleFilter !== 'all') params.role = roleFilter;
    if (searchTerm) params.search = searchTerm;
    const res = await fetchWithAuth(() => axios.get(`${API}/users/`, { params, ...getAuthHeaders() }));
    setUsers(Array.isArray(res.data) ? res.data : (res.data.results || []));
  }, [API, roleFilter, searchTerm, fetchWithAuth, getAuthHeaders]);

  const loadEvents = useCallback(async () => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    const res = await fetchWithAuth(() => axios.get(`${API}/events/`, { params, ...getAuthHeaders() }));
    setEvents(Array.isArray(res.data) ? res.data : (res.data.results || []));
  }, [API, searchTerm, fetchWithAuth, getAuthHeaders]);

  const loadActions = useCallback(async () => {
    const res = await fetchWithAuth(() => axios.get(`${API}/actions/`, getAuthHeaders()));
    setActions(Array.isArray(res.data) ? res.data : (res.data.results || []));
  }, [API, fetchWithAuth, getAuthHeaders]);

  // Orchestrate loads per tab
  useEffect(() => {
    if (authLoading) return;
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'events') loadEvents();
    if (activeTab === 'logs') loadActions();
  }, [activeTab, authLoading, loadStats, loadUsers, loadEvents, loadActions]);

  // Actions
  const toggleUser = useCallback(async (id) => {
    await fetchWithAuth(() => axios.post(`${API}/users/${id}/toggle_active/`, { reason: "Admin action" }, getAuthHeaders()));
    notify('success', 'User status updated successfully');
    await loadUsers();
  }, [API, fetchWithAuth, getAuthHeaders, notify, loadUsers]);

  const changeRole = useCallback(async (id, role) => {
    await fetchWithAuth(() => axios.post(`${API}/users/${id}/change_role/`, { role }, getAuthHeaders()));
    notify('success', 'User role updated successfully');
    await loadUsers();
  }, [API, fetchWithAuth, getAuthHeaders, notify, loadUsers]);

  const deleteUser = useCallback(async (id) => {
    await fetchWithAuth(() => axios.delete(`${API}/users/${id}/delete_user/`, getAuthHeaders()));
    notify('success', 'User deleted successfully');
    await loadUsers();
    setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
  }, [API, fetchWithAuth, getAuthHeaders, notify, loadUsers]);

  const deleteEvent = useCallback(async (id) => {
    await fetchWithAuth(() => axios.delete(`${API}/events/${id}/delete_event/`, getAuthHeaders()));
    notify('success', 'Event deleted successfully');
    await loadEvents();
    setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
  }, [API, fetchWithAuth, getAuthHeaders, notify, loadEvents]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteModal.type === 'user') return deleteUser(deleteModal.id);
    if (deleteModal.type === 'event') return deleteEvent(deleteModal.id);
  }, [deleteModal, deleteUser, deleteEvent]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  const clearNotifications = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const tabColors = {
    dashboard: { bg: 'from-purple-500 to-pink-500', icon: 'text-purple-100' },
    users: { bg: 'from-blue-500 to-cyan-500', icon: 'text-blue-100' },
    events: { bg: 'from-green-500 to-emerald-500', icon: 'text-green-100' },
    logs: { bg: 'from-orange-500 to-red-500', icon: 'text-orange-100' }
  };

  const resolveImageUrl = useCallback((url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your platform with ease</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="p-3 rounded-2xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105 text-red-500 hover:text-red-600"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {(success || error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {success && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 flex items-center gap-3 animate-slide-down shadow-lg">
              <CheckCircleIcon className="w-6 h-6 text-white flex-shrink-0" />
              <p className="flex-1 font-medium">{success}</p>
              <button onClick={clearNotifications} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
          {error && (
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-4 flex items-center gap-3 animate-slide-down shadow-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white flex-shrink-0" />
              <p className="flex-1 font-medium">{error}</p>
              <button onClick={clearNotifications} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
            { id: 'users', label: 'Users', icon: UserGroupIcon },
            { id: 'events', label: 'Events', icon: TicketIcon },
            { id: 'logs', label: 'Activity Logs', icon: DocumentTextIcon }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const colors = tabColors[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all duration-300 rounded-xl whitespace-nowrap flex-1 justify-center ${
                  isActive
                    ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg transform scale-105`
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? colors.icon : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Main Stats Grid - REVENUE REMOVED */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  label: 'Total Users', 
                  value: stats.total_users, 
                  icon: UsersIcon, 
                  gradient: 'from-blue-500 to-cyan-500',
                  change: '+12%'
                },
                { 
                  label: 'Total Events', 
                  value: stats.total_events, 
                  icon: CalendarIcon, 
                  gradient: 'from-purple-500 to-pink-500',
                  change: '+8%'
                },
                { 
                  label: 'Active Users', 
                  value: stats.active_users, 
                  icon: CheckCircleIcon, 
                  gradient: 'from-green-500 to-emerald-500',
                  change: '+5%'
                }
              ].map((stat, idx) => (
                <div key={idx} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"></div>
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-blue-500" />
                  User Analytics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Organizers', value: stats.total_organizers, color: 'bg-blue-500' },
                    { label: 'Viewers', value: stats.total_viewers, color: 'bg-purple-500' },
                    { label: 'Inactive Users', value: stats.inactive_users, color: 'bg-gray-400' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                            style={{ width: `${(item.value / (stats.total_users || 1)) * 100 || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-8">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TicketIcon className="w-5 h-5 text-green-500" />
                  Event Analytics
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Published Events', value: stats.published_events, color: 'bg-green-500' },
                    { label: 'Unpublished Events', value: stats.unpublished_events, color: 'bg-orange-500' },
                    
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                            style={{ width: `${(item.value / (stats.total_events || 1)) * 100 || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-8">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search and Filters */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 w-full">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="organizer">Organizers</option>
                    <option value="viewer">Viewers</option>
                  </select>
                  <button
                    onClick={loadUsers}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold"
                  >
                    <FunnelIcon className="w-5 h-5" />
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {user.username?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={user.role}
                              onChange={(e) => changeRole(user.id, e.target.value)}
                              disabled={loading}
                              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white disabled:opacity-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="admin">Admin</option>
                              <option value="organizer">Organizer</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleUser(user.id)}
                              disabled={loading}
                              className={`px-4 py-2 rounded-full text-xs font-semibold disabled:opacity-50 transition-all duration-300 ${
                                user.is_active
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, type: 'user', id: user.id, name: user.username })}
                              disabled={loading}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 hover:scale-110"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadEvents()}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No events found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {/* UPDATED: Matches Event model 'image_url' */}
                    {resolveImageUrl(event.image_url) ? (
                      <div className="relative overflow-hidden">
                        <img
                          src={resolveImageUrl(event.image_url)}
                          alt={event.title}
                          loading="lazy"
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
                              <svg xmlns='http://www.w3.org/2000/svg' width='600' height='300'>
                                <rect width='100%' height='100%' fill='#10B981'/>
                                <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-family='Arial'>Image not available</text>
                              </svg>
                            `);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center relative">
                        <CalendarIcon className="w-16 h-16 text-white/30" />
                        <div className="absolute bottom-4 left-4 text-white font-semibold"></div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        {/* UPDATED: Matches Event model 'title' */}
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 text-lg">{event.title}</h3>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, type: 'event', id: event.id, name: event.title })}
                          disabled={loading}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 hover:scale-110 flex-shrink-0 ml-3"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {/* UPDATED: Matches Event model 'location' */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{event.location}</p>
                      <div className="flex items-center justify-between mb-3">
                        {/* UPDATED: Matches Event model 'category' */}
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full capitalize">
                          {event.category}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">PKR {event.cost}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        {/* UPDATED: Assumes serializer returns organizer object */}
                        <span>eventID: {event.id || 'Unknown'}</span>
                        {/* UPDATED: Matches Event model 'date' and 'time' */}
                        <span>{event.date} {event.time && `• ${event.time}`}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4 animate-fade-in">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : actions.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
                <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No activity logs found</p>
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {actions.map((action) => (
                    <div key={action.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {action.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            by {action.admin?.username || 'Unknown'} • {new Date(action.created_at).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 transition-all duration-300 ${
                          action.action_type === 'user_delete' || action.action_type === 'event_delete'
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                        }`}>
                          {action.action_type?.replace('_', ' ') || 'action'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-scale-in">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">Confirm Deletion</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteModal.name}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, type: null, id: null, name: '' })}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-down {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}