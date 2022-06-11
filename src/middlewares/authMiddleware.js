const jwt = require("jsonwebtoken");
const status = require("http-status");

const { JWT_SECRET_KEY } = process.env;

function checkToken(req, res, next) {
  let token = req.headers["authorization"];

  if (token !== undefined) {
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.json({
          status: status.BAD_REQUEST,
          validate: false,
          message: "Invalid Auth Token",
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.json({
      status: status.BAD_REQUEST,
      message: "Invalid Auth Token",
      validate: false,
    });
  }
}

function validateAuthToken(req, res, next) {
  let token = req.headers["authorization"];

  if (token !== undefined) {
    if (token.startsWith("Bearer ")) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.json({
          status: status.OK,
          validate: false,
        });
      } else {
        return res.json({
          status: status.OK,
          validate: true,
        });
      }
    });
  } else {
    return res.json({
      status: status.OK,
      validate: false,
    });
  }
}

module.exports = {
  checkToken: checkToken,
  validateAuthToken: validateAuthToken,
};
