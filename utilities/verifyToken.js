const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Get the token from the authorization header
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Missing authentication token' });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Add the user ID to the request object for future use
    req.userId = decodedToken.userId;

    // Call the next middleware or route handler
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

module.exports = { verifyToken };
