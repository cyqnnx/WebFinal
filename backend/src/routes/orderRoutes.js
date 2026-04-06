import { Router } from 'express';
import { createOrder, listOrders, cancelOrder } from '../controllers/orderController.js';
import { requireJwtAuth } from '../middleware/authMiddleware.js';
import { upstashRateLimit } from '../middleware/rateLimitMiddleware.js';
import { orderLimiter } from '../config/ratelimit.js';

const router = Router();

// Protect all /api/order/* endpoints with Upstash rate limiting.
router.use(upstashRateLimit(orderLimiter, { keyPrefix: 'order' }));

router.get('/', requireJwtAuth, listOrders);
router.post('/', requireJwtAuth, createOrder);
router.patch('/:id/cancel', requireJwtAuth, cancelOrder);

export default router;

