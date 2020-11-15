// @flow
import type {Node} from "React";import React from 'react'
import LocalizedInput from '../forms/ant/LocalizedInput'
import { Modal, Row, Button, message } from 'antd'
import Formsy from 'formsy-react'
import UserStore from '../../stores/UserStore'
import UserActions from '../../actions/UserActions'
import SelectGroup from '../Groups/SelectGroup'
import MapHubsComponent from '../MapHubsComponent'

import type {UserStoreState} from '../../stores/UserStore'

type Props = {|
  onSave: Function,
  editing?: boolean,
  editingLayer?: boolean,
  owned_by_group_id: string,
  title: LocalizedString,
  _csrf: string
|}

type State = {
  visible?: boolean,
  title?: Object,
  group?: string
} & UserStoreState

export default class SaveMapModal extends MapHubsComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
    this.state = {
      group: props.owned_by_group_id,
      title: props.title
    }
  }

  recheckLogin: any | (() => void) = () => {
    const {t} = this
    UserActions.getUser(this.props._csrf, (err) => {
      if (err) {
        message.error(t('Not Logged In - Please Login Again'))
      }
    })
  }

  save: any | (() => void) = () => {
    const {t} = this
    let { user, title, group } = this.state

    if (!title || t(title) === '') {
      message.error(t('Please Add a Title'))
      return
    }

    if (!group && user?.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      group = user.groups[0].group_id
    }
    const closeSavingMessage = message.loading(t('Saving'), 0)
    this.props.onSave({title, group}, () => {
      closeSavingMessage()
    })
  }

  showModal: any | (() => void) = () => {
    this.setState({visible: true})
  }

  cancel: any | (() => void) = () => {
    this.setState({visible: false})
  }

  titleChange: any | ((title: any) => void) = (title: Object) => {
    this.setState({title})
  }

  groupChange: any | ((group: string) => void) = (group: string) => {
    this.setState({group})
  }

  render (): Node {
    const {t} = this
    const { owned_by_group_id, editing, editingLayer } = this.props
    const { title, visible, user } = this.state
    let groups = []
    if (user && user.groups) {
      groups = user.groups
    }

    return (
      <>
        {!visible &&
          <Button type='primary' disabled={editingLayer} onClick={this.showModal}>{t('Save Map')}</Button>}
        <Modal
          title={t('Save Map')}
          visible={visible}
          onOk={this.save}
          bodyStyle={{padding: '10px'}}
          centered
          footer={[
            <Button key='back' onClick={this.cancel}>
              {t('Cancel')}
            </Button>,
            <Button key='submit' type='primary' disabled={!title} onClick={this.save}>
              {t('Save Map')}
            </Button>
          ]}
          onCancel={this.cancel}
        >
          {user &&
            <>
              <Row>
                <LocalizedInput value={title} placeholder={t('Title')} onChange={this.titleChange} t={t} />
              </Row>
              <Row>
                <Formsy>
                  <SelectGroup
                    groups={groups} group_id={owned_by_group_id} type='map' canChangeGroup={!editing} editing={editing}
                    onGroupChange={this.groupChange}
                  />
                </Formsy>
              </Row>
            </>}
          {!user &&
            <>
              <Row style={{textAlign: 'center'}}>
                <p>{t('You must login or sign up before saving a map.')}</p>
              </Row>
              <Row style={{textAlign: 'center'}}>
                <Button type='primary' href='/login' target='_blank' rel='noopener noreferrer'>{t('Login')}</Button>
              </Row>
              <Row style={{textAlign: 'center'}}>
                <Button type='primary' onClick={this.recheckLogin}>{t('Retry')}</Button>
              </Row>
            </>}
        </Modal>
      </>
    )
  }
}
