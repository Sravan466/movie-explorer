
# 🎬 Movie Explorer

A full-stack **MERN** application that lets users **search**, **explore**, **bookmark**, and **review** movies and series using data fetched from **TMDB API**.

🔗 **Live Demo**: [https://movie-explorer-1-po9t.onrender.com/](https://movie-explorer-1-po9t.onrender.com/)

---

## 📸 Preview

### 🏠 Home Page & Search
![Homepage Screenshot](movie-explorer/frontend/src/assets/Screenshot-2025-06-17 150250.png)

### 🔥 Trending & Top Rated
![Trending Screenshot](movie-explorer/frontend/src/assets/Screenshot-2025-06-17 150330.png)

---

## ✨ Features

- 🔐 **User Authentication**: Register, login, logout with JWT-based security.
- 🔍 **Movie Search**: Search for movies, TV shows, and people using keywords.
- 🎥 **Movie Details**: View poster, release date, ratings, and description.
- 📌 **Bookmark Movies**: Save your favorite titles with a single click.
- 📱 **Responsive Design**: Works smoothly on desktops, tablets, and mobile devices.
- 📈 **Trending & Top Rated Sections**: Displays updated movie & TV show trends via TMDB API.
- 📝 **Review System** *(optional)*: Users can read and post reviews.
- 🌙 **Dark Mode UI**: Sleek modern black-themed interface.

---

## 🛠️ Tech Stack

### Frontend
- **React** with **Vite**
- **Context API** for state management
- **CSS** for styling
- **Responsive Design**

### Backend
- **Node.js** & **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **TMDB API** for real-time movie data

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### 🔧 Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Run backend:

```bash
npm start
```

---

### 🌐 Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

---

## 📝 License

[MIT](https://opensource.org/licenses/MIT)
