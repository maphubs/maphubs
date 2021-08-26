import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, Col, message, notification, Button } from 'antd'
import MultiTextArea from '../forms/MultiTextArea'
import TextInput from '../forms/textInput'
import MultiTextInput from '../forms/MultiTextInput'
import Locales from '../../services/locales'
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import InfoIcon from '@material-ui/icons/Info'
import DescriptionIcon from '@material-ui/icons/Description'
import $ from 'jquery'
import classNames from 'classnames'
import useT from '../../hooks/useT'
import { useSelector, useDispatch } from '../../redux/hooks'
import mutation from '../../graphql/graphql-mutation'
import {
  setGroupID,
  setGroupCreated,
  resetGroup
} from '../../redux/reducers/groupSlice'

type Props = {
  onSubmit: () => void
  active?: boolean
}

const CreateGroupStep1 = ({ active, onSubmit }: Props): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()
  const router = useRouter()
  const [canSubmit, setCanSubmit] = useState(false)
  const [groupIdValue, setGroupIdValue] = useState<string>()
  const [loaded, setLoaded] = useState(false)

  const created = useSelector((state) => state.group.created)
  const savedGroupID = useSelector((state) => state.group.group_id)

  if (!loaded) {
    addValidationRule('isAvailable', (values: string[], value: string) => {
      if (created) return true
      // prevent extra server calls
      let available: boolean
      if (value && value.localeCompare(groupIdValue) !== 0) {
        setGroupIdValue(value)
        available = checkGroupIdAvailable(value)
      }
      return available
    })
  }

  useEffect(() => {
    setLoaded(true)
  }, [])

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
        }
      })
    }

    return result
  }

  const submit = (model: Record<string, any>): void => {
    saveGroup(model)
  }
  const saveGroup = async (model: Record<string, any>) => {
    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')
    const method = created ? 'saveGroup' : 'createGroup'

    try {
      await mutation(`
          ${method}(group_id: "${model.group_id}", name: ${JSON.stringify(
        JSON.stringify(model.name)
      )}, description: ${JSON.stringify(JSON.stringify(model.description))})
        `)
      dispatch(setGroupID(model.group_id))
      dispatch(setGroupCreated(true))
      message.success(t(created ? 'Group Saved' : 'Group Created'), 3, onSubmit)
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }
  const handleCancel = async () => {
    if (created) {
      try {
        await mutation(`
          deleteGroup(group_id: "${savedGroupID}")
        `)
        dispatch(resetGroup())
        message.success(t('Group Cancelled'), 3, () => {
          router.push('/groups')
        })
      } catch (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString(),
          duration: 0
        })
      }
    } else {
      message.success(t('Group Cancelled'), 3, () => {
        router.push('/groups')
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
