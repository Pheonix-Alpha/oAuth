import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/icon.png";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Redirect if not logged in
  useEffect(() => {
   let currentToken = token;
    const query = new URLSearchParams(window.location.search);
    const tokenFromQuery = query.get("token");
    const nameFromQuery = query.get("name");
    const emailFromQuery = query.get("email");

    // If redirected from Google OAuth, store in localStorage
    if (tokenFromQuery && nameFromQuery && emailFromQuery) {
      localStorage.setItem("token", tokenFromQuery);
      localStorage.setItem("name", nameFromQuery);
      localStorage.setItem("email", emailFromQuery);
       currentToken = tokenFromQuery;
      // Remove query params from URL
      window.history.replaceState({}, document.title, "/dashboard");
    }
   if (!currentToken) {
    navigate("/");
    return;
  }

  const name = localStorage.getItem("name") || "Guest";
  const email = localStorage.getItem("email") || "guest@example.com";
  setUser({ name, email });

  fetchNotes(currentToken);
}, [navigate]);

  // Fetch user's notes
  const fetchNotes = async (authToken) => {
  try {
    setLoading(true);
    const res = await axios.get("https://oauth-8kph.onrender.com/api/notes", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setNotes(res.data);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch notes. Please login again.");
    localStorage.clear();
    navigate("/");
  } finally {
    setLoading(false);
  }
};


  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Create a new note
  const handleCreateNote = async () => {
  const authToken = localStorage.getItem("token");
  try {
    const newNote = { title: "New Note", content: "Write something here..." };
    const res = await axios.post(
      "https://oauth-8kph.onrender.com/api/notes",
      newNote,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    setNotes([res.data.note, ...notes]);
  } catch (err) {
    console.error(err);
    alert("Failed to create note.");
  }
};


  // Delete a note
 const handleDeleteNote = async (id) => {
  const authToken = localStorage.getItem("token");
  try {
    await axios.delete(`https://oauth-8kph.onrender.com/api/notes/${id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    setNotes(notes.filter((note) => note._id !== id));
  } catch (err) {
    console.error(err);
    alert("Failed to delete note.");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-blue-600 hover:underline"
        >
          Sign out
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        {/* Welcome Card */}
        <div className="bg-white shadow rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user.name}! 🎉
          </h2>
          <p className="text-gray-600 mt-2">Email: {user.email}</p>
        </div>

        {/* Create Note Button */}
        <div className="mb-6">
          <button
            onClick={handleCreateNote}
            className="w-full md:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Create Note
          </button>
        </div>

        {/* Notes Section */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Notes</h3>
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Click "Create Note" to start.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition relative"
              >
                <h4 className="font-bold text-lg text-gray-800">{note.title}</h4>
                <p className="text-gray-600 mt-2">{note.content}</p>
                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="absolute top-2 right-2 text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
