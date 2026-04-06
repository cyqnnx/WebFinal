import News from '../models/newsModel.js';

export async function listNews(req, res, next) {
  try {
    const now = new Date();
    const news = await News.find({ untilDate: { $gte: now } }).sort({ untilDate: 1 });
    return res.status(200).json({ news });
  } catch (err) {
    return next(err);
  }
}

export async function createNews(req, res, next) {
  try {
    const { untilDate, content, link } = req.body || {};
    if (!untilDate || !content) {
      return res.status(400).json({ error: { message: 'untilDate and content are required' } });
    }

    const created = await News.create({ untilDate, content, link: link || '' });
    return res.status(201).json({ news: created });
  } catch (err) {
    return next(err);
  }
}

