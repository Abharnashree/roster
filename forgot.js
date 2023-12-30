const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 7000;

// PostgreSQL configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5435,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/forgetpwd.html"));
});

// Serve the forgot password form
app.get("/forgot-password", (req, res) => {
  res.sendFile(__dirname + "/forgot-password.html");
});

// Handle form submission
app.post("/send-email", (req, res) => {
  const { email, message } = req.body;

  // Setup nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rosterrailway@gmail.com",
      pass: "xrskrhqmorvjwshp",
    },
  });

  // Email options
  const mailOptions = {
    from: "rosterrailway@gmail.com",
    to: email,
    subject: "Email from Web Form",
    text: message,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send("Email sent: " + info.response);
  });
});

// Handle forgot password form submission
app.post("/forgot-password", async (req, res) => {
  const { email, favThing } = req.body;

  try {
    // Log to check if the request body is received correctly
    console.log("Received request body:", req.body);

    // Retrieve password from the database
    const result = await pool.query(
      "SELECT password FROM employee WHERE mail = $1 AND fav = $2",
      [email, favThing]
    );

    // Log to check the result from the database query
    console.log("Result from the database:", result.rows);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send("Incorrect favorite thing or email not found.");
    }

    const userPassword = result.rows[0].password;

    // Send the user's password to their email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "rosterrailway@gmail.com",
        pass: "xrskrhqmorvjwshp",
      },
    });

    const mailOptions = {
      from: "rosterrailway@gmail.com",
      to: email,
      subject: "Password Reminder",
      text: `Your password is: ${userPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Error sending email.");
      }
      res.status(200).send("Password reminder email sent.");
    });
  } catch (error) {
    // Log to check for errors
    console.error("Error retrieving password from the database:", error);
    res.status(500).send("Internal server error.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
