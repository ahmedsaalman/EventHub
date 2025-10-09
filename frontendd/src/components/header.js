// components/Header.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black bg-opacity-90 backdrop-blur-lg border-b border-white border-opacity-10' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
              EventHub
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <a href="#events" className="text-white hover:text-purple-300 transition duration-300">
              Events
            </a>
            <a href="#categories" className="text-white hover:text-purple-300 transition duration-300">
              Categories
            </a>
            <a href="#features" className="text-white hover:text-purple-300 transition duration-300">
              Features
            </a>
            <a href="#about" className="text-white hover:text-purple-300 transition duration-300">
              About
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-white hover:text-purple-300 transition duration-300"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}