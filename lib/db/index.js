const mongo = require('mongojs');

module.exports = function (config) {
  const collections = config.collections.map(c => c.name);

  const db = mongo(config.mongo.connection, collections);
  return db;
};
