const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const mysqlm = require("mysqlm");

module.exports = mysqlm.connect({
  host: DB_HOST,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});
