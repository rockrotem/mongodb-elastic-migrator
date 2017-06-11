module.exports = {
	mongo: {
		connection: 'mongodb://localhost:27017/publish-db'
	},

	elastic: {
		host: 'http://localhost:9200',
        httpAuth:'elastic:changeme',
        log: [{
            type: 'stdio',
            levels: ['error', 'warning', 'info']
        }]
	},

	collections: [ {
		name: 'articles',
		index: 'articles',
		type: 'article',
		fields: ['_id', 'title', 'name', 'seo', 'createdDate', 'updatedDate']
	},{
        name: 'authors',
        index: 'authors',
        type: 'author',
        fields: ['_id', 'first_name', 'last_name', 'email', 'title', 'bio']
    }]
};