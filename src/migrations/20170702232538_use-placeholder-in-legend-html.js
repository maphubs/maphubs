
exports.up = function (knex) {
  return knex.raw(`UPDATE omh.layers 
SET legend_html = regexp_replace(legend_html, '<h3>.*?<\\/h3>' , '<h3>{NAME}</h3>')`)
}

exports.down = function () {
  return Promise.resolve()
}
