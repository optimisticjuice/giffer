    // Giffer.jsx
import { useEffect, useRef, useState } from "react";
import "./Aesthic.css";

/**
 * Giffer — Tinder-for-GIFs (works with your App.jsx)
 *
 * App.jsx builds the full Giphy URL:
 *   const GIPHY_KEY = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=${limit}`;
 *   <Giffer apiKey={GIPHY_KEY} />
 *
 * In this file we:
 * - Treat `apiKey` as the fully-formed endpoint (includes key, query, limit).
 * - Fetch whenever that prop changes (prop-driven data flow).
 * - Keep local UI state here (deck index, liked/disliked).
 * - Use useRef for DOM-ish, imperative bits (card transform + swipe detection).
 *
 * Hooks used: useState, useEffect, useRef (✅ matches your constraints)
 */
export default function Giffer({ apiKey }) {
  // ---------- Local UI State (component-local, not lifted) ----------
  const [gifs, setGifs] = useState([]);        // fetched deck (array of GIF models)
  const [idx, setIdx] = useState(0);           // pointer into the deck (top card index)
  const [liked, setLiked] = useState([]);      // accumulated "likes"
  const [disliked, setDisliked] = useState([]);// accumulated "dislikes"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------- Refs (imperative handles) ----------
  const cardRef = useRef(null);                // current "card" DOM node (for transform feedback)
                // swipe: current delta

  // ---------- Side-effect: fetch when the parent-provided endpoint changes ----------
  useEffect(() => {
    if (!apiKey || typeof apiKey !== "string") {
      setError("Invalid endpoint: Pass a full Giphy URL as the `apiKey` prop.");
      return;
    }

    let ignore = false;                        // stale-closure guard for async
    async function fetchDeck() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(apiKey);       // Parent comp controls query/limit via URL
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!ignore) {
          // Normalize the minimal data we actually render (keeps React renders cheap)
          const mapped = (json?.data || []).map((d) => ({
            id: d.id,
            title: d.title || "Untitled",
            preview:
              d.images?.downsized_medium?.url ||
              d.images?.original?.url ||
              d.images?.downsized?.url,
            url: d.url, // Giphy permalink
          }));

          setGifs(mapped);
          setIdx(0);            // reset the pointer whenever a new query/limit arrives
          setLiked([]);         // clearing aggregates keeps UX consistent across queries
          setDisliked([]);
        }
      } catch (e) {
        if (!ignore) setError(String(e?.message || e));
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchDeck();
    return () => {
      ignore = true;            // cancel state updates on unmount or prop change
    };
  }, [apiKey]);                 // 🔁 re-run whenever App.jsx changes q/limit/key in the URL

  // ---------- Derived: current card model ----------
  const current = gifs[idx];    // undefined when deck is exhausted

  // ---------- Intent handlers (pure state transitions; React-friendly immutability) ----------
  function handleVote(kind) {
    if (!current) return; // no-op when deck exhausted

    if (kind === "like") setLiked((prev) => [...prev, current]);
    else setDisliked((prev) => [...prev, current]);

    setIdx((n) => n + 1); // advance deck pointer (top-of-stack pop)
  }


  // ---------- Render ----------
  return (
    <div className="giffer">
      {/* HEADER (flex row): Parent controls query/limit inputs; we just reflect status here */}
      <header className="gf-header">
       
        <div className="gf-controls">
          {/* Keep it display-only to honor "single source of truth" in App.jsx */}
          <div className="ctrl">Deck: {gifs.length}</div>
          <div className="ctrl">Index: {idx}/{gifs.length || 0}</div>
        </div>
      </header>

      {/* SIDEBAR (float left): quick stats panes */}
      <aside className="gf-sidebar">
        <div className="stat"><div className="stat-label">Liked</div><div className="stat-value"> : {liked.length}</div></div>
        <div className="stat"><div className="stat-label">Disliked</div><div className="stat-value"> : {disliked.length}</div></div>
        <div className="stat"><div className="stat-label">Left</div><div className="stat-value"> : {Math.max(0, gifs.length - idx)}</div></div>
      </aside>

      {/* MAIN (flex column) */}
      <main className="gf-main">
        {loading && <div className="hint">Loading…</div>}
        {error && <div className="error">Error: {error}</div>}

        {/* Top-of-deck card (only the "current" is interactive) */}
        {current ? (
          <div
            className="card"
            ref={cardRef}
          >
            {/* Flex centered media, responsive via max-width */}
            <img className="gif" src={current.preview} alt={current.title} />
            <div className="meta">
              <a href={current.url} target="_blank" rel="noreferrer">{current.title}</a>
            </div>
          </div>
        ) : (
          !loading && <div className="hint">No more GIFs. Change the search or limit in App.jsx controls ↑</div>
        )}

        {/* ACTIONS (flex row) */}
        <div className="actions">
          <button className="btn ghost" onClick={() => handleVote("dislike")} title="Dislike">👎 Dislike</button>
          <button className="btn primary" onClick={() => handleVote("like")} title="Like">👍 Like</button>
        </div>

        {/* Buckets (flex wrap) — visual feedback of what you’ve selected */}
        <section className="results">
          <div className="bucket">
            <h3>Liked</h3>
            <div className="thumbs">
              {liked.map((g) => <img key={g.id} className="thumb" src={g.preview} alt="" />)}
            </div>
          </div>
          <div className="bucket">
            <h3>Disliked</h3>
            <div className="thumbs">
              {disliked.map((g) => <img key={g.id} className="thumb" src={g.preview} alt="" />)}
            </div>
          </div>
        </section>
      </main>

      {/* Clear the float so the container wraps correctly without layout collapse */}
      <div className="clearfix" />
    </div>
  );
}
