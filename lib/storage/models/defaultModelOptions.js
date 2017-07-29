"use strict";

const getDefaultModelOptions = tableName => {
  return {
      timestamps: false,
      paranoid: false,
      underscored: true,
      freezeTableName: true,
      tableName: tableName,
      version: false
  };
};

module.exports = {getDefaultModelOptions};