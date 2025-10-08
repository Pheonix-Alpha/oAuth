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
  const [selectedNote, setSelectedNote] = useState(null);
  const [summary, setSummary] = useState(""); // stores AI summary
const [aiLoading, setAiLoading] = useState(false); // loading state


const API_URL = import.meta.env.VITE_BACKEND_URL;

const openFullNote = (note) => {
  setSelectedNote(note);
  setSummary(""); // clear old summary
};

const closeFullNote = () => setSelectedNote(null);

const handleTitleChange = (e) => {
  const updated = { ...selectedNote, title: e.target.value };
  setSelectedNote(updated);
  handleUpdateNote(updated._id, updated);
};

const handleContentChange = (e) => {
  const updated = { ...selectedNote, content: e.target.value };
  setSelectedNote(updated);
  handleUpdateNote(updated._id, updated);
};


  // For debouncing updates
  const updateTimeouts = useRef({});

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tokenFromQuery = query.get("token");
    const nameFromQuery = query.get("name");
    const emailFromQuery = query.get("email");

    let token = tokenFromQuery || localStorage.getItem("token");
    let name = nameFromQuery || localStorage.getItem("name") || "Guest";
    let email =
      emailFromQuery || localStorage.getItem("email") || "guest@example.com";

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
      const res = await axios.get(`${API_URL}/notes`, {
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
        `${API_URL}/notes`,
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
      await axios.delete(`${API_URL}/notes/${id}`, {
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
          `${API_URL}/notes/${id}`,
          updatedNote,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
      } catch (err) {
        console.error(err);
        alert("Failed to update note.");
      } finally {
        // Remove "saving..." indicator
        setSavingNotes((prev) => ({ ...prev, [id]: false }));
      }
    }, 500); // wait 500ms after last keystroke
  };

  const handleSummarizeNote = async () => {
 if (!selectedNote?.content) return;
  setAiLoading(true);
  try {
    const authToken = localStorage.getItem("token"); // optional if backend needs auth
    const res = await axios.post(
      `${API_URL}/ai/summarize`, // backend AI route
      { text: selectedNote.content },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    setSummary(res.data.summary);
  } catch (err) {
    console.error(err);
    alert("Failed to summarize note");
  } finally {
    setAiLoading(false);
  }
  }

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
          className="text-sm bg-blue-600  border-1 p-1 rounded-xl text-white hover: hover:bg-gray-500"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white shadow-md rounded-xl p-4 hover:shadow-xl cursor-pointer transition flex flex-col"
                onClick={() => openFullNote(note)}
              >
                <h3 className="font-bold text-gray-800 mb-2">{note.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-3">
                  {note.content || "No content yet..."}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
       {/* Full Page Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 pt-10 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl h-full rounded-xl p-6 relative flex flex-col shadow-lg">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={closeFullNote}
            >
              ✖
            </button>
            <input
              type="text"
              value={selectedNote.title}
              onChange={handleTitleChange}
              className="text-2xl font-bold mb-4 w-full border-b border-gray-300 focus:outline-none"
              placeholder="Note Title"
            />
            <textarea
              value={selectedNote.content}
              onChange={handleContentChange}
              className="w-full flex-1 border border-gray-300 rounded-lg p-4 focus:outline-none resize-none"
              placeholder="Start writing your note..."
            />
            <div className="mt-4">
  <button
    onClick={handleSummarizeNote}
    disabled={aiLoading}
    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
  >
    {aiLoading ? "Summarizing..." : "✨ Summarize Note"}
  </button>

  {summary && (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h4 className="font-semibold mb-2">Summary</h4>
      <p className="text-gray-700 whitespace-pre-line">{summary}</p>
    </div>
  )}
</div>

            {savingNotes[selectedNote._id] && (
              <p className="text-xs text-gray-400 italic mt-2">Saving...</p>
            )}
            <button
              onClick={() => handleDeleteNote(selectedNote._id)}
              className="mt-4 self-end bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Delete Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
