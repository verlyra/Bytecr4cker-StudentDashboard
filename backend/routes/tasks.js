const router = require("express").Router();
const db = require("../db.js");
const auth = require("../middleware/auth.js");

// GET All
router.get("/", auth, async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at ASC",
    [req.user.id]
  );
  res.json(rows);
});

// POST New
router.post("/", auth, async (req, res) => {
  const { title, due_date } = req.body; // <-- Menerima due_date dari body
  const [result] = await db.query(
    "INSERT INTO tasks (user_id, title, due_date) VALUES (?, ?, ?)",
    [req.user.id, title, due_date || null] // <-- Memasukkannya ke database
  );
  const [newRow] = await db.query("SELECT * FROM tasks WHERE id = ?", [
    result.insertId,
  ]);
  res.json(newRow[0]);
});

// PUT Update
router.put("/:id", auth, async (req, res) => {
  const { is_completed } = req.body;

  if (typeof is_completed !== "boolean") {
    return res
      .status(400)
      .json({ msg: "is_completed field (boolean) is required" });
  }

  try {
    await db.query(
      "UPDATE tasks SET is_completed = ? WHERE id = ? AND user_id = ?",
      [is_completed, req.params.id, req.user.id]
    );

    const [updatedRow] = await db.query("SELECT * FROM tasks WHERE id = ?", [
      req.params.id,
    ]);

    if (updatedRow.length > 0) {
      res.json(updatedRow[0]);
    } else {
      res.status(404).json({ msg: "Task not found" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  await db.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [
    req.params.id,
    req.user.id,
  ]);
  res.json({ msg: "Task removed" });
});

module.exports = router;
