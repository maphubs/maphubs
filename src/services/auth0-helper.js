var local = require('../local');
var Promise = require("bluebird");
var request = require("request");
Promise.promisifyAll(require("request"));

module.exports = {

  getManagementToken(){
    
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

    return request.getAsync(options)
    .then((error, response, body) => {
      return body.access_token;
    });
  },

  updateAppMetadata(data, token, profile){
    var options = { 
        method: 'PATCH',
        url: `https://${local.AUTH0_DOMAIN}/api/v2/users/${profile.id}`,
        headers: { 
          'content-type': 'application/json',
          authorization: 'Bearer ' +  token
        },
        body: {app_metadata: data},
        json: true
      };
    return request.getAsync(options);
  }

};