// pages/index.js
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";

export default function Home() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const featuredEvents = [
    {
      id: 1,
      title: "Tech Conference 2024",
      date: "December 15, 2024",
      location: "San Francisco, CA",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Technology",
      attendees: 1200
    },
    {
      id: 2,
      title: "Music Festival",
      date: "January 20, 2025",
      location: "Austin, TX",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Music",
      attendees: 8500
    },
    {
      id: 3,
      title: "Startup Summit",
      date: "February 8, 2025",
      location: "New York, NY",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      category: "Business",
      attendees: 3000
    },

    {
      id: 4,
      title: "Art Exhibition",
      date: "March 12, 2025",
      location: "Paris, France",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      category: "Arts",
      attendees: 1500
    }
  ];

  const categories = [
    { name: "Music & Concerts", icon: "🎵", count: "1,234" },
    { name: "Tech & Innovation", icon: "💻", count: "856" },
    { name: "Business & Networking", icon: "🤝", count: "742" },
    { name: "Arts & Culture", icon: "🎨", count: "923" },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const nextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  return (
    <Layout>
      {/* Hero Section with Video Background */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}

      
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Where <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent">Events</span> Come to Life
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Discover, create, and manage unforgettable events. From intimate gatherings to massive festivals, EventHub connects people through shared experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center"
            >
              <i className="fas fa-rocket mr-2"></i>
              Explore Events
            </Link>
            <button className="border-2 border-white border-opacity-30 hover:border-opacity-100 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl backdrop-blur-sm">
              <i className="fas fa-play-circle mr-2"></i>
              List Event
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
      <div className="relative bg-black bg-opacity-80 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-64 md:h-80">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {featuredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentEventIndex
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative w-[90%] h-full">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover rounded-2xl shadow-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-2xl"></div>
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                          <div className="flex items-center text-gray-300">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={prevEvent}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              onClick={nextEvent}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentEventIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentEventIndex
                      ? "bg-white"
                      : "bg-white bg-opacity-30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events by Category Section */}
      <section id="events" className="py-20 bg-gradient-to-b from-black to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore by <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">Category</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover events from every corner of creativity and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {categories.map((cat) => {
              const event = featuredEvents.find(e => 
                e.category.toLowerCase().includes(cat.name.split('&')[0].trim().toLowerCase())
              );

              return (
                <div
                  key={cat.name}
                  className="relative group rounded-2xl overflow-hidden border border-white border-opacity-10 hover:border-opacity-30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <img
                    src={event ? event.image : "https://images.unsplash.com/photo-1571266028243-43a4d4fb4636?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"}
                    alt={cat.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                      {cat.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Magic?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust EventHub to bring their visions to life
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              Start Creating Events
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <style jsx global>{`
        body {
          font-family: 'Poppins', sans-serif;
          margin: 0;
          padding: 0;
          background: #000;
          color: white;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

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