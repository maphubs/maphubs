// @flow
import React from 'react'
import Formsy from 'formsy-react'
import { message, notification, Modal, Row, Col, Button, PageHeader, Card, Divider } from 'antd'
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
import Delete from '@material-ui/icons/Delete'
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
    const { layers, maps, headerConfig } = this.props
    const { members, group } = this.state

    const groupId = group.group_id || ''
    const membersList = members.map((user) => {
      return {
        key: user.id,
        label: user.display_name,
        type: user.role,
        image: user.image
      }
    })

    const isPublished = group.published
    const groupUrl = `/group/${groupId}`

    return (
      <ErrorBoundary>
        <Header {...headerConfig} />
        <main>

          <div className='container'>
            <Row style={{marginBottom: '20px'}}>
              <PageHeader
                onBack={() => {
                  window.location = groupUrl
                }}
                style={{padding: '5px'}}
                title={t('Back to Group')}
              />
            </Row>
            <Row style={{marginTop: '20px', marginBottom: '20px'}}>
              <Col sm={24} md={12}>
                <img alt={t('Group Photo')} width='300' src={'/group/' + groupId + '/image?' + new Date().getTime()} />
              </Col>
              <Col sm={24} md={12}>
                <Button type='primary' onClick={this.showImageCrop}>{t('Change Image')}</Button>
              </Col>
            </Row>
            <Divider />
            <Row justify='center' style={{marginBottom: '20px'}}>
              <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton} style={{width: '100%', maxWidth: '800px'}}>
                <Row style={{marginBottom: '20px'}}>
                  <MultiTextInput
                    name='name' id='name'
                    label={{
                      en: 'Name', fr: 'Nom', es: 'Nombre', it: 'Nome', id: 'Nama', pt: 'Nome'
                    }}
                    icon='info'
                    validations='maxLength:100' validationErrors={{
                      maxLength: t('Must be 100 characters or less.')
                    }} length={100}
                    tooltipPosition='top' tooltip={t('Short Descriptive Name for the Group')}
                    value={this.state.group.name}
                    required
                    t={t}
                  />
                </Row>
                <Row style={{marginBottom: '20px'}}>
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
                    icon='description' validations='maxLength:500' validationErrors={{
                      maxLength: t('Description must be 500 characters or less.')
                    }} length={500}
                    tooltipPosition='top' tooltip={t('Brief Description of the Group')}
                    value={group.description}
                    required
                    t={t}
                  />
                </Row>
                <Row style={{marginBottom: '20px'}}>
                  <TextInput
                    name='location' label={t('Location')} validations='maxLength:100' validationErrors={{
                      maxLength: t('Location must be 100 characters or less.')
                    }} length={100}
                    tooltipPosition='top' tooltip={t('Country or City Where the Group is Located')}
                    value={group.location}
                    required
                    t={t}
                  />
                </Row>
                <Row style={{marginBottom: '20px'}}>
                  <Toggle
                    name='published' labelOff={t('Draft')} labelOn={t('Published')}
                    tooltipPosition='top' tooltip={t('Include in Public Group Listings')}
                    checked={isPublished}
                  />
                </Row>
                <div style={{float: 'right'}}>
                  <Button htmlType='submit' name='action'>{t('Update')}</Button>
                </div>
              </Formsy>
            </Row>
            <Divider />
            <Row style={{marginBottom: '20px'}}>
              <Col sm={24} md={12} style={{padding: '2px'}}>
                <EditList title='Members' items={membersList} onDelete={this.handleMemberDelete} onAction={this.handleMemberMakeAdmin} onError={this.onError} t={t} />
              </Col>
              <Col sm={24} md={12} style={{padding: '2px'}}>
                <Card title={<b>{t('Add Group Member')}</b>} size='small'>
                  <AddItem
                    t={t} placeholder={t('Search for User Name')} suggestionUrl='/api/user/search/suggestions'
                    optionLabel={t('Add as Administrator')} addButtonLabel={t('Add and Send Invite')}
                    onAdd={this.handleAddMember} onError={this.onError}
                  />
                </Card>
              </Col>
            </Row>
            <Divider />
            <Row style={{marginBottom: '20px'}}>
              <Col sm={24} md={12} style={{padding: '2px'}}>
                <LayerList layers={layers} t={t} />
              </Col>
              <Col sm={24} md={12} style={{padding: '2px'}}>
                <MapList maps={maps} t={t} />
              </Col>
            </Row>
            <FloatingButton
              onClick={this.handleGroupDelete}
              tooltip={t('Delete Group')}
              style={{color: '#fff', backgroundColor: 'red'}} icon={<Delete />}
            />
          </div>
          <ImageCrop ref='imagecrop' aspectRatio={1} lockAspect resize_width={600} resize_height={600} onCrop={this.onCrop} />
        </main>
      </ErrorBoundary>
    )
  }
}
