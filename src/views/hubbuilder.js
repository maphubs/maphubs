// @flow
import React from 'react'
import Header from '../components/header'
import Formsy, {addValidationRule} from 'formsy-react'
import TextInput from '../components/forms/textInput'
import SelectGroup from '../components/Groups/SelectGroup'
import MessageActions from '../actions/MessageActions'
import NotificationActions from '../actions/NotificationActions'
import Progress from '../components/Progress'
import HubStore from '../stores/HubStore'
import HubActions from '../actions/HubActions'
import MapHubsComponent from '../components/MapHubsComponent'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import type {LocaleStoreState} from '../stores/LocaleStore'
import type {HubStoreState} from '../stores/HubStore'
import UserStore from '../stores/UserStore'

const $ = require('jquery')
const urlUtil = require('@bit/kriscarle.maphubs-utils.maphubs-utils.url-util')

type Props = {
   onSubmit: Function,
  active: boolean,
  groups: Array<Object>,
  hub: Object,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  user: Object
}

type State = {
   canSubmit: boolean,
  showError: boolean,
  errorMessage: string,
  errorTitle: string
} & LocaleStoreState & HubStoreState

export default class HubBuilder extends MapHubsComponent<Props, State> {
  static async getInitialProps ({ req, query }: {req: any, query: Object}) {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

   static defaultProps = {
     active: false
   }

   state: State = {
     canSubmit: false,
     showError: false,
     errorMessage: '',
     errorTitle: '',
     hub: {}
   }

   constructor (props: Props) {
     super(props)
     this.stores.push(HubStore)
     Reflux.rehydrate(LocaleStore, {locale: props.locale, _csrf: props._csrf})
     if (props.user) {
       Reflux.rehydrate(UserStore, {user: props.user})
     }
   }

   componentWillMount () {
     super.componentWillMount()
     const _this = this
     addValidationRule('isAvailable', function (values, value) {
       if (!value) return false
       if (_this.state.hub && _this.state.created) return true
       if (!this.hubIdValue || value !== this.hubIdValue) {
         this.hubIdValue = value
         this.hubIdAvailable = _this.checkHubIdAvailable(value)
       }
       return this.hubIdAvailable
     })
   }

  checkHubIdAvailable = (id: number) => {
    const {t} = this
    let result = false
    // only check if a valid value was provided and we are running in the browser
    if (id && typeof window !== 'undefined') {
      $.ajax({
        type: 'POST',
        url: '/api/hub/checkidavailable',
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json',
        data: JSON.stringify({id, _csrf: this.state._csrf}),
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
    this.saveHub(model)
  }

  saveHub = (model: Object) => {
    const {t} = this
    const _this = this
    this.setState({canSubmit: false, saving: true}) // disable submit button

    if (!model.group && this.props.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = this.props.groups[0].group_id
    }

    HubActions.createHub(model.hub_id, model.group, model.name, false, model.private, this.state._csrf, (err) => {
      if (err) {
        MessageActions.showMessage({title: t('Server Error'), message: err})
      } else {
        NotificationActions.showNotification(
          {
            message: t('Hub Created'),
            position: 'topright',
            dismissAfter: 3000,
            onDismiss () { _this.onComplete(model.hub_id) }
          })
      }
    })
  }

  onComplete = (hubId: number) => {
    const url = urlUtil.getBaseUrl() + '/hub/' + hubId
    window.location = url
  }

  render () {
    const {t} = this
    if (!this.props.groups || this.props.groups.length === 0) {
      return (
        <div className='container'>
          <div className='row'>
            <h5>{t('Please Join a Group')}</h5>
            <p>{t('Please create or join a group before creating a hub.')}</p>
          </div>
        </div>
      )
    }

    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <div className='container'>
          <h4>{t('Create a Hub')}</h4>
          <div className='row'>
            <Progress id='create-hub-progess' title={t('Creating Hub')} dismissible={false} show={this.state.saving} />
            <Formsy onValidSubmit={this.submit} onValid={this.enableButton} onInvalid={this.disableButton}>
              <div className='row'>
                <TextInput name='hub_id' label={t('Hub ID')} icon='group_work' className='col s6'
                  disabled={this.state.hub && this.state.created}
                  validations={{matchRegexp: /^[a-zA-Z0-9-]*$/, maxLength: 25, isAvailable: true}} validationErrors={{
                    maxLength: t('ID must be 25 characters or less.'),
                    matchRegexp: t('Can only contain letters, numbers, or dashes.'),
                    isAvailable: t('ID already taken, please try another.')
                  }} length={25}
                  successText={t('ID is Available')}
                  dataPosition='right' dataTooltip="Identifier for the Hub. This will be used in links and URLs for your hub's content."
                  required />
              </div>
              <div className='row'>
                <TextInput
                  name='name' label={t('Name')} icon='info' className='col s12' validations='maxLength:100' validationErrors={{
                    maxLength: t('Name must be 100 characters or less.')
                  }} length={100}
                  dataPosition='top' dataTooltip={t('Short Descriptive Name for the Hub')}
                  required />
              </div>
              <div className='row'>
                <SelectGroup groups={this.props.groups} type='hub' canChangeGroup editing={false} />
              </div>
              <div className='right'>
                <button type='submit' className='waves-effect waves-light btn' disabled={!this.state.canSubmit}><i className='material-icons right'>arrow_forward</i>{t('Save and Continue')}</button>
              </div>

            </Formsy>
          </div>
        </div>
      </ErrorBoundary>
    )
  }
}
