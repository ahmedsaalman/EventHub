import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Restore token and user from localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setToken(data.access);
        setUser(data.user);
        setIsAuthenticated(true);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access);
      setToken(data.access);
      return data.access;
    } else {
      throw new Error('Token refresh failed');
    }
  };

  return {
    token,
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
    refreshToken,
  };
}

export const createAPIService = (auth) => {
  const BASE_URL = 'http://localhost:8000/api';

  const makeRequest = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token && { 'Authorization': `Bearer ${auth.token}` }),
      },
      ...options,
    };
    
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        try {
          const newToken = await auth.refreshToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, config);
            if (!retryResponse.ok) throw new Error(`HTTP error! status: ${retryResponse.status}`);
            return retryResponse.status === 204 ? null : await retryResponse.json();
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication failed');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      if (options.method === 'DELETE' || response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  return {




    
    // Event endpoints
    fetchEvents: async () => makeRequest('/events/organizer/events/'),
    createEvent: (eventData) => makeRequest('/events/events/', { 
      method: 'POST', 
      body: eventData 
    }),
    updateEvent: (id, eventData) => makeRequest(`/events/events/${id}/`, { 
      method: 'PATCH', 
      body: eventData 
    }),
    deleteEvent: (id) => makeRequest(`/events/events/${id}/`, { 
      method: 'DELETE' 
    }),
    
    // Ticket endpoints - pass organizer_id as query parameter
    // Ticket endpoints
    fetchTickets: async (organizerId) => {
      const endpoint = organizerId 
        ? `/order/orders/tickets/?organizer_id=${organizerId}`
        : '/order/orders/tickets/';
      return makeRequest(endpoint);
    },
    fetchAdminEvents: async (queryString = '') => makeRequest(`/adminis/events/${queryString}`),
    


    fetchEventOrders: (eventId) => makeRequest(`/order/orders/event/${eventId}/`),
    // 3. Get all organizer tickets with user info (Flat Structure) -> Used for "All Purchasers" view
    fetchOrganizerTicketsWithUserInfo: async (organizerId) => {
      const endpoint = organizerId 
        ? `/order/orders/organizer-tickets/?organizer_id=${organizerId}`
        : '/order/orders/organizer-tickets/';
      return makeRequest(endpoint);
    },
    
    fetchOrganizerTicketsWithUserInfo: async (organizerId) => {
      const endpoint = organizerId 
        ? `/order/orders/organizer-tickets/?organizer_id=${organizerId}`
        : '/order/orders/organizer-tickets/';
      return makeRequest(endpoint);
    },
    createTicketCategory: (eventId, ticketData) => makeRequest(`/events/events/${eventId}/tickets/`, { 
      method: 'POST', 
      body: ticketData 
    }),
    updateTicketCategory: (eventId, ticketId, ticketData) => makeRequest(`/events/events/${eventId}/tickets/${ticketId}/`, { 
      method: 'PATCH', 
      body: ticketData 
    }),
    deleteTicketCategory: (eventId, ticketId) => makeRequest(`/events/events/${eventId}/tickets/${ticketId}/`, { 
      method: 'DELETE' 
    }),
  };
};

export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                type === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } disabled:opacity-50`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};