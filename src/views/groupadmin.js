// @flow
import React from 'react'
import Formsy from 'formsy-react'
import { message, notification, Modal } from 'antd'
import EditList from '../components/EditList'
import Header from '../components/header'
import MultiTextArea from '../components/forms/MultiTextArea'
import TextInput from '../components/forms/textInput'
import MultiTextInput from '../components/forms/MultiTextInput'
import Toggle from '../components/forms/toggle'
import AddItem from '../components/AddItem'
import GroupStore from '../stores/GroupStore'
import GroupActions from '../actions/GroupActions'
import ImageCrop from '../components/ImageCrop'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {Group, GroupStoreState} from '../stores/GroupStore'
import Locales from '../services/locales'
import LayerList from '../components/Lists/LayerList'
import MapList from '../components/Lists/MapList'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
import FloatingButton from '../components/FloatingButton'
const { confirm } = Modal
const debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('views/GroupAdmin')

type Props = {
  group: Group,
  layers: Array<Object>,
  maps: Array<Object>,
  members: Array<Object>,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
}

type State = {
  canSubmit: boolean
} & LocaleStoreState & GroupStoreState

export default class GroupAdmin extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps = {
    layers: [],
    maps: [],
    members: []
  }

  state: State = {
    canSubmit: false,
    group: {},
    members: []
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(GroupStore)
    Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
    if (props.user) {
      Reflux.rehydrate(UserStore, {user: props.user})
    }
    Reflux.rehydrate(GroupStore, {
      group: props.group,
      layers: props.layers,
      members: props.members
    })
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

  onError = (msg: string) => {
    notification.error({
      message: 'Error',
      description: msg,
      duration: 0
    })
  }

  submit = (model: Object) => {
    const {t} = this
    const {_csrf} = this.state
    const group_id = this.props.group.group_id

    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')

    GroupActions.updateGroup(group_id, model.name, model.description, model.location, model.published, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.info(t('Group Saved'), 3, () => {
          window.location = `/group/${group_id || ''}`
        })
      }
    })
  }

  handleMemberDelete = (user: Object) => {
    const {t} = this
    const {_csrf} = this.state
    confirm({
      title: t('Confirm Removal'),
      content: `${t('Please confirm removal of')} ${user.label}`,
      okText: t('Remove'),
      okType: 'danger',
      cancelText: t('Cancel'),
      onOk () {
        GroupActions.removeMember(user.key, _csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.info(t('Member Removed'))
          }
        })
      }
    })
  }

  handleGroupDelete = () => {
    const {t} = this
    const _this = this
    confirm({
      title: t('Confirm Deletion'),
      content: `${t('Please confirm removal of')} ${this.t(this.state.group.name)}`,
      okText: t('Delete'),
      okType: 'danger',
      cancelText: t('Cancel'),
      onOk () {
        GroupActions.deleteGroup(_this.state._csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.info(t('Group Deleted'), 3, () => {
              window.location = '/groups'
            })
          }
        })
      }
    })
  }

  handleMemberMakeAdmin = (user: Object) => {
    const {t} = this
    const {_csrf} = this.state
    if (user.type === 'Administrator') {
      this.handleRemoveMemberAdmin(user)
    } else {
      confirm({
        title: t('Confirm Administrator'),
        content: t('Please confirm that you want to make this user an Administrator: ') + user.label,
        okType: 'danger',
        onOk () {
          GroupActions.setMemberAdmin(user.key, _csrf, (err) => {
            if (err) {
              notification.error({
                message: t('Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            } else {
              message.info(t('Member is now an Administrator'), 7)
            }
          })
        }
      })
    }
  }

  handleRemoveMemberAdmin = (user: Object) => {
    const {t} = this
    const {_csrf} = this.state
    confirm({
      title: t('Confirm Remove Administrator'),
      content: t('Please confirm that you want to remove Administrator permissions for ') + user.label + '.',
      okType: 'danger',
      onOk () {
        GroupActions.removeMemberAdmin(user.key, _csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.info(t('Member is no longer an Administrator'), 7)
          }
        })
      }
    })
  }

  handleAddMember = (user: Object) => {
    const {t} = this
    const {_csrf} = this.state
    debug.log(user.value.value + ' as Admin:' + user.option)
    GroupActions.addMember(user.value.value, user.option, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.info(t('Member Added'), 7)
      }
    })
  }

  showImageCrop = () => {
    this.refs.imagecrop.show()
  }

  onCrop = (data: Object) => {
    const {t} = this
    const {_csrf} = this.state
    // send data to server
    GroupActions.setGroupImage(data, _csrf, (err) => {
      if (err) {
        notification.error({
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        message.info(t('Image Saved'), 3)
      }
    })
    // this.pasteHtmlAtCaret('<img class="responsive-img" src="' + data + '" />');
  }

  render () {
    const {t} = this
    const membersList = []
    const groupId = this.props.group.group_id ? this.props.group.group_id : ''
    this.state.members.forEach((user) => {
      membersList.push({
        key: user.id,
        label: user.display_name,
        type: user.role,
        image: user.image,
        icon: 'person',
        actionIcon: 'supervisor_account',
        actionLabel: t('Add/Remove Administrator Access')
      })
    })

    let isPublished = false
    if (this.state.group.published) {
      isPublished = true
    }

    const groupUrl = '/group/' + groupId

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>

          <div className='container'>
            <div className='row'>
              <div className='col s12'>
                <p>&larr; <a href={groupUrl}>{t('Back to Group')}</a></p>
              </div>
            </div>
            <div className='row' style={{marginTop: '20px'}}>
              <div className='col s12 m6 l6'>
                <img alt={t('Group Photo')} width='300' className='' src={'/group/' + groupId + '/image?' + new Date().getTime()} />
              </div>
              <div className='col s12 m6 l6'>
                <button className='waves-effect waves-light btn' onClick={this.showImageCrop}>{t('Change Image')}</button>
              </div>

            </div>
            <div className='row'>
              <h4>{this.t(this.props.group.name)}</h4>
            </div>
            <div className='divider' />
            <div className='row'>
              <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
                <div className='row'>
                  <MultiTextInput
                    name='name' id='name'
                    label={{
                      en: 'Name', fr: 'Nom', es: 'Nombre', it: 'Nome', id: 'Nama', pt: 'Nome'
                    }}
                    icon='info'
                    className='col s12' validations='maxLength:100' validationErrors={{
                      maxLength: t('Name must be 100 characters or less.')
                    }} length={100}
                    dataPosition='top' dataTooltip={t('Short Descriptive Name for the Group')}
                    value={this.state.group.name}
                    required
                  />
                </div>
                <div className='row'>
                  <MultiTextArea
                    name='description'
                    label={{
                      en: 'Description',
                      fr: 'Description',
                      es: 'Descripción',
                      it: 'Descrizione',
                      id: 'Deskripsi',
                      pt: 'Descrição'
                    }}
                    icon='description' className='col s12' validations='maxLength:500' validationErrors={{
                      maxLength: t('Description must be 500 characters or less.')
                    }} length={500}
                    dataPosition='top' dataTooltip={t('Brief Description of the Group')}
                    value={this.state.group.description}
                    required
                  />
                </div>
                <div className='row'>
                  <TextInput
                    name='location' label={t('Location')} icon='navigation' className='col s12' validations='maxLength:100' validationErrors={{
                      maxLength: t('Location must be 100 characters or less.')
                    }} length={100}
                    dataPosition='top' dataTooltip={t('Country or City Where the Group is Located')}
                    value={this.state.group.location}
                    required
                  />
                </div>
                <div className='row'>
                  <Toggle
                    name='published' labelOff={t('Draft')} labelOn={t('Published')} className='col s12'
                    dataPosition='top' dataTooltip={t('Include in Public Group Listings')}
                    checked={isPublished}
                  />
                </div>
                <div className='right'>
                  <button className='btn waves-effect waves-light' type='submit' name='action'>{t('Update')}</button>
                </div>

              </Formsy>
            </div>
            <div className='row'>
              <EditList title='Members' items={membersList} onDelete={this.handleMemberDelete} onAction={this.handleMemberMakeAdmin} onError={this.onError} />
            </div>
            <div className='row'>
              <h5>{t('Add Group Member')}</h5>
              <AddItem
                t={t} placeholder={t('Search for User Name')} suggestionUrl='/api/user/search/suggestions'
                optionLabel={t('Add as Administrator')} addButtonLabel={t('Add and Send Invite')}
                onAdd={this.handleAddMember} onError={this.onError}
              />
            </div>
            <div className='row'>
              <LayerList layers={this.props.layers} />
            </div>
            <div className='row'>
              <MapList maps={this.props.maps} t={t} />
            </div>
            <div className='fixed-action-btn action-button-bottom-right'>
              <FloatingButton
                onClick={this.handleGroupDelete}
                tooltip={t('Delete Group')}
                color='red' icon='delete'
              />
            </div>

          </div>
          <ImageCrop ref='imagecrop' aspectRatio={1} lockAspect resize_width={600} resize_height={600} onCrop={this.onCrop} />
        </main>
      </ErrorBoundary>
    )
  }
}
