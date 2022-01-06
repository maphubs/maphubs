/* eslint-disable unicorn/prefer-module */
exports.up = function (knex) {
  return knex.raw(`
        INSERT INTO omh.page (page_id, config) VALUES ('footer', '{
  "showPoweredByMapHubs": true,
  "copyrightText": "2022 MapHubs, Inc.",
  "showContactUs": true,
  "links": [
    {
      "name": "Help",
      "href": "https://maphubs.notion.site/MapHubs-Help-8888dfa464f04661afa4cde0057fff37",
      "target": "_blank"
    },
    {
      "name": "About",
      "href": "https://maphubs.com"
    }
  ]
  }')
    `)
}

exports.down = function () {
  return Promise.resolve()
}
