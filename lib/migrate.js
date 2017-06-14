const _ = require('underscore');
const moment = require('moment');
const async = require('async');
const config = require('../config');
const db = require('./db')(config);
const elastic = require('./elastic')(config);
const through = require('through');
const single = require('single-line-log');
require('colors');
const EventEmitter = require('events');

class FinishEvent extends EventEmitter {}
const finishEvent = new FinishEvent();

function format(duration) {
  return `${duration.hours()}:${duration.minutes()}:${duration.seconds()}:${duration.milliseconds()}`;
}

function exportCollection(desc, callback) {
  const collection = db[desc.name];
  const query = desc.query || {};

  if (!collection) {
    return callback(`collection ${desc.name} does not exist.`);
  }

  console.log((`====> exporting collection [${desc.name}]`).bold.white);

  const started = moment();

  return async.waterfall([
    function (next) {
      console.log('----> checking connection to elastic');
      elastic.ping({ requestTimeout: 1000 }, (err) => {
        next(err);
      });
    },
    function (next) {
      console.log(`----> dropping existing index [${desc.index}]`);
      elastic.indices.delete({ index: desc.index }, (err) => {
        const indexMissing = err && err.message.indexOf('index_not_found') > 0;
        next(indexMissing ? null : err);
      });
    },
    function (next) {
      console.log(`----> creating new index [${desc.index}]`);
      elastic.indices.create({ index: desc.index }, (err) => {
        next(err);
      });
    },
    function (next) {
      console.log('----> initialize index mapping');

      if (!desc.mappings) {
        return next();
      }

      return elastic.indices
        .putMapping({ index: desc.index, type: desc.type, body: desc.mappings },
          (err) => {
            next(err);
          });
    },
    function (next) {
      console.log(`----> analizing collection [${desc.name}]`);
      collection.count(query, (err, total) => {
        if (err) {
          return next(err);
        }

        console.log(`----> find ${total} documentents to export`);
        return next(null, total);
      });
    },
    function (total, next) {
      console.log('----> streaming collection to elastic');

      const takeFields = through(function (item) {
        let currItem;
        if (desc.fields) {
          currItem = _.pick(item, desc.fields);
        }

        this.queue(currItem);
      });

      const postToElastic = through(function (item) {
        const currItem = item;
        const me = this;
        me.pause();

        /* eslint no-underscore-dangle: 0 */
        const id = currItem._id.toString();
        delete currItem._id;

        elastic.create({
          index: desc.index,
          type: desc.type,
          id,
          body: item,
        }, (err) => {
          if (err) {
            console.error(('failed to create document in elastic.').bold.red);
            return next(err);
          }

          me.queue(item);
          me.resume();
          return null;
        });
      });

      const progress = function () {
        let count = 0;
        return through(() => {
          /* eslint no-plusplus:0 */
          const percentage = Math.floor((100 * ++count) / total);
          single((`------> processed ${count} documents [${percentage}%]`).magenta);
        });
      };

      const stream = collection
        .find(query)
        .sort({ _id: 1 })
        .pipe(takeFields)
        .pipe(postToElastic)
        .pipe(progress());

      stream.on('end', (err) => {
        next(err, total);
      });
    },
  ], (err) => {
    if (err) {
      console.error((`====> collection [${desc.name}] - failed to export.\n`).bold.red);
      console.error(err);
      return callback(err);
    }

    const duration = moment.duration(moment().diff(started));

    console.log((`====> collection [${desc.name}] - exported successfully.`).green);
    console.log((`====> time elapsed ${format(duration)}\n`).green);

    return callback(null);
  });
}

function close() {
  // function closeConn(conn, callback) {
    // conn.close(callback);
  // }

  // async.each([db, elastic], closeConn);
  finishEvent.emit('finish');
}

function exporter(collections) {
  const exports = collections.map(c => function (callback) {
    exportCollection(c, callback);
  });

  async.series(exports, close);
}

module.exports = {
  run: exporter,
  finishEvent,
  elastic,
  config,
};
