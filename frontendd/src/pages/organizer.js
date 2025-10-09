import { useEffect, useState } from "react";
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { ConfirmationModal } from '../components/confirmationModal';

// API service functions
const createAPIService = (auth) => {
  const makeRequest = async (url, options = {}) => {
    let token = auth.token;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(url, config);

    // If token is expired, try to refresh it and retry
    if (response.status === 401 && auth.refreshToken) {
      try {
        token = await auth.refreshToken();
        config.headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, config);
      } catch (refreshError) {
        auth.logout();
        throw new Error('Authentication failed. Please login again.');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // For DELETE requests that might not return content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  };

  return {
    fetchEvents: () => makeRequest('http://127.0.0.1:8000/api/events/'),
    
    createEvent: (eventData) => 
      makeRequest('http://127.0.0.1:8000/api/events/', {
        method: 'POST',
        body: JSON.stringify(eventData),
      }),
    
    updateEvent: (id, eventData) => 
      makeRequest(`http://127.0.0.1:8000/api/events/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      }),
    
    deleteEvent: (id) => 
      makeRequest(`http://127.0.0.1:8000/api/events/${id}/`, {
        method: 'DELETE',
      }),
  };
};

export default function OrganizerDashboard() {
  const auth = useAuth();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: null,
    eventTitle: ''
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cost: "",
    date: "",
    location: "",
    time: "",
    capacity: ""
  });

  const api = createAPIService(auth);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.date || !formData.location) {
      setError("Please fill in all required fields (Title, Date, Location)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingEvent) {
        await api.updateEvent(editingEvent.id, {
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        });
      } else {
        await api.createEvent({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : 0,
          capacity: formData.capacity ? parseInt(formData.capacity) : null
        });
      }

      resetForm();
      fetchEvents();
      
    } catch (error) {
      console.error("Error saving event:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (event) => {
    setDeleteModal({
      isOpen: true,
      eventId: event.id,
      eventTitle: event.title
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.eventId) return;
    
    try {
      setLoading(true);
      setError(null);
      await api.deleteEvent(deleteModal.eventId);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, eventId: null, eventTitle: '' });
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      cost: event.cost?.toString() || "",
      date: event.date || "",
      location: event.location || "",
      time: event.time || "",
      capacity: event.capacity?.toString() || ""
    });
    setShowForm(true);
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      cost: "",
      date: "",
      location: "",
      time: "",
      capacity: ""
    });
    setEditingEvent(null);
    setShowForm(false);
    setError(null);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      fetchEvents();
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  // Show loading while checking authentication
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to access the organizer dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Event Manager
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Create and manage your amazing events</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={auth.logout}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Logout
              </button>
              <button
                onClick={() => setShowForm(true)}
                disabled={loading}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon className="w-5 h-5" />
                Create Event
                <div className="absolute inset-0 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteModal.eventTitle}"? This action cannot be undone.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform animate-slideUp">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {editingEvent ? 'Update your event details' : 'Fill in the details for your new event'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Summer Music Festival 2024"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your event in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Date *
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Time
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Cost (USD)
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.cost}
                          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Capacity
                      </label>
                      <div className="relative">
                        <UsersIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          min="1"
                          placeholder="Unlimited"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g., Central Park, New York, NY"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 bg-gray-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events Section */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Events</h2>
              <p className="text-gray-600 mt-2">Manage and track all your events in one place</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>
          </div>

          {loading && !showForm ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : Array.isArray(events) && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          ) : (
            <EmptyState onAddEvent={() => setShowForm(true)} />
          )}
        </div>
      </div>

      {/* Add some custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

// Event Card Component
const EventCard = ({ event, onEdit, onDelete, formatDate, formatTime }) => (
  <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/60 overflow-hidden hover:scale-105">
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2"></div>
    
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
          {event.title}
        </h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(event)}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
            title="Edit event"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            title="Delete event"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {event.description || "No description provided"}
      </p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 text-gray-700">
          <CalendarIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-sm font-medium">
            {formatDate(event.date)}
          </span>
        </div>
        
        {event.time && (
          <div className="flex items-center gap-3 text-gray-700">
            <ClockIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="text-sm">{formatTime(event.time)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-3 text-gray-700">
          <MapPinIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{event.location}</span>
        </div>
        
        <div className="flex items-center gap-3 text-gray-700">
          <CurrencyDollarIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-green-600">
            ${event.cost ? parseFloat(event.cost).toFixed(2) : '0.00'}
          </span>
          {event.capacity && (
            <>
              <span className="text-gray-300">•</span>
              <UsersIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-600">{event.capacity} people</span>
            </>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200/60">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Created {new Date(event.created_at || Date.now()).toLocaleDateString()}</span>
          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
            Active
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ onAddEvent }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/60">
    <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <CalendarIcon className="w-12 h-12 text-indigo-600" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-3">No events yet</h3>
    <p className="text-gray-600 mb-8 max-w-md mx-auto">
      Start creating amazing events for your audience. Your first event is just a click away!
    </p>
    <button
      onClick={onAddEvent}
      className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
    >
      <PlusIcon className="w-5 h-5" />
      Create Your First Event
    </button>
  </div>
);