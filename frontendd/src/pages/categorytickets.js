// pages/category/[category].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";

export default function CategoryEvents() {
  const router = useRouter();
  const { category } = router.query;
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryName = category || "Tech";
  
  const categoryIcons = {
    tech: "💻",
    technology: "💻",
    music: "🎵",
    business: "🤝",
    arts: "🎨",
    sports: "⚽",
    food: "🍕",
    education: "📚"
  };

  useEffect(() => {
    if (category) {
      fetchCategoryEvents();
    }
  }, [category]);

  const fetchCategoryEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/public/events/category/${category.toLowerCase()}/`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      
      // Transform API data to match component structure
      // Handle paginated response - check if data has 'results' property
      const eventsArray = data.results || data;
      
      const transformedEvents = eventsArray.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time || '00:00',
        location: event.location,
        image: event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        category: event.category,
        price: parseFloat(event.cost),
        attendees: event.capacity || 0,
        type: event.category,
        organizer: event.organizer?.name || 'Event Organizer',
        description: event.description
      }));
      
      setEvents(transformedEvents);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching category events:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatPrice = (price) => {
    return price === 0 ? "Free" : `$${price}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading {categoryName} events...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-red-500 text-2xl mb-4">⚠️ Error loading events</p>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => fetchCategoryEvents()} 
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show empty state
  if (events.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-center text-white max-w-md">
            <div className="text-6xl mb-4">{categoryIcons[categoryName.toLowerCase()] || "💻"}</div>
            <h2 className="text-3xl font-bold mb-2">No {categoryName} Events Yet</h2>
            <p className="text-gray-400 mb-6">
              There are currently no events in this category. Check back soon!
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold"
            >
              Browse All Events
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{categoryName} Events | EventHub</title>
      </Head>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-black min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl mr-4">{categoryIcons[categoryName.toLowerCase()] || "💻"}</span>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent capitalize">
              {categoryName}
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            Discover amazing {categoryName.toLowerCase()} events
          </p>
          <p className="text-lg text-gray-400">
            {events.length} event{events.length !== 1 ? 's' : ''} found • Join thousands of enthusiasts
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                Featured {categoryName} Events
              </h2>
              <p className="text-gray-400 mt-1">
                {events.length} event{events.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => router.push(`/ticketpage?eventId=${event.id}`)}
                className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
              >
                {/* Event Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {formatPrice(event.price)}
                    </span>
                  </div>
                  {event.attendees > 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs">
                        {event.attendees} capacity
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs capitalize">
                      {event.type}
                    </span>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                      {event.title}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2 text-purple-400">📅</span>
                      <span className="text-sm">{formatDate(event.date)} • {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <span className="mr-2 text-purple-400">📍</span>
                      <span className="text-sm line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="text-purple-400 font-bold text-lg">
                      {formatPrice(event.price)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/ticketpage?eventId=${event.id}`);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Get Tickets
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back to Home Button */}
          <div className="text-center mt-12">
            <button 
              onClick={() => router.push('/')}
              className="border-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-2xl"
            >
              ← Back to All Events
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        body {
          font-family: 'Poppins', sans-serif;
          background: #000;
          color: white;
        }
      `}</style>
    </Layout>
  );
}