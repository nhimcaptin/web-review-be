const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");

const reviewRouter = require("./app/router/review.js");
const mediaRouter = require("./app/router/media.js");

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// Config static files d? truy c?p uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("", (req, res) => {
  return res.status(200).json({ message: "Connection successful" });
});

app.use("/api/reviews", reviewRouter);
app.use("/api/media", mediaRouter);

// Load SSL cert t? Let�s Encrypt
// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/api.autocaruniverse.cloud/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/api.autocaruniverse.cloud/fullchain.pem")
// };

// https.createServer(options, app).listen(443);
app.listen(3000);