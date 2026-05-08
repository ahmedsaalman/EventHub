import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { apiUrl } from '@/lib/api';
export default function EmailAllAttendees() {

  const [eventId, setEventId] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  useEffect(() => {
   
 
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || user.role !== 'organizer') {
        router.push('/login');
      }

    
 
    const id = router.query.eventId;
    if (id) {
      setEventId(id);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!eventId) {
      setError('Event ID is missing');
      return;
    }

    if (!subject.trim() || !body.trim()) {
      setError('Please fill in both subject and body');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(apiUrl('/api/order/orders/event/email_all/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          event_id: eventId,
          subject: subject,
          body: body
        })
      });

      const data = await response.json();

      // Check if response is OK (status 200-299)
      if (response.ok) {
        setSuccess(`Successfully sent emails to all attendees!`);
        
        // Reset form
        setSubject('');
        setBody('');
        
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        // Handle error responses - just show the message, don't crash
        const errorMessage = data.error || data.message || 'Failed to send emails';
        setError(errorMessage);
      }

    } catch (err) {
      console.error('Error sending emails:', err);
      setError(err.message || 'Failed to send emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/90 backdrop-blur-md shadow-2xl border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Email All Attendees
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                Send a message to all registered attendees
              </p>
            </div>
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-green-700 max-w-md w-full p-6 animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
              <p className="text-gray-300 mb-6">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-red-700 max-w-md w-full p-6 animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Notice</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={() => setError(null)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Email Form Card */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <EnvelopeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Compose Email</h2>
                <p className="text-indigo-100 text-sm">
                  {eventId ? `Event ID: ${eventId}` : 'Loading event...'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Subject Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Email Subject *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Important Update About Your Event"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white placeholder-gray-400 transition-all"
                disabled={loading}
              />
            </div>

            {/* Body Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Email Body *
              </label>
              <textarea
                required
                rows={12}
                placeholder="Write your message here...&#10;&#10;You can include:&#10;• Event updates&#10;• Important announcements&#10;• Special instructions&#10;• Contact information"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white placeholder-gray-400 resize-none transition-all"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-gray-400">
                Tip: Keep your message clear and concise. Include all important details.
              </p>
            </div>

            {/* Preview Section */}
            {(subject || body) && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-gray-300">Preview</span>
                </div>
                {subject && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Subject:</span>
                    <p className="text-white font-medium">{subject}</p>
                  </div>
                )}
                {body && (
                  <div>
                    <span className="text-xs text-gray-500">Message:</span>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap mt-1">
                      {body.substring(0, 200)}{body.length > 200 ? '...' : ''}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700">
              <button
                onClick={handleSubmit}
                disabled={loading || !eventId || !subject.trim() || !body.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending Emails...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    <span>Send to All Attendees</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setSubject('');
                  setBody('');
                  setError(null);
                  setSuccess(null);
                }}
                disabled={loading}
                className="px-8 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Form
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
              <div className="flex gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">Important Information</p>
                  <ul className="space-y-1 text-blue-300">
                    <li>• This email will be sent to all registered attendees</li>
                    <li>• Make sure to review your message before sending</li>
                    <li>• Emails cannot be recalled once sent</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}