import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useUser } from '../context/Usercontext';
import { apiUrl } from "@/lib/api";

import Layout from "@/components/Layout";
export default function Home() {
  const router = useRouter();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  // Refs for scroll sections
  const eventsRef = useRef(null);
  const categoriesRef = useRef(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl('/api/public/all_events/'));
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        
        // Transform API data to match component structure
        const transformedEvents = data.results.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          location: event.location,
          image: event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
          category: event.category,
          attendees: event.capacity,
          description: event.description,
          cost: event.cost,
          time: event.time
        }));
        
        setEvents(transformedEvents);
        
        // Generate categories dynamically from events
        const categoryMap = new Map();
        const categoryIcons = {
          'music': '🎵',
          'tech': '💻',
          'business': '🤝',
          'arts': '🎨',
          'sports': '⚽',
          'food': '🍽️',
          'education': '📚',
          'health': '💪'
        };
        
        data.results.forEach(event => {
          const cat = event.category.toLowerCase();
          if (categoryMap.has(cat)) {
            categoryMap.set(cat, categoryMap.get(cat) + 1);
          } else {
            categoryMap.set(cat, 1);
          }
        });
        
        const dynamicCategories = Array.from(categoryMap).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          icon: categoryIcons[name] || '🎪',
          count: count.toString(),
          categoryKey: name
        }));
        
        setCategories(dynamicCategories);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle scroll navigation from URL params
  useEffect(() => {
    if (router.query.scrollTo && !loading) {
      const scrollTimeout = setTimeout(() => {
        if (router.query.scrollTo === 'events' && eventsRef.current) {
          eventsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (router.query.scrollTo === 'categories' && categoriesRef.current) {
          categoriesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      return () => clearTimeout(scrollTimeout);
    }
  }, [router.query.scrollTo, loading]);

  // Animation and carousel effects
  useEffect(() => {
    setIsVisible(true);
    if (events.length > 0) {
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % events.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [events]);

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const scrollToEvents = () => {
    if (eventsRef.current) {
      eventsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const checkorganizer= async()=>{
    const token = localStorage.getItem('token');
    if(!token){
      router.push('/login');
      return;
    }
    console.log('Token found:', token);

     if(user.role=='organizer'){
      router.push('/organizer');
     }
     else{
      router.push('/login');
     }
  }
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Loading amazing events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>

      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-500 text-2xl mb-4">⚠️ Error loading events</p>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
      </Layout>
    );
  }

  return (
 <Layout>
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Where <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent">Events</span> Come to Life
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Discover, create, and manage unforgettable events. From intimate gatherings to massive festivals, EventHub connects people through shared experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={scrollToEvents}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              🚀 Explore {events.length} Events
            </button>
            <button onClick={()=>checkorganizer()}
            className="border-2 border-white border-opacity-30 hover:border-opacity-100 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl backdrop-blur-sm">
              ▶️ List Event
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white border-opacity-50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white bg-opacity-50 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Featured Events Carousel */}
      {events.length > 0 && (
        <div className="relative bg-black bg-opacity-80 py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Featured <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Events</span>
            </h2>
            
            <div className="relative h-80 md:h-96">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {events.map((event, index) => (
                    index === currentEventIndex && (
                      <div
                        key={event.id}
                        onClick={() => {
                          router.push(`/ticketpage?eventId=${event.id}`);
                        }}
                        className="absolute inset-0 transition-all duration-1000 ease-in-out cursor-pointer"
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="relative w-[90%] h-full">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover rounded-2xl shadow-2xl"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-2xl"></div>
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                              <span className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                                {event.category}
                              </span>
                              <h3 className="text-3xl font-bold mb-2">{event.title}</h3>
                              <div className="flex items-center text-gray-300 mb-2">
                                <span className="mr-4">📍 {event.location}</span>
                                <span>📅 {event.date}</span>
                              </div>
                              <div className="text-gray-400 text-sm line-clamp-2">
                                {event.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <button
                onClick={prevEvent}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10"
              >
                ‹
              </button>
              <button
                onClick={nextEvent}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10"
              >
                ›
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                {events.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentEventIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentEventIndex
                        ? "bg-white w-8"
                        : "bg-white bg-opacity-30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events by Category Section */}
      {categories.length > 0 && (
        <section ref={categoriesRef} className="py-20 bg-gradient-to-b from-black to-purple-900 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Explore by <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">Category</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Discover events from every corner of creativity and innovation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((cat) => {
                const categoryEvent = events.find(e => 
                  e.category.toLowerCase() === cat.categoryKey.toLowerCase()
                );

                return (
                  <div
                    key={cat.name}
                    onClick={() => router.push(`/categorytickets?category=${cat.categoryKey.toLowerCase()}`)}
                    className="relative group rounded-2xl overflow-hidden border border-white border-opacity-10 hover:border-opacity-30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                  >
                    <img
                      src={categoryEvent ? categoryEvent.image : "https://images.unsplash.com/photo-1571266028243-43a4d4fb4636?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
                      alt={cat.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1571266028243-43a4d4fb4636?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="text-4xl mb-2">{cat.icon}</div>
                      <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                      <p className="text-gray-300 text-sm">{cat.count} Events</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Events Grid */}
      <section ref={eventsRef} className="py-20 bg-black scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              All <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Events</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => router.push(`/ticketpage?eventId=${event.id}`)}
                className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
              >
                <div className="relative h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📍</span>
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-purple-400 font-bold">${event.cost}</span>
                      <span className="text-gray-500">{event.attendees} spots</span>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      { !user && (
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Magic?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust EventHub to bring their visions to life
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={()=>checkorganizer()}
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              Start Creating Events
            </button>

          </div>
        </div>
      </section>)}
    </div>
      
       <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
            onError={(e) => console.error('Video error:', e)}
          >
            <source src="/videos/2022395-hd_1920_1080_30fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
     </Layout>
  );
}