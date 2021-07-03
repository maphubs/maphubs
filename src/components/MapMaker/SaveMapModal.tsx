import React from 'react'
import LocalizedInput from '../forms/ant/LocalizedInput'
import { Modal, Row, Button, message } from 'antd'
import Formsy from 'formsy-react'
import UserStore from '../../stores/UserStore'
import UserActions from '../../actions/UserActions'
import SelectGroup from '../Groups/SelectGroup'

import type { UserStoreState } from '../../stores/UserStore'
import { LocalizedString } from '../../types/LocalizedString'
type Props = {
  onSave: (...args: Array<any>) => void
  editing?: boolean
  editingLayer?: boolean
  owned_by_group_id: string
  title: LocalizedString
  _csrf: string
}
type State = {
  visible?: boolean
  title?: Record<string, any>
  group?: string
} & UserStoreState
export default class SaveMapModal extends React.Component<Props, State> {
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [UserStore]
    this.state = {
      group: props.owned_by_group_id,
      title: props.title
    }
  }

  recheckLogin = (): void => {
    const { t, props } = this
    UserActions.getUser(props._csrf, (err) => {
      if (err) {
        message.error(t('Not Logged In - Please Login Again'))
      }
    })
  }
  save = (): void => {
    const { t, props, state } = this
    const { onSave } = props
    const { user, title } = state
    let { group } = state

    if (!title || t(title) === '') {
      message.error(t('Please Add a Title'))
      return
    }

    if (!group && user?.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      group = user.groups[0].group_id
    }

    const closeSavingMessage = message.loading(t('Saving'), 0)
    onSave(
      {
        title,
        group
      },
      () => {
        closeSavingMessage()
      }
    )
  }
  showModal = (): void => {
    this.setState({
      visible: true
    })
  }
  cancel = (): void => {
    this.setState({
      visible: false
    })
  }
  titleChange = (title: Record<string, any>): void => {
    this.setState({
      title
    })
  }
  groupChange = (group: string): void => {
    this.setState({
      group
    })
  }

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      showModal,
      save,
      cancel,
      titleChange,
      groupChange,
      recheckLogin
    } = this
    const { owned_by_group_id, editing, editingLayer } = props
    const { title, visible, user } = state
    let groups = []

    if (user && user.groups) {
      groups = user.groups
    }

    return (
      <>
        {!visible && (
          <Button type='primary' disabled={editingLayer} onClick={showModal}>
            {t('Save Map')}
          </Button>
        )}
        <Modal
          title={t('Save Map')}
          visible={visible}
          onOk={save}
          bodyStyle={{
            padding: '10px'
          }}
          centered
          footer={[
            <Button key='back' onClick={cancel}>
              {t('Cancel')}
            </Button>,
            <Button
              key='submit'
              type='primary'
              disabled={!title}
              onClick={save}
            >
              {t('Save Map')}
            </Button>
          ]}
          onCancel={cancel}
        >
          {user && (
            <>
              <Row>
                <LocalizedInput
                  value={title}
                  placeholder={t('Title')}
                  onChange={titleChange}
                  t={t}
                />
              </Row>
              <Row>
                <Formsy>
                  <SelectGroup
                    groups={groups}
                    group_id={owned_by_group_id}
                    type='map'
                    canChangeGroup={!editing}
                    editing={editing}
                    onGroupChange={groupChange}
                  />
                </Formsy>
              </Row>
            </>
          )}
          {!user && (
            <>
              <Row
                style={{
                  textAlign: 'center'
                }}
              >
                <p>{t('You must login or sign up before saving a map.')}</p>
              </Row>
              <Row
                style={{
                  textAlign: 'center'
                }}
              >
                <Button
                  type='primary'
                  href='/login'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {t('Login')}
                </Button>
              </Row>
              <Row
                style={{
                  textAlign: 'center'
                }}
              >
                <Button type='primary' onClick={recheckLogin}>
                  {t('Retry')}
                </Button>
              </Row>
            </>
          )}
        </Modal>
      </>
    )
  }
}
