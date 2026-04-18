import { useEffect, useState } from "react";
import {useRouter} from 'next/router';
import { 
  CurrencyRupeeIcon,
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  TicketIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CameraIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon,
  Squares2X2Icon,
  ChartBarIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import { useAuth, createAPIService, ConfirmationModal} from '../hooks/useAuth';
import TicketPurchasersView from './TicketPurchasersView'; // Add this import

export default function OrganizerDashboard() {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const auth = useAuth();
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("events");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedEvent, setSelectedEvent] = useState(null);
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
    capacity: "",
    image_url: "",
    category: "music"
  });

  const api = createAPIService(auth);
  //const api2 =  fetch('http://localhost:8000/api/orders/')
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

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

 const fetchTickets = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Get organizer ID from auth user
    const organizerId = auth.user?.id;
    
    if (!organizerId) {
      throw new Error('Organizer ID not found');
    }
    
    // Use the new endpoint that includes user email
    const data = await api.fetchOrganizerTicketsWithUserInfo(organizerId);
    setTickets(data);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.title || !formData.date || !formData.location) {
      setError("Please fill in all required fields (Title, Date, Location)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const eventData = {
        title: formData.title,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        date: formData.date,
        location: formData.location,
        time: formData.time || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        image_url: formData.image_url || "",
        category: formData.category,
        is_published: true
      };

      if (editingEvent) {
        await api.updateEvent(editingEvent.id, eventData);
        setSuccess("Event updated successfully!");
      } else {
        await api.createEvent(eventData);
        setSuccess("Event created successfully!");
      }

      resetForm();
      await fetchEvents();
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error("Error saving event:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };



  const handleViewAttendees = (event) => {
    setSelectedEvent(event);
    setCurrentView('attendees');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedEvent(null);
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
      setEvents(prev => prev.filter(e => e.id !== deleteModal.eventId));
      setSuccess("Event deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
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
      capacity: event.capacity?.toString() || "",
      image_url: event.image_url || "",
      category: event.category || "music"
    });
    setShowForm(true);
    setError(null);
  };

  const handleManageTickets = (event) => {
    window.location.href = `/ticketing?event=${event.id}`;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      cost: "",
      date: "",
      location: "",
      time: "",
      capacity: "",
      image_url: "",
      category: "music"
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

  const getCategoryColor = (category) => {
    const colors = {
      music: 'from-purple-500 to-pink-600',
      sports: 'from-emerald-500 to-green-600',
      arts: 'from-rose-500 to-red-600',
      food: 'from-amber-500 to-orange-600',
      tech: 'from-blue-500 to-cyan-600',
      business: 'from-indigo-500 to-purple-600',
      other: 'from-gray-500 to-slate-600'
    };
    return colors[category] || 'from-gray-500 to-slate-600';
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      music: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
      sports: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
      arts: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
      food: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
      tech: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      business: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
      other: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      fetchEvents();
      if (activeTab === "tickets"||activeTab == "analytics") {
        fetchTickets();
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, activeTab]);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-emerald-900 dark:to-teal-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 dark:border-emerald-400"></div>
          <SparklesIcon className="w-8 h-8 text-emerald-500 dark:text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-emerald-900 dark:to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20 dark:border-slate-700/50 animate-scale-in">
          <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ExclamationTriangleIcon className="w-10 h-10 text-orange-500 dark:text-orange-400" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">Authentication Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
            Please log in to access the organizer dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (auth.user && auth.user.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-emerald-900 dark:to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/20 dark:border-slate-700/50 animate-scale-in">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
            You need to be an organizer to access this dashboard.
          </p>
          <button
            onClick={auth.logout}
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-slate-900 dark:via-emerald-900 dark:to-teal-900 transition-colors duration-500">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-40 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-400 dark:via-green-400 dark:to-teal-400 bg-clip-text text-transparent animate-fade-in">
                EventHub Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg animate-slide-up">
                {currentView === 'dashboard' ? 'Create and manage your events' : `Viewing attendees for ${selectedEvent?.title}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 group hover:scale-105 shadow-sm"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                )}
              </button>
              
              {/* Back to Events button when in attendees view */}
              {currentView === 'attendees' && (
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 transition-all duration-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Events
                </button>
              )}
              
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</p>
                <p className="text-slate-800 dark:text-white font-semibold">{auth.user?.username || auth.user?.email}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 capitalize">{auth.user?.role}</p>
              </div>
              <button
                onClick={auth.logout}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-400 transition-all duration-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
              >
                Logout
              </button>
              {currentView === 'dashboard' && activeTab === "events" && (
                <button
                  onClick={() => setShowForm(true)}
                  disabled={loading}
                  className="group relative flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300 relative z-10" />
                  <span className="hidden sm:inline relative z-10">Create Event</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 animate-slide-up">
          <div className="bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm shadow-lg">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-emerald-800 dark:text-emerald-200 font-medium">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 animate-slide-up">
          <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm shadow-lg">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
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

      {/* Event Form Modal */}
      {showForm && (
        <EventFormModal
          showForm={showForm}
          editingEvent={editingEvent}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          onClose={resetForm}
          onSubmit={handleSubmit}
        />
      )}

      {/* Main Content Area */}
      {currentView === 'dashboard' ? (
        /* Dashboard View */
        <>
          {/* Tab Navigation - Only show in dashboard view */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex flex-wrap gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <button
                onClick={() => setActiveTab("events")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "events"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
                Manage Events
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "tickets"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <TicketIcon className="w-5 h-5" />
                View Tickets
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === "analytics"
                    ? "bg-gradient-to-r from-lime-500 to-green-600 text-white shadow-lg shadow-lime-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <ChartBarIcon className="w-5 h-5" />
                Analytics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === "events" && (
              <EventsTab
                events={events}
                loading={loading}
                showForm={showForm}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onManageTickets={handleManageTickets}
                onAddEvent={() => setShowForm(true)}
                formatDate={formatDate}
                formatTime={formatTime}
                getCategoryColor={getCategoryColor}
                getCategoryBadgeColor={getCategoryBadgeColor}
                onViewAttendees={handleViewAttendees}

              />
            )}
            
            {activeTab === "tickets" && (
              <TicketsTab
                tickets={tickets}
                loading={loading}
                events={events}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsTab
                events={events}
                tickets={tickets}
              />
            )}
          </div>
        </>
      ) : (
        /* Attendees View */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Events
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Attendees for {selectedEvent?.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  View and manage all ticket purchasers for this event
                </p>
              </div>
              <div className="flex items-center gap-4 flex-col">
                <span className="text-sm text-slate-800 dark:text-white bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  Event ID: {selectedEvent?.id}
                </span>
                <div className="flex items-center gap-4">
                <button  onClick={() => router.push(`/email-all-attendes?eventId=${selectedEvent?.id}`)}
                className="bulk_email_button flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-teal-600/25 hover:shadow-teal-500/25"> 
                  Email Attendees
                </button>

                <button  onClick={() => router.push(`/scanner?eventId=${selectedEvent?.id}`)}
                className="scanner flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-teal-600/25 hover:shadow-teal-500/25"> 
                  Ticket Scanner
                </button>
                 

               </div>
              </div>
            </div>
          </div>

          <TicketPurchasersView 
            eventId={selectedEvent?.id}
            eventName={selectedEvent?.title}
          />
        </div>
      )}
    </div>
  );
  
}

// Events Tab Component
const EventsTab = ({ events, loading, showForm, onEdit, onDelete, onManageTickets, onAddEvent, formatDate, formatTime, getCategoryColor, getCategoryBadgeColor,onViewAttendees }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Your Events</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your events and tickets</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-800 dark:text-white bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          {events.length} {events.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>
    </div>

    {loading && !showForm ? (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 dark:border-emerald-400"></div>
          <SparklesIcon className="w-8 h-8 text-emerald-500 dark:text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    ) : Array.isArray(events) && events.length > 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <div
            key={event.id}
            style={{ animationDelay: `${index * 0.1}s` }}
            className="animate-slide-up"
          >
            <EventCard 
              event={event} 
              onEdit={onEdit}
              onDelete={onDelete}
              onManageTickets={onManageTickets}
              formatDate={formatDate}
              formatTime={formatTime}
              getCategoryColor={getCategoryColor}
              getCategoryBadgeColor={getCategoryBadgeColor}
              onViewAttendees={onViewAttendees}
            />
          </div>
        ))}
      </div>
    ) : (
      <EmptyState onAddEvent={onAddEvent} />
    )}
  </div>
);

// Tickets Tab Component
const TicketsTab = ({ tickets, loading, events, formatDate, formatTime }) => {
  const getStatusColor = (status) => {
    const colors = {
      used: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusMap = {
      used: 'Used',
      cancelled: 'Cancelled',
      pending: 'Pending'
    };
    return statusMap[status] || status;
  };

  // Calculate tickets sold per category
  const getTicketsByCategory = () => {
    const categoryMap = {};
    tickets.forEach(ticket => {
      const category = ticket.category_name || 'Unknown';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          count: 0,
          users: new Set()
        };
      }
      categoryMap[category].count++;
      if (ticket.user_email) {
        categoryMap[category].users.add(ticket.user_email);
      }
    });
    return categoryMap;
  };

  const ticketsByCategory = getTicketsByCategory();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">All Tickets</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">View all tickets across your events</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-800 dark:text-white bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
          </span>
        </div>
      </div>

      {/* Tickets by Category Summary */}
      {Object.keys(ticketsByCategory).length > 0 && (
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tickets by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ticketsByCategory).map(([category, data]) => (
              <div key={category} className="bg-slate-100/50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-slate-800 dark:text-white">{category}</span>
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {data.count} tickets
                  </span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>{data.users.size} unique users</p>
                  {data.users.size > 0 && (
                    <p className="text-xs mt-1 truncate" title={Array.from(data.users).join(', ')}>
                      Users: {Array.from(data.users).slice(0, 2).join(', ')}
                      {data.users.size > 2 && ` and ${data.users.size - 2} more`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
            <TicketIcon className="w-8 h-8 text-cyan-500 dark:text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
        </div>
      ) : Array.isArray(tickets) && tickets.length > 0 ? (
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100/50 dark:bg-slate-700/50 border-b border-slate-200/50 dark:border-slate-600/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    User Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {tickets.map((ticket, index) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          #{ticket.ticket_number}
                        </span>
                        {ticket.scanned_at && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Scanned: {formatDate(ticket.scanned_at)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {ticket.event_name}
                        </p>
                        {ticket.event_date && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(ticket.event_date)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                        {ticket.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {ticket.user_email || 'No email'}
                      </p>
                      {ticket.user_name && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {ticket.user_name}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {ticket.created_at ? formatDate(ticket.created_at) : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl shadow-lg p-12 text-center border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-200 dark:border-emerald-800">
            <TicketIcon className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">No tickets yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto text-lg">
            Tickets will appear here once attendees register for your events.
          </p>
        </div>
      )}
    </div>
  );
};
// Analytics Tab Component
const AnalyticsTab = ({ events, tickets }) => {
  const totalRevenue = tickets.reduce((sum, ticket) => sum + (parseFloat(ticket.price) || 0), 0);
  const totalAttendees = tickets.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Analytics Overview</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Track your event performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-xl text-white animate-slide-up group hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Revenue</h3>
           
          </div>
          <p className="text-4xl font-bold mb-2">PKR {totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-80">From {totalAttendees} tickets sold</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white animate-slide-up group hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Events</h3>
            <CalendarIcon className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-4xl font-bold mb-2">{events.length}</p>
          <p className="text-sm opacity-80">{upcomingEvents} upcoming</p>
        </div>

        <div className="bg-gradient-to-br from-lime-500 to-green-600 p-6 rounded-2xl shadow-xl text-white animate-slide-up group hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">Total Attendees</h3>
            <UsersIcon className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <p className="text-4xl font-bold mb-2">{totalAttendees}</p>
          <p className="text-sm opacity-80">Across all events</p>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-lg p-8 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm animate-fade-in">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">Event Performance</h3>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, index) => {
              const eventTickets = tickets.filter(t => t.event_id === event.id);
              const eventRevenue = eventTickets.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
              const capacity = event.capacity || 100;
              const fillRate = capacity > 0 ? (eventTickets.length / capacity) * 100 : 0;

              return (
                <div 
                  key={event.id} 
                  className="p-4 bg-slate-100/50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors duration-300 animate-slide-up group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{event.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{eventTickets.length} tickets sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">PKR {eventRevenue.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000 ease-out group-hover:from-emerald-600 group-hover:to-teal-700"
                      style={{ width: `${Math.min(fillRate, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {fillRate.toFixed(1)}% capacity ({eventTickets.length}/{capacity})
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">No events to display analytics for</p>
        )}
      </div>
    </div>
  );
};
// Event Card Component
const EventCard = ({ event, onEdit, onDelete, onManageTickets, formatDate, formatTime, getCategoryColor, getCategoryBadgeColor,onViewAttendees }) => (
  <div className="group bg-white/50 dark:bg-slate-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden hover:scale-[1.02] hover:border-emerald-300 dark:hover:border-emerald-500 backdrop-blur-sm">
    {event.image_url ? (
      <div className="h-48 bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${event.image_url})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm ${getCategoryBadgeColor(event.category)}`}>
            {event.category || 'General'}
          </span>
        </div>
        <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300"></div>
      </div>
    ) : (
      <div className={`bg-gradient-to-br ${getCategoryColor(event.category)} h-48 flex items-center justify-center relative overflow-hidden`}>
        <CalendarIcon className="w-20 h-20 text-white/30" />
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full border border-white/30 backdrop-blur-sm">
            {event.category || 'General'}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      </div>
    )}
    
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
            {event.title}
          </h3>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(event)}
            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-all duration-300 border border-emerald-200 transform hover:scale-110 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700"
            title="Edit event"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-300 border border-red-200 transform hover:scale-110 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 dark:border-red-700"
            title="Delete event"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {event.description || "No description provided"}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <CalendarIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">
            {formatDate(event.date)}
          </span>
        </div>
        
        {event.time && (
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <ClockIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-sm">{formatTime(event.time)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
          <MapPinIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{event.location}</span>
        </div>
        
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
         
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            PKR {event.cost ? parseFloat(event.cost).toFixed(2) : '0.00'}
          </span>
          {event.capacity && (
            <>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <UsersIcon className="w-4 h-4 text-teal-500 dark:text-teal-400 flex-shrink-0" />
              <span className="text-sm text-teal-600 dark:text-teal-400">{event.capacity} cap</span>
            </>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onManageTickets(event)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] group"
          >
            <TicketIcon className="w-5 h-5" />
            Manage Tickets
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={() => onViewAttendees(event)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] group"
          >
            <UsersIcon className="w-5 h-5" />
            View Attendees
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Created {new Date(event.created_at || Date.now()).toLocaleDateString()}</span>
          <span className={`px-3 py-1 rounded-full font-semibold transition-all duration-300 ${
            event.is_published 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' 
              : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
          }`}>
            {event.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Event Form Modal Component
const EventFormModal = ({ showForm, editingEvent, formData, setFormData, loading, onClose, onSubmit }) => {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform animate-scale-in border border-slate-200 dark:border-slate-700">
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-8 py-6 flex justify-between items-center rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              {editingEvent ? 'Update your event details' : 'Fill in the details for your new event'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all duration-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transform hover:rotate-90"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="animate-slide-up">
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Summer Music Festival 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe your event in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white"
                >
                  <option value="music">Music</option>
                  <option value="sports">Sports</option>
                  <option value="arts">Arts & Culture</option>
                  <option value="food">Food & Drink</option>
                  <option value="tech">Technology</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                  Event Image URL
                </label>
                <div className="relative">
                  <CameraIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                  Date *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                  Time
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                  Base Cost (PKR)
                </label>
                <div className="relative">
                 
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                  Total Capacity
                </label>
                <div className="relative">
                  <UsersIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-3">
                Location *
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Central Park, New York, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                editingEvent ? 'Update Event' : 'Create Event'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-8 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-slate-600 transform hover:scale-[1.02]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ onAddEvent }) => (
  <div className="bg-white/50 dark:bg-slate-800/50 rounded-3xl shadow-lg p-12 text-center border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm animate-scale-in">
    <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-300 dark:border-emerald-500 animate-pulse">
      <CalendarIcon className="w-12 h-12 text-white" />
    </div>
    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">No events yet</h3>
    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto text-lg">
      Start creating amazing events for your audience. Your first event is just a click away!
    </p>
    <button
      onClick={onAddEvent}
      className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] group"
    >
      <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
      Create Your First Event
    </button>
  </div>
);