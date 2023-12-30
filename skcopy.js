const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5435, // your PostgreSQL port
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const client = await pool.connect();
    const queryText =
      "SELECT * FROM employee WHERE username = $1 AND password = $2";
    const result = await client.query(queryText, [username, password]);

    if (result.rows.length > 0) {
      const userPosition = result.rows[0].position;

      if (userPosition === "Sr ECRC") {
        res.sendFile(path.join(__dirname, "/public/main.html"));
      } else if (userPosition === "ECRC") {
        res.redirect(`/user?username=${username}`);
      } else {
        res
          .status(403)
          .send("Access forbidden. You do not have the required position.");
      }

      console.log("User Position:", userPosition);
    } else {
      res.status(401).send("Invalid username or password. Please try again.");
    }

    client.release();
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/user", (req, res) => {
  const username = req.query.username;

  // You may perform additional checks here if needed

  res.sendFile(path.join(__dirname, "/public/user.html"));
});

app.get("/schedule", async (req, res) => {
  try {
    const username = req.query.username;

    const client = await pool.connect();
    const querySchedule = "SELECT * FROM schedule ;";
    const resultSchedule = await client.query(querySchedule, [username]);
    client.release();

    res.json(resultSchedule.rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
