import { Router } from "express";
import { prisma, httpError, fail } from "../lib/prisma.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// Shared with orders.js (pass the transaction client as db)
export async function findValid(db, raw) {
  const code = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  const c = code ? await db.coupon.findUnique({ where: { code } }) : null;
  if (!c || !c.active) throw httpError(400, "This coupon code is not valid");
  if (c.maxUses !== null && c.uses >= c.maxUses) throw httpError(400, "This coupon has been fully used");
  return c;
}

router.post("/validate", protect, async (req, res) => {
  try { const c = await findValid(prisma, req.body.code); res.json({ code: c.code, percent: c.percent }); }
  catch (e) { fail(res, e); }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try { res.json(await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })); } catch (e) { fail(res, e); }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    const percent = Number(req.body.percent);
    const maxUses = req.body.maxUses === "" || req.body.maxUses == null ? null : Number(req.body.maxUses);
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) throw httpError(400, "Code: 3-20 letters, numbers, - or _");
    if (!Number.isInteger(percent) || percent < 1 || percent > 90) throw httpError(400, "Discount must be a whole number from 1 to 90");
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) throw httpError(400, "Max uses must be 1 or more (or empty)");
    try { res.status(201).json(await prisma.coupon.create({ data: { code, percent, maxUses } })); }
    catch (e) { throw e.code === "P2002" ? httpError(400, "This code already exists") : e; }
  } catch (e) { fail(res, e); }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try { res.json(await prisma.coupon.update({ where: { id: req.params.id }, data: { active: !!req.body.active } })); }
  catch (e) { fail(res, e.code === "P2025" ? httpError(404, "Coupon not found") : e); }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try { await prisma.coupon.delete({ where: { id: req.params.id } }); res.json({ message: "Coupon deleted" }); }
  catch (e) { fail(res, e.code === "P2025" ? httpError(404, "Coupon not found") : e); }
});

export default router;
