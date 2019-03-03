'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Transcription = loader.database.define('transcription', {
  transcriptionId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  transcriptionName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdBy: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      fields: ['createdBy']
    }
  ]
});

module.exports = Transcription;