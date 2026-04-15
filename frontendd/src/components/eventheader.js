import Head from 'next/head'

export default function EventDashboard() {
  // sample data
  const events = [
    { id: 1, title: 'Hackathon 2025', date: '2025-12-05', attendees: 120 },
    { id: 2, title: 'Music Night', date: '2025-12-12', attendees: 85 },
    { id: 3, title: 'Tech Talk: Next.js', date: '2026-01-09', attendees: 200 },
  ]

  const totalAttendees = events.reduce((s, e) => s + e.attendees, 0)

  return (
    <>
      <Head>
        <title>event_dashboard</title>
        <meta name="description" content="Simple Event Dashboard" />
      </Head>

      <main className="min-h-screen bg-gray-50 p-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Event Dashboard</h1>
            <div className="text-sm text-gray-600">{new Date().toLocaleDateString()}</div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white rounded-2xl shadow">
              <div className="text-xs text-gray-500">Events</div>
              <div className="text-2xl font-semibold">{events.length}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow">
              <div className="text-xs text-gray-500">Total Attendees</div>
              <div className="text-2xl font-semibold">{totalAttendees}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow">
              <div className="text-xs text-gray-500">Next Event</div>
              <div className="text-2xl font-semibold">{events[0].title}</div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-xl font-medium mb-3">Upcoming Events</h2>
            <ul className="space-y-3">
              {events.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-semibold">{ev.title}</div>
                    <div className="text-xs text-gray-500">{ev.date}</div>
                  </div>
                  <div className="text-sm text-gray-700">{ev.attendees} attendees</div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  )
}
