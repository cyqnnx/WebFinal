import './config/env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/mongoose.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import orderManageRoutes from './routes/orderManageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();

const port = Number(process.env.PORT || 4000);
const clientOrigin = process.env.CLIENT_ORIGIN || '*';

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: process.env.JSON_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => res.status(200).json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/orders/manage', orderManageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);

app.use((req, res) => res.status(404).json({ error: { message: 'Not found' } }));
app.use(errorMiddleware);

await connectDB();
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

