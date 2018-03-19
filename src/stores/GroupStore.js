// @flow
import Reflux from 'reflux'
import Actions from '../actions/GroupActions'
const request = require('superagent')
const debug = require('../services/debug')('stores/group-store')
const checkClientError = require('../services/client-error-response').checkClientError

export type Group = {
  group_id?: string,
  name?: LocalizedString,
  description?: LocalizedString,
  location?: string,
  created?: boolean,
  hasImage?: boolean,
  unofficial?: boolean,
  published?: boolean
}

export type GroupStoreState = {
  group: Group,
  members: Array<Object>,
  layers?: Array<Object>
}

export default class GroupStore extends Reflux.Store {
  state: GroupStoreState

  constructor () {
    super()
    this.state = {
      group: {
        group_id: ''
      },
      members: [],
      layers: []
    }
    this.listenables = Actions
  }

  reset () {
    this.setState({
      group: {},
      members: [],
      layers: []
    })
  }

  storeDidUpdate () {
    debug.log('store updated')
  }

  // listeners

  loadGroup (group: Object) {
    debug.log('load group')
    this.setState({group})
  }

  loadMembers (members: Array<Object>) {
    debug.log('load members')
    this.setState({members})
  }

  createGroup (group_id: string, name: string, description: string, location: string, published: boolean, _csrf: string, cb: Function) {
    debug.log('create group')
    const _this = this

    request.post('/api/group/create')
      .type('json').accept('json')
      .send({
        group_id,
        name,
        description,
        location,
        published,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          const group = {
            group_id,
            name,
            description,
            location,
            published,
            created: true,
            hasImage: false
          }
          _this.setState({group})
          _this.trigger(_this.state)
          cb()
        })
      })
  }

  updateGroup (group_id: string, name: string, description: string, location: string, published: boolean, _csrf: string, cb: Function) {
    debug.log('update group')
    const _this = this
    request.post('/api/group/save')
      .type('json').accept('json')
      .send({
        group_id,
        name,
        description,
        location,
        published,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          const group = {
            group_id,
            name,
            description,
            location,
            published,
            created: true
          }
          _this.setState({group})
          _this.trigger(_this.state)
          cb()
        })
      })
  }

  deleteGroup (_csrf: string, cb: Function) {
    debug.log('delete group')
    request.post('/api/group/delete')
      .type('json').accept('json')
      .send({
        group_id: this.state.group.group_id,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          // don't trigger updates, the view will redirect to another page
          cb()
        })
      })
  }

  setGroupImage (data: Object, _csrf: string, cb: Function) {
    debug.log('set group image')
    const _this = this

    request.post('/api/group/setphoto')
      .type('json').accept('json')
      .send({
        group_id: this.state.group.group_id,
        image: data,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          const group = _this.state.group
          group.hasImage = true
          _this.setState({group})
          _this.trigger(_this.state)
          cb()
        })
      })
  }

  addMember (display_name: string, asAdmin: boolean, _csrf: string, cb: Function) {
    debug.log('add member')
    const _this = this
    request.post('/api/group/addmember')
      .type('json').accept('json')
      .send({
        group_id: this.state.group.group_id,
        display_name,
        asAdmin,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.reloadMembers(_csrf, cb)
        })
      })
  }

  removeMember (user_id: number, _csrf: string, cb: Function) {
    debug.log('remove member')
    const _this = this
    request.post('/api/group/removemember')
      .type('json').accept('json')
      .send({
        group_id: this.state.group.group_id,
        user_id,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.reloadMembers(_csrf, cb)
        })
      })
  }

  setMemberAdmin (user_id: number, _csrf: string, cb: Function) {
    debug.log('set member admin')
    const _this = this
    request.post('/api/group/updatememberrole')
      .type('json').accept('json')
      .send({
        group_id: this.state.group.group_id,
        user_id,
        role: 'Administrator',
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.reloadMembers(_csrf, cb)
        })
      })
  }

  removeMemberAdmin (user_id: number, _csrf: string, cb: Function) {
    debug.log('remove member admin')
    const _this = this
    request.post('/api/group/updatememberrole')
      .type('json').accept('json')
      .send({
        group_id: this.state.group.group_id,
        user_id,
        role: 'Member',
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.reloadMembers(_csrf, cb)
        })
      })
  }

  reloadMembers (_csrf: string, cb: Function) {
    debug.log('reload members')
    const _this = this
    const group_id = this.state.group.group_id ? this.state.group.group_id : ''
    request.post('/api/group/' + group_id + '/members')
      .type('json').accept('json')
      .send({_csrf})
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          _this.loadMembers(res.body.members)
          cb()
        })
      })
  }
}
