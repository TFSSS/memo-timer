'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Memo = loader.database.define('memo', {
  candidateId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  transcriptionId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  content : {
    type: Sequelize.STRING,
    allowNull: false
  },
  time: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      fields: ['transcriptionId']
    }
  ]
});

module.exports = Memo;