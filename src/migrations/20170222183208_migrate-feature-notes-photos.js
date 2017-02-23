
exports.up = function(knex) {
  return knex.raw(`ALTER TABLE omh.feature_notes RENAME COLUMN osm_id TO mhid;`)
  .then(function(){
    return knex.raw(`UPDATE omh.feature_notes SET mhid= layer_id || ':' || substring(mhid from 2);`)
    .then(function(){
      return knex.raw(`ALTER TABLE omh.feature_photo_attachments RENAME COLUMN osm_id TO mhid;`)
      .then(function(){
        return knex.raw(`UPDATE omh.feature_photo_attachments SET mhid= layer_id || ':' || substring(mhid from 2);`);
      });
    });
  });
};

exports.down = function() {
  
};
