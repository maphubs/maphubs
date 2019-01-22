// @flow
import React from 'react'
import Formsy, {addValidationRule} from 'formsy-react'
import MultiTextArea from '../forms/MultiTextArea'
import TextInput from '../forms/textInput'
import MultiTextInput from '../forms/MultiTextInput'
import Toggle from '../forms/toggle'
import MessageActions from '../../actions/MessageActions'
import NotificationActions from '../../actions/NotificationActions'
import GroupStore from '../../stores/GroupStore'
import GroupActions from '../../actions/GroupActions'
import MapHubsComponent from '../../components/MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {GroupStoreState} from '../../stores/GroupStore'
import Locales from '../../services/locales'

import $ from 'jquery'
import classNames from 'classnames'

type Props = {
  onSubmit: Function,
  active: boolean
}

type State = {
  canSubmit: boolean,
  showError: boolean,
  errorMessage: string,
  errorTitle: string
} & LocaleStoreState & GroupStoreState

export default class CreateGroupStep1 extends MapHubsComponent<Props, State> {
  static defaultProps = {
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

  constructor (props: Props) {
    super(props)
    this.stores.push(GroupStore)
  }

  componentWillMount () {
    super.componentWillMount()
    const _this = this
    addValidationRule('isAvailable', function (values, value) {
      if (_this.state.group.created) return true
      if (!this.groupIdValue || value !== this.groupIdValue) {
        this.groupIdValue = value
        this.groupIdAvailable = _this.checkGroupIdAvailable(value)
      }
      return this.groupIdAvailable
    })
  }

  checkGroupIdAvailable = (id: string) => {
    const {t} = this
    let result = false
    // only check if a valid value was provided and we are running in the browser
    if (id && typeof window !== 'undefined') {
      $.ajax({
        type: 'POST',
        url: '/api/group/checkidavailable',
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json',
        data: JSON.stringify({id}),
        async: false,
        success (msg) {
          if (msg.available) {
            result = true
          }
        },
        error (msg) {
          MessageActions.showMessage({title: t('Server Error'), message: msg})
        },
        complete () {
        }
      })
    }
    return result
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton = () => {
    this.setState({
      canSubmit: false
    })
  }

  submit = (model: Object) => {
    this.saveGroup(model)
  }

  saveGroup = (model: Object) => {
    const {t} = this
    const _this = this
    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')

    if (this.state.group.created) {
      GroupActions.updateGroup(model.group_id, model.name, model.description, model.location, model.published, _this.state._csrf, (err) => {
        if (err) {
          MessageActions.showMessage({title: t('Server Error'), message: err})
        } else {
          NotificationActions.showNotification(
            {
              message: t('Group Saved'),
              position: 'bottomright',
              dismissAfter: 3000,
              onDismiss: _this.props.onSubmit
            })
        }
      })
    } else {
      GroupActions.createGroup(model.group_id, model.name, model.description, model.location, model.published, _this.state._csrf, (err) => {
        if (err) {
          MessageActions.showMessage({title: t('Server Error'), message: err})
        } else {
          NotificationActions.showNotification(
            {
              message: t('Group Created'),
              position: 'bottomright',
              dismissAfter: 3000,
              onDismiss: _this.props.onSubmit
            })
        }
      })
    }
  }

  handleCancel = () => {
    const {t} = this
    const _this = this
    if (_this.state.group.created) {
      GroupActions.deleteGroup(_this.state._csrf, (err) => {
        if (err) {
          MessageActions.showMessage({title: t('Server Error'), message: err})
        } else {
          NotificationActions.showNotification(
            {
              message: t('Group Cancelled'),
              position: 'bottomright',
              dismissAfter: 3000,
              onDismiss () {
                window.location = '/groups'
              }
            })
        }
      })
    } else {
      NotificationActions.showNotification(
        {
          message: t('Group Cancelled'),
          position: 'bottomright',
          dismissAfter: 3000,
          onDismiss () {
            window.location = '/groups'
          }
        })
    }
  }

  render () {
    const {t} = this
    // hide if not active
    let className = classNames('row')
    if (!this.props.active) {
      className = classNames('row', 'hidden')
    }

    return (
      <div className={className}>
        <div className='container'>
          <div className='row'>
            <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
              <div className='row'>
                <TextInput name='group_id' label={t('Group ID')} icon='group_work' className='col s6'
                  disabled={this.state.group.created}
                  validations={{matchRegexp: /^[a-zA-Z0-9-]*$/, maxLength: 25, isAvailable: true}} validationErrors={{
                    maxLength: t('ID must be 25 characters or less.'),
                    matchRegexp: t('Can only contain letters, numbers, or dashes.'),
                    isAvailable: t('ID already taken, please try another.')
                  }} length={25}
                  successText='ID is Available'
                  dataPosition='right' dataTooltip={t("Identifier for the Group. This will be used in links and URLs for your group's content.")}
                  required />
              </div>
              <div className='row'>
                <MultiTextInput name='name' id='name'
                  label={{
                    en: 'Name', fr: 'Nom', es: 'Nombre', it: 'Nome'
                  }}
                  icon='info' className='col s12' validations='maxLength:100' validationErrors={{
                    maxLength: t('Name must be 100 characters or less.')
                  }} length={100}
                  dataPosition='top' dataTooltip={t('Short Descriptive Name for the Group')}
                  required />
              </div>
              <div className='row'>
                <MultiTextArea name='description'
                  label={{
                    en: 'Description',
                    fr: 'Description',
                    es: 'Descripción',
                    it: 'Descrizione'
                  }}
                  icon='description' className='col s12' validations='maxLength:500' validationErrors={{
                    maxLength: t('Description must be 500 characters or less.')
                  }} length={500}
                  dataPosition='top' dataTooltip={t('Brief Description of the Group')}
                  required />
              </div>
              <div className='row'>
                <TextInput
                  name='location' label='Location' icon='navigation' className='col s12' validations='maxLength:100' validationErrors={{
                    maxLength: t('Location must be 100 characters or less.')
                  }} length={100}
                  dataPosition='top' dataTooltip={t('Country or City Where the Group is Located')}
                  required />
              </div>
              <div className='row'>
                <Toggle name='published' labelOff={t('Draft')} labelOn={t('Published')} defaultChecked className='col s12'
                  dataPosition='top' dataTooltip={t('Include in Public Group Listings')}
                />
              </div>
              <div className='left'>
                <a className='waves-effect waves-light redirect btn' onClick={this.handleCancel}><i className='material-icons left'>delete</i>{t('Cancel')}</a>
              </div>
              <div className='right'>
                <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
              </div>

            </Formsy>

          </div>
        </div>
      </div>
    )
  }
}
