// pages/checkout.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useUser } from '../context/Usercontext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedOrder = localStorage.getItem('currentOrder');
    if (storedOrder) {
      setOrder(JSON.parse(storedOrder));
    } else {
      router.push('/');
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage('You must be logged in to place an order.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Prepare API payload
      const payload = {
        user: user.id,
        event: order.event.id,
        payment_method: paymentMethod,
        total_amount: order.total,
        tickets: order.tickets.map(t => ({
          ticket_category: t.type,
          quantity: t.quantity,
          price: t.price
        }))
      };

      const response = await fetch('http://127.0.0.1:8000/api/order/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        setOrderResponse(data);
        setShowSuccessPopup(true);
        localStorage.removeItem('currentOrder');
      } else {
        setMessage(`❌ Failed to place order: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    router.push('/');
  };

  const downloadTicket = (ticketImageUrl, ticketNumber) => {
    const link = document.createElement('a');
    link.href = ticketImageUrl;
    link.download = `ticket-${ticketNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllTickets = () => {
    if (!orderResponse?.items) return;
    
    orderResponse.items.forEach(item => {
      item.tickets?.forEach(ticket => {
        setTimeout(() => {
          downloadTicket(ticket.ticket_image_url, ticket.ticket_number);
        }, 100);
      });
    });
  };

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading checkout...</p>
            {message && <p className="text-red-500 mt-2">{message}</p>}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white py-18">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-purple-400">Checkout</h1>

          {message && (
            <div className={`p-4 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-800' : 'bg-red-800'}`}>
              {message}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold mb-4 text-purple-400">Event Details</h2>
                <div className="flex space-x-4">
                  <img
                    src={order.event.image}
                    alt={order.event.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{order.event.name}</h3>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>{order.event.date} • {order.event.time}</div>
                      <div>{order.event.location}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold mb-4 text-purple-400">Tickets Summary</h2>
                {order.tickets.map((ticket, idx) => (
                  <div key={idx} className="flex justify-between mb-2 p-2 bg-gray-700/30 rounded-xl">
                    <div>{ticket.type} x{ticket.quantity}</div>
                    <div>{formatCurrency(ticket.total)}</div>
                  </div>
                ))}
                <div className="mt-4 border-t border-gray-700 pt-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="text-purple-400 font-bold">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="space-y-6">
              <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold mb-4 text-purple-400">Payment Method</h2>
                <div className="flex space-x-4 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl border ${paymentMethod === 'card' ? 'border-purple-500 bg-purple-500/20' : 'border-gray-600'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl border ${paymentMethod === 'bank' ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600'}`}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    Bank Transfer
                  </button>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white placeholder-gray-400"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white placeholder-gray-400"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white placeholder-gray-400"
                    required
                  />

                  {paymentMethod === 'card' && (
                    <>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Card Number"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-xl bg-gray-700/50 text-white placeholder-gray-400"
                        required
                      />
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="w-1/2 px-4 py-2 rounded-xl bg-gray-700/50 text-white placeholder-gray-400"
                          required
                        />
                        <input
                          type="text"
                          name="cvv"
                          placeholder="CVV"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="w-1/2 px-4 py-2 rounded-xl bg-gray-700/50 text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatCurrency(order.total)}`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup Modal with Tickets */}
      {showSuccessPopup && orderResponse && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-4xl w-full border-2 border-green-500/50 shadow-2xl my-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-center text-white mb-3">
              Order Confirmed! 🎉
            </h2>
            <p className="text-center text-gray-300 mb-2">
              Your tickets have been confirmed successfully!
            </p>
            <p className="text-center text-gray-400 text-sm mb-6">
              Your tickets will be emailed to you shortly at <span className="text-purple-400 font-semibold">{user?.email}</span>
            </p>

            {/* Order Summary */}
            <div className="bg-gray-700/30 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Event:</span>
                <span className="text-white font-semibold">{orderResponse.event_name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Total Tickets:</span>
                <span className="text-white font-semibold">
                  {orderResponse.items?.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-green-400 font-bold">{formatCurrency(orderResponse.total_amount)}</span>
              </div>
            </div>

            {/* Download All Button */}
            <div className="mb-6 text-center">
              <button
                onClick={downloadAllTickets}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download All Tickets
              </button>
            </div>

            {/* Tickets Display */}
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {orderResponse.items?.map((item) => (
                <div key={item.id} className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-purple-400">
                      {item.category_name} Tickets ({item.tickets?.length})
                    </h3>
                    <span className="text-gray-400 text-sm">
                      {formatCurrency(item.price)} each
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {item.tickets?.map((ticket) => (
                      <div key={ticket.id} className="bg-gray-900/50 rounded-xl p-3 border border-gray-600/50 hover:border-purple-500/50 transition-colors">
                        {/* Ticket Image */}
                        {ticket.ticket_image_url ? (
                          <img 
                            src={ticket.ticket_image_url} 
                            alt={`Ticket ${ticket.ticket_number}`}
                            className="w-full rounded-lg mb-3 shadow-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                            <p className="text-gray-400">Generating ticket...</p>
                          </div>
                        )}
                        
                        {/* Ticket Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Ticket Number:</span>
                            <span className="text-xs text-white font-mono bg-gray-700 px-2 py-1 rounded">
                              {ticket.ticket_number}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Status:</span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              ticket.status === 'valid' ? 'bg-green-500/20 text-green-400' :
                              ticket.status === 'used' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {ticket.status.toUpperCase()}
                            </span>
                          </div>

                          {/* Download Button */}
                          <button
                            onClick={() => downloadTicket(ticket.ticket_image_url, ticket.ticket_number)}
                            className="w-full mt-2 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleClosePopup}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-bold text-white transition-all transform hover:scale-105"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </Layout>
  );
}