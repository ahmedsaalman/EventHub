import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  TicketIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon
} from "@heroicons/react/24/outline";

export default function ViewTicket() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dummy load effect
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fake timeout to simulate loading
    setTimeout(() => {
      setTickets([
        {
          id: 1,
          eventName: "Music Fiesta 2025",
          buyer: "John Smith",
          price: 120,
          category: "VIP",
          date: "2025-11-05",
          seat: "A-12",
          status: "Active",
        },
        {
          id: 2,
          eventName: "Cosmic Tech Conference",
          buyer: "Sarah Parker",
          price: 40,
          category: "Standard",
          date: "2025-10-19",
          seat: "C-44",
          status: "Used",
        },
        {
          id: 3,
          eventName: "Spring Gaming Expo",
          buyer: "Adeel Khan",
          price: 60,
          category: "Premium",
          date: "2025-09-01",
          seat: "B-21",
          status: "Active",
        }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleCloseModal = () => {
    setSelectedTicket(null);
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.eventName.toLowerCase().includes(filter.toLowerCase()) ||
    ticket.buyer.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* HEADER */}
      <div className="bg-gray-800 border-b border-gray-700 p-6 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-400">View Tickets</h1>
          <button className="bg-gray-700 px-5 py-2 rounded-xl text-white hover:bg-gray-600 transition">
            <ArrowLeftIcon className="w-5 h-5 inline-block mr-2" />
            Back
          </button>
        </div>
        <p className="text-gray-400 mt-2">Browse and inspect purchased tickets</p>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search bar */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search by event or buyer..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-14 text-gray-300 focus:border-indigo-500 outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-500 absolute left-4 top-3.5" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-indigo-500 rounded-full"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 mb-6 flex gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-900/50 border border-green-700 rounded-xl p-4 mb-6 flex gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <p className="text-green-300">{success}</p>
          </div>
        )}

        {/* Ticket LIST */}
        {!loading && filteredTickets.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <TicketIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            No tickets found
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading &&
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-gray-800 border border-gray-700 p-6 rounded-2xl hover:border-indigo-600 transition cursor-pointer"
                onClick={() => handleOpenTicket(ticket)}
              >
                <TicketIcon className="w-10 h-10 text-indigo-400 mb-4" />
                <h3 className="text-xl text-white font-semibold">{ticket.eventName}</h3>
                <p className="text-gray-400 text-sm mt-1">{ticket.category} Ticket</p>

                <div className="mt-4 space-y-2 text-gray-300 text-sm">
                  <p className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    Buyer: {ticket.buyer}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    Date: {ticket.date}
                  </p>
                  <p className="flex items-center gap-2">
                    Seat: <span className="text-white">{ticket.seat}</span>
                  </p>
                </div>

                <div className="mt-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      ticket.status === "Active"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-yellow-600/20 text-yellow-300"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* TICKET MODAL */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-md w-full relative">
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <TicketIcon className="w-14 h-14 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl text-white font-bold">Ticket Details</h2>
              </div>

              <div className="text-gray-300 space-y-4">
                <p><span className="text-gray-400">Event:</span> {selectedTicket.eventName}</p>
                <p><span className="text-gray-400">Buyer:</span> {selectedTicket.buyer}</p>
                <p><span className="text-gray-400">Category:</span> {selectedTicket.category}</p>
                <p><span className="text-gray-400">Price:</span> ${selectedTicket.price}</p>
                <p><span className="text-gray-400">Date:</span> {selectedTicket.date}</p>
                <p><span className="text-gray-400">Seat:</span> {selectedTicket.seat}</p>
                <p><span className="text-gray-400">Status:</span> {selectedTicket.status}</p>
              </div>

              <button
                onClick={() => {
                  setSuccess("Ticket downloaded successfully!");
                  setSelectedTicket(null);
                }}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
              >
                Download Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
