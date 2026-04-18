// pages/scanner.js
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useUser } from '../context/Usercontext';

import jsQR from 'jsqr';


export default function ScannerPage() {
  const router = useRouter();
  const { user } = useUser();
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualTicketId, setManualTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Check if user is organizer (you can add your own logic here)
  useEffect(() => {
    // Optional: Add organizer check
    // if (!user || user.role !== 'organizer') {
    //   router.push('/');
    // }
  }, [user, router]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      alert('Camera access denied or not available. Please use manual entry.');
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Update captureAndScan function:
const captureAndScan = async () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const context = canvas.getContext('2d');
  const eventId = router.query.eventId;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  
  if (code) {
    verifyTicket(code.data); // The QR contains the ticket UUID
    stopCamera();
  } else {
    alert('No QR code detected. Try again.');
  }
};

  const verifyTicket = async (ticketId) => {
    setLoading(true);
    setScanResult(null);
    const eventId = router.query.eventId;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/order/orders/scan-ticket/?event_id=${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket_id: ticketId })
      });

      const data = await response.json();
      
      setScanResult({
        success: data.success,
        message: data.message,
        ticket: data.ticket,
        timestamp: new Date().toLocaleTimeString()
      });

      // Add to history
      setScanHistory(prev => [{
        ticketNumber: data.ticket?.ticket_number || ticketId,
        status: data.success ? 'success' : 'failed',
        message: data.message,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]); // Keep last 10

      setManualTicketId('');

      // Play sound feedback
      if (data.success) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Error connecting to server',
        timestamp: new Date().toLocaleTimeString()
      });
      playErrorSound();
    } finally {
      setLoading(false);
    }
  };

  const playSuccessSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUKbh8bllHAU2jdf0z3krBSJ1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUqi9Dy14o4BxRgvPDmnE4MClCm4fK6ZRwFNo3X9c95KwUidcXv4JRCCxJcsejsq1gVCEKb3PK+bSQFKYvP89iJOQcTYbzv5ptOCwlPpt/zumYcBTWM1vLPeSsFInXF7+CUQgsRXLHo7KxZFQhBm9zyvm0kBSiLzvPYiTkHE2G87+abTgsJT6bf88tlHAU1jdby0HktBSF1xe/glEILEVux6OytWhUIQJrc8r1tJAUoi87z2Yo6BxJhvO7mmk4LCE+m3vPLZhwFNY3W8tB5LQUgdcTu4JNCCxFbsejsrVoVCECa3PG9bSQFJ4rO89mKOgcSYbzu5ppOCwhPpt3yy2YcBTSN1vLQeS4FIHXCDv94AwAA');
    audio.play().catch(() => {});
  };

  const playErrorSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUKbh8bllHAU2jdf0z3krBSJ1xe/glEILElyx6OyrWBUIQ5zd8sFuJAUqi9Dy14o4BxRgvPDmnE4MClCm4fK6ZRwFNo3X9c95KwUidcXv4JRCCxJcsejsq1gVCEKb3PK+bSQFKYvP89iJOQcTYbzv5ptOCwlPpt/zumYcBTWM1vLPeSsFInXF7+CUQgsRXLHo7KxZFQhBm9zyvm0kBSiLzvPYiTkHE2G87+abTgsJT6bf88tlHAU1jdby0HktBSF1xe/glEILEVux6OytWhUIQJrc8r1tJAUoi87z2Yo6BxJhvO7mmk4LCE+m3vPLZhwFNY3W8tB5LQUgdcTu4JNCCxFbsejsrVoVCECa3PG9bSQFJ4rO89mKOgcSYbzu5ppOCwhPpt3yy2YcBTSN1vLQeS4FIHXCDv94AwAA');
    audio.play().catch(() => {});
  };

  const handleManualSubmit = () => {
    if (manualTicketId.trim()) {
      verifyTicket(manualTicketId.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  return (
   
      <><div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-4">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Ticket Scanner</h1>
          <p className="text-gray-400">Scan or enter ticket ID to verify</p>
        </div>

        {/* Scanner Controls */}
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 mb-6">
          <h2 className="text-xl font-bold mb-4 text-purple-400">Scan Ticket</h2>

          {/* Camera View */}
          {isScanning ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover" />
                <div className="absolute inset-0 border-4 border-purple-500/50 m-8 rounded-xl pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-purple-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-purple-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-purple-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-purple-500"></div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-4">
                <button
                  onClick={captureAndScan}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-colors"
                >
                  📸 Capture & Scan
                </button>
                <button
                  onClick={stopCamera}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold transition-colors"
                >
                  ✕ Stop Camera
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Start Camera Scanner
            </button>
          )}

          {/* Manual Entry */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-gray-300">Or Enter Ticket ID Manually</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualTicketId}
                onChange={(e) => setManualTicketId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter ticket UUID or scan from QR"
                className="flex-1 px-4 py-3 rounded-xl bg-gray-700/50 text-white placeholder-gray-400 border border-gray-600 focus:border-purple-500 focus:outline-none" />
              <button
                onClick={handleManualSubmit}
                disabled={loading || !manualTicketId.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-bold transition-colors"
              >
                {loading ? '⏳ Verifying...' : '✓ Verify'}
              </button>
            </div>
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className={`bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border-2 mb-6 animate-[scale-in_0.3s_ease-out] ${scanResult.success
              ? 'border-green-500/50'
              : 'border-red-500/50'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${scanResult.success
                  ? 'bg-green-500/20'
                  : 'bg-red-500/20'}`}>
                {scanResult.success ? (
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <h3 className={`text-2xl font-bold mb-2 ${scanResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  {scanResult.success ? 'Valid Ticket ✓' : 'Invalid Ticket ✗'}
                </h3>
                <p className="text-gray-300 mb-4 text-lg">{scanResult.message}</p>

                {scanResult.ticket && (
                  <div className="bg-gray-900/50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ticket Number:</span>
                      <span className="text-white font-mono">{scanResult.ticket.ticket_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Event:</span>
                      <span className="text-white">{scanResult.ticket.event_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{scanResult.ticket.category_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-semibold ${scanResult.ticket.status === 'valid' ? 'text-green-400' :
                          scanResult.ticket.status === 'used' ? 'text-gray-400' :
                            'text-red-400'}`}>
                        {scanResult.ticket.status.toUpperCase()}
                      </span>
                    </div>
                    {scanResult.ticket.scanned_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Scanned At:</span>
                        <span className="text-white">{new Date(scanResult.ticket.scanned_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-gray-500 text-sm mt-3">
                  ⏰ Scanned at: {scanResult.timestamp}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div><style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style></>
  
  );
}