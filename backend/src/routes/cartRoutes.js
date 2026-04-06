import { Router } from 'express';

import { addCartItem, getCart } from '../controllers/cartController.js';
import { optionalJwtAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalJwtAuth, getCart);
router.post('/items', optionalJwtAuth, addCartItem);

export default router;

