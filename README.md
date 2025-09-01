📒 Note App

A simple Note-taking app with Email OTP authentication and Google OAuth login.
Built with React (frontend), Express + MongoDB (backend), and JWT authentication.

⚡ Features

✨ User signup with Email + OTP verification

🔑 Secure login with OTP

🔗 Google OAuth login support

🎂 User profile with Name & Date of Birth

🔒 JWT-based authentication for protected routes

📱 Responsive frontend with React

🛠️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/Pheonix-Alpha/oAuth.git
cd note-app

2️⃣ Backend Setup
cd backend
npm install


Create a .env file inside backend/:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback


Start backend server:

npm run dev


(Default: runs on http://localhost:5000)

3️⃣ Frontend Setup
cd frontend
npm install


Update frontend/.env file:

VITE_API_URL=http://localhost:5000


Start frontend:

npm run dev


(Default: runs on http://localhost:5173)

▶️ Usage

Open the app in browser → http://localhost:5173

Signup with Email + OTP or login with Google

Once logged in, your name will show on dashboard 🎉

📂 Project Structure
note-app/
│── backend/        # Express + MongoDB + JWT
│   ├── models/     # Mongoose schemas
│   ├── routes/     # API routes
│   ├── server.js   # App entry point
│── frontend/       # React + Vite
│   ├── src/        # Components, Pages, Context
│   ├── main.jsx    # App entry
│── README.md

🌍 Deployment

Frontend → [Netlify]    for demo https://oauth-note-app.netlify.app/

Backend → [Render]

MongoDB → [MongoDB Atlas]

🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

📜 License

MIT License © 2025
