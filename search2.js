const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = 8000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5435,
});

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/search.html"));
});

app.get("/employee", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM employee");
    const totalCount = result.rows.length;

    res.json({ data: result.rows, totalCount });
    client.release();
  } catch (error) {
    console.error("Error fetching all employees:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/employee/search/:attribute/:input", async (req, res) => {
  const { attribute, input } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM employee WHERE LOWER(${attribute}) LIKE LOWER($1)`,
      [`%${input}%`]
    );
    const countResult = await client.query(
      `SELECT COUNT(*) FROM employee WHERE LOWER(${attribute}) LIKE LOWER($1)`,
      [`%${input}%`]
    );
    const totalCount = countResult.rows[0].count;

    res.json({ data: result.rows, totalCount });
    client.release();
  } catch (error) {
    console.error(`Error searching employees by ${attribute}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/employee/sort/:attribute", async (req, res) => {
  const { attribute } = req.params;
  const sortOrder = req.query.order || "asc";

  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM employee ORDER BY ${attribute} ${sortOrder}`
    );
    const totalCount = result.rows.length;

    res.json({ data: result.rows, totalCount });
    client.release();
  } catch (error) {
    console.error(`Error sorting employees by ${attribute}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
