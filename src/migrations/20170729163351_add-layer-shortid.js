var shortid = require('shortid');
exports.up = function(knex, Promise) {
  return knex.raw(`ALTER TABLE omh.layers ADD COLUMN shortid text;`)
  .then(() => {
    return knex.select('layer_id').from('omh.layers').then(layers => {
      return Promise.map(layers, layer => {
        return knex('omh.layers').update({shortid: shortid.generate()}).where({layer_id: layer.layer_id});
      });
    });
  });
};

exports.down = function(knex) {
  return  knex.raw(`ALTER TABLE omh.layers DROP COLUMN shortid;`);
};