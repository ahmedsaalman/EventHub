// pages/about.js
import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { useUser } from '../context/Usercontext';

export default function About() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUser();
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const values = [
    {
      icon: "🎯",
      title: "Innovation First",
      description: "We leverage cutting-edge technology to create seamless event experiences for all Pakistanis."
    },
    {
      icon: "🤝",
      title: "Community Driven",
      description: "Building connections and fostering communities through memorable events across Pakistan."
    },
    {
      icon: "💡",
      title: "Transparency",
      description: "Clear pricing, honest communication, and reliable service you can trust."
    },
    {
      icon: "🌟",
      title: "Excellence",
      description: "Committed to delivering exceptional quality in every aspect of our platform."
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Founded in Lahore",
      description: "EventHub was born with a vision to revolutionize event management in Pakistan"
    },
    {
      year: "2023",
      title: "First 1,000 Events",
      description: "Successfully hosted over 1,000 events across major Pakistani cities"
    },
    {
      year: "2024",
      title: "100K+ Users",
      description: "Growing community of event organizers and attendees across the nation"
    },
    {
      year: "2024",
      title: "50+ Cities",
      description: "Expanded to cover events in over 50 cities throughout Pakistan"
    }
  ];

  const team = [
    {
      name: "Ahmed Khan",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "Tech entrepreneur passionate about connecting people through events"
    },
    {
      name: "Fatima Ali",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "Expert in event management with 10+ years of experience"
    },
    {
      name: "Hassan Malik",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "Software architect building scalable solutions for millions"
    },
    {
      name: "Aisha Raza",
      role: "Head of Marketing",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      bio: "Digital marketing specialist growing Pakistan's event community"
    }
  ];

  const cities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", 
    "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
    "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Abbottabad"
  ];

  return (
    <Layout>
      <Head>
        <title>About Us - EventHub Pakistan</title>
        <meta name="description" content="Learn about EventHub, Pakistan's leading event management and ticketing platform" />
      </Head>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-900 via-black to-blue-900 py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-5xl md:text-7xl font-bold text-white mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            About <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">EventHub</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Pakistan's premier platform for discovering, organizing, and experiencing unforgettable events
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Our <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Mission</span>
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                At EventHub, we believe in the power of shared experiences. Our mission is to make event organization and attendance accessible to everyone across Pakistan.
              </p>
              <p className="text-lg text-gray-400 mb-6">
                We're building more than just a platform – we're creating a vibrant community where event organizers can connect with passionate attendees, where ideas come to life, and where memories are made.
              </p>
              <p className="text-lg text-gray-400">
                From intimate workshops in Lahore to massive concerts in Karachi, from tech conferences in Islamabad to cultural festivals in Multan – EventHub is powering Pakistan's event revolution.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Events"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-black to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Values</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-xl p-8 border border-gray-800 hover:border-purple-500 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-6xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
     
      {/* Coverage Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Nationwide</span> Coverage
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Supporting events across Pakistan from major cities to emerging markets
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {cities.map((city, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105"
                >
                  <span className="text-white font-semibold">📍 {city}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 mt-8 text-sm">
              ...and many more cities across Pakistan
            </p>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the EventHub Family
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Whether you're organizing your first event or your hundredth, we're here to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              Get Started Today
            </button>

          </div>
        </div>
      </section>
    </Layout>
  );
}
