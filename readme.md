# EventHub - Event Management & Ticketing System (still in progress)

## Live
https://event-hub-pk.vercel.app

## Overview
EventHub is a scalable and secure event management and ticketing platform. It allows users to browse events, purchase tickets, and use QR code-based digital ticketing for entry. The system is built using a **Next.js frontend** and a **Django REST Framework backend**, providing a seamless user experience for both event organizers and attendees.

## Features
- Browse and search events with categories and dates.
- Secure user authentication and session management.
- Purchase tickets online and receive digital tickets with QR codes.
- QR Code scanning for ticket validation with one-time scan authentication.
- Responsive design for mobile and desktop.

## Tech Stack
**Frontend:** Next.js, React.js, Tailwind CSS  
**Backend:** Django REST Framework, Python, SQLite/PostgreSQL  
**Other Tools:** QR Code Scanner, JWT Authentication  

## Installation & Setup

### Frontend
1. Navigate to the `frontend` folder:  
   ```bash
   cd frontend
Install dependencies:

bash
Copy code
npm install
Start the development server:

bash
Copy code
npm run dev
Backend
Navigate to the backend folder:

bash
Copy code
cd backend
Install dependencies:

bash
Copy code
pip install -r requirements.txt
Run migrations:

bash
Copy code
python manage.py migrate
Start the backend server:

bash
Copy code
python manage.py runserver
Usage
Open your browser and go to http://localhost:3000 (frontend).

Register or log in to your account.

Browse events and purchase tickets.

Use the QR code scanner to validate tickets at the event.

Project Structure
graphql
Copy code
EventHub/
├── frontend/          # Next.js frontend code
├── backend/           # Django REST Framework backend
└── README.md
Contributing
Contributions are welcome! Please fork the repository, create a branch, and submit a pull request.

License
This project is open-source and free to use.
