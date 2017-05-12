var local = require('../local');

module.exports = {

  getManagementToken(cb){
    var request = require("request");

    var options = {
      method: 'POST',
      url: `https://${local.AUTH0_DOMAIN}/oauth/token`,
      headers: {'content-type': 'application/json'},
      body: 
      { 
        grant_type: 'client_credentials',
        client_id: local.AUTH0_CLIENT_ID,
        client_secret: local.AUTH0_CLIENT_SECRET,
        audience: `https://${local.AUTH0_DOMAIN}/api/v2/`
      },
      json: true 
    };

    request(options, (error, response, body) => {
      if (error){
        cb(error, null);
      }
      cb(null, body.access_token);
    });
  }
};