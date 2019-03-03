'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/memo_timer',
  {
    operatorsAliases: false
});

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
}