import { Op } from 'sequelize';
import {
  User,
  SeekerProfile,
  Skill,
  SeekerSkill,
  Experience,
  Education,
  Certification,
  Application,
  SavedJob,
} from '../models/index.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROFILE_INCLUDES = [
  { model: SeekerProfile, as: 'seekerProfile' },
  {
    model: Skill,
    as: 'skills',
    through: { attributes: ['proficiencyLevel', 'yearsOfExperience'] },
    attributes: ['id', 'name', 'slug', 'category'],
  },
  {
    model: Experience,
    as: 'experiences',
    attributes: { exclude: ['seekerId'] },
  },
  {
    model: Education,
    as: 'educations',
    attributes: { exclude: ['seekerId'] },
  },
  {
    model: Certification,
    as: 'certifications',
    attributes: { exclude: ['seekerId'] },
  },
];

const ownEntry = (model, id, seekerId) =>
  model.findOne({ where: { id, seekerId } });

// ── Profile ───────────────────────────────────────────────────────────────────

// GET /api/seekers/profile
export const getProfile = async (req, res, next) => {
  try {
    const [profile] = await SeekerProfile.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id },
    });

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'role', 'isVerified', 'createdAt'],
      include: PROFILE_INCLUDES,
      order: [
        [{ model: Experience, as: 'experiences' }, 'startDate', 'DESC'],
        [{ model: Education, as: 'educations' }, 'startDate', 'DESC'],
        [{ model: Certification, as: 'certifications' }, 'issueDate', 'DESC'],
      ],
    });

    sendSuccess(res, { profile: user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/seekers/profile
export const updateProfile = async (req, res, next) => {
  try {
    const {
      headline,
      summary,
      location,
      experienceYears,
      openToWork,
      profileVisibility,
      skills, // optional: [{ skillId, proficiencyLevel, yearsOfExperience }]
    } = req.body;

    const [seekerProfile] = await SeekerProfile.findOrCreate({
      where: { userId: req.user.id },
      defaults: { userId: req.user.id },
    });

    await seekerProfile.update({
      ...(headline !== undefined && { headline }),
      ...(summary !== undefined && { summary }),
      ...(location !== undefined && { location }),
      ...(experienceYears !== undefined && { experienceYears }),
      ...(openToWork !== undefined && { openToWork }),
      ...(profileVisibility !== undefined && { profileVisibility }),
    });

    if (Array.isArray(skills)) {
      await SeekerSkill.destroy({ where: { seekerId: req.user.id } });
      if (skills.length > 0) {
        await SeekerSkill.bulkCreate(
          skills.map(({ skillId, proficiencyLevel = 'intermediate', yearsOfExperience }) => ({
            seekerId: req.user.id,
            skillId,
            proficiencyLevel,
            yearsOfExperience: yearsOfExperience ?? null,
          }))
        );
      }
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'role', 'isVerified', 'createdAt'],
      include: PROFILE_INCLUDES,
      order: [
        [{ model: Experience, as: 'experiences' }, 'startDate', 'DESC'],
        [{ model: Education, as: 'educations' }, 'startDate', 'DESC'],
        [{ model: Certification, as: 'certifications' }, 'issueDate', 'DESC'],
      ],
    });

    sendSuccess(res, { profile: user }, 'Profile updated.');
  } catch (err) {
    next(err);
  }
};

// ── Experience ────────────────────────────────────────────────────────────────

// POST /api/seekers/profile/experience
export const addExperience = async (req, res, next) => {
  try {
    const { company, title, location, startDate, endDate, isCurrent, description } = req.body;

    const experience = await Experience.create({
      seekerId: req.user.id,
      company,
      title,
      location,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent: Boolean(isCurrent),
      description,
    });

    sendSuccess(res, { experience }, 'Experience added.', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/seekers/profile/experience/:id
export const updateExperience = async (req, res, next) => {
  try {
    const experience = await ownEntry(Experience, req.params.id, req.user.id);
    if (!experience) return sendError(res, 'Experience entry not found.', 404);

    const { company, title, location, startDate, endDate, isCurrent, description } = req.body;

    await experience.update({
      ...(company !== undefined && { company }),
      ...(title !== undefined && { title }),
      ...(location !== undefined && { location }),
      ...(startDate !== undefined && { startDate }),
      ...(isCurrent !== undefined && { isCurrent: Boolean(isCurrent), endDate: isCurrent ? null : endDate }),
      ...(endDate !== undefined && !isCurrent && { endDate }),
      ...(description !== undefined && { description }),
    });

    sendSuccess(res, { experience }, 'Experience updated.');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/seekers/profile/experience/:id
export const deleteExperience = async (req, res, next) => {
  try {
    const experience = await ownEntry(Experience, req.params.id, req.user.id);
    if (!experience) return sendError(res, 'Experience entry not found.', 404);

    await experience.destroy();
    sendSuccess(res, null, 'Experience deleted.');
  } catch (err) {
    next(err);
  }
};

// ── Education ─────────────────────────────────────────────────────────────────

// POST /api/seekers/profile/education
export const addEducation = async (req, res, next) => {
  try {
    const { institution, degree, fieldOfStudy, startDate, endDate, isCurrent, grade, description } = req.body;

    const education = await Education.create({
      seekerId: req.user.id,
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate: isCurrent ? null : endDate,
      isCurrent: Boolean(isCurrent),
      grade,
      description,
    });

    sendSuccess(res, { education }, 'Education added.', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/seekers/profile/education/:id
export const updateEducation = async (req, res, next) => {
  try {
    const education = await ownEntry(Education, req.params.id, req.user.id);
    if (!education) return sendError(res, 'Education entry not found.', 404);

    const { institution, degree, fieldOfStudy, startDate, endDate, isCurrent, grade, description } = req.body;

    await education.update({
      ...(institution !== undefined && { institution }),
      ...(degree !== undefined && { degree }),
      ...(fieldOfStudy !== undefined && { fieldOfStudy }),
      ...(startDate !== undefined && { startDate }),
      ...(isCurrent !== undefined && { isCurrent: Boolean(isCurrent), endDate: isCurrent ? null : endDate }),
      ...(endDate !== undefined && !isCurrent && { endDate }),
      ...(grade !== undefined && { grade }),
      ...(description !== undefined && { description }),
    });

    sendSuccess(res, { education }, 'Education updated.');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/seekers/profile/education/:id
export const deleteEducation = async (req, res, next) => {
  try {
    const education = await ownEntry(Education, req.params.id, req.user.id);
    if (!education) return sendError(res, 'Education entry not found.', 404);

    await education.destroy();
    sendSuccess(res, null, 'Education deleted.');
  } catch (err) {
    next(err);
  }
};

// ── Certifications ────────────────────────────────────────────────────────────

// POST /api/seekers/profile/certifications
export const addCertification = async (req, res, next) => {
  try {
    const { name, issuingOrganization, issueDate, expiryDate, credentialId, credentialUrl } = req.body;

    const certification = await Certification.create({
      seekerId: req.user.id,
      name,
      issuingOrganization,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
    });

    sendSuccess(res, { certification }, 'Certification added.', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/seekers/profile/certifications/:id
export const updateCertification = async (req, res, next) => {
  try {
    const certification = await ownEntry(Certification, req.params.id, req.user.id);
    if (!certification) return sendError(res, 'Certification not found.', 404);

    const { name, issuingOrganization, issueDate, expiryDate, credentialId, credentialUrl } = req.body;

    await certification.update({
      ...(name !== undefined && { name }),
      ...(issuingOrganization !== undefined && { issuingOrganization }),
      ...(issueDate !== undefined && { issueDate }),
      ...(expiryDate !== undefined && { expiryDate }),
      ...(credentialId !== undefined && { credentialId }),
      ...(credentialUrl !== undefined && { credentialUrl }),
    });

    sendSuccess(res, { certification }, 'Certification updated.');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/seekers/profile/certifications/:id
export const deleteCertification = async (req, res, next) => {
  try {
    const certification = await ownEntry(Certification, req.params.id, req.user.id);
    if (!certification) return sendError(res, 'Certification not found.', 404);

    await certification.destroy();
    sendSuccess(res, null, 'Certification deleted.');
  } catch (err) {
    next(err);
  }
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

// GET /api/seekers/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const seekerId = req.user.id;

    const [totalApplications, shortlistedCount, savedJobsCount, seekerProfile] = await Promise.all([
      Application.count({ where: { seekerId } }),
      Application.count({
        where: {
          seekerId,
          atsStage: { [Op.in]: ['screening', 'interview', 'offer', 'hired'] },
        },
      }),
      SavedJob.count({ where: { seekerId } }),
      SeekerProfile.findOne({ where: { userId: seekerId }, attributes: ['profileViews'] }),
    ]);

    sendSuccess(res, {
      stats: {
        totalApplications,
        shortlistedCount,
        savedJobsCount,
        profileViews: seekerProfile?.profileViews ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
