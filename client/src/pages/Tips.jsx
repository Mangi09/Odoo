import React, { useMemo, useState } from "react";

/* =========================
   SAMPLE NOTES DATA
========================= */

const initialNotes = [
  {
    id: 1,
    title: "Hotel Check-In Details - Rome Stop",
    description:
      "Check in after 2pm, room 302, breakfast included (7-10am)",
    day: "Day 3: June 14 2025",
    type: "stop",
  },
  {
    id: 2,
    title: "Colosseum Visit Plan",
    description:
      "Arrive early at 8am to avoid crowd, guided tour booked.",
    day: "Day 2: June 13 2025",
    type: "day",
  },
  {
    id: 3,
    title: "Airport Transfer Info",
    description:
      "Taxi booked for 6:30am pickup, terminal 2 departure.",
    day: "Day 1: June 12 2025",
    type: "stop",
  },
];

/* =========================
   NOTE CARD COMPONENT
========================= */

const NoteCard = ({ note, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {note.title}
          </h3>

          <p className="text-gray-600 mt-2">{note.description}</p>

          <p className="text-sm text-gray-400 mt-3">{note.day}</p>
        </div>

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            note.type === "day"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {note.type === "day" ? "By Day" : "By Stop"}
        </span>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={() => onEdit(note)}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(note.id)}
          className="px-4 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

/* =========================
   MAIN PAGE
========================= */

const Tips = () => {
  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [groupBy, setGroupBy] = useState("none");
  const [sortBy, setSortBy] = useState("default");

  /* =========================
     ADD NOTE (simple demo)
  ========================= */
  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: "New Trip Note",
      description: "Add your note details here...",
      day: "Day X",
      type: "day",
    };
    setNotes([newNote, ...notes]);
  };

  /* =========================
     DELETE NOTE
  ========================= */
  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  /* =========================
     EDIT NOTE (simple demo)
  ========================= */
  const editNote = (note) => {
    const updated = prompt("Edit note:", note.description);
    if (!updated) return;

    setNotes(
      notes.map((n) =>
        n.id === note.id ? { ...n, description: updated } : n
      )
    );
  };

  /* =========================
     PROCESS NOTES
  ========================= */

  const processedNotes = useMemo(() => {
    let data = [...notes];

    // SEARCH
    data = data.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.description.toLowerCase().includes(search.toLowerCase())
    );

    // FILTER
    if (filter !== "All") {
      data = data.filter((n) =>
        filter === "By Day" ? n.type === "day" : n.type === "stop"
      );
    }

    // SORT
    if (sortBy === "title") {
      data.sort((a, b) => a.title.localeCompare(b.title));
    }

    return data;
  }, [notes, search, filter, sortBy]);

  /* =========================
     GROUP NOTES
  ========================= */

  const groupedNotes = useMemo(() => {
    if (groupBy === "type") {
      return {
        "By Day": processedNotes.filter((n) => n.type === "day"),
        "By Stop": processedNotes.filter((n) => n.type === "stop"),
      };
    }

    return {
      All: processedNotes,
    };
  }, [processedNotes, groupBy]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Trip Notes
          </h1>

          <p className="text-gray-500 mt-2">
            Your travel journal, itinerary and reminders.
          </p>
        </div>

        <button
          onClick={addNote}
          className="bg-primary text-white px-5 py-3 rounded-2xl hover:bg-[#dd6a26]"
        >
          + Add Note
        </button>
      </div>

        {/* SEARCH + CONTROLS (ADMIN STYLE UNIFIED) */}
        <section className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex flex-col xl:flex-row gap-4 items-stretch">

            {/* SEARCH */}
            <div className="flex-1">
            <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>

            {/* FILTER */}
            <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-gray-200 outline-none"
            >
            <option value="All">All</option>
            <option value="By Day">By Day</option>
            <option value="By Stop">By Stop</option>
            </select>

            {/* SORT */}
            <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-gray-200 outline-none"
            >
            <option value="default">Sort By</option>
            <option value="title">Title A-Z</option>
            </select>

            {/* GROUP */}
            <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-gray-200 outline-none"
            >
            <option value="none">No Grouping</option>
            <option value="type">Group by Type</option>
            </select>
        </div>
        </section>

      {/* NOTES */}
      <section className="space-y-8">
        {Object.entries(groupedNotes).map(([group, items]) => (
          <div key={group}>
            {groupBy === "type" && (
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                {group}
              </h2>
            )}

            {items.length === 0 ? (
              <p className="text-gray-500">No notes found.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {items.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={editNote}
                    onDelete={deleteNote}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
};

export default Tips;