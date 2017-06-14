module.exports = {
  mongo: {
    connection: 'mongodb://localhost:9300/publish-db',
  },

  elastic: {
    host: 'http://localhost:9200',
    httpAuth: 'elastic:changeme',
    log: [{
      type: 'stdio',
      levels: ['error', 'warning', 'info'],
    }],
  },

  collections: [{
    name: 'authors',
    index: 'authors',
    type: 'author',
    fields: ['_id', 'firstName', 'lastName'],
  }],
};
