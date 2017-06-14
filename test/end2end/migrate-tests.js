require('./../e2e-tools/setup');
const mongoose = require('mongoose');
const { expect } = require('chai');
const { it, describe, before } = require('mocha');
const migrate = require('../../lib/migrate');
const Promise = require('bluebird');

mongoose.Promise = Promise;

function createAuthorsToMongoDB(done) {
  const dbConnection = `mongodb://${process.env.DB_HOSTS}:${process.env.PORT}/publish-db`;
  const db = mongoose.createConnection(`${dbConnection}`);

  const authorModel = db.model('author', new mongoose.Schema({}, { strict: false }));
  authorModel.create([
    { firstName: 'first name', lastName: 'last name' },
    { firstName: 'first name 2', lastName: 'last name 2' },
    { firstName: 'first name 3', lastName: 'last name 3' },
    { firstName: 'second name 1', lastName: 'second last name 1' },
  ]).then(() => {
    done();
  });
}

describe('migrate end to end tests', () => {
  before((done) => {
    createAuthorsToMongoDB(done);
  });

  it('should create migrations from mongodb to elastic', (done) => {
    migrate.finishEvent.on('finish', () => {
      console.log('Wait 2 sec to elastic index readiness');
      setTimeout(() => {
        migrate.elastic.search({
          index: 'authors',
          type: 'author',
          q: 'first',
        }).then((result) => {
          expect(result.hits.hits.length, 'elastic hits contains 3 authors.').to.eql(3);
          done();
        }).catch((err) => {
          console.error('test failed with an error', err);
          done();
        });
      }, 2000);
    });
    migrate.run(migrate.config.collections);
  });
});
