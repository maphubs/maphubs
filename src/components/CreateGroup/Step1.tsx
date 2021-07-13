import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, Col, message, notification, Button } from 'antd'
import MultiTextArea from '../forms/MultiTextArea'
import TextInput from '../forms/textInput'
import MultiTextInput from '../forms/MultiTextInput'
import Toggle from '../forms/toggle'
import GroupActions from '../../actions/GroupActions'
import Locales from '../../services/locales'
import NavigationIcon from '@material-ui/icons/Navigation'
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import InfoIcon from '@material-ui/icons/Info'
import DescriptionIcon from '@material-ui/icons/Description'
import $ from 'jquery'
import classNames from 'classnames'
import useT from '../../hooks/useT'
import { useSelector } from 'react-redux'
import { LocaleState } from '../../redux/reducers/locale'

type Props = {
  onSubmit: () => void
  active?: boolean
}

const CreateGroupStep1 = ({ active, onSubmit }: Props): JSX.Element => {
  const { t } = useT()
  const [canSubmit, setCanSubmit] = useState(false)
  const [groupIdValue, setGroupIdValue] = useState<string>()
  const [groupIdAvailable, setGroupIdAvailable] = useState(false)

  const created = useSelector((state: { group: any }) => state.group.created)
  const _csrf = useSelector(
    (state: { locale: LocaleState }) => state.locale._csrf
  )

  addValidationRule('isAvailable', (values: string[], value: string) => {
    if (created) return true
    // prevent extra server calls
    let available: boolean
    if (groupIdValue || value !== groupIdValue) {
      setGroupIdValue(value)
      available = checkGroupIdAvailable(value)
      setGroupIdAvailable(available)
    }
    return available
  })

  const checkGroupIdAvailable = (id: string) => {
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

  const submit = (model: Record<string, any>): void => {
    saveGroup(model)
  }
  const saveGroup = (model: Record<string, any>) => {
    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')

    if (created) {
      GroupActions.updateGroup(
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
            message.success(t('Group Saved'), 3, onSubmit)
          }
        }
      )
    } else {
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
            message.success(t('Group Created'), 3, onSubmit)
          }
        }
      )
    }
  }
  const handleCancel = (): void => {
    if (created) {
      GroupActions.deleteGroup(_csrf, (err) => {
        if (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString(),
            duration: 0
          })
        } else {
          message.success(t('Group Cancelled'), 3, () => {
            window.location.assign('/groups')
          })
        }
      })
    } else {
      message.success(t('Group Cancelled'), 3, () => {
        window.location.assign('/groups')
      })
    }
  }

  // hide if not active
  let className = classNames('row')

  if (!active) {
    className = classNames('row', 'hidden')
  }

  return (
    <div className={className}>
      <div className='container'>
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Formsy
            onValidSubmit={submit}
            onValid={() => {
              setCanSubmit(true)
            }}
            onInvalid={() => {
              setCanSubmit(false)
            }}
            style={{
              width: '100%'
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
                className='col s6'
                disabled={created}
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
                successText='ID is Available'
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
                icon={<DescriptionIcon />}
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
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <TextInput
                name='location'
                label='Location'
                icon={<NavigationIcon />}
                validations='maxLength:100'
                validationErrors={{
                  maxLength: t('Location must be 100 characters or less.')
                }}
                length={100}
                tooltipPosition='top'
                tooltip={t('Country or City Where the Group is Located')}
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
                defaultChecked
                tooltipPosition='top'
                tooltip={t('Include in Public Group Listings')}
              />
            </Row>
            <Row justify='center' align='middle'>
              <Col span={4}>
                <Button danger onClick={handleCancel}>
                  {t('Cancel')}
                </Button>
              </Col>
              <Col span={4} offset={16}>
                <Button type='primary' htmlType='submit' disabled={!canSubmit}>
                  {t('Save and Continue')}
                </Button>
              </Col>
            </Row>
          </Formsy>
        </Row>
      </div>
    </div>
  )
}
export default CreateGroupStep1
