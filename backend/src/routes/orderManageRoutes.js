import { Router } from 'express';
import { listAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { requireJwtAuth, requireRole } from '../middleware/authMiddleware.js';
import { upstashRateLimit } from '../middleware/rateLimitMiddleware.js';
import { orderLimiter } from '../config/ratelimit.js';

const router = Router();

router.use(upstashRateLimit(orderLimiter, { keyPrefix: 'order-manage' }));
router.use(requireJwtAuth, requireRole('employee', 'admin'));

router.get('/', listAllOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;

