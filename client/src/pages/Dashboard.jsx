import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/icon.png";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "" });
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingNotes, setSavingNotes] = useState({});

  // For debouncing updates
  const updateTimeouts = useRef({});

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tokenFromQuery = query.get("token");
    const nameFromQuery = query.get("name");
    const emailFromQuery = query.get("email");

    let token = tokenFromQuery || localStorage.getItem("token");
    let name = nameFromQuery || localStorage.getItem("name") || "Guest";
    let email = emailFromQuery || localStorage.getItem("email") || "guest@example.com";

    if (!token) {
      navigate("/"); // redirect if no token
      return;
    }

    if (tokenFromQuery && nameFromQuery && emailFromQuery) {
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      window.history.replaceState({}, document.title, "/dashboard");
    }

    setUser({ name, email });
    fetchNotes(token);
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

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

  const handleDeleteNote = async (id) => {
    const authToken = localStorage.getItem("token");
    try {
      await axios.delete(`https://oauth-8kph.onrender.com/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
      // Clear any pending timeout for deleted note
      delete updateTimeouts.current[id];
    } catch (err) {
      console.error(err);
      alert("Failed to delete note.");
    }
  };

  const handleUpdateNote = (id, updatedNote) => {
   
    if (updateTimeouts.current[id]) clearTimeout(updateTimeouts.current[id]);

  setSavingNotes((prev) => ({ ...prev, [id]: true }));

    updateTimeouts.current[id] = setTimeout(async () => {
      const authToken = localStorage.getItem("token");
      try {
        await axios.put(
          `https://oauth-8kph.onrender.com/api/notes/${id}`,
          updatedNote,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } catch (err) {
        console.error(err);
        alert("Failed to update note.");
      }finally {
      // Remove "saving..." indicator
      setSavingNotes((prev) => ({ ...prev, [id]: false }));
    }
    }, 500); // wait 500ms after last keystroke
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-blue-600 hover:underline"
        >
          Sign out
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-8">
        <div className="bg-white shadow rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user.name}! 🎉
          </h2>
          <p className="text-gray-600 mt-2">Email: {user.email}</p>
        </div>

        <div className="mb-6">
          <button
            onClick={handleCreateNote}
            className="w-full md:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Create Note
          </button>
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Notes</h3>
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Click "Create Note" to start.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notes.map((note, index) => (
              <div
                key={note._id}
                className="bg-white shadow rounded-xl p-4 hover:shadow-lg transition relative"
              >
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) => {
                    const updatedNotes = [...notes];
                    updatedNotes[index].title = e.target.value;
                    setNotes(updatedNotes);
                    handleUpdateNote(note._id, updatedNotes[index]);
                  }}
                  className="font-bold text-lg text-gray-800 w-full border-b border-gray-300 mb-2 focus:outline-none"
                />
                <textarea
                  value={note.content}
                  onChange={(e) => {
                    const updatedNotes = [...notes];
                    updatedNotes[index].content = e.target.value;
                    setNotes(updatedNotes);
                    handleUpdateNote(note._id, updatedNotes[index]);
                  }}
                  className="text-gray-600 w-full border border-gray-300 rounded p-2 focus:outline-none"
                />
                {/* Saving indicator */}
  {savingNotes[note._id] && (
    <p className="text-xs text-gray-500 italic">Saving...</p>
  )}
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
