const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = 9700;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5435,
});
function generate_username(name) {
  const username = name.replace(/\s+/g, "").toLowerCase();
  return username;
}
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/signin.html"));
});

app.post("/add-employee", async (req, res) => {
  const { name, position, depart, email, contactNo, fav } = req.body;
  const username = generate_username(name);

  const query = `
      INSERT INTO employee (name, position, dept, mail, contact_num, username, password, fav)
      VALUES ($1, $2, COALESCE($3, 'Reservation'), $4, $5, $6, generate_password(6), $7)
      RETURNING *;
    `;

  try {
    const client = await pool.connect();
    const result = await client.query(query, [
      name,
      position,
      depart,
      email,
      contactNo,
      username,
      fav, // Add fav to the array
    ]);
    client.release();
    res
      .status(200)
      .json({ success: true, message: "Employee added successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding employee: " + error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
