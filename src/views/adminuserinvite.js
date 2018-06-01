// @flow
import React from 'react'
import Formsy from 'formsy-react'
import TextInput from '../components/forms/textInput'
import Header from '../components/header'
import Footer from '../components/footer'
import ConfirmationActions from '../actions/ConfirmationActions'
import NotificationActions from '../actions/NotificationActions'
import Progress from '../components/Progress'
import MessageActions from '../actions/MessageActions'
import request from 'superagent'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import {Tooltip} from 'react-tippy'

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
  saving: boolean,
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
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    this.state = {
      members: this.props.members,
      canSubmit: false,
      saving: false
    }
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
    const _this = this
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm Invite'),
      postitiveButtonText: this.__('Send Invite'),
      negativeButtonText: this.__('Cancel'),
      message: this.__(`Are you sure you want to invite ${user.email}?`),
      onPositiveResponse () {
        _this.submitInvite(user)
      }
    })
  }

  submitInvite = (user: User) => {
    const _this = this
    this.setState({saving: true})
    request.post('/admin/invite/send')
      .type('json').accept('json')
      .send({email: user.email, _csrf: this.state._csrf})
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          const key = res.body.key
          _this.setState({saving: false})
          if (err) {
            MessageActions.showMessage({title: _this.__('Failed to Send Invite'), message: err})
          } else {
            NotificationActions.showNotification(
              {
                message: _this.__('Invite Sent'),
                position: 'topright',
                dismissAfter: 3000,
                onDismiss () {
                  _this.state.members.push({email: user.email, invite_email: user.email, key, used: false})
                  _this.setState({members: _this.state.members})
                }
              })
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  handleResendInvite = (user: User) => {
    const {submitInvite} = this
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm Resend Email'),
      postitiveButtonText: this.__('Send Invite'),
      negativeButtonText: this.__('Cancel'),
      message: this.__(`Are you sure you want to resend the invite email for ${user.email}?`),
      onPositiveResponse () {
        submitInvite(user)
      }
    })
  }

  handleDeauthorize = (user: User) => {
    const {submitDeauthorize} = this
    ConfirmationActions.showConfirmation({
      title: this.__('Confirm Deauthorize'),
      postitiveButtonText: this.__('Deauthorize'),
      negativeButtonText: this.__('Cancel'),
      message: this.__(`Are you sure you want to deauthorize access for ${user.email}?`),
      onPositiveResponse () {
        submitDeauthorize(user)
      }
    })
  }

  submitDeauthorize = (user: User) => {
    const _this = this
    this.setState({saving: true})
    request.post('/admin/invite/deauthorize')
      .type('json').accept('json')
      .send({
        email: user.email,
        key: user.key,
        _csrf: this.state._csrf
      })
      .end((err, res) => {
        checkClientError(res, err, (err) => {
          _this.setState({saving: false})
          if (err) {
            MessageActions.showMessage({title: _this.__('Failed to Send Invite'), message: err})
          } else {
            NotificationActions.showNotification(
              {
                message: _this.__('User Removed'),
                position: 'topright',
                dismissAfter: 3000,
                onDismiss () {
                  const members = []
                  _this.state.members.forEach((member) => {
                    if (member.key !== user.key) {
                      members.push(member)
                    }
                  })
                  _this.setState({members})
                }
              })
          }
        },
        (cb) => {
          cb()
        })
      })
  }

  render () {
    const _this = this

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main className='container'>
          <h4 className='center'>{this.__('Manage Users')}</h4>
          <div className='row valign-wrapper'>
            <div className='col s12 m8 l8 valign' style={{margin: 'auto'}}>
              <Formsy onValidSubmit={this.onSubmit} onValid={this.enableButton} onInvalid={this.disableButton}>
                <div className='row' style={{margin: '25px'}}>
                  <TextInput name='email' label={this.__('Email to Invite')} icon='email' className='col s12'
                    validations={{isEmail: true}} validationErrors={{
                      isEmail: this.__('Not a valid email address.')
                    }} length={50}
                    required />

                </div>
                <div className='row'>
                  <div className='col s12 valign-wrapper'>
                    <button type='submit' className='valign waves-effect waves-light btn' style={{margin: 'auto'}} disabled={!this.state.canSubmit}>{this.__('Send Invite')}</button>
                  </div>
                </div>

              </Formsy>
            </div>

          </div>
          <div className='row'>
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
                        <Tooltip title={status} position='bottom' inertia followCursor>
                          <i className='material-icons' style={{color}} >{icon}</i>
                        </Tooltip>
                      </td>
                      <td>{member.display_name}</td>
                      <td>{email}</td>
                      <td>{member.key}</td>
                      <td>
                        <Tooltip title={_this.__('Resend Invite')} position='bottom' inertia followCursor>
                          <a onClick={() => {
                            _this.handleResendInvite(member)
                          }
                          }>
                            <i className='material-icons' style={{cursor: 'pointer'}}>email</i>
                          </a>
                        </Tooltip>
                        {(status !== 'Disabled' && status !== 'Admin') &&
                          <Tooltip title={_this.__('Remove User')} position='bottom' inertia followCursor>
                            <a onClick={() => {
                              _this.handleDeauthorize(member)
                            }}>
                              <i className='material-icons' style={{
                                cursor: 'pointer'
                              }}>delete</i>
                            </a>
                          </Tooltip>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className='row'>
            <p>
              {this.__('To delete a user please contact support@maphubs.com. Completely deleting a user may require deleting their content or reassigning their content to another user.')}
            </p>
          </div>
          <Progress id='saving-user-invite' title={this.__('Sending')} subTitle='' dismissible={false} show={this.state.saving} />
        </main>
        <Footer {...this.props.footerConfig} />
      </ErrorBoundary>
    )
  }
}
