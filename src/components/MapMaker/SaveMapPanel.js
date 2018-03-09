// @flow
import React from 'react'
import UserStore from '../../stores/UserStore'
import UserActions from '../../actions/UserActions'
import Formsy from 'formsy-react'
import MultiTextInput from '../forms/MultiTextInput'
import NotificationActions from '../../actions/NotificationActions'
import SelectGroup from '../Groups/SelectGroup'
import Toggle from '../forms/toggle'
import MapHubsComponent from '../MapHubsComponent'
import Locales from '../../services/locales'

import type {UserStoreState} from '../../stores/UserStore'

type Props = {|
  onSave: Function,
  editing?: boolean,
  owned_by_group_id: string,
  title: LocalizedString
|}

type State = {
  canSave: boolean,
  ownedByGroup?: boolean,
  saving?: boolean
} & UserStoreState

export default class SaveMapPanel extends MapHubsComponent<Props, State> {
  props: Props

  constructor (props: Props) {
    super(props)
    this.stores.push(UserStore)
    this.state = {
      canSave: false
    }
  }

  enableSaveButton = () => {
    this.setState({
      canSave: true
    })
  }

  disableSaveButton = () => {
    this.setState({
      canSave: false
    })
  }

  recheckLogin = () => {
    UserActions.getUser((err) => {
      if (err) {
        NotificationActions.showNotification({message: this.__('Not Logged In - Please Login Again'), dismissAfter: 3000, position: 'topright'})
      }
    })
  }

  onSave = (model: Object) => {
    const _this = this
    model.title = Locales.formModelToLocalizedString(model, 'title')
    if (!model.title || this._o_(model.title) === '') {
      NotificationActions.showNotification({message: this.__('Please Add a Title'), dismissAfter: 5000, position: 'topright'})
      return
    }

    if (!model.group && this.state.user.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = this.state.user.groups[0].group_id
    }
    this.setState({saving: true})
    this.props.onSave(model, () => {
      _this.setState({saving: false})
    })
  }

  onOwnedByGroup = (ownedByGroup: boolean) => {
    this.setState({ownedByGroup})
  }

  render () {
    const {title, editing, owned_by_group_id} = this.props
    const {canSave, saving, ownedByGroup, user} = this.state
    const groups = user.groups || []

    let ownedByGroupChecked
    if (typeof ownedByGroup === 'undefined' && groups.length > 0) {
      // suggest a group by default if user is member of groups
      ownedByGroupChecked = true
    } else {
      ownedByGroupChecked = ownedByGroup
    }

    let groupToggle
    if (groups.length > 0 && !editing) {
      // if the user is in a group, show group options
      groupToggle = (
        <div className='row'>
          <Toggle name='ownedByGroup' labelOff={this.__('Owned by Me')} labelOn={this.__('Owned by My Group')}
            checked={ownedByGroupChecked} className='col s12'
            onChange={this.onOwnedByGroup}
            dataPosition='right' dataTooltip={this.__('Select who should own this map')}
          />
        </div>
      )
    }

    let selectGroup
    if (ownedByGroupChecked) {
      const groups = user.groups || []
      selectGroup = (
        <div className='row'>
          <SelectGroup groups={groups} group_id={owned_by_group_id} type='map' canChangeGroup={!editing} editing={editing} />
        </div>
      )
    }

    if (user) {
      return (
        <Formsy onValidSubmit={this.onSave} onValid={this.enableSaveButton} onInvalid={this.disableSaveButton}>
          <div className='row'>
            <MultiTextInput name='title' id='title'
              value={title}
              label={{
                en: 'Map Title', fr: 'Titre de la carte', es: 'Título del mapa', it: 'Titolo della mappa'
              }}
              className='col s12'
              validations='maxLength:100' validationErrors={{
                maxLength: this.__('Name must be 100 characters or less.')
              }} length={100}
              required />
          </div>
          {groupToggle}
          {selectGroup}
          <div className='row'>
            <div className='col s12 valign-wrapper'>
              <button type='submit' className='valign waves-effect waves-light btn' style={{margin: 'auto'}}
                disabled={(!canSave || saving)}>{this.__('Save Map')}</button>
            </div>
          </div>

        </Formsy>
      )
    } else {
      return (
        <div>
          <div className='row center-align'>
            <p>{this.__('You must login or sign up before saving a map.')}</p>
          </div>
          <div className='row center-align'>
            <a className='btn' href='/login' target='_blank' rel='noopener noreferrer'>{this.__('Login')}</a>
          </div>
          <div className='row center-align'>
            <a className='btn' onClick={this.recheckLogin}>{this.__('Retry')}</a>
          </div>
        </div>
      )
    }
  }
}
