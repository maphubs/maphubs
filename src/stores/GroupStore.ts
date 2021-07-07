import Reflux from 'reflux'
import Actions from '../actions/GroupActions'
import request from 'superagent'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { checkClientError } from '../services/client-error-response'
import { LocalizedString } from '../types/LocalizedString'

const debug = DebugService('stores/group-store')

export type Group = {
  group_id?: string
  name?: LocalizedString
  description?: LocalizedString
  location?: string
  created?: boolean
  hasImage?: boolean
  unofficial?: boolean
  published?: boolean
}
export type GroupStoreState = {
  group: Group
  members: Array<Record<string, any>>
  layers?: Array<Record<string, any>>
}
export default class GroupStore extends Reflux.Store {
  state: GroupStoreState
  setState: any
  trigger: any
  listenables: any
  constructor() {
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

  reset(): void {
    this.setState({
      group: {},
      members: [],
      layers: []
    })
  }

  storeDidUpdate(): void {
    debug.log('store updated')
  }

  // listeners
  loadGroup(group: Record<string, any>): void {
    debug.log('load group')
    this.setState({
      group
    })
  }

  loadMembers(members: Array<Record<string, any>>): void {
    debug.log('load members')
    this.setState({
      members
    })
  }

  createGroup(
    group_id: string,
    name: string,
    description: string,
    location: string,
    published: boolean,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    debug.log('create group')

    const _this = this

    request
      .post('/api/group/create')
      .type('json')
      .accept('json')
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

          _this.setState({
            group
          })

          _this.trigger(_this.state)

          cb()
        })
      })
  }

  updateGroup(
    group_id: string,
    name: string,
    description: string,
    location: string,
    published: boolean,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    debug.log('update group')

    const _this = this

    request
      .post('/api/group/save')
      .type('json')
      .accept('json')
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

          _this.setState({
            group
          })

          _this.trigger(_this.state)

          cb()
        })
      })
  }

  deleteGroup(_csrf: string, cb: (...args: Array<any>) => any): void {
    debug.log('delete group')
    request
      .post('/api/group/delete')
      .type('json')
      .accept('json')
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

  setGroupImage(
    data: Record<string, any>,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    debug.log('set group image')

    const _this = this

    request
      .post('/api/group/setphoto')
      .type('json')
      .accept('json')
      .send({
        group_id: this.state.group.group_id,
        image: data,
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          const group = _this.state.group
          group.hasImage = true

          _this.setState({
            group
          })

          _this.trigger(_this.state)

          cb()
        })
      })
  }

  addMember(
    display_name: string,
    asAdmin: boolean,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    debug.log('add member')

    const _this = this

    request
      .post('/api/group/addmember')
      .type('json')
      .accept('json')
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

  removeMember(
    user_id: number,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    debug.log('remove member')

    const _this = this

    request
      .post('/api/group/removemember')
      .type('json')
      .accept('json')
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

  setMemberAdmin(
    user_id: number,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    debug.log('set member admin')

    const _this = this

    request
      .post('/api/group/updatememberrole')
      .type('json')
      .accept('json')
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

  removeMemberAdmin(
    user_id: number,
    _csrf: string,
    cb: (...args: Array<any>) => any
  ): void {
    debug.log('remove member admin')

    const _this = this

    request
      .post('/api/group/updatememberrole')
      .type('json')
      .accept('json')
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

  reloadMembers(_csrf: string, cb: (...args: Array<any>) => any): void {
    debug.log('reload members')

    const { state, loadMembers } = this

    const group_id = state.group.group_id || ''
    request
      .post('/api/group/' + group_id + '/members')
      .type('json')
      .accept('json')
      .send({
        _csrf
      })
      .end((err, res) => {
        checkClientError(res, err, cb, (cb) => {
          loadMembers(res.body.members)

          cb()
        })
      })
  }
}
