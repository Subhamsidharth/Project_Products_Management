const jwt = require("jsonwebtoken");

module.exports.authentication= async function (req, res, next) {
  try {
    let token = req.headers["authorization"];
    // "Bearer eyyyyyyyyyyyyyyyyyy";
    token = token.substring(7);
    // token.split(" "); => ["Bearer", "eyyyyyyyyyyyyyyyyy"]
    // token = arr[1]
    if (!token) {
      return res.status(401).send({ status: false, message: "Missing authentication token in request ⚠️", });
    }

    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(401).send({ status: false, message: "Invalid authentication token in request headers." })
    }
    if (Date.now() > (decoded.exp) * 1000) {
      return res.status(440).send({ status: false, message: "Session expired! Please login again." })//​​440 Login Timeout
    }
    jwt.verify(token, "group70", function (err, decoded) {
      if (err) {
        return res.status(400).send({ status: false, message: "token invalid ⚠️" });
      }
      else {
        req.userId = decoded.userId;
        return next();
      }
    });

  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};