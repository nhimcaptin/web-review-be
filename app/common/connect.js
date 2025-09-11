const mysql = require("mysql2");

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "web_review",
});

module.exports = connection;
