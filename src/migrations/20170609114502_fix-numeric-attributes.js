var layerViews = require('../services/layer-views')
exports.up = function (knex) {
  return Promise.all([
    knex.raw(`
CREATE OR REPLACE FUNCTION isnumeric(text) RETURNS BOOLEAN AS $$
DECLARE x NUMERIC;
BEGIN
    x = $1::NUMERIC;
    RETURN TRUE;
EXCEPTION WHEN others THEN
    RETURN FALSE;
END;
$$
STRICT
LANGUAGE plpgsql IMMUTABLE;
    `),
    knex('omh.layers')
      .select('layer_id', 'presets', 'data_type')
      .where({status: 'published', is_external: false, remote: false})
      .then((layers) => {
        var commands = []
        layers.forEach((layer) => {
          var layer_id = layer.layer_id
          commands.push(
            layerViews.replaceViews(layer_id, layer.presets, knex)
          )
        })
        return Promise.all(commands)
      })
  ])
}

exports.down = function () {
  return Promise.resolve()
}
