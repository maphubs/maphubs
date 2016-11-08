var styles = require('../components/Map/styles');

exports.up = function(knex, Promise) {
  return Promise.all([
      knex.raw(`UPDATE omh.layers SET settings='`+ JSON.stringify(styles.defaultSettings()) + `' where settings IS NULL`)
  ]);
};

exports.down = function(knex, Promise) {

};
