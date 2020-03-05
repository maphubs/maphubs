// @flow
import React from 'react'
import Formsy from 'formsy-react'
import TextInput from '../components/forms/textInput'
import Header from '../components/header'
import Footer from '../components/footer'
import { Modal, Tooltip, message, notification, Row } from 'antd'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
const { confirm } = Modal
const checkClientError = require('../services/client-error-response').checkClientError

type User = {
  email: string,
  key: string,
  used: boolean,
  invite_email: string,
  display_name?: string,
  id?: number,
  admin?: boolean
}

type Props = {
  locale: string,
  _csrf: string,
  members: Array<User>,
  footerConfig: Object,
  headerConfig: Object,
  user: Object
}

type State = {
  canSubmit: boolean,
  members: Array<User>
} & LocaleStoreState

export default class AdminUserInvite extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  constructor (props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    this.state = {
      members: props.members,
      canSubmit: false
    }
  }

  clipboard: any

  componentDidMount () {
    this.clipboard = require('clipboard-polyfill').default
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  onSubmit = (user: User) => {
    const {t} = this
    const _this = this
    confirm({
      title: t('Confirm Invite'),
      content: t(`Are you sure you want to invite ${user.email}?`),
      okText: t('Send Invite'),
      okType: 'primary',
      onOk () {
        _this.submitInvite(user)
      }
    })
  }

  copyInviteLink = (user: User) => {
    const baseUrl = urlUtil.getBaseUrl()
    const url = `${baseUrl}/signup/invite/${user.key}`
    this.clipboard.writeText(url)
    message.info(this.t('Copied'))
  }

  submitInvite = (user: User) => {
    const {t} = this
    const _this = this
    const email = user.email || user.invite_email
    const closeMessage = message.loading(t('Sending'), 0)
    request.post('/admin/invite/send')
      .type('json').accept('json')
      .send({email, _csrf: this.state._csrf})
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          const key = res.body.key
          closeMessage()
          if (err) {
            notification.error({
              message: t('Failed to Send Invite'),
              description: err,
              duration: 0
            })
          } else {
            message.info(t('Invite Sent'), 3, () => {
              _this.state.members.push({email: user.email, invite_email: user.email, key, used: false})
              _this.setState({members: _this.state.members})
            })
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  resendInvite = (user: User) => {
    const {t} = this
    const key = user.key
    const closeMessage = message.loading(t('Sending'), 0)
    request.post('/admin/invite/resend')
      .type('json').accept('json')
      .send({key, _csrf: this.state._csrf})
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          closeMessage()
          if (err) {
            notification.error({
              message: t('Failed to Resend Invite'),
              description: err,
              duration: 0
            })
          } else {
            message.info(t('Resent Invite'), 3)
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  handleResendInvite = (user: User) => {
    const {t} = this
    const {resendInvite} = this
    confirm({
      title: t('Confirm Resend Email'),
      content: t(`Are you sure you want to resend the invite email for ${user.invite_email}?`),
      okText: t('Send Invite'),
      okType: 'primary',
      onOk () {
        resendInvite(user)
      }
    })
  }

  handleDeauthorize = (user: User) => {
    const {t} = this
    const {submitDeauthorize} = this
    confirm({
      title: t('Confirm Deauthorize'),
      content: t(`Are you sure you want to deauthorize access for ${user.email}?`),
      okText: t('Deauthorize'),
      okType: 'danger',
      onOk () {
        submitDeauthorize(user)
      }
    })
  }

  submitDeauthorize = (user: User) => {
    const {t} = this
    const _this = this
    const closeMessage = message.loading(t('Sending'), 0)
    request.post('/admin/invite/deauthorize')
      .type('json').accept('json')
      .send({
        email: user.email,
        key: user.key,
        _csrf: this.state._csrf
      })
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          closeMessage()
          if (err) {
            notification.error({
              message: t('Failed to Deauthorize'),
              description: err,
              duration: 0
            })
          } else {
            message.info(t('User Removed'), 3)
            const members = []
            _this.state.members.forEach((member) => {
              if (member.key !== user.key) {
                members.push(member)
              }
            })
            _this.setState({members})
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  render () {
    const {t} = this
    const _this = this

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main className='container'>
          <h4 className='center'>{t('Manage Users')}</h4>
          <div className='row valign-wrapper'>
            <div className='col s12 m8 l8 valign' style={{margin: 'auto'}}>
              <Formsy onValidSubmit={this.onSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
                <Row style={{margin: '25px'}}>
                  <TextInput
                    name='email' label={t('Email to Invite')} icon='email'
                    validations={{isEmail: true}} validationErrors={{
                      isEmail: t('Not a valid email address.')
                    }} length={50}
                    required
                  />
                </Row>
                <Row>
                  <div className='valign-wrapper'>
                    <button type='submit' className='valign waves-effect waves-light btn' style={{margin: 'auto'}} disabled={!this.state.canSubmit}>{t('Send Invite')}</button>
                  </div>
                </Row>
              </Formsy>
            </div>

          </div>
          <Row>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Invite Key</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.members.map((member) => {
                  let status = 'Disabled'
                  let icon = 'warning'
                  let color = 'red'
                  if (member.key) {
                    if (member.used) {
                      status = 'Active'
                      icon = 'done'
                      color = 'green'
                    } else {
                      status = 'Invite Sent'
                      icon = 'email'
                      color = 'orange'
                    }
                  }

                  if (member.admin) {
                    status = 'Admin'
                    color = 'purple'
                    icon = 'supervisor_account'
                  }

                  const email = member.email || member.invite_email
                  return (
                    <tr key={member.id}>
                      <td>
                        <Tooltip title={status} placement='bottom'>
                          <i className='material-icons' style={{color}}>{icon}</i>
                        </Tooltip>
                      </td>
                      <td>{member.display_name}</td>
                      <td>{email}</td>
                      <td>{member.key}</td>
                      <td>
                        {(status !== 'Disabled' && status !== 'Admin') &&
                          <>
                            <Tooltip title={t('Resend Invite')} placement='bottom'>
                              <a onClick={() => {
                                _this.handleResendInvite(member)
                              }}
                              >
                                <i className='material-icons' style={{cursor: 'pointer'}}>email</i>
                              </a>
                            </Tooltip>
                            <Tooltip title={t('Copy Invite Link')} placement='bottom'>
                              <a onClick={() => {
                                _this.copyInviteLink(member)
                              }}
                              >
                                <i className='material-icons' style={{cursor: 'pointer'}}>link</i>
                              </a>
                            </Tooltip>
                            <Tooltip title={t('Remove User')} placement='bottom'>
                              <a onClick={() => {
                                _this.handleDeauthorize(member)
                              }}
                              >
                                <i
                                  className='material-icons' style={{
                                    cursor: 'pointer'
                                  }}
                                >delete
                                </i>
                              </a>
                            </Tooltip>
                          </>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Row>
          <Row>
            <p>
              {t('To delete a user please contact support@maphubs.com. Completely deleting a user may require deleting their content or reassigning their content to another user.')}
            </p>
          </Row>
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
