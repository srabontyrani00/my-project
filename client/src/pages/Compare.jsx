import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money, onImgError } from "../api";
import { useCompare, useTitle } from "../fx.jsx";

export default function Compare() {
  useTitle("Compare");
  const { ids, toggle } = useCompare();
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!ids.length) return setList([]);
    api(`/products?limit=3&ids=${encodeURIComponent(ids.join(","))}`).then(setList).catch(() => {});
  }, [ids.join(",")]); // eslint-disable-line
  const shown = ids.map((id) => list.find((p) => p.id === id)).filter(Boolean);
  if (!shown.length)
    return <p className="py-16 text-center text-slate-500">Pick up to 3 products with the Compare button on a product page. <Link to="/" className="text-volt">Browse</Link></p>;
  const rows = [
    ["Price", (p) => <b>{money(p.price)}</b>], ["Brand", (p) => p.brand || "-"], ["Category", (p) => p.category?.name],
    ["Stock", (p) => (p.stock ? `${p.stock} in stock` : "Out of stock")],
    ...Array.from({ length: Math.max(...shown.map((p) => p.specs?.length || 0)) }, (_, i) => [`Spec ${i + 1}`, (p) => p.specs?.[i] || "-"]),
  ];
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead><tr><th className="p-3"></th>{shown.map((p) => (
          <th key={p.id} className="p-3 align-top">
            <img src={p.image} alt="" onError={onImgError} className="mb-2 w-32 rounded-md bg-paper" />
            <Link to={`/product/${p.id}`} className="font-bold hover:text-volt">{p.name}</Link><br />
            <button className="text-xs font-normal text-red-600" onClick={() => toggle(p.id)}>Remove</button>
          </th>))}</tr></thead>
        <tbody className="divide-y divide-line">
          {rows.map(([l, f]) => <tr key={l}><td className="p-3 font-semibold text-slate-500">{l}</td>{shown.map((p) => <td key={p.id} className="p-3">{f(p)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
