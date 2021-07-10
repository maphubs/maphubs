import React from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { PlusOutlined } from '@ant-design/icons'
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import InfoIcon from '@material-ui/icons/Info'
import { Modal, Button, Row, notification, message } from 'antd'
import TextInput from '../forms/textInput'
import MultiTextInput from '../forms/MultiTextInput'
import MultiTextArea from '../forms/MultiTextArea'
import GroupStore from '../../stores/GroupStore'
import GroupActions from '../../actions/GroupActions'
import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { GroupStoreState } from '../../stores/GroupStore'
import Locales from '../../services/locales'
import $ from 'jquery'
import { LocalizedString } from '../../types/LocalizedString'

type Props = {
  t: (v: string | LocalizedString) => string
  onCreate?: (...args: Array<any>) => any
}

type State = {
  visible?: boolean
  canSubmit: boolean
  formModel?: Record<string, any>
} & LocaleStoreState &
  GroupStoreState

export default class CreateGroupModal extends React.Component<Props, State> {
  stores: any
  groupIdValue: string
  groupIdAvailable: boolean
  constructor(props: Props) {
    super(props)

    const { state, checkGroupIdAvailable, groupIdValue } = this

    this.stores = [GroupStore]
    addValidationRule('isAvailable', (values: string[], value: string) => {
      if (state.group.created) return true
      // prevent extra server calls
      let available: boolean
      if (groupIdValue || value !== groupIdValue) {
        this.groupIdValue = value
        available = checkGroupIdAvailable(value)
        this.groupIdAvailable = available
      }

      return available
    })
  }

  showModal = (): void => {
    this.setState({
      visible: true
    })
  }
  enableButton = (): void => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton = (): void => {
    this.setState({
      canSubmit: false
    })
  }

  checkGroupIdAvailable = (id: string): boolean => {
    const { t } = this
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
  onFormChange = (formModel: Record<string, any>): void => {
    this.setState({
      formModel
    })
  }
  saveGroup = (): void => {
    const { t, props, state } = this
    const { onCreate } = props

    const { model, group, _csrf } = state

    if (!model) {
      message.error(t('Please enter required fields'))
      return
    }

    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')
    GroupActions.createGroup(
      model.group_id,
      model.name,
      model.description,
      model.location,
      model.published,
      _csrf,
      (err) => {
        if (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString(),
            duration: 0
          })
        } else {
          message.success(t('Group Created'), 1)

          if (onCreate) {
            onCreate(group)

            this.setState({
              visible: false
            })
          }
        }
      }
    )
  }
  handleCancel = (): void => {
    this.setState({
      visible: false
    })
  }

  render(): JSX.Element {
    const {
      props,
      state,
      saveGroup,
      handleCancel,
      showModal,
      onFormChange,
      enableButton,
      disableButton
    } = this
    const { t } = props
    const { visible, canSubmit } = state
    return (
      <>
        {!visible && (
          <Button size='small' onClick={showModal}>
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
            <Button key='back' onClick={handleCancel}>
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
          onCancel={handleCancel}
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
              onChange={onFormChange}
              onValid={enableButton}
              onInvalid={disableButton}
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
                  icon='description'
                  validations='maxLength:500'
                  validationErrors={{
                    maxLength: t('Description must be 500 characters or less.')
                  }}
                  length={500}
                  tooltipPosition='top'
                  tooltip={t('Brief Description of the Group')}
                  required
                  t={t}
                />
              </Row>
            </Formsy>
          </Row>
        </Modal>
      </>
    )
  }
}
