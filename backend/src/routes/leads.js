const express = require("express");
const { Lead } = require("../models/Lead");
const { validateLead } = require("../validation");

const router = express.Router();

// GET /api/leads — list with search, status filter, sorting and pagination.
// Query params: search (name/company/email), status, sort (newest|oldest|name),
// page (default 1), limit (default 50, max 100).
router.get("/", async (req, res, next) => {
  try {
    const { search = "", status, sort = "newest" } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));

    const filter = {};
    if (status) filter.status = status;
    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, name: { name: 1 } };
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sortMap[sort] || sortMap.newest).skip((page - 1) * limit).limit(limit),
      Lead.countDocuments(filter),
    ]);
    res.json({ data: leads, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/stats — dashboard counts: total + one count per status.
router.get("/stats", async (req, res, next) => {
  try {
    const grouped = await Lead.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const byStatus = { New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
    for (const row of grouped) byStatus[row._id] = row.count;
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    res.json({ total, byStatus });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/:id — single lead.
router.get("/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found." });
    res.json({ data: lead });
  } catch (err) {
    next(err);
  }
});

// POST /api/leads — create a lead.
router.post("/", async (req, res, next) => {
  try {
    const errors = validateLead(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    const lead = await Lead.create(req.body);
    res.status(201).json({ data: lead });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ errors: { email: "A lead with this email already exists." } });
    }
    next(err);
  }
});

// PUT /api/leads/:id — update a lead (edit fields and/or status).
router.put("/:id", async (req, res, next) => {
  try {
    const errors = validateLead(req.body, { partial: true });
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ error: "Lead not found." });
    res.json({ data: lead });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ errors: { email: "A lead with this email already exists." } });
    }
    next(err);
  }
});

// DELETE /api/leads/:id — delete a lead.
router.delete("/:id", async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found." });
    res.json({ message: "Lead deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
