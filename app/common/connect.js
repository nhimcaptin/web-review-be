const mysql = require("mysql2");

const connection = mysql.createPool({
  host: "localhost",
  user: "admin",
  password: "AdminPassword123!",
  database: "web_review",
});

module.exports = connection;
