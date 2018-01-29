// @flow
const Group = require('../../models/group')
const User = require('../../models/user')
const Layer = require('../../models/layer')
const Image = require('../../models/image')
const Account = require('../../models/account')
const Email = require('../../services/email-util')
const debug = require('../../services/debug')('routes/groups')
const apiError = require('../../services/error-response').apiError
const apiDataError = require('../../services/error-response').apiDataError
const local = require('../../local')
const Locales = require('../../services/locales')
const csrfProtection = require('csurf')({cookie: false})
const isAuthenticated = require('../../services/auth-check')

module.exports = function (app: any) {
  // API Endpoints
  app.post('/api/group/checkidavailable', isAuthenticated, async (req, res) => {
    try {
      if (req.body && req.body.id) {
        return res.send({
          available: await Group.checkGroupIdAvailable(req.body.id)
        })
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.get('/api/groups/search/suggestions', (req, res) => {
    if (!req.query.q) {
      apiDataError(res)
    }
    const q = req.query.q
    Group.getSearchSuggestions(q)
      .then((result) => {
        const suggestions = []
        result.forEach((group) => {
          const name = Locales.getLocaleStringObject(req.locale, group.name)
          suggestions.push({key: group.group_id, value: name})
        })
        return res.send({
          suggestions
        })
      }).catch(apiError(res, 200))
  })

  app.get('/api/groups/search', async (req, res) => {
    try {
      if (!req.query.q) {
        apiDataError(res)
      } else {
        return res.status(200).send({
          groups: await Group.getSearchResults(req.query.q)
        })
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/create', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.group_id) {
        const result = await Group.createGroup(data.group_id, data.name, data.description, data.location, data.published, req.user_id)
        if (result) {
          return res.send({
            success: true
          })
        } else {
          return res.send({
            success: false,
            error: 'Failed to Create Group'
          })
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/account/status', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.group_id) {
        if (await Group.allowedToModify(data.group_id, req.user_id)) {
          return res.status(200).send({
            status: await Account.getStatus(data.group_id)
          })
        } else {
          return res.status(401).send()
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/save', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.group_id) {
        if (await Group.allowedToModify(data.group_id, req.user_id)) {
          const result = await Group.updateGroup(data.group_id, data.name, data.description, data.location, data.published)
          if (result && result === 1) {
            return res.send({
              success: true
            })
          } else {
            return res.send({
              success: false,
              error: 'Failed to Save Group'
            })
          }
        } else {
          return res.status(401).send()
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/delete', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.group_id) {
        if (await Group.isGroupAdmin(data.group_id, req.user_id)) {
          const layers = await Layer.getGroupLayers(data.group_id, true)
          if (layers && layers.length > 0) {
            return res.status(200).send({
              success: false,
              error: 'Group has layers: You must first delete all the layers in this group'
            })
          } else {
            const result = await Group.deleteGroup(data.group_id)
            if (result) {
              return res.status(200).send({
                success: true
              })
            } else {
              return res.status(200).send({
                success: false,
                error: 'Failed to Delete Group'
              })
            }
          }
        } else {
          return res.status(401).send()
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/setphoto', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.group_id && data.image) {
        if (await Group.allowedToModify(data.group_id, req.user_id)) {
          await Image.setGroupImage(data.group_id, data.image, data.info)
          return res.status(200).send({success: true})
        } else {
          return res.status(401).send()
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/:id/members', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const group_id = req.params.id
      if (await Group.allowedToModify(group_id, req.user_id)) {
        return res.status(200).send({
          success: true,
          members: await Group.getGroupMembers(group_id)
        })
      } else {
        return res.status(401).send()
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/addmember', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body

      if (data && data.group_id && data.display_name && data.asAdmin !== undefined) {
        const user = await User.getUserByName(data.display_name)
        if (user) {
          if (await Group.allowedToModify(data.group_id, req.user_id)) {
            let role = 'Member'
            if (data.asAdmin) {
              role = 'Administrator'
            }
            const members = await Group.getGroupMembers(data.group_id)
            let alreadyInGroup = false
            members.forEach((member) => {
              if (member.id === user.id) {
                alreadyInGroup = true
              }
            })
            if (!alreadyInGroup) {
              await Group.addGroupMember(data.group_id, user.id, role)
              debug.log('Added ' + data.display_name + ' to ' + data.group_id)
              Email.send({
                from: MAPHUBS_CONFIG.productName + ' <info@maphub.com>',
                to: user.email,
                subject: req.__('Welcome to Group:') + ' ' + data.group_id + ' - ' + MAPHUBS_CONFIG.productName,
                text: user.display_name + ',\n' +
                req.__('You have been added to the group') + ' ' + data.group_id,
                html: user.display_name + ',<br />' +
                req.__('You have been added to the group') + ' ' + data.group_id
              })
              return res.status(200).send({success: true})
            } else {
              return res.status(200).send({success: false, 'error': req.__('User is already a member of this group.')})
            }
          } else {
            return res.status(401).send()
          }
        } else {
          res.status(200).send({
            success: false,
            error: 'User not found'
          })
          return
        }
      } else {
        apiDataError(res)
        return
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/updatememberrole', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.group_id && data.user_id && data.role) {
        const user = await User.getUser(data.user_id)
        if (await Group.allowedToModify(data.group_id, req.user_id)) {
          await Group.updateGroupMemberRole(data.group_id, user.id, data.role)
          debug.log(`Added role ${data.role} to ${data.display_name} of ${data.group_id}`)
          return res.status(200).send({success: true})
        } else {
          return res.status(401).send()
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })

  app.post('/api/group/removemember', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const data = req.body
      if (data && data.group_id && data.user_id) {
        const user = await User.getUser(data.user_id)
        // TODO: wrap in transaction
        if (await Group.isGroupAdmin(data.group_id, req.user_id)) {
          // don't allow removal of last admin
          const result = await Group.getGroupMembersByRole(data.group_id, 'Administrator')
          if (result && result.length === 1 && result[0].user_id === req.user_id) {
            // last admin
            debug.log('Attempted to delete last admin ' + data.display_name + ' from ' + data.group_id)
            throw new Error('Unable to delete only administrator from the group. Please assign another admin first.')
          } else {
            await Group.removeGroupMember(data.group_id, user.id)
            debug.log('Removed ' + data.display_name + ' from ' + data.group_id)
            Email.send({
              from: MAPHUBS_CONFIG.productName + ' <' + local.fromEmail + '>',
              to: user.email,
              subject: req.__('Removed from Group:') + ' ' + data.group_id + ' - ' + MAPHUBS_CONFIG.productName,
              text: user.display_name + ',\n' +
                  req.__('You have been removed from the group') + ' ' + data.group_id + '\n',
              html: user.display_name + ',' +
                  '<br />' + req.__('You have been removed from the group') + ' ' + data.group_id + '\n'
            })
            return res.status(200).send({success: true})
          }
        } else {
          return res.status(401).send()
        }
      } else {
        apiDataError(res)
      }
    } catch (err) { apiError(res, 200)(err) }
  })
}
