import User from '../models/userModel.js';

export async function listUsers(req, res, next) {
  try {
    const users = await User.find({}).select('email role createdAt').sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    if (!['guest', 'employee', 'admin'].includes(role)) {
      return res.status(400).json({ error: { message: 'Invalid role' } });
    }

    const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).select('email role');
    if (!updated) return res.status(404).json({ error: { message: 'User not found' } });

    return res.status(200).json({ user: updated });
  } catch (err) {
    return next(err);
  }
}

