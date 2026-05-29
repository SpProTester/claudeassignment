import { JobAlert } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

const ALERT_LIMIT = 10;

export const createAlert = async (req, res, next) => {
  try {
    const count = await JobAlert.count({ where: { seekerId: req.user.id } });
    if (count >= ALERT_LIMIT) {
      return sendError(res, `You can have at most ${ALERT_LIMIT} active alerts.`, 422);
    }

    const { keywords, location, jobType, workMode, experienceLevel, salaryMin, frequency } = req.body;

    const alert = await JobAlert.create({
      seekerId: req.user.id,
      keywords:        keywords?.trim()  || null,
      location:        location?.trim()  || null,
      jobType:         jobType           || null,
      workMode:        workMode          || null,
      experienceLevel: experienceLevel   || null,
      salaryMin:       salaryMin != null ? parseInt(salaryMin, 10) : null,
      frequency:       frequency         || 'daily',
    });

    sendSuccess(res, { alert }, 'Job alert created.', 201);
  } catch (err) {
    next(err);
  }
};

export const listAlerts = async (req, res, next) => {
  try {
    const alerts = await JobAlert.findAll({
      where: { seekerId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    sendSuccess(res, { alerts });
  } catch (err) {
    next(err);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const deleted = await JobAlert.destroy({ where: { id: req.params.id, seekerId: req.user.id } });
    if (!deleted) return sendError(res, 'Alert not found.', 404);
    sendSuccess(res, null, 'Alert deleted.');
  } catch (err) {
    next(err);
  }
};

export const toggleAlert = async (req, res, next) => {
  try {
    const alert = await JobAlert.findOne({ where: { id: req.params.id, seekerId: req.user.id } });
    if (!alert) return sendError(res, 'Alert not found.', 404);

    await alert.update({ isActive: !alert.isActive });
    sendSuccess(res, { alert }, `Alert ${alert.isActive ? 'enabled' : 'disabled'}.`);
  } catch (err) {
    next(err);
  }
};
