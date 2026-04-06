import { Router } from 'express';
import { listUsers, updateUserRole } from '../controllers/userController.js';
import { requireJwtAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireJwtAuth, requireRole('admin'));
router.get('/permissions', listUsers);
router.patch('/permissions/:id', updateUserRole);

export default router;

