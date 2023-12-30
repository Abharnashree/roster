const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const port = 9900;
const path = require("path");

const app = express();
app.use(cors());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5435,
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/notifications", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT e.name AS requestedby, sr.reasonforswap, sr.originalshiftid, sr.requestedshiftid FROM shiftswaprequest sr INNER JOIN employee e ON sr.requestedby = e.emp_id WHERE sr.status = $1",
      ["Pending"]
    );
    const requests = result.rows;
    client.release();
    res.json(requests);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Error fetching data");
  }
});

app.put("/approve/:requestid", async (req, res) => {
  try {
    const requestid = req.params.requestid;
    console.log("Received request ID for approval:", requestid);

    const client = await pool.connect();
    const result = await client.query(
      "UPDATE shiftswaprequest SET status = $1 WHERE requestid = $2 RETURNING *",
      ["Approved", requestid]
    );
    client.release();

    console.log("Result after update:", result.rows);

    res.send("Request approved");
  } catch (err) {
    console.error("Error updating request status", err);
    res.status(500).send("Error updating status");
  }
});

app.put("/reject/:requestid", async (req, res) => {
  try {
    const requestid = req.params.requestid;
    console.log("Received request ID for rejection:", requestid); // Log the received request ID

    const client = await pool.connect();
    await client.query(
      "UPDATE shiftswaprequest SET status = $1 WHERE requestid = $2",
      ["Rejected", requestid]
    );
    client.release();
    res.send("Request rejected");
  } catch (err) {
    console.error("Error updating request status", err);
    res.status(500).send("Error updating status");
  }
});

app.get("/approved-requests", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT requestedby, reasonforswap, originalshiftid, requestedshiftid FROM shiftswaprequest WHERE status = $1",
      ["Approved"]
    );
    const requests = result.rows;
    client.release();
    res.json(requests);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Error fetching data");
  }
});

app.get("/rejected-requests", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT requestedby, reasonforswap, originalshiftid, requestedshiftid FROM shiftswaprequest WHERE status = $1",
      ["Rejected"]
    );
    const requests = result.rows;
    client.release();
    res.json(requests);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Error fetching data");
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/noti.html");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
