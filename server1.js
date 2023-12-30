const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5435,
});

app.use(express.static("public"));

app.get("/employee", async (req, res) => {
  try {
    // Assuming your employee table has a 'position' column
    const result = await pool.query(
      "SELECT name FROM employee WHERE LOWER(position) <> $1",
      ["sr ecrc"]
    );
    const employeeNames = result.rows.map((row) => row.name);

    console.log("Fetched employees:", employeeNames);

    res.json(employeeNames);
  } catch (error) {
    console.error("Error fetching names:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/submitSchedule", async (req, res) => {
  try {
    const { schedule } = req.body;

    const query =
      "INSERT INTO schedule (day, time_of_day, selected_name) VALUES ($1, $2, $3)";

    await Promise.all(
      schedule.map((entry) =>
        pool.query(query, [entry.day, entry.timeOfDay, entry.selectedName])
      )
    );

    res.send("Schedule submitted successfully");
  } catch (error) {
    console.error("Error submitting schedule:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
