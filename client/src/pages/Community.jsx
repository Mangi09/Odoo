import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'
import { getCurrentUserId } from '../lib/session'

const FALLBACK_POSTS = [
  {
    id: 'demo-community-1',
    userId: 'demo-user-1',
    userName: 'Aarav Sharma',
    title: 'Amazing Trip to Paris!',
    content: 'The Eiffel Tower at night was breathtaking. Highly recommend the river cruise.',
    type: 'trip',
    likes: 24,
    date: '2025-06-14'
  },
  {
    id: 'demo-community-2',
    userId: 'demo-user-2',
    userName: 'Priya Verma',
    title: 'Best Food in Rome',
    content: 'Trastevere has the best pasta spots. Don\'t miss the local gelato!',
    type: 'city',
    likes: 18,
    date: '2025-06-10'
  },
  {
    id: 'demo-community-3',
    userId: 'demo-user-3',
    userName: 'Rahul Mehta',
    title: 'Mountain Hiking Experience',
    content: 'The trek was challenging but worth it. Sunrise view was unreal.',
    type: 'activity',
    likes: 32,
    date: '2025-06-18'
  }
]

const typeStyles = {
  trip: 'bg-sky-100 text-sky-700',
  activity: 'bg-emerald-100 text-emerald-700',
  city: 'bg-amber-100 text-amber-800'
}

function formatCommunityPost(post) {
  return {
    id: post.id,
    userId: post.userId,
    userName: post.userName || 'Traveloop user',
    title: post.title,
    content: post.content,
    type: post.type || 'trip',
    likes: Number(post.likeCount ?? post.likes ?? 0),
    date: post.createdAt ? new Date(post.createdAt).toISOString().slice(0, 10) : post.date || new Date().toISOString().slice(0, 10)
  }
}

function PostCard({ post, onLike, isMine }) {
  return (
    <article className="tl-community-card tl-fade-card">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="tl-subtitle mb-1">{post.title}</h3>
          <p className="tl-muted">by {post.userName}{isMine ? ' · you' : ''}</p>
        </div>

        <span className={`tl-community-chip ${typeStyles[post.type] || typeStyles.trip}`}>
          {post.type?.[0]?.toUpperCase() + post.type?.slice(1)}
        </span>
      </div>

      <p className="tl-community-copy">{post.content}</p>

      <div className="flex justify-between items-center mt-5 gap-3 flex-wrap">
        <span className="tl-muted text-sm">{post.date}</span>
        <button onClick={() => onLike(post.id)} className="tl-btn" type="button">
          ❤️ {post.likes}
        </button>
      </div>
    </article>
  )
}

export default function Community() {
  const userId = getCurrentUserId()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [groupBy, setGroupBy] = useState('none')
  const [sortBy, setSortBy] = useState('newest')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'trip'
  })

  useEffect(() => {
    let mounted = true

    async function loadPosts() {
      setLoading(true)
      setErrorMessage('')

      try {
        const result = await apiFetch('/community/posts')
        const nextPosts = Array.isArray(result.posts) && result.posts.length
          ? result.posts.map((post) => formatCommunityPost({ ...post, type: post.tripId ? 'trip' : post.activityId ? 'activity' : 'city' }))
          : FALLBACK_POSTS

        if (mounted) {
          setPosts(nextPosts)
        }
      } catch (error) {
        if (mounted) {
          setPosts(FALLBACK_POSTS)
          setErrorMessage(error.message || 'Unable to load community posts')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      mounted = false
    }
  }, [])

  const handleLike = async (postId) => {
    try {
      await apiFetch(`/community/posts/${postId}/likes`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      })

      setPosts((current) => current.map((post) => (
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )))
    } catch (error) {
      setErrorMessage(error.message || 'Unable to like this post right now')
    }
  }

  const handleAddPost = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setErrorMessage('Title and content are required')
      return
    }

    try {
      const result = await apiFetch('/community/posts', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          title: form.title.trim(),
          content: form.content.trim(),
          visibility: 'public'
        })
      })

      const created = formatCommunityPost({
        ...result.post,
        userId,
        userName: 'You',
        type: form.type
      })

      setPosts((current) => [created, ...current])
      setForm({ title: '', content: '', type: 'trip' })
      setIsModalOpen(false)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to create the post')
    }
  }

  const processedPosts = useMemo(() => {
    let data = [...posts]

    data = data.filter((post) => {
      const text = `${post.title} ${post.content}`.toLowerCase()
      return text.includes(search.toLowerCase())
    })

    if (filter !== 'all') {
      data = data.filter((post) => post.type === filter)
    }

    if (sortBy === 'newest') {
      data.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (sortBy === 'oldest') {
      data.sort((a, b) => new Date(a.date) - new Date(b.date))
    } else if (sortBy === 'popular') {
      data.sort((a, b) => b.likes - a.likes)
    }

    return data
  }, [posts, search, filter, sortBy])

  const groupedPosts = useMemo(() => {
    if (groupBy === 'type') {
      return {
        Trips: processedPosts.filter((post) => post.type === 'trip'),
        Activities: processedPosts.filter((post) => post.type === 'activity'),
        Cities: processedPosts.filter((post) => post.type === 'city')
      }
    }

    return { All: processedPosts }
  }, [processedPosts, groupBy])

  return (
    <div className="tl-page">
      <main className="tl-board tl-board-large">
        <section className="tl-section">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="tl-kicker">Community</p>
              <h1 className="tl-title mb-2">Share travel experiences with others</h1>
              <p className="tl-muted">Write posts, like updates, and browse by place or activity.</p>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="tl-btn tl-btn-primary" type="button">
              + Add Post
            </button>
          </div>
        </section>

        <section className="tl-section">
          <div className="tl-toolbar">
            <input
              type="search"
              placeholder="Search posts..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="tl-input"
            />

            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="tl-input">
              <option value="all">All Posts</option>
              <option value="trip">Trip</option>
              <option value="activity">Activity</option>
              <option value="city">City</option>
            </select>

            <select value={groupBy} onChange={(event) => setGroupBy(event.target.value)} className="tl-input">
              <option value="none">No Grouping</option>
              <option value="type">Group by Type</option>
            </select>

            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="tl-input">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </section>

        {loading ? <p className="tl-muted mt-4">Loading community...</p> : null}
        {errorMessage ? <p className="tl-error">{errorMessage}</p> : null}

        <section className="space-y-8 mt-6">
          {Object.entries(groupedPosts).map(([group, items]) => (
            <div key={group}>
              {groupBy === 'type' ? <h2 className="tl-subtitle mb-4">{group}</h2> : null}

              <div className="grid md:grid-cols-2 gap-5">
                {items.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    isMine={post.userId === userId}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {isModalOpen ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="tl-section w-full max-w-lg">
              <h2 className="tl-subtitle mb-4">Add New Post</h2>

              <div className="grid gap-3">
                <input
                  className="tl-input w-full"
                  placeholder="Title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />

                <textarea
                  className="tl-input w-full"
                  placeholder="Content"
                  rows={4}
                  value={form.content}
                  onChange={(event) => setForm({ ...form, content: event.target.value })}
                />

                <select
                  className="tl-input w-full"
                  value={form.type}
                  onChange={(event) => setForm({ ...form, type: event.target.value })}
                >
                  <option value="trip">Trip</option>
                  <option value="activity">Activity</option>
                  <option value="city">City</option>
                </select>

                <div className="flex gap-3 flex-wrap">
                  <button onClick={handleAddPost} className="tl-btn tl-btn-primary" type="button">Post</button>
                  <button onClick={() => setIsModalOpen(false)} className="tl-btn" type="button">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
