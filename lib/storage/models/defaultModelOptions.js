"use strict";

const getDefaultModelOptions = tableName => {
  return {
      timestamps: true,
      paranoid: false,
      underscored: true,
      freezeTableName: true,
      tableName: tableName,
      version: false
  };
};

module.exports = {getDefaultModelOptions};