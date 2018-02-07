const jwt = require('jsonwebtoken');
const { tokenKey } = require('../config');

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({ token: null });
  }

  jwt.verify(
    token,
    tokenKey,
    (err, decoded) => {
      if (err) {
        return res.status(500).send({ token: null });
      }

      // if everything good, save to request for use in other routes
      req.userId = decoded.id;
      next();
    }
  );
}

module.exports = verifyToken;
