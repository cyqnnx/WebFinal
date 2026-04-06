import jwt from 'jsonwebtoken';

export function requireJwtAuth(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: { message: 'Server misconfiguration: JWT_SECRET missing' } });
  }

  const authHeader = req.headers.authorization;
  
  // Explicitly check if the authorization header exists and starts with "Bearer "
  if (!authHeader || authHeader.startsWith('Bearer ') === false) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  // Extract the actual token string by splitting at the space
  const tokenParts = authHeader.split(' ');
  const token = tokenParts[1];

  try {
    // Verify the token against our secret key to ensure it hasn't been tampered with
    const payload = jwt.verify(token, jwtSecret);
    
    // Attach the decoded user information to the request object for later use
    req.user = { id: payload.sub, role: payload.role || 'guest' };
    
    // Move on to the next middleware or route handler
    return next();
  } catch {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}

export function optionalJwtAuth(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return next();

  const authHeader = req.headers.authorization;
  
  // If there is no auth header or it doesn't start with "Bearer ", just continue as a guest
  if (!authHeader || authHeader.startsWith('Bearer ') === false) {
    return next();
  }

  // Extract the actual token string
  const tokenParts = authHeader.split(' ');
  const token = tokenParts[1];

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, role: payload.role || 'guest' };
  } catch {
    // If token is invalid we just treat the request as unauthenticated
  }
  return next();
}

export function requireRole(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user?.id) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const role = req.user?.role || 'guest';
    if (!roles.includes(role)) {
      return res.status(403).json({ error: { message: 'Forbidden' } });
    }

    return next();
  };
}

