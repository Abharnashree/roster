const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const PORT = 3000; // Change to the port you prefer

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
  res.sendFile(path.join(__dirname, "/public/LOGIN.html"));
});

app.get("/user", async (req, res) => {
  try {
    const client = await pool.connect();
    const queryText = "SELECT * FROM schedule WHERE selected_name = $1";
    const result = await client.query(queryText, ["username"]); // Replace "username" with the actual username of the logged-in user
    client.release();

    if (result.rows.length > 0) {
      const schedule = result.rows;

      // Send schedule data to the user.html page with the full URL
      res.sendFile(path.join(__dirname, "/public/user.html"), {
        schedule: JSON.stringify(schedule),
        root: path.join(__dirname, "/public"),
      });
    } else {
      // If no schedule found, send an empty array
      res.sendFile(path.join(__dirname, "/public/user.html"), {
        schedule: "[]",
        root: path.join(__dirname, "/public"),
      });
    }
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const client = await pool.connect();
    const queryText =
      "SELECT * FROM employee WHERE username = $1 AND password = $2";
    const result = await client.query(queryText, [username, password]);
    client.release();

    if (result.rows.length > 0) {
      const userPosition = result.rows[0].position;

      // Check user's position and redirect accordingly
      if (userPosition === "Sr ECRC") {
        // Redirect to MAIN.html with the full URL
        res.sendFile(path.join(__dirname, "public/main.html"));
      } else if (userPosition === "ECRC") {
        // Redirect to user.html with the full URL
        res.redirect("/user");
      } else {
        // Handle other positions or show an error
        res
          .status(403)
          .send("Access forbidden. You do not have the required position.");
      }

      // Log userPosition inside the block
      console.log("User Position:", userPosition);
    } else {
      // Invalid login credentials - Send error message to login page
      res.status(401).send("Invalid username or password. Please try again.");
    }
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
