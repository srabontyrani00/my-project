import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { Hero3D, Reveal, SkeletonCard, useTitle } from "../fx.jsx";

export default function Home() {
  const [params, setParams] = useSearchParams();
  useTitle();
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";

  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { api("/categories").then((d) => setCats(Array.isArray(d) ? d : [])).catch(() => {}); }, []);

  useEffect(() => {
    // AbortController: a slow old response can never overwrite a newer search
    const ac = new AbortController();
    setLoading(true);
    const qs = new URLSearchParams({ ...(search && { search }), ...(category && { category }), sort });
    api(`/products?${qs}`, { signal: ac.signal })
      .then((d) => { setProducts(Array.isArray(d) ? d : []); setError(""); setLoading(false); })
      .catch((e) => { if (e.name === "AbortError") return; setError(e.message); setLoading(false); });
    return () => ac.abort();
  }, [search, category, sort]);

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    setParams(next);
  };

  return (
    <>
      {!search && !category && (
        <section className="mb-6 grid items-center gap-6 overflow-hidden rounded-lg bg-ink px-6 py-10 text-white md:grid-cols-2 md:px-10">
          <div>
            <h1 className="max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">Phones, laptops and parts, all with official warranty.</h1>
            <p className="mt-3 max-w-lg text-slate-300">Compare specs, check live stock, and order in a few taps.</p>
          </div>
          <Hero3D />
        </section>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button onClick={() => set("category", "")} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${!category ? "border-volt bg-volt text-white" : "border-line bg-white"}`}>All</button>
        {cats.map((c) => (
          <button key={c.id} onClick={() => set("category", c.id)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${category === c.id ? "border-volt bg-volt text-white" : "border-line bg-white"}`}>
            {c.name}
          </button>
        ))}
        <select className="input ml-auto !w-auto" value={sort} onChange={(e) => set("sort", e.target.value)} aria-label="Sort products">
          <option value="newest">Newest</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
        </select>
      </div>

      {search && <p className="mb-4 text-sm text-slate-600">Results for <strong>“{search}”</strong> <button className="ml-2 text-volt" onClick={() => set("search", "")}>Clear</button></p>}

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}</div>
      ) : products.length === 0 && !error ? (
        <p className="py-20 text-center text-slate-500">No products match. Try a different search or category.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => <Reveal key={p.id} delay={Math.min(i, 7) * 60}><ProductCard p={p} /></Reveal>)}
        </div>
      )}
    </>
  );
}
