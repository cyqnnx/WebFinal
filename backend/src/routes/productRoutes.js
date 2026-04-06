import { Router } from 'express';
import multer from 'multer';

import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from '../controllers/productController.js';
import { optionalJwtAuth, requireJwtAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', listProducts);
router.get('/:id', getProductById);
router.post(
  '/',
  requireJwtAuth,
  requireRole('admin'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'descriptionImages', maxCount: 10 },
  ]),
  createProduct,
);
router.patch(
  '/:id',
  requireJwtAuth,
  requireRole('admin'),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'descriptionImages', maxCount: 10 },
  ]),
  updateProduct,
);
router.delete('/:id', requireJwtAuth, requireRole('admin'), deleteProduct);

export default router;

