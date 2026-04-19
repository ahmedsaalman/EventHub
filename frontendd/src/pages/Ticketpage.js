import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

export default function TicketPage() {
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isBooking, setIsBooking] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { eventId } = router.query;

  // Fetch event data from backend
  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/api/public/events/${eventId}/`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch event data: ${response.status}`);
      }
      
      const eventData = await response.json();
      setEvent(eventData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform backend data to match frontend structure
  const transformEventData = (backendEvent) => {
    if (!backendEvent) return null;

    // Use microsite data if available, otherwise use event data
    const microsite = backendEvent.microsite || {};
    const tickets = backendEvent.tickets || backendEvent.ticket_categories || [];

    return {
      id: backendEvent.id,
      name: backendEvent.title,
      description: backendEvent.description,
      location: backendEvent.location,
      date: new Date(backendEvent.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: backendEvent.time ? new Date(`1970-01-01T${backendEvent.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) : '7:00 PM',
      image: microsite.banner_url || backendEvent.image_url || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      
      // Use microsite about section or default features
      features: microsite.about_section ? 
        microsite.about_section.split('\n').filter(line => line.trim()) : 
        [
          "Live Music Performance",
          "Stunning Visual Effects", 
          "Food and Beverage Counters",
          "Complimentary Parking",
        ],
      
      // Transform ticket categories from backend
      categories: tickets.map((ticket, index) => ({
        type: ticket.name,
        price: parseFloat(ticket.price),
        quantity: ticket.quantity,
        available: ticket.is_active !== false && (ticket.available_quantity || ticket.quantity) > 0,
        description: ticket.description || `${ticket.name} ticket`,
        benefits: ticket.features || ["Event Entry", "Basic Access"],
        id: ticket.id,
        available_quantity: ticket.available_quantity || ticket.quantity
      })) || []
    };
  };

  const transformedEvent = transformEventData(event);

  const updateTicketQuantity = (categoryType, quantity) => {
    if (!transformedEvent) return;

    setSelectedTickets(prev => {
      const category = transformedEvent.categories.find(cat => cat.type === categoryType);
      if (!category) return prev;

      const maxQuantity = category.available_quantity || category.quantity;
      const newQuantity = Math.max(0, Math.min(quantity, maxQuantity));
      
      if (newQuantity === 0) {
        const { [categoryType]: removed, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [categoryType]: newQuantity
      };
    });
  };

  const getTotalPrice = () => {
    if (!transformedEvent) return 0;

    return Object.entries(selectedTickets).reduce((total, [categoryType, quantity]) => {
      const category = transformedEvent.categories.find(cat => cat.type === categoryType);
      return category ? total + (category.price * quantity) : total;
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

const handleProceedToPay = async () => {
  if (!transformedEvent) return;


  if (getTotalTickets() === 0) {
    alert("Please select at least one ticket.");
    return;
  }

  setIsBooking(true);
  try {
    // Prepare order data
    const orderData = {
      id: `ORD-${Date.now()}`, // simple order id
      event: {
        id: transformedEvent.id,
        name: transformedEvent.name,
        date: transformedEvent.date,
        time: transformedEvent.time,
        location: transformedEvent.location,
        image: transformedEvent.image
      },
      tickets: transformedEvent.categories
        .filter(cat => selectedTickets[cat.type] > 0)
        .map(cat => ({
          type: cat.type,
          price: cat.price,
          quantity: selectedTickets[cat.type],
          total: cat.price * selectedTickets[cat.type]
        })),
      subtotal: getTotalPrice(),
      serviceFee: Math.round(getTotalPrice() * 0.05), 
      tax: Math.round(getTotalPrice() * 0.1), 
      total: Math.round(getTotalPrice() * 1.15), 
      orderDate: new Date().toISOString()
    };

  localStorage.setItem('currentOrder', JSON.stringify(orderData));

  const token = localStorage.getItem('token'); 
  if (!token) {
    router.push('/login');
    return;
  }

    // Redirect to checkout page
    router.push('/checkout');
  } catch (error) {
    console.error('Error creating order:', error);
    alert(`Failed to proceed: ${error.message}`);
  } finally {
    setIsBooking(false);
  }
};


  const hasSelectedTickets = getTotalTickets() > 0;

  // Calculate starting price safely
  const getStartingPrice = () => {
    if (!transformedEvent || !transformedEvent.categories.length) return 0;
    const prices = transformedEvent.categories
      .filter(cat => cat.available)
      .map(cat => cat.price);
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <div className="text-cyan-300">Loading event details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <div className="text-2xl text-red-400 mb-4">Error loading event</div>
            <div className="text-slate-300 mb-6 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
              {error}
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => router.push('/events')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl transition-colors"
              >
                Browse Events
              </button>
              <button 
                onClick={fetchEventData}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // No event data
  if (!transformedEvent) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl text-slate-300 mb-4">Event not found</div>
            <button 
              onClick={() => router.push('/events')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Browse Events
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white font-sans">
        {/* Full Width Hero Image */}
        <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
          <img
            src={transformedEvent.image}
            alt={transformedEvent.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
          
          {/* Event Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-6xl font-bold mb-2 font-serif bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {transformedEvent.name}
                  </h1>
                  <p className="text-xl text-slate-300 mb-4 max-w-2xl font-light line-clamp-3">
                    {transformedEvent.description}
                  </p>
                </div>
                <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 md:p-6 mt-4 md:mt-0 border border-cyan-500/30 min-w-[200px]">
                  <div className="text-sm text-cyan-300 font-medium">Starting from</div>
                  <div className="text-2xl md:text-3xl font-bold text-cyan-400 font-mono">
                    {getStartingPrice()} PKR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Event Details - Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Event Info Card */}
              <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold mb-4 text-cyan-400 font-serif">Event Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-cyan-300 font-medium">Location</div>
                      <div className="font-semibold text-slate-200 truncate">{transformedEvent.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-blue-300 font-medium">Date & Time</div>
                      <div className="font-semibold text-slate-200">{transformedEvent.date}</div>
                      <div className="text-sm text-slate-400">{transformedEvent.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30 flex-shrink-0">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-purple-300 font-medium">Duration</div>
                      <div className="font-semibold text-slate-200">4 Hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Features */}
              <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold mb-4 text-cyan-400 font-serif">Event Features</h3>
                <div className="grid grid-cols-1 gap-3">
                  {transformedEvent.features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/30"
                    >
                      <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-200 text-sm truncate">{feature}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ticket Selection - Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-cyan-400 font-serif">Select Tickets</h2>
                  {hasSelectedTickets && (
                    <div className="text-sm bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-full font-medium border border-cyan-500/30">
                      {getTotalTickets()} ticket{getTotalTickets() > 1 ? 's' : ''} selected • {getTotalPrice()} PKR
                    </div>
                  )}
                </div>

                {/* Ticket Categories */}
                <div className="space-y-4">
                  {transformedEvent.categories.length > 0 ? (
                    transformedEvent.categories.map((category, index) => (
                      <div
                        key={category.id || index}
                        className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
                          selectedTickets[category.type] > 0
                            ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                            : 'border-slate-700 bg-slate-700/30'
                        } ${!category.available && 'opacity-40 cursor-not-allowed'}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-1 flex-wrap">
                                  <h3 className="text-xl font-bold text-slate-100 truncate">{category.type}</h3>
                                  <span className="text-lg font-mono font-bold text-cyan-400 whitespace-nowrap">
                                    {category.price} PKR
                                  </span>
                                </div>
                                <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                                  {category.description}
                                </p>
                                
                                {/* Benefits */}
                                <div className="flex flex-wrap gap-2">
                                  {category.benefits.map((benefit, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-slate-600/50 text-slate-300 px-3 py-1 rounded-full border border-slate-500/30 whitespace-nowrap"
                                    >
                                      {benefit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end space-x-6 mt-4 md:mt-0">
                            {/* Availability */}
                            <div className="text-right min-w-[120px]">
                              <div className={`text-sm font-medium ${category.available ? 'text-green-400' : 'text-red-400'}`}>
                                {category.available ? 
                                  `${category.available_quantity || category.quantity} available` : 
                                  'Sold Out'
                                }
                              </div>
                            </div>

                            {/* Quantity Selector */}
                            {category.available && (
                              <div className="flex items-center space-x-3 bg-slate-700/50 rounded-xl p-2 border border-slate-600/50">
                                <button
                                  onClick={() => updateTicketQuantity(category.type, (selectedTickets[category.type] || 0) - 1)}
                                  disabled={!selectedTickets[category.type]}
                                  className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center disabled:opacity-30 hover:bg-slate-500 transition-colors text-slate-200 font-bold flex-shrink-0"
                                >
                                  −
                                </button>
                                
                                <span className="w-8 text-center font-bold text-slate-100 text-lg flex-shrink-0">
                                  {selectedTickets[category.type] || 0}
                                </span>
                                
                                <button
                                  onClick={() => updateTicketQuantity(category.type, (selectedTickets[category.type] || 0) + 1)}
                                  disabled={(selectedTickets[category.type] || 0) >= (category.available_quantity || category.quantity)}
                                  className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center disabled:opacity-30 hover:bg-cyan-500 transition-colors text-white font-bold flex-shrink-0"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-2xl text-slate-400 mb-4">No tickets available</div>
                      <div className="text-slate-500">Check back later for ticket availability</div>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                {hasSelectedTickets && (
                  <div className="mt-8 border-t border-slate-700 pt-6">
                    <h3 className="text-xl font-bold mb-4 text-cyan-400 font-serif">Order Summary</h3>
                    
                    {/* Selected Tickets List */}
                    <div className="space-y-3 mb-6">
                      {Object.entries(selectedTickets).map(([categoryType, quantity]) => {
                        const category = transformedEvent.categories.find(cat => cat.type === categoryType);
                        if (!category) return null;
                        
                        return (
                          <div key={categoryType} className="flex justify-between items-center bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30 flex-shrink-0">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-200 truncate">{category.type}</div>
                                <div className="text-sm text-slate-400">x{quantity} tickets</div>
                              </div>
                            </div>
                            <div className="font-bold text-cyan-400 font-mono whitespace-nowrap ml-4">
                              {category.price * quantity} PKR
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center text-xl font-bold border-t border-slate-600 pt-4">
                      <span className="text-slate-300">Total Amount:</span>
                      <span className="text-2xl text-cyan-400 font-mono">{getTotalPrice()} PKR</span>
                    </div>

                    {/* Proceed to Pay Button */}
                    <button
                      onClick={handleProceedToPay}
                      disabled={isBooking}
                      className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl font-bold text-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:transform-none shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
                    >
                      {isBooking ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        `Proceed to Pay - ${getTotalPrice()} PKR`
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}