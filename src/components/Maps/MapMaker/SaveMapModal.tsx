import React, { useState } from 'react'
import LocalizedInput from '../../forms/ant/LocalizedInput'
import { Modal, Row, Button, message } from 'antd'
import Formsy from 'formsy-react'
import SelectGroup from '../../Groups/SelectGroup'
import useMapT from '../hooks/useMapT'
import { useSession } from 'next-auth/client'

import { LocalizedString } from '../../../types/LocalizedString'
type Props = {
  onSave: (...args: Array<any>) => void
  editing?: boolean
  editingLayer?: boolean
  owned_by_group_id: string
  initialTitle?: LocalizedString
}

const SaveMapModal = ({
  owned_by_group_id,
  editing,
  editingLayer,
  initialTitle,
  onSave
}: Props): JSX.Element => {
  const { t } = useMapT()
  const [session, loading] = useSession()
  const [visible, setVisible] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [group, setGroup] = useState(owned_by_group_id)

  let user
  if (!loading) {
    user = session.user
  }

  const recheckLogin = (): void => {
    // TODO: trigger next-auth to recheck login
    /*
      if (err) {
        message.error(t('Not Logged In - Please Login Again'))
      }
    */
  }
  const save = (): void => {
    if (!title || t(title) === '') {
      message.error(t('Please Add a Title'))
      return
    }
    let selectedGroup = group
    if (!group && user?.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      selectedGroup = user.groups[0].group_id
    }

    const closeSavingMessage = message.loading(t('Saving'), 0)
    onSave(
      {
        title,
        group: selectedGroup
      },
      () => {
        closeSavingMessage()
      }
    )
  }

  let groups = []

  if (user && user.groups) {
    groups = user.groups
  }

  return (
    <>
      {!visible && (
        <Button
          type='primary'
          disabled={editingLayer}
          onClick={() => {
            setVisible(true)
          }}
        >
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
          <Button
            key='back'
            onClick={() => {
              setVisible(false)
            }}
          >
            {t('Cancel')}
          </Button>,
          <Button key='submit' type='primary' disabled={!title} onClick={save}>
            {t('Save Map')}
          </Button>
        ]}
        onCancel={() => {
          setVisible(false)
        }}
      >
        {user && (
          <>
            <Row>
              <LocalizedInput
                initialValue={title}
                placeholder={t('Title')}
                onChange={setTitle}
              />
            </Row>
            <Row>
              <Formsy>
                <SelectGroup
                  groups={groups}
                  group_id={owned_by_group_id}
                  canChangeGroup={!editing}
                  editing={editing}
                  onGroupChange={setGroup}
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
export default SaveMapModal
