
exports.up = function(knex, Promise) {
  return  knex.raw(`
        INSERT INTO omh.page (page_id, config) VALUES ('footer', '{
  "showPoweredByMapHubs": true,
  "showMapForEnvironmentMoabiLogo": false,
  "copyrightText": "2017 MapHubs, Inc.",
  "showContactUs": true,
  "links": [
    {
      "name": "Help",
      "href": "http://help.maphubs.com",
      "target": "_blank"
    },
    {
      "name": "About",
      "href": "https://maphubs.com"
    },
    {
      "name": "Journalists",
      "href": "/journalists"
    },
    {
      "name": "Terms",
      "href": "/terms"
    },
    {
      "name": "Privacy",
      "href": "/privacy"
    }
  ]
  }')
    `);
};

exports.down = function(knex, Promise) {
  
};
