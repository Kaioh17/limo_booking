# BHO - Premium Limo Booking Frontend

A modern, memorable frontend for the BHO limo booking service.

## Features

- 🎨 Modern, memorable UI design with glassmorphism effects
- 📱 Fully responsive design
- 🚗 Complete booking form with real-time price calculation
- 👤 Optional sign-in functionality
- ✨ Smooth animations and transitions
- 🎯 User-friendly interface

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (Icons)
- Axios (API calls)

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://127.0.0.1:8001
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── BookingForm.jsx
│   │   └── SignInModal.jsx
│   ├── pages/          # Page components
│   │   └── BookingPage.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features in Detail

### Booking Form
- Pickup and dropoff locations
- Date and time selection
- Ride type selection (Standard, Luxury, Stretch, Party Bus)
- Real-time price calculation
- Special requests/notes field

### Sign-In
- Optional sign-in functionality
- User data stored in localStorage
- Personalized welcome message

### Design
- Dark theme with gradient backgrounds
- Glassmorphism effects
- Smooth animations
- Memorable visual identity

