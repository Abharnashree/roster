const express = require("express");
const path = require("path");

const app = express();
const port = 3300;

const imagesDirectory = path.join(__dirname, "/public/images");

app.use("/images", express.static(imagesDirectory));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
