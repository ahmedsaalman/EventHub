import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useUser } from '../context/Usercontext';
import { createAPIService } from '../hooks/useAuth';
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
  
  // Data States
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [actions, setActions] = useState([]);
  
  // Note: kept total_revenue in state to avoid errors if API sends it, 
  // but it won't be displayed in the UI.
  const [stats, setStats] = useState({
    total_users: 0, total_organizers: 0, total_viewers: 0, active_users: 0, inactive_users: 0,
    total_events: 0, published_events: 0, unpublished_events: 0, total_orders: 0, total_revenue: 0
  });

  // UI States
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, name: '' });
  
  const router = useRouter();
  const API = apiUrl("/api/adminis");

  // Initialize API Service
  const apiService = useMemo(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return createAPIService({ 
      token, 
      refreshToken: async () => null 
    });
  }, []);

  // Helpers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
  }, []);

  const notify = useCallback((type, message) => {
    if (type === 'success') { setSuccess(message); setTimeout(() => setSuccess(null), 3000); }
    if (type === 'error') { setError(message); setTimeout(() => setError(null), 5000); }
  }, []);

  const handleAuthError = useCallback((error) => {
    if (error.response?.status === 401 || error.message === 'Authentication failed') {
      handleLogout();
      return true;
    }
    return false;
  }, []);

  const fetchWithAuth = useCallback(async (fn) => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (err) {
      if (!handleAuthError(err)) {
        notify('error', err.response?.data?.detail || err.message || 'Request failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError, notify]);

  // Image Normalization
  const normalizeImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') return null;
    const trimmedUrl = url.trim();
    const baseUrl = API_BASE_URL;
    if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;
    if (trimmedUrl.startsWith('/media/')) return `${baseUrl}${trimmedUrl}`;
    if (trimmedUrl.startsWith('/static/')) return `${baseUrl}${trimmedUrl}`;
    if (trimmedUrl.startsWith('/')) return `${baseUrl}${trimmedUrl}`;
    return `${baseUrl}/media/${trimmedUrl}`;
  }, []);

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || userLocal.role !== 'admin') {
      router.push('/login');
      return;
    }
    setAuthLoading(false);
  }, [router]);

  // Loaders
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

  const loadActions = useCallback(async () => {
    const res = await fetchWithAuth(() => axios.get(`${API}/actions/`, getAuthHeaders()));
    setActions(Array.isArray(res.data) ? res.data : (res.data.results || []));
  }, [API, fetchWithAuth, getAuthHeaders]);

  const loadEvents = useCallback(async () => {
    await fetchWithAuth(async () => {
      const query = searchTerm ? `?search=${searchTerm}` : '';
      
      const data = await apiService.fetchAdminEvents(query);
      const rawEvents = Array.isArray(data) ? data : (data.results || []);

      const normalizedEvents = rawEvents.map(event => {
        // Organizer Normalization
        let organizerData = { id: 0, username: 'Unknown', email: '' };
        
        if (event.organizer) {
          if (typeof event.organizer === 'object') {
             organizerData = {
               id: event.organizer.id || event.organizer.pk || 0,
               username: event.organizer.username || event.organizer.name || 'Unknown',
               email: event.organizer.email || ''
             };
          } else if (typeof event.organizer === 'number') {
             organizerData.id = event.organizer;
             const foundUser = users.find(u => u.id === event.organizer);
             if (foundUser) {
               organizerData.username = foundUser.username;
               organizerData.email = foundUser.email;
             } else {
               organizerData.username = `Organizer #${event.organizer}`;
             }
          } else if (typeof event.organizer === 'string') {
             organizerData.username = event.organizer;
          }
        }

        return {
          ...event,
          id: event.id || event.pk,
          organizer: organizerData,
          image_url: normalizeImageUrl(event.image_url || event.image),
          cost: typeof event.cost === 'number' ? event.cost : parseFloat(event.cost) || 0,
          date: event.date || event.start_date || 'No date',
          time: event.time || '',
          location: event.location || 'No location',
          category: (event.category || 'general').toLowerCase(),
          is_published: event.is_published ?? event.published ?? false,
        };
      });

      setEvents(normalizedEvents);
    });
  }, [apiService, searchTerm, fetchWithAuth, users, normalizeImageUrl]); 

  // Effects
  useEffect(() => {
    if (authLoading) return;
    
    // Always load users first so we can resolve names
    if (users.length === 0) loadUsers();

    if (activeTab === 'dashboard') loadStats();
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
    await fetchWithAuth(async () => {
       await apiService.deleteEvent(id);
    });
    notify('success', 'Event deleted successfully');

    await loadEvents();
    await loadActions();
    setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
  }, [apiService, fetchWithAuth, notify, loadEvents]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteModal.type === 'user') return deleteUser(deleteModal.id);
    if (deleteModal.type === 'event') return deleteEvent(deleteModal.id);
  }, [deleteModal, deleteUser, deleteEvent]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  }, [router]);

  const clearNotifications = useCallback(() => { setError(null); setSuccess(null); }, []);

  const tabColors = {
    dashboard: { bg: 'from-purple-500 to-pink-500', icon: 'text-purple-100' },
    users: { bg: 'from-blue-500 to-cyan-500', icon: 'text-blue-100' },
    events: { bg: 'from-green-500 to-emerald-500', icon: 'text-green-100' },
    logs: { bg: 'from-orange-500 to-red-500', icon: 'text-orange-100' }
  };

  const getCategoryGradient = useCallback((category) => {
    const gradients = {
      music: 'from-purple-500 to-pink-500',
      sports: 'from-emerald-500 to-green-500',
      arts: 'from-rose-500 to-red-500',
      food: 'from-amber-500 to-orange-500',
      tech: 'from-blue-500 to-cyan-500',
      business: 'from-indigo-500 to-purple-500',
      default: 'from-green-500 to-emerald-500'
    };
    return gradients[category?.toLowerCase()] || gradients.default;
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
            {/* Main Stats Grid - CHANGED to grid-cols-3 and Removed Revenue */}
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
                // Revenue Card Removed
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
                            style={{ width: `${(item.value / stats.total_users) * 100 || 0}%` }}
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
                    { label: 'Total Orders', value: stats.total_orders, color: 'bg-cyan-500' }
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
                {events.map((event) => {
                  const categoryGradient = getCategoryGradient(event.category);
                  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                  });
                  
                  return (
                    <div key={event.id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                      {/* Image Section */}
                      <div className="relative overflow-hidden">
                        {event.image_url ? (
                          <div className="relative w-full h-48 overflow-hidden">
                            <img
                              src={event.image_url}
                              alt={event.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.innerHTML = `
                                  <div class="w-full h-48 bg-gradient-to-r ${categoryGradient} flex items-center justify-center relative">
                                    <svg class="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                    </svg>
                                    <div class="absolute bottom-4 left-4 text-white font-semibold text-sm">Image unavailable</div>
                                  </div>
                                `;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                          </div>
                        ) : (
                          <div className={`w-full h-48 bg-gradient-to-r ${categoryGradient} flex items-center justify-center relative`}>
                            <CalendarIcon className="w-16 h-16 text-white/30" />
                            <div className="absolute bottom-4 left-4 text-white font-semibold text-sm"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 text-lg pr-2">
                            {event.title || 'Untitled Event'}
                          </h3>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, type: 'event', id: event.id, name: event.title })}
                            disabled={loading}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 hover:scale-110 flex-shrink-0 ml-2"
                            title="Delete event"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {event.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full capitalize">
                            {event.category || 'general'}
                          </span>
                          {/* CHANGED: Replaced $ with Rs. */}
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            Rs. {typeof event.cost === 'number' ? event.cost.toFixed(2) : '0.00'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" />
                            by {event.organizer?.username || 'Unknown Organizer'}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formattedDate}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          📍 {event.location || 'Location not specified'}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded ${event.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                              {event.is_published ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              ID: {event.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slide-down { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
      `}</style>
    </div>
  );
}