const jwt = require('jsonwebtoken');
const config = require('../config');

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({ token: null });
  }

  jwt.verify(
    token,
    '4e04432ac8f5f37fd91aecce7c3a989de5f46ba847a2157cd527c50c5d83ebaf',
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
