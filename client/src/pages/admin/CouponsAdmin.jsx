import { useEffect, useState } from "react";
import { api } from "../../api";

export default function CouponsAdmin() {
  const [list, setList] = useState([]);
  const [f, setF] = useState({ code: "", percent: "10", maxUses: "" });
  const [error, setError] = useState("");
  const load = () => api("/coupons").then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const run = async (fn) => { setError(""); try { await fn(); load(); } catch (e) { setError(e.message); } };

  return (
    <div className="max-w-2xl">
      <form onSubmit={(e) => { e.preventDefault(); run(async () => { await api("/coupons", { method: "POST", body: f }); setF({ code: "", percent: "10", maxUses: "" }); }); }} className="panel mb-4 grid gap-3 p-4 md:grid-cols-[1fr_110px_130px_auto]">
        <input className="input" placeholder="CODE (e.g. EID20)" required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
        <input className="input" type="number" min="1" max="90" required value={f.percent} onChange={(e) => setF({ ...f, percent: e.target.value })} aria-label="Percent off" />
        <input className="input" type="number" min="1" placeholder="Max uses" value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value })} />
        <button className="btn-primary">Add</button>
      </form>
      {error && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
      <ul className="panel divide-y divide-line">
        {list.length === 0 && <li className="p-4 text-sm text-slate-500">No coupons yet.</li>}
        {list.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
            <span><b>{c.code}</b> · {c.percent}% off · used {c.uses}{c.maxUses ? `/${c.maxUses}` : ""}</span>
            <span className="space-x-2">
              <button className="btn-ghost !py-1" onClick={() => run(() => api(`/coupons/${c.id}`, { method: "PUT", body: { active: !c.active } }))}>{c.active ? "Pause" : "Activate"}</button>
              <button className="btn-danger !py-1" onClick={() => confirm(`Delete ${c.code}?`) && run(() => api(`/coupons/${c.id}`, { method: "DELETE" }))}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
