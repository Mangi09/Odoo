import React, { useMemo, useState } from "react";

/* =========================
   POST TYPES
========================= */

const POST_TYPES = {
  trip: "Trip",
  activity: "Activity",
  city: "City",
};

/* =========================
   INITIAL POSTS
========================= */

const initialPosts = [
  {
    id: 1,
    user: "Aarav Sharma",
    title: "Amazing Trip to Paris!",
    content:
      "The Eiffel Tower at night was breathtaking. Highly recommend the river cruise.",
    type: "trip",
    likes: 24,
    date: "2025-06-14",
  },
  {
    id: 2,
    user: "Priya Verma",
    title: "Best Food in Rome 🍝",
    content:
      "Trastevere has the best pasta spots. Don’t miss the local gelato!",
    type: "city",
    likes: 18,
    date: "2025-06-10",
  },
  {
    id: 3,
    user: "Rahul Mehta",
    title: "Mountain Hiking Experience",
    content:
      "The trek was challenging but worth it. Sunrise view was unreal.",
    type: "activity",
    likes: 32,
    date: "2025-06-18",
  },
];

/* =========================
   POST CARD
========================= */

const PostCard = ({ post, onLike }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500">by {post.user}</p>
        </div>

        <span
        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full capitalize ${typeStyles[post.type]}`}
        >
        {POST_TYPES[post.type]}
        </span>
      </div>

      <p className="text-gray-600 mt-4">{post.content}</p>

      <div className="flex justify-between items-center mt-5">
        <span className="text-sm text-gray-400">{post.date}</span>

        <button
          onClick={() => onLike(post.id)}
          className="bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 transition"
        >
          ❤️ {post.likes}
        </button>
      </div>
    </div>
  );
};

const typeStyles = {
  trip: "bg-blue-100 text-blue-700",
  activity: "bg-green-100 text-green-700",
  city: "bg-purple-100 text-purple-700",
};

/* =========================
   COMMUNITY PAGE
========================= */

const Community = () => {
  const [posts, setPosts] = useState(initialPosts);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("none");
  const [sortBy, setSortBy] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "trip",
    user: "You",
  });

  /* =========================
     LIKE FUNCTION
  ========================= */

  const handleLike = (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: p.likes + 1 } : p
      )
    );
  };

  /* =========================
     ADD POST
  ========================= */

  const handleAddPost = () => {
    if (!form.title || !form.content) return;

    const newPost = {
      id: Date.now(),
      user: form.user,
      title: form.title,
      content: form.content,
      type: form.type,
      likes: 0,
      date: new Date().toISOString().split("T")[0],
    };

    setPosts((prev) => [newPost, ...prev]);
    setIsModalOpen(false);

    setForm({
      title: "",
      content: "",
      type: "trip",
      user: "You",
    });
  };

  /* =========================
     PROCESS DATA
  ========================= */

  const processedPosts = useMemo(() => {
    let data = [...posts];

    data = data.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.content.toLowerCase().includes(search.toLowerCase())
    );

    if (filter !== "all") {
      data = data.filter((p) => p.type === filter);
    }

    if (sortBy === "newest") {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (sortBy === "oldest") {
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (sortBy === "popular") {
      data.sort((a, b) => b.likes - a.likes);
    }

    return data;
  }, [posts, search, filter, sortBy]);

  /* =========================
     GROUPING
  ========================= */

  const groupedPosts = useMemo(() => {
    if (groupBy === "type") {
      return {
        Trips: processedPosts.filter((p) => p.type === "trip"),
        Activities: processedPosts.filter((p) => p.type === "activity"),
        Cities: processedPosts.filter((p) => p.type === "city"),
      };
    }

    return { All: processedPosts };
  }, [processedPosts, groupBy]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Community
          </h1>
          <p className="text-gray-500 mt-2">
            Share travel experiences with others
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-3 rounded-2xl font-medium hover:bg-[#dd6a26] transition"
        >
          + Add Post
        </button>
      </div>

      {/* =========================
          CONTROL PANEL (ADMIN STYLE)
      ========================= */}
      <section className="bg-white rounded-3xl p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* SEARCH */}
          <input
            type="search"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* FILTER */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-gray-200 outline-none"
          >
            <option value="all">All Posts</option>
            <option value="trip">Trip</option>
            <option value="activity">Activity</option>
            <option value="city">City</option>
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

          {/* SORT */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-5 py-4 rounded-2xl border border-gray-200 outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      </section>

      {/* POSTS */}
      <section className="space-y-8">
        {Object.entries(groupedPosts).map(([group, items]) => (
          <div key={group}>
            {groupBy === "type" && (
              <h2 className="text-2xl font-bold mb-4 text-gray-700">
                {group}
              </h2>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {items.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Add New Post
            </h2>

            <input
              className="w-full border p-3 rounded-xl mb-3"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              className="w-full border p-3 rounded-xl mb-3"
              placeholder="Content"
              rows={4}
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
            />

            <select
              className="w-full border p-3 rounded-xl mb-3"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
            >
              <option value="trip">Trip</option>
              <option value="activity">Activity</option>
              <option value="city">City</option>
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleAddPost}
                className="bg-primary text-white px-5 py-2 rounded-xl"
              >
                Post
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 px-5 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Community;