// pages/login.js
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from 'next/link';
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
        email,
        password,
      });

      console.log(res.data);

      if (res.data.access) {
        localStorage.setItem("token", res.data.access);
        setMessage("Login successful! Redirecting to dashboard...");
        
        if(res.data.user.role==="organizer"){
          router.push("/organizer");
        }
        else {
          router.push("/dashboard");
        }

      } else {
        setMessage("Login failed");
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.detail || "Invalid credentials");
      } else {
        setMessage("Something went wrong. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>EventHub| Login</title>
        <meta name="description" content="Login to your Eventify account" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900">
        <div className="glass-effect w-full max-w-md p-8 shadow-2xl rounded-2xl">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="eventify-logo text-4xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
              EventHub
            </div>
            <p className="text-white text-opacity-80 mt-2">Your event management solution</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-white text-opacity-60"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field w-full pl-10 pr-4 py-3 rounded-lg text-black placeholder-black placeholder-opacity-60 focus:outline-none bg-white bg-opacity-10 border border-white border-opacity-30 focus:border-opacity-50 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-20"
                />
              </div>
            </div>

            <div>
              <label className="block text-black text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-black text-opacity-60"></i>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field w-full pl-10 pr-12 py-3 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none bg-white bg-opacity-10 border border-white border-opacity-30 focus:border-opacity-50 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-20"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-white text-opacity-60`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">

              <div className="text-sm">
                <a href="#" className="font-medium text-white hover:text-opacity-80 transition">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 px-4 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Login to Eventify
                </>
              )}
            </button>
          </form>

        
          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-white text-opacity-70">
              Don't have an account?{' '}
                  <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-300">
                    Sign up
                  </Link>
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500 bg-opacity-20 text-green-200 animate-pulse' : 'bg-red-500 bg-opacity-20 text-red-200'}`}>
              <i className={`fas ${message.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
              {message}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        body {
          font-family: 'Poppins', sans-serif;
          margin: 0;
          padding: 0;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .input-field:focus {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.2);
        }
      `}</style>
    </>
  );
}