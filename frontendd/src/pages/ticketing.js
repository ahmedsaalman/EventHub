import { useEffect, useState } from "react";
import { 
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TicketIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth, createAPIService, ConfirmationModal} from '../hooks/useAuth';

export default function TicketingManagement() {
  const auth = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [ticketFormData, setTicketFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    features: [],
    color: "#fbbf24"
  });

  const api = createAPIService(auth);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchEvents();
      setEvents(data);
      
      // Check if event ID is in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('event');
      if (eventId) {
        const event = data.find(e => e.id.toString() === eventId);
        if (event) {
          handleSelectEvent(event);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    // Load ticket categories from event data
    if (event.ticket_categories) {
      setTicketCategories(event.ticket_categories);
    } else {
      setTicketCategories([]);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      setError("Please select an event first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const ticketData = {
        name: ticketFormData.name,
        price: parseFloat(ticketFormData.price),
        quantity: parseInt(ticketFormData.quantity),
        description: ticketFormData.description,
        features: ticketFormData.features,
        color: ticketFormData.color
      };

      if (editingTicket) {
        await api.updateTicketCategory(selectedEvent.id, editingTicket.id, ticketData);
        setSuccess("Ticket category updated!");
      } else {
        await api.createTicketCategory(selectedEvent.id, ticketData);
        setSuccess("Ticket category created!");
      }

      resetTicketForm();
      // Refresh events to get updated ticket categories
      await fetchEvents();
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error("Error saving ticket:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticket) => {
  if (!selectedEvent) {
    setError('No event selected');
    return;
  }
  
  // Add confirmation dialog
  const confirmed = window.confirm(
    `Are you sure you want to delete the "${ticket.name}" ticket category?`
  );
  if (!confirmed) return;
  
  try {
    setLoading(true);
    
    // First, verify the event exists and user has permission
    console.log(`Attempting to delete ticket ${ticket.id} from event ${selectedEvent.id}`);
    
    await api.deleteTicketCategory(selectedEvent.id, ticket.id);
    
    setTicketCategories(prev => prev.filter(cat => cat.id !== ticket.id));
    setSuccess('Ticket category deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
    
  } catch (error) {
    console.error('Delete error details:', error);
    
    if (error.response?.status === 404) {
      setError('Event not found or you do not have permission to modify this event');
    } else {
      setError(`Failed to delete ticket category: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};

  const resetTicketForm = () => {
    setTicketFormData({
      name: "",
      price: "",
      quantity: "",
      description: "",
      features: [],
      color: "#fbbf24"
    });
    setEditingTicket(null);
    setShowTicketForm(false);
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

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      fetchEvents();
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  // Show loading while checking authentication
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-700">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6">
            Please log in to access the ticketing management.
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

  // Check if user is organizer
  if (auth.user && auth.user.role !== 'organizer') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-700">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You need to be an organizer to access this page.
          </p>
          <button
            onClick={auth.logout}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/90 backdrop-blur-md shadow-2xl border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Ticket Management
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Manage ticket categories for your events</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-400">Welcome back,</p>
                <p className="text-white font-semibold">{auth.user?.username || auth.user?.email}</p>
                <p className="text-xs text-indigo-400 capitalize">{auth.user?.role}</p>
              </div>
              <button
                onClick={auth.logout}
                className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
              >
                Logout
              </button>
              <button
                onClick={() => window.location.href = '/organizer'}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-green-900/50 border border-green-700 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Selection */}
        {!selectedEvent ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Select an Event</h2>
                <p className="text-gray-400 mt-2">Choose an event to manage its tickets</p>
              </div>
              <span className="text-sm text-gray-300 bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-700">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : Array.isArray(events) && events.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventSelectionCard 
                    key={event.id} 
                    event={event} 
                    onSelect={handleSelectEvent}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-700">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-indigo-500/30">
                  <TicketIcon className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No events found</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  You need to create events first before managing tickets.
                </p>
                <button
                  onClick={() => window.location.href = '/organizer'}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Ticket Management for Selected Event */
          <div className="space-y-6">
            {/* Event Header */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Events
                  </button>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedEvent.title}</h3>
                  <p className="text-gray-400">{formatDate(selectedEvent.date)} • {selectedEvent.location}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedEvent.is_published 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {selectedEvent.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Ticket Categories</h4>
                  <p className="text-gray-400">Create different ticket tiers for your event</p>
                </div>
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Category
                </button>
              </div>

              {ticketCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ticketCategories.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onEdit={(t) => {
                        setEditingTicket(t);
                        setTicketFormData({
                          name: t.name,
                          price: t.price.toString(),
                          quantity: t.quantity.toString(),
                          description: t.description,
                          features: t.features || [],
                          color: t.color
                        });
                        setShowTicketForm(true);
                      }}
                      onDelete={handleDeleteTicket}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TicketIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No ticket categories yet</p>
                  <button
                    onClick={() => setShowTicketForm(true)}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Create your first ticket category →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ticket Form Modal */}
        {showTicketForm && (
          <TicketFormModal
            showTicketForm={showTicketForm}
            editingTicket={editingTicket}
            ticketFormData={ticketFormData}
            setTicketFormData={setTicketFormData}
            loading={loading}
            onClose={resetTicketForm}
            onSubmit={handleTicketSubmit}
          />
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Event Selection Card Component
const EventSelectionCard = ({ event, onSelect, formatDate }) => (
  <div 
    className="group bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-700 overflow-hidden hover:scale-105 hover:border-indigo-500/50 cursor-pointer"
    onClick={() => onSelect(event)}
  >
    {event.image_url ? (
      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${event.image_url})` }}>
        <div className="h-full bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>
    ) : (
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-32 flex items-center justify-center">
        <TicketIcon className="w-12 h-12 text-white/50" />
      </div>
    )}
    
    <div className="p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <span className="inline-block px-2 py-1 bg-indigo-600/20 text-indigo-400 text-xs font-semibold rounded-full mb-2">
            {event.category || 'General'}
          </span>
          <h3 className="text-lg font-bold text-white line-clamp-2">
            {event.title}
          </h3>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {event.description || "No description provided"}
      </p>

      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700 mt-4">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{event.ticket_categories?.length || 0} ticket categories</span>
          <span className={`px-2 py-1 rounded-full font-semibold ${
            event.is_published 
              ? 'bg-green-600/20 text-green-400' 
              : 'bg-yellow-600/20 text-yellow-400'
          }`}>
            {event.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Ticket Card Component - UPDATED
const TicketCard = ({ ticket, onEdit, onDelete }) => {
  // Calculate available quantity properly
  const availableQuantity = ticket.available_quantity !== undefined 
    ? ticket.available_quantity 
    : (ticket.quantity - (ticket.quantity_sold || 0));
  
  const totalQuantity = ticket.quantity;
  const soldQuantity = ticket.quantity_sold || 0;

  return (
    <div className="bg-gray-900/50 border-2 border-gray-700 hover:border-gray-600 rounded-xl p-6 transition-all duration-300 hover:shadow-lg group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: ticket.color }}
          ></div>
          <h5 className="text-lg font-bold text-white">{ticket.name}</h5>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(ticket)}
            className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(ticket)}
            className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-400">PKR {ticket.price}</span>
          <div className="text-right">
            <div className="text-sm text-white font-semibold">{availableQuantity} available</div>
            <div className="text-xs text-gray-400">{soldQuantity} sold • {totalQuantity} total</div>
          </div>
        </div>

        {ticket.description && (
          <p className="text-gray-400 text-sm">{ticket.description}</p>
        )}

        {ticket.features && ticket.features.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-gray-700">
            {ticket.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
// Ticket Form Modal Component
const TicketFormModal = ({ showTicketForm, editingTicket, ticketFormData, setTicketFormData, loading, onClose, onSubmit }) => {
  if (!showTicketForm) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {editingTicket ? 'Edit Ticket Category' : 'Create Ticket Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Gold, VIP, General"
                value={ticketFormData.name}
                onChange={(e) => setTicketFormData({ ...ticketFormData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Color Theme
              </label>
              <input
                type="color"
                value={ticketFormData.color}
                onChange={(e) => setTicketFormData({ ...ticketFormData, color: e.target.value })}
                className="w-full h-12 bg-gray-700 border-2 border-gray-600 rounded-xl cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Price (PKR) *
              </label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={ticketFormData.price}
                  onChange={(e) => setTicketFormData({ ...ticketFormData, price: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Quantity Available *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="100"
                value={ticketFormData.quantity}
                onChange={(e) => setTicketFormData({ ...ticketFormData, quantity: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe what's included..."
              value={ticketFormData.description}
              onChange={(e) => setTicketFormData({ ...ticketFormData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Features (comma-separated)
            </label>
            <input
              type="text"
              placeholder="VIP Access, Free Drink, Backstage Pass"
              value={ticketFormData.features.join(', ')}
              onChange={(e) => setTicketFormData({ 
                ...ticketFormData, 
                features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
              })}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingTicket ? 'Update Category' : 'Create Category')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};