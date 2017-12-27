var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'sniff'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/sniff-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'sniff'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/sniff-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'sniff'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/sniff-production'
  }
};

module.exports = config[env];
