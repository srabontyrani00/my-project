import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { Reveal, useTitle, useWish } from "../fx.jsx";

export default function Wishlist() {
  useTitle("Wishlist");
  const { ids } = useWish();
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!ids.length) { setList([]); setLoaded(true); return; }
    api(`/products?limit=50&ids=${encodeURIComponent(ids.slice(0, 50).join(","))}`).then(setList).catch(() => {}).finally(() => setLoaded(true));
  }, [ids.join(",")]); // eslint-disable-line
  const shown = list.filter((p) => ids.includes(p.id));
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold">My wishlist</h1>
      {loaded && shown.length === 0 ? (
        <p className="py-16 text-center text-slate-500">Nothing saved yet. Tap the heart on any product. <Link to="/" className="text-volt">Browse products</Link></p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p, i) => <Reveal key={p.id} delay={Math.min(i, 7) * 60}><ProductCard p={p} /></Reveal>)}
        </div>
      )}
    </>
  );
}
