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

// ── New application received (employer) ──────────────────────────────────────

/**
 * Sent to the employer when a new seeker applies to their job posting.
 *
 * @param {{ to, companyName, seekerName, jobTitle, applicationId }} opts
 */
export const sendApplicationReceivedEmail = async ({ to, companyName, seekerName, jobTitle, applicationId }) => {
  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `New Application: ${jobTitle}`,
    html: layout('New Job Application Received', `
      <p>Hi <strong>${companyName}</strong>,</p>
      <p><strong>${seekerName}</strong> has applied for your job posting:</p>
      <table style="margin:24px 0;border-collapse:collapse;width:100%">
        <tr>
          <td style="padding:8px 12px;background:#eff6ff;border-radius:4px;font-size:14px">
            <strong>Position:</strong> ${jobTitle}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-size:14px">
            <strong>Applicant:</strong> ${seekerName}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#eff6ff;border-radius:4px;font-size:14px">
            <strong>Application ID:</strong> ${applicationId}
          </td>
        </tr>
      </table>
      <p>Log in to your employer dashboard to review the application and manage your pipeline.</p>
    `),
  });
};

// ── Interview invitation (seeker) ─────────────────────────────────────────────

/**
 * Sent to the seeker when their application reaches the interview stage.
 *
 * @param {{ to, seekerName, jobTitle, companyName, applicationId }} opts
 */
export const sendInterviewScheduledEmail = async ({ to, seekerName, jobTitle, companyName, applicationId }) => {
  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `Interview Invitation — ${jobTitle} at ${companyName}`,
    html: layout('You Have Been Invited for an Interview!', `
      <p>Hi <strong>${seekerName}</strong>,</p>
      <p>Congratulations! <strong>${companyName}</strong> would like to invite you for an interview for the following position:</p>
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
      </table>
      <p>Please log in to your account to view further details and confirm your availability.</p>
      <p style="color:#6b7280;font-size:13px">Application ID: ${applicationId}</p>
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

// ── Job alert digest ──────────────────────────────────────────────────────────

const formatSalary = (min, max) => {
  if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min)        return `From $${min.toLocaleString()}`;
  return null;
};

const badge = (text) =>
  `<span style="display:inline-block;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;margin-right:4px;white-space:nowrap">${text}</span>`;

const jobCard = (job, clientUrl) => {
  const salary   = formatSalary(job.salaryMin, job.salaryMax);
  const company  = job.employer?.companyName ?? 'Company';
  const location = job.location ? ` &nbsp;·&nbsp; ${job.location}` : '';
  const badges   = [job.jobType, job.workMode, job.experienceLevel].filter(Boolean).map(badge).join('');
  const postedAgo = Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin-bottom:14px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <h3 style="margin:0 0 2px;font-size:16px">
              <a href="${clientUrl}/jobs/${job.slug}" style="color:#2563eb;text-decoration:none">${job.title}</a>
            </h3>
            <p style="margin:0 0 10px;font-size:13px;color:#6b7280">${company}${location}</p>
            <div style="margin-bottom:10px">${badges}</div>
            ${salary ? `<p style="margin:0;font-size:13px;color:#374151;font-weight:600">${salary}</p>` : ''}
          </td>
          <td style="text-align:right;vertical-align:top;white-space:nowrap;padding-left:16px">
            <p style="margin:0;font-size:11px;color:#9ca3af">${postedAgo === 0 ? 'Today' : `${postedAgo}d ago`}</p>
            <a href="${clientUrl}/jobs/${job.slug}"
               style="display:inline-block;margin-top:10px;background:#2563eb;color:#fff;padding:7px 16px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">
              Apply →
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;
};

/**
 * Sends a job alert digest email to a seeker.
 *
 * @param {{ to, seekerName, alert, jobs }} opts
 *   alert — JobAlert model instance
 *   jobs  — array of JobListing instances (with employer eager-loaded)
 */
export const sendAlertDigestEmail = async ({ to, seekerName, alert, jobs }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const alertLabel = [
    alert.keywords,
    alert.location,
    alert.jobType,
    alert.workMode,
    alert.experienceLevel,
  ].filter(Boolean).join(' · ') || 'All Jobs';

  const jobCount     = jobs.length;
  const manageUrl    = `${clientUrl}/seeker/alerts`;
  const unsubUrl     = `${clientUrl}/seeker/alerts?unsubscribe=${alert.id}`;
  const freqLabel    = alert.frequency === 'weekly' ? 'weekly' : 'daily';

  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM(),
    to,
    subject: `${jobCount} new job${jobCount > 1 ? 's' : ''} matching "${alertLabel}"`,
    html: `
      <div style="font-family:sans-serif;max-width:620px;margin:auto;color:#1a1a1a">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);padding:28px 32px;border-radius:8px 8px 0 0">
          <p style="margin:0 0 4px;color:#bfdbfe;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase">Job Alert Digest</p>
          <h1 style="margin:0 0 4px;color:#fff;font-size:22px">${alertLabel}</h1>
          <p style="margin:0;color:#bfdbfe;font-size:13px">${jobCount} new match${jobCount > 1 ? 'es' : ''} in your ${freqLabel} digest</p>
        </div>

        <!-- Body -->
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none">
          <p style="margin:0 0 24px">Hi <strong>${seekerName}</strong>, here are the latest jobs matching your saved search:</p>

          ${jobs.map((j) => jobCard(j, clientUrl)).join('')}

          <!-- CTA -->
          <div style="text-align:center;margin:32px 0">
            <a href="${clientUrl}/jobs"
               style="display:inline-block;background:#2563eb;color:#fff;padding:13px 32px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">
              Browse All Jobs →
            </a>
          </div>

          <!-- Alert summary box -->
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px">Your Alert Filters</p>
            <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#4b5563;width:100%">
              ${alert.keywords        ? `<tr><td style="padding:2px 0;width:130px;color:#9ca3af">Keywords</td><td>${alert.keywords}</td></tr>` : ''}
              ${alert.location        ? `<tr><td style="padding:2px 0;color:#9ca3af">Location</td><td>${alert.location}</td></tr>` : ''}
              ${alert.jobType         ? `<tr><td style="padding:2px 0;color:#9ca3af">Job type</td><td>${alert.jobType}</td></tr>` : ''}
              ${alert.workMode        ? `<tr><td style="padding:2px 0;color:#9ca3af">Work mode</td><td>${alert.workMode}</td></tr>` : ''}
              ${alert.experienceLevel ? `<tr><td style="padding:2px 0;color:#9ca3af">Experience</td><td>${alert.experienceLevel}</td></tr>` : ''}
              ${alert.salaryMin       ? `<tr><td style="padding:2px 0;color:#9ca3af">Min salary</td><td>$${alert.salaryMin.toLocaleString()}</td></tr>` : ''}
              <tr><td style="padding:2px 0;color:#9ca3af">Frequency</td><td style="text-transform:capitalize">${alert.frequency}</td></tr>
            </table>
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px">

          <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;line-height:1.8">
            You receive this because you set up a job alert on our platform.<br>
            <a href="${manageUrl}" style="color:#6b7280;text-decoration:underline">Manage my alerts</a>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <a href="${unsubUrl}" style="color:#6b7280;text-decoration:underline">Unsubscribe from this alert</a>
          </p>
        </div>

      </div>
    `,
  });
};
