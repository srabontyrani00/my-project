import { useEffect, useState } from "react";
import { api, money } from "../../api";
import { Count } from "../../fx.jsx";

export default function Overview() {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api("/admin/stats").then(setS).catch((e) => setError(e.message)); }, []);
  const [orders, setOrders] = useState([]);
  useEffect(() => { api("/orders").then(setOrders).catch(() => {}); }, []);
  if (error) return <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>;
  if (!s) return <p className="text-slate-500">Loading...</p>;

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return { k: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), s: d.toDateString(), v: 0 }; });
  orders.filter((o) => o.status !== "Cancelled").forEach((o) => { const x = days.find((d) => d.s === new Date(o.createdAt).toDateString()); if (x) x.v += o.total; });
  const max = Math.max(...days.map((d) => d.v), 1);
  const cards = [["Revenue", s.revenue, money], ["Orders", s.orders], ["Products", s.products], ["Customers", s.users]];
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([l, v, f]) => (
          <div key={l} className="panel p-5"><p className="text-sm text-slate-500">{l}</p><p className="mt-1 text-2xl font-extrabold"><Count to={v} fmt={f} /></p></div>
        ))}
      </div>
      <section className="panel mt-6 p-5">
        <h2 className="font-extrabold">Low stock (5 or fewer)</h2>
        {s.lowStock.length === 0 ? <p className="mt-2 text-sm text-slate-500">All products are well stocked.</p> : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {s.lowStock.map((p) => (
              <li key={p.id} className="flex justify-between py-2"><span>{p.name}</span>
                <span className={`font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</span></li>
            ))}
          </ul>
        )}
      </section>
      <section className="panel mt-6 p-5">
        <h2 className="font-extrabold">Sales, last 7 days</h2>
        <div className="mt-4 flex h-40 items-end gap-3">
          {days.map((d) => (
            <div key={d.k} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[11px] font-semibold">{d.v ? money(d.v) : ""}</span>
              <div className="grow-y w-full rounded-t bg-volt" style={{ height: Math.max(Math.round((d.v / max) * 100), 3) + "px" }} />
              <span className="text-[11px] text-slate-500">{d.k}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
