// components/Header.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from "../context/Usercontext";
import { useRouter } from "next/router";

export default function Header() {
  const { user, logoutUser } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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

          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
              EventHub
            </div>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <a 
              onClick={() => router.push('/?scrollTo=events')} 
              className="text-white hover:text-purple-300 transition duration-300 cursor-pointer"
            >
              Events
            </a>
            <a 
              onClick={() => router.push('/?scrollTo=categories')} 
              className="text-white hover:text-purple-300 transition duration-300 cursor-pointer"
            >
              Categories
            </a>
            <a 
              onClick={() => router.push('/features')} 
              className="text-white hover:text-purple-300 transition duration-300 cursor-pointer"
            >
              Features
            </a>
            <a 
              onClick={() => router.push('/about')} 
              className="text-white hover:text-purple-300 transition duration-300 cursor-pointer"
            >
              About
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={logoutUser}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-purple-300 transition duration-300">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}