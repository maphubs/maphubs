/* @flow weak */
var log = require('./log.js');

// Module to split an array into nested arrays,
// each containing n items of the original array where n = interval.
module.exports = function(array: Array<number>, interval: number) {
  interval = interval || 5000;
  var count: number = array.length;
  if (count === 0) {
    return [];
  }
  var chunks = count < interval ? [array] : Array.apply(null, {length: Math.ceil(count/interval)})
    .map(function(d, i) {
      var start: number = i * interval,
        end: number = start + interval > count ? count : start + interval;
      return array.slice(start, end);
    });
  log.info(count, 'entities divided into', chunks.length, 'chunks');
  return chunks;
};
