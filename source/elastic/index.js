var elasticsearch = require('elasticsearch');

module.exports = function (config) {
    var client = new elasticsearch.Client(config.elastic);

	return client;
};