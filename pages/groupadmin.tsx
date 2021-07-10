import React from 'react'
import Formsy from 'formsy-react'
import {
  message,
  notification,
  Modal,
  Row,
  Col,
  Button,
  PageHeader,
  Card,
  Divider
} from 'antd'
import EditList from '../src/components/EditList'
import Header from '../src/components/header'
import MultiTextArea from '../src/components/forms/MultiTextArea'
import TextInput from '../src/components/forms/textInput'
import MultiTextInput from '../src/components/forms/MultiTextInput'
import Toggle from '../src/components/forms/toggle'
import AddItem from '../src/components/AddItem'
import GroupStore from '../src/stores/GroupStore'
import GroupActions from '../src/actions/GroupActions'
import ImageCrop from '../src/components/ImageCrop'
import Reflux from '../src/components/Rehydrate'

import type { Group, GroupStoreState } from '../src/stores/GroupStore'
import Locales from '../src/services/locales'
import LayerList from '../src/components/Lists/LayerList'
import MapList from '../src/components/Lists/MapList'
import ErrorBoundary from '../src/components/ErrorBoundary'
import FloatingButton from '../src/components/FloatingButton'
import Delete from '@material-ui/icons/Delete'
import InfoIcon from '@material-ui/icons/Info'
import DescriptionIcon from '@material-ui/icons/Description'
import MyLocationIcon from '@material-ui/icons/MyLocation'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'

const { confirm } = Modal
const debug = DebugService('views/GroupAdmin')

type Props = {
  group: Group
  layers: Array<Record<string, any>>
  maps: Array<Record<string, any>>
  members: Array<Record<string, any>>
  locale: string
  _csrf: string
  headerConfig: Record<string, any>
  user: Record<string, any>
}
type State = {
  canSubmit: boolean
} & GroupStoreState
export default class GroupAdmin extends React.Component<Props, State> {
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  static defaultProps:
    | any
    | {
        layers: Array<any>
        maps: Array<any>
        members: Array<any>
      } = {
    layers: [],
    maps: [],
    members: []
  }
  state: State = {
    canSubmit: false,
    group: {},
    members: []
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [GroupStore]

    Reflux.rehydrate(GroupStore, {
      group: props.group,
      layers: props.layers,
      members: props.members
    })
  }

  enableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton: any | (() => void) = () => {
    this.setState({
      canSubmit: false
    })
  }
  onError: any | ((msg: string) => void) = (msg: string) => {
    notification.error({
      message: 'Error',
      description: msg,
      duration: 0
    })
  }
  submit: any | ((model: any) => void) = (model: Record<string, any>) => {
    const { t, props, state } = this
    const { _csrf } = state
    const { group } = props
    const group_id = group.group_id
    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')
    GroupActions.updateGroup(
      group_id,
      model.name,
      model.description,
      model.location,
      model.published,
      _csrf,
      (err) => {
        if (err) {
          notification.error({
            message: t('Error'),
            description: err.message || err.toString() || err,
            duration: 0
          })
        } else {
          message.info(t('Group Saved'), 3, () => {
            window.location.assign(`/group/${group_id || ''}`)
          })
        }
      }
    )
  }
  handleMemberDelete: any | ((user: any) => void) = (
    user: Record<string, any>
  ) => {
    const { t, state } = this
    const { _csrf } = state
    confirm({
      title: t('Confirm Removal'),
      content: `${t('Please confirm removal of')} ${user.label}`,
      okText: t('Remove'),
      okType: 'danger',
      cancelText: t('Cancel'),

      onOk() {
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
  handleGroupDelete: any | (() => void) = () => {
    const { t, state } = this
    const { group, _csrf } = state

    confirm({
      title: t('Confirm Deletion'),
      content: `${t('Please confirm removal of')} ${this.t(group.name)}`,
      okText: t('Delete'),
      okType: 'danger',
      cancelText: t('Cancel'),

      onOk() {
        GroupActions.deleteGroup(_csrf, (err) => {
          if (err) {
            notification.error({
              message: t('Error'),
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            message.info(t('Group Deleted'), 3, () => {
              window.location.assign('/groups')
            })
          }
        })
      }
    })
  }
  handleMemberMakeAdmin: any | ((user: any) => void) = (
    user: Record<string, any>
  ) => {
    const { t, state } = this
    const { _csrf } = state

    if (user.type === 'Administrator') {
      this.handleRemoveMemberAdmin(user)
    } else {
      confirm({
        title: t('Confirm Administrator'),
        content:
          t(
            'Please confirm that you want to make this user an Administrator: '
          ) + user.label,
        okType: 'danger',

        onOk() {
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
  handleRemoveMemberAdmin: any | ((user: any) => void) = (
    user: Record<string, any>
  ) => {
    const { t, state } = this
    const { _csrf } = state
    confirm({
      title: t('Confirm Remove Administrator'),
      content:
        t(
          'Please confirm that you want to remove Administrator permissions for '
        ) +
        user.label +
        '.',
      okType: 'danger',

      onOk() {
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
  handleAddMember: any | ((user: any) => void) = (
    user: Record<string, any>
  ) => {
    const { t, state } = this
    const { _csrf } = state
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
  showImageCrop: any | (() => void) = () => {
    this.refs.imagecrop.show()
  }
  onCrop: any | ((data: any) => void) = (data: Record<string, any>) => {
    const { t, state } = this
    const { _csrf } = state
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
    }) // this.pasteHtmlAtCaret('<img class="responsive-img" src="' + data + '" />');
  }

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      submit,
      enableButton,
      disableButton,
      handleAddMember,
      onError,
      handleGroupDelete,
      onCrop,
      handleMemberMakeAdmin,
      handleMemberDelete,
      showImageCrop
    } = this
    const { layers, maps, headerConfig } = props
    const { members, group } = state
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
      <ErrorBoundary t={t}>
        <Header {...headerConfig} />
        <main>
          <div className='container'>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <PageHeader
                onBack={() => {
                  window.location.assign(groupUrl)
                }}
                style={{
                  padding: '5px'
                }}
                title={t('Back to Group')}
              />
            </Row>
            <Row
              style={{
                marginTop: '20px',
                marginBottom: '20px'
              }}
            >
              <Col sm={24} md={12}>
                <img
                  alt={t('Group Photo')}
                  width='300'
                  src={
                    '/group/' + groupId + '/image.png?' + new Date().getTime()
                  }
                />
              </Col>
              <Col sm={24} md={12}>
                <Button type='primary' onClick={showImageCrop}>
                  {t('Change Image')}
                </Button>
              </Col>
            </Row>
            <Divider />
            <Row
              justify='center'
              style={{
                marginBottom: '20px'
              }}
            >
              <Formsy
                onValidSubmit={submit}
                onValid={enableButton}
                onInvalid={disableButton}
                style={{
                  width: '100%',
                  maxWidth: '800px'
                }}
              >
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <MultiTextInput
                    name='name'
                    id='name'
                    label={{
                      en: 'Name',
                      fr: 'Nom',
                      es: 'Nombre',
                      it: 'Nome',
                      id: 'Nama',
                      pt: 'Nome'
                    }}
                    icon={<InfoIcon />}
                    validations='maxLength:100'
                    validationErrors={{
                      maxLength: t('Must be 100 characters or less.')
                    }}
                    length={100}
                    tooltipPosition='top'
                    tooltip={t('Short Descriptive Name for the Group')}
                    value={group.name}
                    required
                    t={t}
                  />
                </Row>
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
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
                    icon={<DescriptionIcon />}
                    validations='maxLength:500'
                    validationErrors={{
                      maxLength: t(
                        'Description must be 500 characters or less.'
                      )
                    }}
                    length={500}
                    tooltipPosition='top'
                    tooltip={t('Brief Description of the Group')}
                    value={group.description}
                    required
                    t={t}
                  />
                </Row>
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <TextInput
                    name='location'
                    label={t('Location')}
                    validations='maxLength:100'
                    validationErrors={{
                      maxLength: t('Location must be 100 characters or less.')
                    }}
                    length={100}
                    icon={<MyLocationIcon />}
                    tooltipPosition='top'
                    tooltip={t('Country or City Where the Group is Located')}
                    value={group.location}
                    required
                    t={t}
                  />
                </Row>
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <Toggle
                    name='published'
                    labelOff={t('Draft')}
                    labelOn={t('Published')}
                    tooltipPosition='top'
                    tooltip={t('Include in Public Group Listings')}
                    checked={isPublished}
                  />
                </Row>
                <div
                  style={{
                    float: 'right'
                  }}
                >
                  <Button htmlType='submit' name='action'>
                    {t('Update')}
                  </Button>
                </div>
              </Formsy>
            </Row>
            <Divider />
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Col
                sm={24}
                md={12}
                style={{
                  padding: '2px'
                }}
              >
                <EditList
                  title='Members'
                  items={membersList}
                  onDelete={handleMemberDelete}
                  onAction={handleMemberMakeAdmin}
                  onError={onError}
                  t={t}
                />
              </Col>
              <Col
                sm={24}
                md={12}
                style={{
                  padding: '2px'
                }}
              >
                <Card title={<b>{t('Add Group Member')}</b>} size='small'>
                  <AddItem
                    placeholder={t('Search for User Name')}
                    suggestionUrl='/api/user/search/suggestions'
                    optionLabel={t('Add as Administrator')}
                    optionLabelOn={t('Administrator')}
                    optionLabelOff={t('Member')}
                    addButtonLabel={t('Add and Send Invite')}
                    onAdd={handleAddMember}
                    onError={onError}
                  />
                </Card>
              </Col>
            </Row>
            <Divider />
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Col
                sm={24}
                md={12}
                style={{
                  padding: '2px'
                }}
              >
                <LayerList layers={layers} groups={[group]} t={t} />
              </Col>
              <Col
                sm={24}
                md={12}
                style={{
                  padding: '2px'
                }}
              >
                <MapList maps={maps} groups={[group]} t={t} />
              </Col>
            </Row>
            <FloatingButton
              onClick={handleGroupDelete}
              tooltip={t('Delete Group')}
              style={{
                color: '#fff',
                backgroundColor: 'red'
              }}
              icon={<Delete />}
            />
          </div>
          <ImageCrop
            ref='imagecrop'
            aspectRatio={1}
            lockAspect
            resize_width={600}
            resize_height={600}
            onCrop={onCrop}
          />
        </main>
      </ErrorBoundary>
    )
  }
}
