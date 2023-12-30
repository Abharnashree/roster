const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5435,
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/user.html"));
});

app.get("/schedule", async (req, res) => {
  try {
    const client = await pool.connect();
    const querySchedule = "SELECT * FROM schedule";
    const resultSchedule = await client.query(querySchedule);
    client.release();
    const formattedSchedule = resultSchedule.rows.map((row) => ({
      id: row.id,
      day: row.day,
      time_of_day: row.time_of_day,
      selected_name: row.selected_name.replace(/[{}"]/g, "").split(","),
    }));
    res.json(resultSchedule.rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 9000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
