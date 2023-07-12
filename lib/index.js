'use strict';

const requireIndex = require('requireindex');


module.exports = {
  rules: requireIndex(`${__dirname}/rules`),
  configs: {
    base: require('./configs/base'),
    essential: require('./configs/essential'),
    recommended: require('./configs/recommended'),
  },
};


