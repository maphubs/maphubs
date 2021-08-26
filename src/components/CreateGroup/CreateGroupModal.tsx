import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { PlusOutlined } from '@ant-design/icons'
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import InfoIcon from '@material-ui/icons/Info'
import { Modal, Button, Row, notification, message } from 'antd'
import TextInput from '../forms/textInput'
import MultiTextInput from '../forms/MultiTextInput'
import MultiTextArea from '../forms/MultiTextArea'
import Locales from '../../services/locales'
import $ from 'jquery'
import useT from '../../hooks/useT'
import { useSelector } from '../../redux/hooks'
import { LocalizedString } from '../../types/LocalizedString'
import mutation from '../../graphql/graphql-mutation'

type Props = {
  onCreate?: (...args: Array<any>) => any
}

type FormModel = {
  group_id: string
  name: LocalizedString
  description: LocalizedString
  location: LocalizedString
  published: boolean
}

const CreateGroupModal = ({ onCreate }: Props): JSX.Element => {
  const { t } = useT()
  const [visible, setVisible] = useState(false)
  const [canSubmit, setCanSubmit] = useState(false)
  const [model, setModel] = useState<FormModel>()
  const [groupIdValue, setGroupIdValue] = useState<string>()
  const [groupIdAvailable, setGroupIdAvailable] = useState(false)

  const groupState = useSelector((state) => state.group)

  addValidationRule('isAvailable', (values: string[], value: string) => {
    if (groupState.created) return true
    // prevent extra server calls
    let available: boolean
    if (groupIdValue || value !== groupIdValue) {
      setGroupIdValue(value)
      available = checkGroupIdAvailable(value)
      setGroupIdAvailable(available)
    }
    return available
  })

  const checkGroupIdAvailable = (id: string): boolean => {
    let result = false

    // only check if a valid value was provided and we are running in the browser
    if (id && typeof window !== 'undefined') {
      $.ajax({
        type: 'POST',
        url: '/api/group/checkidavailable',
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json',
        data: JSON.stringify({
          id
        }),
        async: false,

        success(msg) {
          if (msg.available) {
            result = true
          }
        },

        error(msg) {
          notification.error({
            message: t('Server Error'),
            description: msg.message || msg.toString(),
            duration: 0
          })
        },

        complete() {}
      })
    }

    return result
  }

  const saveGroup = async () => {
    if (!model) {
      message.error(t('Please enter required fields'))
      return
    }

    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')
    try {
      await mutation(`
          createGroup(group_id: "${model.group_id}", name: "${model.name}", description: "${model.description}")
        `)
      message.success(t('Group Created'), 1)

      if (onCreate) {
        onCreate(groupState)
        setVisible(false)
      }
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }

  return (
    <>
      {!visible && (
        <Button
          size='small'
          onClick={() => {
            setVisible(true)
          }}
        >
          <PlusOutlined />
          {t('New Group')}
        </Button>
      )}
      <Modal
        title={t('Create Group')}
        visible={visible}
        onOk={saveGroup}
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
          <Button
            key='submit'
            type='primary'
            disabled={!canSubmit}
            onClick={saveGroup}
          >
            {t('Create Group')}
          </Button>
        ]}
        onCancel={() => {
          setVisible(false)
        }}
      >
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Formsy
            style={{
              width: '100%'
            }}
            onChange={setModel}
            onValid={() => {
              setCanSubmit(true)
            }}
            onInvalid={() => {
              setCanSubmit(false)
            }}
          >
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <TextInput
                name='group_id'
                label={t('Group ID')}
                icon={<GroupWorkIcon />}
                validations={{
                  matchRegexp: /^[\dA-Za-z-]*$/,
                  maxLength: 25,
                  isAvailable: true
                }}
                validationErrors={{
                  maxLength: t('ID must be 25 characters or less.'),
                  matchRegexp: t(
                    'Can only contain letters, numbers, or dashes.'
                  ),
                  isAvailable: t('ID already taken, please try another.')
                }}
                length={25}
                successText={t('ID is Available')}
                tooltipPosition='right'
                tooltip={t(
                  "Identifier for the Group. This will be used in links and URLs for your group's content."
                )}
                required
                t={t}
              />
            </Row>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <MultiTextInput
                inputName='name'
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
                required
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
                icon='description'
                validations='maxLength:500'
                validationErrors={{
                  maxLength: t('Description must be 500 characters or less.')
                }}
                length={500}
                tooltipPosition='top'
                tooltip={t('Brief Description of the Group')}
                required
              />
            </Row>
          </Formsy>
        </Row>
      </Modal>
    </>
  )
}
export default CreateGroupModal
