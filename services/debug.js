/* @flow weak */
var debug = require('debug');

module.exports = function(name){
  return debug("maphubs:"+name);
};
