import { Router } from 'express';
import { login, me, signup } from '../controllers/authController.js';
import { requireJwtAuth } from '../middleware/authMiddleware.js';
import { upstashRateLimit } from '../middleware/rateLimitMiddleware.js';
import { authLimiter } from '../config/ratelimit.js';

const router = Router();

// Protect all /api/auth/* endpoints with Upstash rate limiting.
router.use(upstashRateLimit(authLimiter, { keyPrefix: 'auth' }));

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireJwtAuth, me);

export default router;

