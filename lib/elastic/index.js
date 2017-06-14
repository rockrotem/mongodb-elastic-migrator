const elasticsearch = require('elasticsearch');

module.exports = function (config) {
  const client = new elasticsearch.Client(config.elastic);

  return client;
};
