import Product from '../models/productModel.js';
import { getAssetUrl, getProductImagesBucket, uploadAsset } from '../config/storageUtils.js';

function validateProductFields({ name, price, discountPercent }) {
  if (name !== undefined && !String(name).trim()) {
    return 'name cannot be empty';
  }
  if (price !== undefined) {
    const numPrice = Number(price);
    if (!Number.isFinite(numPrice) || numPrice < 0) return 'price must be a non-negative number';
  }
  if (discountPercent !== undefined) {
    const numDiscount = Number(discountPercent);
    if (!Number.isFinite(numDiscount) || numDiscount < 0 || numDiscount > 100) {
      return 'discountPercent must be between 0 and 100';
    }
  }
  return null;
}

function transformProduct(product) {
  return {
    ...product.toObject(),
  };
}

async function decorateProductImages(productDoc) {
  const p = transformProduct(productDoc);
  p.thumbnailUrl = await getAssetUrl(p.thumbnail);
  p.descriptionImageUrls = await Promise.all((p.descriptionImages || []).map((k) => getAssetUrl(k)));
  return p;
}

export async function listProducts(req, res, next) {
  try {
    const q = (req.query?.q || '').trim();
    const page = Math.max(1, Number(req.query?.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query?.limit || 20)));
    const skip = (page - 1) * limit;

    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    const decorated = await Promise.all(products.map((p) => decorateProductImages(p)));
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      products: decorated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: { message: 'Product not found' } });

    return res.status(200).json({ product: await decorateProductImages(product) });
  } catch (err) {
    return next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const guestId = userId ? null : req.body?.guestId || null;

    const { name, price, discountPercent, description } = req.body || {};
    if (!name || price === undefined) {
      return res.status(400).json({ error: { message: 'name and price are required' } });
    }
    const validationError = validateProductFields({ name, price, discountPercent });
    if (validationError) {
      return res.status(400).json({ error: { message: validationError } });
    }
    if (!userId && !guestId) {
      return res.status(400).json({ error: { message: 'guestId is required for guest products' } });
    }

    const thumbnailFile = req.files?.thumbnail?.[0] || null;
    const descriptionImageFiles = req.files?.descriptionImages || [];

    const basePath = userId
      ? `products/user-${userId}`
      : `products/guest-${guestId}`;

    let thumbnail = null;
    if (thumbnailFile) {
      const path = `${basePath}/thumbnail-${Date.now()}-${thumbnailFile.originalname}`;
      await uploadAsset({
        path,
        fileBuffer: thumbnailFile.buffer,
        contentType: thumbnailFile.mimetype,
      });
      thumbnail = path;
    }

    const descriptionImages = [];
    for (const f of descriptionImageFiles) {
      const path = `${basePath}/description-${Date.now()}-${f.originalname}`;
      await uploadAsset({
        path,
        fileBuffer: f.buffer,
        contentType: f.mimetype,
      });
      descriptionImages.push(path);
    }

    const product = await Product.create({
      userId,
      guestId,
      name,
      price: Number(price),
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : 0,
      description: description || '',
      thumbnail,
      descriptionImages,
    });

    return res.status(201).json({ product: await decorateProductImages(product) });
  } catch (err) {
    return next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, price, discountPercent, description } = req.body || {};
    const validationError = validateProductFields({ name, price, discountPercent });
    if (validationError) {
      return res.status(400).json({ error: { message: validationError } });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: { message: 'Product not found' } });

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (discountPercent !== undefined) product.discountPercent = Number(discountPercent);
    if (description !== undefined) product.description = description;

    const thumbnailFile = req.files?.thumbnail?.[0] || null;
    const descriptionImageFiles = req.files?.descriptionImages || [];
    const clearDescriptionImages = req.body?.clearDescriptionImages === 'true';

    const ownerLabel = product.userId
      ? `user-${product.userId.toString()}`
      : `guest-${product.guestId || 'unknown'}`;
    const basePath = `products/${ownerLabel}`;

    if (thumbnailFile) {
      const path = `${basePath}/thumbnail-${Date.now()}-${thumbnailFile.originalname}`;
      await uploadAsset({
        path,
        fileBuffer: thumbnailFile.buffer,
        contentType: thumbnailFile.mimetype,
      });
      product.thumbnail = path;
    }

    if (clearDescriptionImages) product.descriptionImages = [];
    for (const f of descriptionImageFiles) {
      const path = `${basePath}/description-${Date.now()}-${f.originalname}`;
      await uploadAsset({
        path,
        fileBuffer: f.buffer,
        contentType: f.mimetype,
      });
      product.descriptionImages.push(path);
    }

    await product.save();
    return res.status(200).json({ product: await decorateProductImages(product) });
  } catch (err) {
    return next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: { message: 'Product not found' } });
    return res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
}

// Small helper for debugging uploads; not required by spec.
export async function _bucketInfo(req, res) {
  return res.json({ bucket: getProductImagesBucket() });
}

