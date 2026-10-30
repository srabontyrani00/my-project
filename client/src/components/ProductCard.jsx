import { Link } from "react-router-dom";
import { money, onImgError } from "../api";
import { useCart } from "../context/CartContext";
import { fly, tilt, useWish } from "../fx.jsx";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { ids, toggle } = useWish();
  const out = p.stock === 0;
  return (
    <article className="panel tilt flex h-full flex-col overflow-hidden" {...tilt}>
      <button onClick={() => toggle(p.id)} aria-label="Save to wishlist" className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2 py-1 text-lg shadow">{ids.includes(p.id) ? "❤️" : "🤍"}</button>
      <Link to={`/product/${p.id}`} className="block bg-paper">
        <img src={p.image} alt={p.name} onError={onImgError} className="aspect-square w-full object-cover" loading="lazy" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-slate-500">{p.brand} · {p.category?.name}</p>
        <Link to={`/product/${p.id}`} className="mt-1 font-bold leading-snug hover:text-volt">{p.name}</Link>
        <div className="mt-auto pt-3">
          <p className="text-lg font-extrabold">{money(p.price)}</p>
          <p className={`mb-3 text-xs font-semibold ${out ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
            {out ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}
          </p>
          <button className="btn-primary w-full" disabled={out} onClick={(e) => { add(p); fly(e.currentTarget.closest("article").querySelector("img")); }}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}
