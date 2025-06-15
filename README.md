# Movie Explorer

A full-stack MERN application for exploring movies, writing reviews, and bookmarking favorites.

## Features

- User authentication (register, login)
- Browse movies
- Search for movies
- View movie details
- Write and read reviews
- Bookmark favorite movies

## Tech Stack

### Frontend
- React
- Context API for state management
- CSS for styling
- Vite as build tool

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server: `npm start`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server: `npm run dev`

## License
MIT