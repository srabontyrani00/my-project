import { useEffect, useRef, useState } from "react";

// 3D tilt + glare for cards (mouse only)
export const tilt = {
  onMouseMove(e) {
    const el = e.currentTarget, r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", (x - 0.5) * 12 + "deg"); el.style.setProperty("--rx", (0.5 - y) * 12 + "deg");
    el.style.setProperty("--gx", x * 100 + "%"); el.style.setProperty("--gy", y * 100 + "%");
  },
  onMouseLeave(e) { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); },
};

// product picture flies into the cart icon
export function fly(img) {
  const t = document.getElementById("cart-link");
  if (!img || !t || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = img.getBoundingClientRect(), b = t.getBoundingClientRect(), c = img.cloneNode();
  Object.assign(c.style, { position: "fixed", left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px", borderRadius: "14px", zIndex: 100, pointerEvents: "none", objectFit: "cover" });
  document.body.appendChild(c);
  c.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${b.left - a.left}px,${b.top - a.top}px) scale(.08)`, opacity: 0.3 }], { duration: 700, easing: "cubic-bezier(.5,-.2,.7,.4)" }).onfinish = () => c.remove();
}

// fade/slide in when scrolled into view
export function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(), [on, set] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { set(true); o.disconnect(); } }, { threshold: 0.08 });
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${on ? "in" : ""} ${className}`} style={{ transitionDelay: delay + "ms" }}>{children}</div>;
}

export const SkeletonCard = () => (
  <div className="panel overflow-hidden"><div className="skel aspect-square" /><div className="space-y-2 p-4"><div className="skel h-3 w-1/2 rounded" /><div className="skel h-4 w-4/5 rounded" /><div className="skel h-9 rounded" /></div></div>
);

// number that counts up
export function Count({ to, fmt = (n) => n.toLocaleString("en-US") }) {
  const [v, set] = useState(0);
  useEffect(() => {
    let f, t0;
    const run = (t) => { t0 ??= t; const k = Math.min((t - t0) / 900, 1); set(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) f = requestAnimationFrame(run); };
    f = requestAnimationFrame(run);
    return () => cancelAnimationFrame(f);
  }, [to]);
  return fmt(v);
}

export function Confetti() {
  const c = ["#2447f5", "#22c55e", "#f97316", "#ec4899", "#facc15"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => <i key={i} className="confetti" style={{ left: (i * 97) % 100 + "%", background: c[i % 5], animationDelay: (i % 10) * 0.08 + "s", animationDuration: 2 + (i % 5) * 0.4 + "s" }} />)}
    </div>
  );
}

// animated order progress
const STEPS = ["Pending", "Processing", "Shipped", "Delivered"];
export function Track({ status }) {
  if (status === "Cancelled") return <p className="mt-2 text-sm font-semibold text-red-600">Order cancelled</p>;
  const i = STEPS.indexOf(status);
  return (
    <ol className="mt-3 flex gap-1">
      {STEPS.map((s, k) => (
        <li key={s} className="flex-1 text-center text-[11px] font-semibold">
          <div className="mb-1 h-2 overflow-hidden rounded-full bg-line">
            {k <= i && <div className="track h-full rounded-full bg-volt" style={{ animationDelay: k * 180 + "ms" }} />}
          </div>
          <span className={k <= i ? "text-volt" : "text-slate-400"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

// floating 3D product stack that follows the mouse
export function Hero3D() {
  const ref = useRef();
  const set = (x, y) => { ref.current.style.setProperty("--mx", x); ref.current.style.setProperty("--my", y); };
  return (
    <div ref={ref} className="hero3d hidden md:block" aria-hidden="true"
      onMouseMove={(e) => { const r = ref.current.getBoundingClientRect(); set((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5); }}
      onMouseLeave={() => set(0, 0)}>
      <div className="stage">
        <img className="l1" src="/products/pulse-anc.svg" alt="" />
        <img className="l3" src="/products/aerobook-14.svg" alt="" />
        <img className="l2" src="/products/nova-x12.svg" alt="" />
      </div>
    </div>
  );
}

// ---- wishlist (saved in the browser, shared across components) ----
const WK = "ec_wish";
const readWish = () => { try { return JSON.parse(localStorage.getItem(WK)) || []; } catch { return []; } };
export function useWish() {
  const [ids, set] = useState(readWish);
  useEffect(() => { const f = () => set(readWish()); window.addEventListener("ec:wish", f); return () => window.removeEventListener("ec:wish", f); }, []);
  const toggle = (id) => {
    const n = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    try { localStorage.setItem(WK, JSON.stringify(n)); } catch {}
    window.dispatchEvent(new Event("ec:wish"));
  };
  return { ids, toggle };
}

export const useTitle = (t) => useEffect(() => { document.title = t ? `${t} · EasyCart` : "EasyCart: Phones, Laptops & Parts"; }, [t]);

// printable invoice (opens a new tab, user can Save as PDF)
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export function printInvoice(o) {
  const w = window.open("", "_blank");
  if (!w) return alert("Please allow pop-ups to print the invoice");
  const m = (n) => "৳" + Number(n).toLocaleString("en-US");
  w.document.write(`<!doctype html><title>Invoice ${esc(o.id.slice(-6).toUpperCase())}</title><style>body{font:14px Arial,sans-serif;max-width:720px;margin:32px auto;color:#14181f}h1{margin:0}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}td:last-child,th:last-child{text-align:right}.t{font-size:18px;font-weight:700;text-align:right;margin-top:14px}</style>
<h1>Easy<span style="color:#2447f5">Cart</span> <small style="font-weight:400">Invoice</small></h1>
<p>Order #${esc(o.id.slice(-6).toUpperCase())} · ${esc(new Date(o.createdAt).toLocaleDateString())}<br>Status: ${esc(o.status)} · ${o.paymentMethod === "cod" ? "Cash on delivery" : o.isPaid ? "Paid by card" : "Card (pending)"}</p>
<p><b>Ship to</b><br>${esc(o.shipping?.name)}<br>${esc(o.shipping?.phone)}<br>${esc(o.shipping?.address)}</p>
<table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>${o.items.map((i) => `<tr><td>${esc(i.name)}</td><td>${i.qty}</td><td>${m(i.price)}</td><td>${m(i.price * i.qty)}</td></tr>`).join("")}</table>
<p class="t">Total: ${m(o.total)}</p><script>onload=()=>print()</script>`);
  w.document.close();
}

// ---- compare list (max 3 products) ----
const rd = () => { try { return JSON.parse(localStorage.getItem("ec_cmp")) || []; } catch { return []; } };
export function useCompare() {
  const [ids, set] = useState(rd);
  useEffect(() => { const f = () => set(rd()); window.addEventListener("ec:cmp", f); return () => window.removeEventListener("ec:cmp", f); }, []);
  const toggle = (id) => {
    const n = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id].slice(-3);
    try { localStorage.setItem("ec_cmp", JSON.stringify(n)); } catch {}
    window.dispatchEvent(new Event("ec:cmp"));
  };
  return { ids, toggle };
}
