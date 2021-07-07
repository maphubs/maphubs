import React from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, Col, message, notification, Button } from 'antd'
import MultiTextArea from '../forms/MultiTextArea'
import TextInput from '../forms/textInput'
import MultiTextInput from '../forms/MultiTextInput'
import Toggle from '../forms/toggle'
import GroupStore from '../../stores/GroupStore'
import GroupActions from '../../actions/GroupActions'

import type { LocaleStoreState } from '../../stores/LocaleStore'
import type { GroupStoreState } from '../../stores/GroupStore'
import Locales from '../../services/locales'
import NavigationIcon from '@material-ui/icons/Navigation'
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import InfoIcon from '@material-ui/icons/Info'
import DescriptionIcon from '@material-ui/icons/Description'
import $ from 'jquery'
import classNames from 'classnames'
type Props = {
  onSubmit: (...args: Array<any>) => any
  active: boolean
}
type State = {
  canSubmit: boolean
  showError: boolean
  errorMessage: string
  errorTitle: string
} & LocaleStoreState &
  GroupStoreState
export default class CreateGroupStep1 extends React.Component<Props, State> {
  static defaultProps:
    | any
    | {
        active: boolean
      } = {
    active: false
  }
  state: State = {
    canSubmit: false,
    showError: false,
    errorMessage: '',
    errorTitle: '',
    group: {},
    members: []
  }
  stores: any
  constructor(props: Props) {
    super(props)
    this.stores = [GroupStore]

    const _this = this

    addValidationRule('isAvailable', function (values, value) {
      if (_this.state.group.created) return true

      if (!_this.groupIdValue || value !== _this.groupIdValue) {
        _this.groupIdValue = value
        _this.groupIdAvailable = _this.checkGroupIdAvailable(value)
      }

      return _this.groupIdAvailable
    })
  }

  checkGroupIdAvailable: any | ((id: string) => boolean) = (id: string) => {
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
  submit = (model: Record<string, any>): void => {
    this.saveGroup(model)
  }
  saveGroup: any | ((model: any) => void) = (model: Record<string, any>) => {
    const { t, props, state } = this
    const { onSubmit } = props
    const { group, _csrf } = state

    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')

    if (group.created) {
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
            message.success(t('Group Saved'), 3, _this.props.onSubmit)
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
  handleCancel = (): void => {
    const { t, props, state } = this
    const { group, _csrf } = state

    if (group.created) {
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

  render(): JSX.Element {
    const {
      t,
      props,
      state,
      submit,
      enableButton,
      disableButton,
      handleCancel
    } = this
    const { active } = props
    const { group, canSubmit } = state
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
              onValid={enableButton}
              onInvalid={disableButton}
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
                  disabled={group.created}
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
                  <Button
                    type='primary'
                    htmlType='submit'
                    disabled={!canSubmit}
                  >
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
}
