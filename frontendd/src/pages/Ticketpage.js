import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { apiUrl } from '@/lib/api';
import { useUser } from '../context/Usercontext';

export default function TicketPage() {
  const router = useRouter();
  const { eventId } = router.query;
  const { user, token } = useUser();

  const [event, setEvent] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(apiUrl(`/api/public/events/${eventId}/`));

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Failed to fetch event data: ${response.status}`);
        }

        const eventData = await response.json();
        setEvent(eventData);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const transformedEvent = event
    ? {
        id: event.id,
        name: event.title,
        description: event.description,
        location: event.location,
        date: event.date ? new Date(event.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) : '',
        time: event.time || '7:00 PM',
        image: event.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        features: event.microsite?.about_section
          ? event.microsite.about_section.split('\n').filter(Boolean)
          : ['Live Music Performance', 'Stunning Visual Effects', 'Food and Beverage Counters', 'Complimentary Parking'],
        categories: (event.tickets || event.ticket_categories || []).map((ticket) => ({
          id: ticket.id,
          type: ticket.name,
          price: Number.parseFloat(ticket.price) || 0,
          quantity: ticket.quantity || 0,
          available: ticket.is_active !== false && ((ticket.available_quantity ?? ticket.quantity) > 0),
          available_quantity: ticket.available_quantity ?? ticket.quantity ?? 0,
          description: ticket.description || `${ticket.name} ticket`,
        })),
      }
    : null;

  const updateTicketQuantity = (categoryType, delta) => {
    if (!transformedEvent) return;

    setSelectedTickets((previous) => {
      const category = transformedEvent.categories.find((item) => item.type === categoryType);
      if (!category) return previous;

      const currentQuantity = previous[categoryType] || 0;
      const nextQuantity = Math.max(0, Math.min(currentQuantity + delta, category.available_quantity || category.quantity));

      if (nextQuantity === 0) {
        const { [categoryType]: removed, ...rest } = previous;
        return rest;
      }

      return { ...previous, [categoryType]: nextQuantity };
    });
  };

  const getTotalPrice = () => {
    if (!transformedEvent) return 0;

    return Object.entries(selectedTickets).reduce((total, [categoryType, quantity]) => {
      const category = transformedEvent.categories.find((item) => item.type === categoryType);
      return category ? total + category.price * quantity : total;
    }, 0);
  };

  const getTotalTickets = () => Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);

  const handleProceedToPay = () => {
    if (!transformedEvent) return;

    if (getTotalTickets() === 0) {
      alert('Please select at least one ticket.');
      return;
    }

    if (!user || !token) {
      router.push('/login');
      return;
    }

    const orderData = {
      event: {
        id: transformedEvent.id,
        name: transformedEvent.name,
        date: transformedEvent.date,
        time: transformedEvent.time,
        location: transformedEvent.location,
        image: transformedEvent.image,
      },
      tickets: transformedEvent.categories
        .filter((category) => selectedTickets[category.type] > 0)
        .map((category) => ({
          ticket_category: category.id,
          type: category.type,
          price: category.price,
          quantity: selectedTickets[category.type],
          total: category.price * selectedTickets[category.type],
        })),
      total: getTotalPrice(),
    };

    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    router.push('/checkout');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
          Loading event details...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white px-6">
          <div className="max-w-lg text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-300">Error loading event</h1>
            <p className="text-slate-200">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!transformedEvent) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white px-6">
          <div className="max-w-lg text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-200">Event not found</h1>
            <button
              onClick={() => router.push('/')}
              className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700"
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
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white">
        <div className="relative h-96 w-full overflow-hidden">
          <img
            src={transformedEvent.image}
            alt={transformedEvent.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="mx-auto max-w-7xl">
              <h1 className="text-4xl font-bold md:text-6xl">{transformedEvent.name}</h1>
              <p className="mt-3 max-w-2xl text-slate-200">{transformedEvent.description}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="text-xl font-semibold text-cyan-300">Event Details</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-200">
                  <p><span className="text-slate-400">Location:</span> {transformedEvent.location}</p>
                  <p><span className="text-slate-400">Date:</span> {transformedEvent.date}</p>
                  <p><span className="text-slate-400">Time:</span> {transformedEvent.time}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="text-xl font-semibold text-cyan-300">Event Features</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {transformedEvent.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:col-span-2">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold text-cyan-300">Select Tickets</h2>
                <div className="rounded-full bg-cyan-500/20 px-4 py-2 text-sm text-cyan-200">
                  {getTotalTickets()} selected • {getTotalPrice()} PKR
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {transformedEvent.categories.length > 0 ? (
                  transformedEvent.categories.map((category) => (
                    <div key={category.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{category.type}</h3>
                          <p className="text-sm text-slate-300">{category.description}</p>
                          <p className="mt-1 text-sm text-cyan-300">{category.price} PKR</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateTicketQuantity(category.type, -1)}
                            disabled={!selectedTickets[category.type]}
                            className="h-10 w-10 rounded-lg bg-slate-700 text-white disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-lg font-semibold">{selectedTickets[category.type] || 0}</span>
                          <button
                            onClick={() => updateTicketQuantity(category.type, 1)}
                            disabled={(selectedTickets[category.type] || 0) >= category.available_quantity}
                            className="h-10 w-10 rounded-lg bg-cyan-600 text-white disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-300">No ticket categories are available for this event.</p>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
                <div className="text-slate-300">Total</div>
                <div className="text-2xl font-bold text-cyan-300">{getTotalPrice()} PKR</div>
                <button
                  onClick={handleProceedToPay}
                  className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={getTotalTickets() === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}