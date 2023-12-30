const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");

const app = express();
const port = 3000;

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5435,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) =>
    console.error("Error connecting to PostgreSQL database:", err)
  );

app.use(bodyParser.json());

const processShiftSwapRequest = (
  requestId,
  empId,
  originalShiftId,
  requestedShiftId
) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT process_shift_swap_request($1)", [requestId])
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        console.error("Error processing shift swap request:", error);
        reject(error);
      });
  });
};

const submitSupervisorRequest = (
  empName,
  originalShiftId,
  requestedShiftId,
  reason
) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT submit_supervisor_request($1, $2, $3, $4)", [
      empName,
      originalShiftId,
      requestedShiftId,
      reason,
    ])
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        console.error("Error submitting supervisor request:", error);
        reject(error);
      });
  });
};

app.post("/request-shift-swap", async (req, res) => {
  const { empId, originalShiftId, requestedShiftId, reason } = req.body;
  try {
    await db.query(
      "INSERT INTO shiftswaprequest (requestedby, originalshiftid, requestedshiftid, reasonforswap, status) VALUES ($1, $2, $3, $4, $5)",
      [empId, originalShiftId, requestedShiftId, reason, "Pending"]
    );

    const swapSuccessful = await processShiftSwapRequest(
      empId,
      originalShiftId,
      requestedShiftId
    );

    if (swapSuccessful) {
      res.json({
        success: true,
        message: "Shift swap request submitted successfully",
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Shift swap request failed" });
    }
  } catch (error) {
    console.error("Error submitting shift swap request:", error);
    res
      .status(500)
      .json({ success: false, message: "Shift swap request failed" });
  }
});

app.post("/submit-supervisor-request", async (req, res) => {
  const { empName, originalShiftId, requestedShiftId, reason } = req.body;

  try {
    await db.query(
      "INSERT INTO notification (emp_name, original_shift_id, requested_shift_id, reason) VALUES ($1, $2, $3, $4)",
      [empName, originalShiftId, requestedShiftId, reason]
    );

    const supervisorRequestSuccessful = await submitSupervisorRequest(
      empName,
      originalShiftId,
      requestedShiftId,
      reason
    );

    if (supervisorRequestSuccessful) {
      res.json({
        success: true,
        message: "Supervisor request submitted successfully",
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Supervisor request failed" });
    }
  } catch (error) {
    console.error("Error submitting supervisor request:", error);
    res
      .status(500)
      .json({ success: false, message: "Supervisor request failed" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
