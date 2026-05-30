export default (sequelize, DataTypes) => {
  const SearchLog = sequelize.define(
    'SearchLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      keyword: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true },
      },
      resultCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      searchedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'search_logs',
      timestamps: false,
      underscored: true,
      indexes: [
        { fields: ['keyword', 'searched_at'], name: 'search_logs_keyword_time_idx' },
      ],
    }
  );

  return SearchLog;
};
