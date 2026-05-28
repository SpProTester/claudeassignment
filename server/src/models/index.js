import { Sequelize, DataTypes } from 'sequelize';
import { dbConfig } from '../config/database.js';
import defineUser from './User.js';
import defineSeekerProfile from './SeekerProfile.js';
import defineEmployerProfile from './EmployerProfile.js';
import defineJobListing from './JobListing.js';
import defineResume from './Resume.js';
import defineApplication from './Application.js';
import defineSkill from './Skill.js';
import defineJobSkill from './JobSkill.js';
import defineSeekerSkill from './SeekerSkill.js';
import defineSavedJob from './SavedJob.js';
import defineJobAlert from './JobAlert.js';
import defineNotification from './Notification.js';

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
  }
);

// Define all models — Resume before Application (resumeId FK)
export const User = defineUser(sequelize, DataTypes);
export const SeekerProfile = defineSeekerProfile(sequelize, DataTypes);
export const EmployerProfile = defineEmployerProfile(sequelize, DataTypes);
export const JobListing = defineJobListing(sequelize, DataTypes);
export const Resume = defineResume(sequelize, DataTypes);
export const Application = defineApplication(sequelize, DataTypes);
export const Skill = defineSkill(sequelize, DataTypes);
export const JobSkill = defineJobSkill(sequelize, DataTypes);
export const SeekerSkill = defineSeekerSkill(sequelize, DataTypes);
export const SavedJob = defineSavedJob(sequelize, DataTypes);
export const JobAlert = defineJobAlert(sequelize, DataTypes);
export const Notification = defineNotification(sequelize, DataTypes);

const models = {
  User,
  SeekerProfile,
  EmployerProfile,
  JobListing,
  Resume,
  Application,
  Skill,
  JobSkill,
  SeekerSkill,
  SavedJob,
  JobAlert,
  Notification,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

export default models;
