const local = require('../local')

const request = require('request-promise')

const urlencode = require('urlencode')

module.exports = {
  async getManagementToken() {
    const options = {
      method: 'POST',
      url: `https://${local.AUTH0_DOMAIN}/oauth/token`,
      headers: {
        'content-type': 'application/json'
      },
      body: {
        grant_type: 'client_credentials',
        client_id: local.AUTH0_CLIENT_ID,
        client_secret: local.AUTH0_CLIENT_SECRET,
        audience: `https://${local.AUTH0_DOMAIN}/api/v2/`
      },
      json: true
    }
    const response = await request(options)
    return response.access_token
  },

  updateAppMetadata(data, token, profile) {
    const options = {
      method: 'PATCH',
      url: `https://${local.AUTH0_DOMAIN}/api/v2/users/${profile.id}`,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token
      },
      body: {
        app_metadata: data
      },
      json: true
    }
    return request(options)
  },

  findUserByEmail(email, token) {
    const options = {
      method: 'GET',
      url: `https://${
        local.AUTH0_DOMAIN
      }/api/v2/users-by-email?email=${urlencode(email)}`,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token
      },
      json: true
    }
    return request(options)
  }
}