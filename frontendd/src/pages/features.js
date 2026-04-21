// pages/features.js
import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { useUser } from '../context/Usercontext';

export default function Features() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useUser();
  useEffect(() => {
    setIsVisible(true);
  }, []);


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
  const features = [
    {
      icon: "🎫",
      title: "Smart Ticketing System",
      description: "Generate QR-coded tickets instantly. Secure, scannable, and easy to manage for both organizers and attendees.",
      color: "from-purple-500 to-pink-500",
      benefits: [
        "Instant ticket generation",
        "QR code verification",
        "Mobile-friendly tickets",
        "Anti-counterfeit protection"
      ]
    },
    {
      icon: "📱",
      title: "Mobile-First Experience",
      description: "Access EventHub from any device. Browse events, purchase tickets, and manage your bookings on the go.",
      color: "from-blue-500 to-cyan-500",
      benefits: [
        "Responsive design",
        "Native mobile experience",
        "Offline ticket access",
        "Push notifications"
      ]
    },
    {
      icon: "💳",
      title: "Secure Payment Processing",
      description: "Multiple payment options including JazzCash, EasyPaisa, and credit/debit cards. Fast, secure, and reliable.",
      color: "from-green-500 to-teal-500",
      benefits: [
        "Local payment methods",
        "International cards accepted",
        "Encrypted transactions",
        "Instant confirmation"
      ]
    },
    {
      icon: "📊",
      title: "Real-Time Analytics",
      description: "Track ticket sales, attendance, and revenue in real-time. Make data-driven decisions for your events.",
      color: "from-orange-500 to-red-500",
      benefits: [
        "Live sales tracking",
        "Attendee demographics",
        "Revenue reports",
        "Export data easily"
      ]
    },
    {
      icon: "🔍",
      title: "Smart Event Discovery",
      description: "Find events by category, location, date, and price. Our intelligent search helps you discover the perfect event.",
      color: "from-indigo-500 to-purple-500",
      benefits: [
        "Category filtering",
        "Location-based search",
        "Price range filters",
        "Personalized recommendations"
      ]
    },
    {
      icon: "🎨",
      title: "Custom Event Pages",
      description: "Create beautiful event pages with custom branding, images, and descriptions. Stand out from the crowd.",
      color: "from-pink-500 to-rose-500",
      benefits: [
        "Custom branding",
        "Rich media support",
        "SEO optimized",
        "Social media integration"
      ]
    },
    {
      icon: "📧",
      title: "Automated Communications",
      description: "Send automated confirmations, reminders, and updates to attendees via email and SMS.",
      color: "from-yellow-500 to-orange-500",
      benefits: [
        "Email notifications",
        "SMS alerts",
        "Custom messaging",
        "Scheduled reminders"
      ]
    },
    {
      icon: "👥",
      title: "Team Management",
      description: "Add team members, assign roles, and collaborate efficiently. Perfect for large-scale events.",
      color: "from-cyan-500 to-blue-500",
      benefits: [
        "Role-based access",
        "Multiple organizers",
        "Task assignment",
        "Activity logs"
      ]
    },
    {
      icon: "🔐",
      title: "Check-In & Verification",
      description: "Scan QR codes at the entrance for quick and secure check-ins. Track attendance in real-time.",
      color: "from-teal-500 to-green-500",
      benefits: [
        "QR code scanning",
        "Instant verification",
        "Duplicate prevention",
        "Attendance tracking"
      ]
    }
  ];

  const organizers = [
    {
      icon: "🚀",
      title: "Launch in Minutes",
      description: "Create and publish your event in just a few clicks. No technical knowledge required."
    },
    {
      icon: "💰",
      title: "Competitive Pricing",
      description: "Low service fees designed for the Pakistani market. Keep more of what you earn."
    },
    {
      icon: "📈",
      title: "Grow Your Audience",
      description: "Reach thousands of potential attendees across Pakistan through our platform."
    },
    {
      icon: "🛡️",
      title: "Fraud Protection",
      description: "Advanced security measures to protect against fake tickets and unauthorized access."
    }
  ];

  const attendees = [
    {
      icon: "🎯",
      title: "Discover Events",
      description: "Find concerts, conferences, sports events, and more happening near you."
    },
    {
      icon: "⚡",
      title: "Instant Booking",
      description: "Book tickets in seconds with our streamlined checkout process."
    },
    {
      icon: "📱",
      title: "Digital Tickets",
      description: "No printing required. Access all your tickets from your phone."
    },
    {
      icon: "💬",
      title: "Event Updates",
      description: "Get notified about changes, special offers, and important announcements."
    }
  ];

  return (
    <Layout>
      <Head>
        <title>Features - EventHub Pakistan</title>
        <meta name="description" content="Discover EventHub's powerful features for organizing and attending events in Pakistan" />
      </Head>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-900 via-black to-blue-900 py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-5xl md:text-7xl font-bold text-white mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            Powerful <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Features</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Everything you need to create, manage, and attend unforgettable events in Pakistan
          </p>
        </div>
      </div>

      {/* Main Features Grid */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Complete Event <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Management</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built for Pakistan's growing event industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-purple-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group"
              >
                <div className={`text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-gray-300 text-sm">
                      <span className="text-green-400 mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizers Section */}
      <section className="py-20 bg-gradient-to-b from-black to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              For Event <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Organizers</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to host successful events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {organizers.map((item, index) => (
              <div
                key={index}
                className="bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => checkorganizer()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              Start Organizing Events
            </button>
          </div>
        </div>
      </section>

      {/* For Attendees Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              For <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Attendees</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience events like never before
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {attendees.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              Browse Events
            </button>
          </div>
        </div>
      </section>

    
      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join Pakistan's leading event platform today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              Create Free Account
            </button>

          </div>
        </div>
      </section>
    </Layout>
  );
}