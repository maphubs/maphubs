import React, { useState } from 'react'
import LocalizedInput from '../../forms/ant/LocalizedInput'
import { Modal, Row, Button, message } from 'antd'
import Formsy from 'formsy-react'
import SelectGroup from '../../Groups/SelectGroup'
import useMapT from '../hooks/useMapT'
import { useSession } from 'next-auth/client'

import { LocalizedString } from '../../../types/LocalizedString'
import { Group } from '../../../types/group'
type Props = {
  onSave: (
    { title, group }: { title: LocalizedString; group: string },
    cb: () => void
  ) => void
  editing?: boolean
  editingLayer?: boolean
  owned_by_group_id: string
  initialTitle?: LocalizedString
  userGroups: Group[]
}

const SaveMapModal = ({
  owned_by_group_id,
  editing,
  editingLayer,
  initialTitle,
  onSave,
  userGroups
}: Props): JSX.Element => {
  console.log(`render savemapmodel title: ${initialTitle}`)
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
    if (!group && userGroups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      selectedGroup = userGroups[0].group_id
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
                initialValue={initialTitle}
                placeholder={t('Title')}
                onChange={setTitle}
              />
            </Row>
            <Row>
              <Formsy>
                <SelectGroup
                  groups={userGroups}
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
