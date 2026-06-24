import { sendContactEmail } from '../utils/email.utils.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return sendError(res, 'All fields are required.', 400);
    }

    await sendContactEmail({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() });

    sendSuccess(res, null, 'Message sent successfully.');
  } catch (err) {
    next(err);
  }
};
