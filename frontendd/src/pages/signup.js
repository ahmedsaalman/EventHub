// pages/register.js
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer' // default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/register/', formData);

      if (response.status === 201) {
       
        router.push('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = (newRole) => {
    setFormData({
      ...formData,
      role: newRole
    });
  };

  return (
<>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
     
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-10 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
              <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
            </div>
          </div>

          <div className="relative glass-effect rounded-3xl shadow-2xl overflow-hidden border border-white border-opacity-20">
            {/* Header */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  Join EventHub
                </h1>
                <p className="text-gray-400">Create your account and start exploring events</p>
              </div>

              {/* Role Selection */}
              <div className="mb-8">
                <div className="flex bg-gray-800 rounded-2xl p-1">
                  <button
                    onClick={() => switchRole('viewer')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      formData.role === 'viewer'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Event Viewer
                  </button>
                  <button
                    onClick={() => switchRole('organizer')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      formData.role === 'organizer'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                     Event Organizer
                  </button>
                </div>
                <p className="text-center text-sm text-gray-500 mt-3">
                  {formData.role === 'organizer' 
                    ? 'Create and manage amazing events' 
                    : 'Discover and attend incredible events'
                  }
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 text-red-200 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Username"
                      required
                      className="w-full bg-gray-800 bg-opacity-50 border border-gray-700 border-opacity-50 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-gray-500">👤</span>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      required
                      className="w-full bg-gray-800 bg-opacity-50 border border-gray-700 border-opacity-50 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                      className="w-full bg-gray-800 bg-opacity-50 border border-gray-700 border-opacity-50 rounded-2xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                   
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    `Sign Up as ${formData.role === 'organizer' ? 'Organizer' : 'Viewer'}`
                  )}
                </button>
              </form>

              {/* Alternative Role Link */}
              <div className="text-center mt-6">
                <button
                  onClick={() => switchRole(formData.role === 'organizer' ? 'viewer' : 'organizer')}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors duration-300"
                >
                  {formData.role === 'organizer' 
                    ? 'Want to explore events? Sign up as Viewer'
                    : 'Want to create events? Sign up as Organizer'
                  }
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-800 border-opacity-50">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Role-specific decoration */}
            <div className={`h-2 bg-gradient-to-r ${
              formData.role === 'organizer' 
                ? 'from-purple-500 to-pink-500' 
                : 'from-blue-500 to-cyan-500'
            }`}></div>
          </div>

          {/* Additional Info */}
         
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
  </>
  );
}