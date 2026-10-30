import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, money, onImgError } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCompare } from "../fx.jsx";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("search") || "");
  const cmp = useCompare();
  const [dark, setDark] = useState(() => { try { const s = localStorage.getItem("ec_dark"); return s ? s === "1" : matchMedia("(prefers-color-scheme: dark)").matches; } catch { return false; } });
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); try { localStorage.setItem("ec_dark", dark ? "1" : "0"); } catch {} }, [dark]);

  // keep the search box in step with the URL (e.g. after pressing "Clear")
  useEffect(() => { setQ(params.get("search") || ""); }, [params]);

  // live suggestions while typing
  const [sugg, setSugg] = useState([]);
  useEffect(() => {
    if (q.trim().length < 2) return setSugg([]);
    const ac = new AbortController();
    const t = setTimeout(() => api(`/products?limit=5&search=${encodeURIComponent(q.trim())}`, { signal: ac.signal }).then(setSugg).catch(() => {}), 250);
    return () => { clearTimeout(t); ac.abort(); };
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/?search=${encodeURIComponent(q.trim())}` : "/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          Easy<span className="text-volt">Cart</span>
        </Link>

        <form onSubmit={submit} className="relative order-last flex w-full flex-1 gap-2 md:order-none md:w-auto" role="search">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search phones, laptops, SSDs..." aria-label="Search products" />
          <button className="btn-dark">Search</button>
          {sugg.length > 0 && (
            <ul className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-line bg-white shadow-lg">
              {sugg.map((p) => (
                <li key={p.id}>
                  <Link to={`/product/${p.id}`} onClick={() => setSugg([])} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-paper">
                    <img src={p.image} alt="" onError={onImgError} className="h-10 w-10 rounded bg-paper object-cover" />
                    <span className="flex-1 font-semibold">{p.name}</span><span className="font-bold text-volt">{money(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>

        <nav className="ml-auto flex items-center gap-4 text-sm font-semibold">
          {user?.role === "admin" && <NavLink to="/admin" className="text-volt">Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">{(user.name || "Account").split(" ")[0]}</NavLink>
              <button onClick={() => { logout(); nav("/"); }}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn-primary !py-1.5">Sign up</NavLink>
            </>
          )}
          <NavLink to="/compare">Compare{cmp.ids.length > 0 && ` (${cmp.ids.length})`}</NavLink>
          <NavLink to="/wishlist" aria-label="Wishlist" className="text-lg">♡</NavLink>
          <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className="text-lg">{dark ? "☀️" : "🌙"}</button>
          <NavLink to="/cart" id="cart-link" className="relative">
            Cart
            {count > 0 && (
              <span key={count} className="pop absolute -right-4 -top-3 rounded-full bg-volt px-1.5 text-xs font-bold text-white">{count}</span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
