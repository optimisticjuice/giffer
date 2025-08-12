// App.jsx — minimal integration that imports the main Giffer component
import Giffer from "./Giffer.jsx";
import "./Aesthic.css";
import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("cool");
  const [limit, setLimit] = useState(12);
  const apiKey = "bZe4nEmDbpJVXOXR8z2mm6N35VCjaiKn";

  // Pass your Giphy API key through props (no extra libs, pure props contract)
  const GIPHY_KEY = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=${limit}`;

  return (
    <div className="app">
       <h1 className="brand">Giffer</h1>
       
     <b>Search</b> <input style={{display:"inline"}} type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
     <b>Number of Gifs</b> <input style={{display:"inline"}} type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
      {/* Props-driven composition: App owns the key, Giffer owns its internal state */}
      <Giffer apiKey={GIPHY_KEY} />
    </div>
  );
}

