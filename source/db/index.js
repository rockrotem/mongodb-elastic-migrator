var mongo = require('mongojs');

module.exports = function (config) {
	var collections = config.collections.map(function (c) {
		return c.name;
	});

    var db = mongo(config.mongo.connection, collections);
	return db;
};
