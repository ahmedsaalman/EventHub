// eventbasic.js - extended placeholder file for Git commit

export default function eventbasic() {
  const events = [
    { id: 1, name: "Welcome Ceremony", date: "2025-12-01", location: "Auditorium", attendees: 150 },
    { id: 2, name: "Tech Meetup", date: "2025-12-05", location: "Hall B", attendees: 90 },
    { id: 3, name: "Project Expo", date: "2025-12-10", location: "Expo Center", attendees: 23034 },
    { id: 4, name: "Music Fest", date: "2025-12-15", location: "Sports Ground", attendees: 500 },
  ]

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Event Basic Page</h1>
      <p style={{ marginBottom: "15px", maxWidth: "600px" }}>
        This is a placeholder page used for Git commits. It contains sample event data so the file
        appears meaningful inside the project structure.
      </p>

      <div style={{ marginTop: "20px" }}>
        {events.map((ev) => (
          <div
            key={ev.id}
            style={{
              padding: "12px 16px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "10px",
              background: "#fafafa",
            }}
          >
            <h2 style={{ fontSize: "20px", margin: 0 }}>{ev.name}</h2>
            <p style={{ margin: "5px 0 0 0" }}>Date: {ev.date}</p>
            <p style={{ margin: 0 }}>Location: {ev.location}</p>
            <p style={{ margin: 0 }}>Expected Attendees: {ev.attendees}</p>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "30px", fontSize: "12px", color: "#555" }}>
        Placeholder file generated for repository structure.
      </footer>
    </div>
  )
}
