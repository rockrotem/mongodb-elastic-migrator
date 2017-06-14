const { before, after } = require('mocha');
const Promise = require('bluebird');
const rp = require('request-promise');
const dct = require('docker-compose-mocha');


const pathOfDockerCompose = `${__dirname}/docker-compose.yml`;
const getAddressForService = dct.getAddressForService;

const options = {
  healthCheck: {
    state: true,
    options: {
      timeout: 80,
      custom: {
        elastic: Promise.coroutine(function* (address) {
          const url = `http://elastic:changeme@${address}`;
          try {
            yield rp(url);

            return true;
          } catch (ex) {
            return false;
          }
        }),
      },
    },
  },
};

const randomEnvName = dct.dockerComposeTool(before, after, pathOfDockerCompose, options);

before(Promise.coroutine(function* () {
  console.log('Locating the database address..');
  const hosts = yield getAddressForService(randomEnvName, pathOfDockerCompose, 'db', 27017);
  const hostsArray = hosts.split(':');
  process.env.DB_HOSTS = hostsArray[0];
  process.env.PORT = hostsArray[1];
  console.log(`Database is available at ${process.env.DB_HOSTS}:${process.env.PORT}`);
}));
