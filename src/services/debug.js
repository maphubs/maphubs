const debug = require('debug');

module.exports = function(name){
  const log = debug(`maphubs:${name}`);
  const error = debug(`maphubs-error:${name}`);

  //log goes to stdout
  /*eslint-disable no-console */
  log.log = console.log.bind(console);

  return {log, error, info: log};
};
