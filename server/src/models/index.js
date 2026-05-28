import { Sequelize, DataTypes } from 'sequelize';
import { dbConfig } from '../config/database.js';
import defineUser from './User.js';
import defineCompany from './Company.js';
import defineJob from './Job.js';
import defineApplication from './Application.js';

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

export const User = defineUser(sequelize, DataTypes);
export const Company = defineCompany(sequelize, DataTypes);
export const Job = defineJob(sequelize, DataTypes);
export const Application = defineApplication(sequelize, DataTypes);

const models = { User, Company, Job, Application };

// Run model associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

export default models;
