import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  EnvelopeIcon, 
  TicketIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  CalendarIcon,
  CreditCardIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { apiUrl } from '@/lib/api';

const API_BASE_URL = apiUrl('/api');

const TicketPurchasersView = ({ eventId }) => {
  const [attendees, setAttendees] = useState([]);
  const [filteredAttendees, setFilteredAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketType, setSelectedTicketType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [error, setError] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchAttendees();
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to initialize data');
        setLoading(false);
      }
    };

    initializeData();
  }, [eventId]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      console.log('Fetching event attendees for event:', eventId);
      const url = `${API_BASE_URL}/order/orders/event-attendees/?event_id=${eventId}`;
      
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch attendees');
      
      const attendeesData = await response.json();
      console.log('Attendees data received:', attendeesData);
      
      setAttendees(attendeesData);
      setFilteredAttendees(attendeesData);
      
    } catch (err) {
      console.error('Error fetching attendees:', err);
      setError(err.message || 'Failed to load attendee data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get display name
  const getDisplayName = (attendee) => {
    if (attendee.first_name && attendee.last_name) {
      return `${attendee.first_name} ${attendee.last_name}`;
    }
    return  'User';
  };

  // Handle view details
  const handleViewDetails = (attendee) => {
    setSelectedAttendee(attendee);
    setShowDetailsModal(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedAttendee(null);
  };

  // Re-run filters when dependencies change
  useEffect(() => {
    filterAndSortAttendees();
  }, [searchTerm, selectedTicketType, sortBy, sortOrder, attendees]);

  const filterAndSortAttendees = () => {
    let filtered = [...attendees];

    if (searchTerm) {
      filtered = filtered.filter(attendee => {
        const userName = getDisplayName(attendee);
        const userEmail = attendee.user_email || '';
        return (
          userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (selectedTicketType !== 'all') {
      filtered = filtered.filter(attendee => 
        attendee.ticket_category_name === selectedTicketType
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = getDisplayName(a).toLowerCase();
          bValue = getDisplayName(b).toLowerCase();
          break;
        case 'email':
          aValue = (a.user_email || '').toLowerCase();
          bValue = (b.user_email || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.purchase_date);
          bValue = new Date(b.purchase_date);
          break;
        case 'ticket_type':
          aValue = (a.ticket_category_name || '').toLowerCase();
          bValue = (b.ticket_category_name || '').toLowerCase();
          break;
        default:
          aValue = getDisplayName(a).toLowerCase();
          bValue = getDisplayName(b).toLowerCase();
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredAttendees(filtered);
  };

  // Get unique ticket types for dropdown
  const ticketTypes = ['all'];
  attendees.forEach(attendee => {
    const type = attendee.ticket_category_name || 'General';
    if (!ticketTypes.includes(type)) ticketTypes.push(type);
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getTicketTypeStats = () => {
    const stats = {};
    filteredAttendees.forEach(attendee => {
      const type = attendee.ticket_category_name || 'General';
      if (!stats[type]) {
        stats[type] = { count: 0, revenue: 0 };
      }
      stats[type].count += 1;
      stats[type].revenue += attendee.ticket_price;
    });
    return stats;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Ticket Type', 'Price', 'Purchase Date', 'Order Status', 'Payment Method', 'Order ID'];
    const csvData = filteredAttendees.map(attendee => [
      getDisplayName(attendee),
      attendee.user_email,
      attendee.ticket_category_name,
      `PKR ${attendee.ticket_price.toFixed(2)}`,
      new Date(attendee.purchase_date).toLocaleDateString(),
      attendee.order_status,
      attendee.payment_method,
      attendee.order_id
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${eventId}-attendees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSelectAttendee = (attendeeId) => {
    setSelectedAttendees(prev =>
      prev.includes(attendeeId) ? prev.filter(id => id !== attendeeId) : [...prev, attendeeId]
    );
  };

  const selectAllAttendees = () => {
    if (selectedAttendees.length === filteredAttendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(filteredAttendees.map(attendee => attendee.order_id + '-' + attendee.ticket_category_id));
    }
  };

  const ticketTypeStats = getTicketTypeStats();
  const totalRevenue = attendees.reduce((sum, attendee) => sum + attendee.ticket_price, 0);
  const uniqueOrders = [...new Set(attendees.map(attendee => attendee.order_id))].length;

  // Details Modal Component
  const DetailsModal = () => {
    if (!showDetailsModal || !selectedAttendee) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">Attendee Details</h3>
            <button
              onClick={handleCloseDetails}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          
          <div className="p-6">
            {/* Attendee Information */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-medium text-cyan-400">
                  {getDisplayName(selectedAttendee).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-white mb-1">
                  {getDisplayName(selectedAttendee)}
                </h4>
                <div className="flex items-center gap-2 text-gray-400">
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>{selectedAttendee.user_email}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedAttendee.order_status === 'confirmed' || selectedAttendee.order_status === 'completed'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                  : selectedAttendee.order_status === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {selectedAttendee.order_status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ticket Information */}
              <div className="bg-gray-700/50 rounded-xl p-4">
                <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <TicketIcon className="w-5 h-5 text-cyan-400" />
                  Ticket Information
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ticket Type:</span>
                    <span className="text-white font-medium">{selectedAttendee.ticket_category_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-cyan-400 font-bold">PKR {selectedAttendee.ticket_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Event:</span>
                    <span className="text-white font-medium">{selectedAttendee.event_title}</span>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-gray-700/50 rounded-xl p-4">
                <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-green-400" />
                  Order Information
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="text-white font-mono text-sm">{selectedAttendee.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-white font-medium capitalize">{selectedAttendee.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Purchase Date:</span>
                    <span className="text-white font-medium">
                      {new Date(selectedAttendee.purchase_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-700/50 rounded-xl p-4 md:col-span-2">
                <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <UserCircleIcon className="w-5 h-5 text-purple-400" />
                  User Information
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Username:</span>
                      <span className="text-white font-medium">{selectedAttendee.user_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-white font-mono text-sm">{selectedAttendee.user_id}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">First Name:</span>
                      <span className="text-white font-medium">{selectedAttendee.first_name || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Name:</span>
                      <span className="text-white font-medium">{selectedAttendee.last_name || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
              <button 
                onClick={() => {
                  // Assuming 'attendee' object has an 'email' property
                  if (selectedAttendee.user_email) {
                    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedAttendee.user_email)}`, '_blank');
                  } else {
                    alert('No email address available for this attendee');
                  }
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <EnvelopeIcon className="w-5 h-5" />
                Email Attendee
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading attendee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchAttendees}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Event Attendees
              </h1>
              <p className="text-gray-400">
                {filteredAttendees.length} attendees • {uniqueOrders} orders • PKR{totalRevenue.toLocaleString()} total revenue
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Grid View
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 hover:border-cyan-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Attendees</p>
                <p className="text-2xl font-bold text-white">{filteredAttendees.length}</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <UsersIcon className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-white">{uniqueOrders}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <TicketIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  PKR {totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 hover:border-orange-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg. per Order</p>
                <p className="text-2xl font-bold text-white">
                  {uniqueOrders > 0 
                    ? `PKR ${(totalRevenue / uniqueOrders).toFixed(2)}`
                    : '$0.00'
                  }
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <UsersIcon className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[300px]">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white placeholder-gray-400"
                />
              </div>

              {/* Ticket Type Filter */}
              <div className="relative">
                <select
                  value={selectedTicketType}
                  onChange={(e) => setSelectedTicketType(e.target.value)}
                  className="appearance-none bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-white"
                >
                  {ticketTypes.map(type => (
                    <option key={type} value={type} className="bg-gray-800">
                      {type === 'all' ? 'All Ticket Types' : type}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-cyan-600/25 hover:shadow-cyan-500/25"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Ticket Type Breakdown */}
        {Object.keys(ticketTypeStats).length > 0 && (
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ticket Type Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(ticketTypeStats).map(([type, stats]) => (
                <div key={type} className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 hover:border-cyan-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{type}</span>
                    <span className="text-sm text-gray-400">{stats.count} attendees</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Revenue:</span>
                      <span className="font-medium text-green-400">PKR {stats.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg. Price:</span>
                      <span className="font-medium text-cyan-400">PKR {(stats.revenue / stats.count).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendees Table View */}
        {viewMode === 'table' && (
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                        onChange={selectAllAttendees}
                        className="rounded border-gray-500 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        Name {sortBy === 'name' && <span className="text-cyan-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => handleSort('email')}>
                      <div className="flex items-center gap-1">
                        Email {sortBy === 'email' && <span className="text-cyan-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => handleSort('ticket_type')}>
                      <div className="flex items-center gap-1">
                        Ticket Type {sortBy === 'ticket_type' && <span className="text-cyan-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">
                        Purchase Date {sortBy === 'date' && <span className="text-cyan-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredAttendees.map((attendee, index) => (
                    <tr key={`${attendee.order_id}-${attendee.ticket_category_id}-${index}`} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.includes(attendee.order_id + '-' + attendee.ticket_category_id)}
                          onChange={() => toggleSelectAttendee(attendee.order_id + '-' + attendee.ticket_category_id)}
                          className="rounded border-gray-500 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-cyan-400">
                              {getDisplayName(attendee).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-white">{getDisplayName(attendee)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300">{attendee.user_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                          attendee.ticket_category_name === 'VIP' 
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : attendee.ticket_category_name === 'Student'
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {attendee.ticket_category_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 font-medium">
                        PKR {attendee.ticket_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(attendee.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          attendee.order_status === 'confirmed' || attendee.order_status === 'completed'
                            ? 'bg-green-500/10 text-green-400'
                            : attendee.order_status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            attendee.order_status === 'confirmed' || attendee.order_status === 'completed' ? 'bg-green-400' : 
                            attendee.order_status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></span>
                          {attendee.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <button 
                            onClick={() => handleViewDetails(attendee)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 first:rounded-t-xl hover:text-white"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => {
                              if (attendee.user_email) {
                                window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(attendee.user_email)}`, '_blank');
                              } else {
                                // Fallback if no email is available
                                alert('No email address available for this attendee');
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            Email Attendee
                          </button>
                        </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAttendees.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        No attendees found for this event.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="bg-gray-700/30 px-6 py-4 border-t border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">{filteredAttendees.length}</span> of <span className="font-medium text-white">{filteredAttendees.length}</span> attendees
              </span>
            </div>
          </div>
        )}

        {/* Grid View Implementation */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAttendees.map((attendee, index) => (
              <div key={`${attendee.order_id}-${attendee.ticket_category_id}-${index}`} className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 hover:border-cyan-500/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-cyan-400">
                        {getDisplayName(attendee).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{getDisplayName(attendee)}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <EnvelopeIcon className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-400">{attendee.user_email}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    attendee.order_status === 'confirmed' || attendee.order_status === 'completed' 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {attendee.order_status}
                  </span>
                </div>
                
                <div className="space-y-3 border-t border-gray-700 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ticket Type</span>
                    <span className="text-gray-300 font-medium">{attendee.ticket_category_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="text-cyan-400 font-medium">PKR {attendee.ticket_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Purchase Date</span>
                    <span className="text-gray-300">{new Date(attendee.purchase_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="text-gray-300 font-medium capitalize">{attendee.payment_method}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleViewDetails(attendee)}
                  className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <UserCircleIcon className="w-4 h-4" />
                  View Details
                </button>
              </div>
            ))}
            {filteredAttendees.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">
                No attendees found for this event.
              </div>
            )}
          </div>
        )}

        {/* Details Modal */}
        <DetailsModal />
      </div>
    </div>
  );
};

export default TicketPurchasersView;