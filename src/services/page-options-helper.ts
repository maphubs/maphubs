import { v4 as uuidv4 } from 'uuid'

var jwt = require('jsonwebtoken')

const log = require('@bit/kriscarle.maphubs-utils.maphubs-utils.log')

const Page = require('../models/page')

const User = require('../models/user')

const Group = require('../models/group')

const Admin = require('../models/admin')

const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')

const version = require('../../version.json').version

const config = require('../local')

module.exports = async (req, options) => {
  let locale = 'en'

  if (req) {
    // var browserLocale = req.acceptsLanguages('en', 'fr', 'es', 'it');
    if (req.session && req.session.locale) {
      // the user has specified a language from the options on the website
      locale = req.session.locale
      req.setLocale(locale)
    } else {
      // use local from i18n parsing of http accept-language
      locale = req.locale
    }

    if (req.csrfToken) {
      options.props._csrf = req.csrfToken()
    }
  } else {
    console.error('req object not found when rendering view')
  }

  options.props.locale = locale
  // include version number in all pages for debugging
  options.props.version = version

  if (!options.props.error) {
    // don't hit the database on error and 404 pages
    try {
      const pageConfigs = await Page.getPageConfigs(['footer', 'header', 'map'])
      options.props.headerConfig = pageConfigs.header
      options.props.footerConfig = pageConfigs.footer
      options.props.mapConfig = pageConfigs.map
    } catch (err) {
      log.error('Error loading page config')
      console.error(err)
    }

    try {
      if (
        req &&
        req.session &&
        req.session.user &&
        req.session.user.maphubsUser
      ) {
        const user_id = req.session.user.maphubsUser.id
        const user = await User.getUser(user_id)

        // add session content
        if (req.session.user && req.session.user._json) {
          user.username =
            req.session.user._json.username ||
            req.session.user.username ||
            user.display_name
          user.picture = req.session.user._json.picture
        }

        const groups = await Group.getGroupsForUser(user_id)
        user.groups = groups
        const admin = await Admin.checkAdmin(user_id)
        user.admin = admin

        // add Coral Talk jwt
        if (config.CORAL_TALK_SECRET) {
          let email = req.user['https://users.maphubs.com/email'] || user.email
          if (user.username === 'maphubs') email = 'info@maphubs.com'
          const token = jwt.sign(
            {
              user: {
                id: req.session.user.sub || user_id,
                email,
                username: user.username
              }
            },
            config.CORAL_TALK_SECRET,
            {
              jwtid: uuidv4(),
              expiresIn: '24h'
            }
          )
          user.coral_jwt = token
        }

        options.props.user = user
      }
    } catch (err) {
      log.error('Error adding user session content')
      log.error(err)
      // TODO: capture Sentry Error
    }

    options.baseUrl = urlUtil.getBaseUrl()

    if (req && req.url) {
      options.reqUrl = req.url
    }
  }

  return options
}
