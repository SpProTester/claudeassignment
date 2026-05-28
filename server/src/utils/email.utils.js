import nodemailer from 'nodemailer';

const createTransport = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const FROM = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;

// ── Shared layout wrapper ─────────────────────────────────────────────────────
const layout = (title, bodyHtml) => `
  <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#1a1a1a">
    <div style="background:#2563eb;padding:24px 32px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;color:#fff;font-size:20px">${title}</h1>
    </div>
    <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none">
      ${bodyHtml}
      <p style="margin-top:32px;font-size:12px;color:#9ca3af">
        You received this email because you applied for a job on our platform.
      </p>
    </div>
  </div>
`;

// ── OTP ───────────────────────────────────────────────────────────────────────

export const sendOtpEmail = async (to, otp) => {
  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: 'Password Reset OTP — Job Portal',
    html: layout('Password Reset Request', `
      <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:10px;padding:16px 0;color:#2563eb">${otp}</div>
      <p style="color:#6b7280">If you did not request a password reset, you can safely ignore this email.</p>
    `),
  });
};

// ── ATS: application status changed ──────────────────────────────────────────

/**
 * Sent to the seeker when an employer moves their application to a new stage.
 *
 * @param {{ to, seekerName, jobTitle, companyName, stage, copy: { title, body } }} opts
 */
export const sendApplicationStatusEmail = async ({ to, seekerName, jobTitle, companyName, stage, copy }) => {
  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `${copy.title} — ${jobTitle} at ${companyName}`,
    html: layout(copy.title, `
      <p>Hi <strong>${seekerName}</strong>,</p>
      <p>${copy.body}</p>
      <table style="margin:24px 0;border-collapse:collapse;width:100%">
        <tr>
          <td style="padding:8px 12px;background:#eff6ff;border-radius:4px;font-size:14px">
            <strong>Position:</strong> ${jobTitle}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-size:14px">
            <strong>Company:</strong> ${companyName}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#eff6ff;border-radius:4px;font-size:14px">
            <strong>Current Stage:</strong>
            <span style="background:#2563eb;color:#fff;padding:2px 10px;border-radius:99px;font-size:12px;margin-left:8px">${stage}</span>
          </td>
        </tr>
      </table>
      <p>Log in to your account to view full details.</p>
    `),
  });
};

// ── ATS: custom employer → applicant email ────────────────────────────────────

/**
 * Sends a custom employer-authored message to an applicant.
 *
 * @param {{ to, seekerName, companyName, jobTitle, subject, message }} opts
 */
export const sendEmployerEmail = async ({ to, seekerName, companyName, jobTitle, subject, message }) => {
  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `${subject} — ${companyName}`,
    html: layout(`Message from ${companyName}`, `
      <p>Hi <strong>${seekerName}</strong>,</p>
      <p style="color:#6b7280;font-size:13px">Regarding your application for <em>${jobTitle}</em></p>
      <div style="margin:20px 0;padding:16px;background:#fff;border-left:4px solid #2563eb;border-radius:0 4px 4px 0;white-space:pre-wrap;font-size:15px;line-height:1.7">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <p style="color:#6b7280;font-size:13px">This message was sent by ${companyName} via the job portal.</p>
    `),
  });
};
