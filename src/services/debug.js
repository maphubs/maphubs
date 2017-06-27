var debug = require('debug');

module.exports = function(name){
  let log = debug(`maphubs:${name}`);
  let error = debug(`maphubs-error:${name}`);

  //log goes to stdout
  /*eslint-disable no-console */
  log.log = console.log.bind(console);

  return {log, error};
};
