'use client';
// app/writers/page.jsx — My Writers (followed authors)
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/forms/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PenLine, Trash2, UserPlus, UserCheck, Search, BookOpen } from 'lucide-react';
import { getPalette } from '@/components/ui/BookCover';

export default function WritersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [followed, setFollowed]     = useState([]);  // { id, author_name, created_at }
  const [allAuthors, setAllAuthors] = useState([]);  // [{ name, bookCount }]
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [actionMap, setActionMap]   = useState({});  // { authorName: 'loading' }

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    loadAll();
  }, [user, authLoading]);

  async function loadAll() {
    setLoading(true);
    try {
      const [followedRes, booksRes] = await Promise.all([
        fetch('/api/writers').then(r => r.ok ? r.json() : []),
        fetch('/api/books?pageSize=200').then(r => r.ok ? r.json() : { books: [] }),
      ]);

      setFollowed(Array.isArray(followedRes) ? followedRes : []);

      // Build unique author list with book counts only (no covers)
      const countMap = {};
      for (const book of (booksRes.books || [])) {
        countMap[book.author] = (countMap[book.author] || 0) + 1;
      }
      const authorList = Object.entries(countMap)
        .map(([name, bookCount]) => ({ name, bookCount }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setAllAuthors(authorList);
    } finally {
      setLoading(false);
    }
  }

  const followedNames = new Set(followed.map(f => f.author_name));

  async function handleFollow(authorName) {
    setActionMap(m => ({ ...m, [authorName]: 'loading' }));
    try {
      const res = await fetch('/api/writers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName }),
      });
      const data = await res.json();
      if (res.ok) setFollowed(prev => [...prev, data]);
    } finally {
      setActionMap(m => { const n = { ...m }; delete n[authorName]; return n; });
    }
  }

  async function handleUnfollow(authorName) {
    setActionMap(m => ({ ...m, [authorName]: 'loading' }));
    await fetch(`/api/writers/${encodeURIComponent(authorName)}`, { method: 'DELETE' });
    setFollowed(prev => prev.filter(a => a.author_name !== authorName));
    setActionMap(m => { const n = { ...m }; delete n[authorName]; return n; });
  }

  const filteredAuthors = allAuthors.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || authLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <PenLine size={24} className="text-purple-400" />
        <h1 className="text-2xl font-bold text-white">My Writers</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Follow authors to keep track of their work. Currently following{' '}
        <span className="text-indigo-400 font-medium">{followed.length}</span>{' '}
        author{followed.length !== 1 ? 's' : ''}.
      </p>

      {/* ── Following section ── */}
      {followed.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Following</h2>
          <div className="space-y-3">
            {followed.map(f => {
              const pal = getPalette(f.author_name);
              const authorInfo = allAuthors.find(a => a.name === f.author_name);
              const bookCount = authorInfo?.bookCount ?? 0;
              const busy = actionMap[f.author_name] === 'loading';
              return (
                <div key={f.id}
                  className="flex items-center gap-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-5 py-4 hover:border-indigo-800 transition">

                  {/* Initial avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${pal.accent}66, ${pal.bg})`, border: `2px solid ${pal.accent}55` }}
                  >
                    {f.author_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{f.author_name}</p>
                    <p className="text-xs text-gray-500">
                      {bookCount} book{bookCount !== 1 ? 's' : ''} in catalogue ·
                      Since {new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Browse link */}
                  <Link
                    href={`/?q=${encodeURIComponent(f.author_name)}`}
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-gray-400 hover:border-indigo-700 hover:text-indigo-400 text-xs transition"
                  >
                    <BookOpen size={12} /> Browse
                  </Link>

                  {/* Unfollow */}
                  <button
                    onClick={() => handleUnfollow(f.author_name)}
                    disabled={busy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-900/60 text-red-400 hover:bg-red-900/20 text-xs font-medium transition disabled:opacity-50 flex-shrink-0"
                  >
                    {busy
                      ? <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full inline-block" />
                      : <><Trash2 size={13} /> Unfollow</>
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Discover / All authors ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {followed.length === 0 ? 'Discover Authors' : 'All Authors'}
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search authors…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {filteredAuthors.length === 0 ? (
          <p className="text-gray-600 text-sm py-8 text-center">No authors found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredAuthors.map(author => {
              const pal = getPalette(author.name);
              const isFollowing = followedNames.has(author.name);
              const busy = actionMap[author.name] === 'loading';
              return (
                <div key={author.name}
                  className="flex items-center gap-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 hover:border-indigo-800 transition">

                  {/* Initial avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${pal.accent}55, ${pal.bg})`, border: `2px solid ${pal.accent}44` }}
                  >
                    {author.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{author.name}</p>
                    <p className="text-xs text-gray-500">{author.bookCount} book{author.bookCount !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Follow / Following */}
                  <button
                    onClick={() => isFollowing ? handleUnfollow(author.name) : handleFollow(author.name)}
                    disabled={busy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0 disabled:opacity-50
                      ${isFollowing
                        ? 'border border-indigo-700 text-indigo-400 hover:border-red-800 hover:text-red-400'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                  >
                    {busy ? (
                      <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full inline-block" />
                    ) : isFollowing ? (
                      <><UserCheck size={12} /> Following</>
                    ) : (
                      <><UserPlus size={12} /> Follow</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
