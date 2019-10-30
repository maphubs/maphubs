// @flow
import React from 'react'
import { Row, message } from 'antd'
import UserStore from '../../stores/UserStore'
import UserActions from '../../actions/UserActions'
import Formsy from 'formsy-react'
import MultiTextInput from '../forms/MultiTextInput'
import SelectGroup from '../Groups/SelectGroup'
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
    const {t} = this
    UserActions.getUser((err) => {
      if (err) {
        message.error(t('Not Logged In - Please Login Again'))
      }
    })
  }

  onSave = (model: Object) => {
    const {t} = this
    const _this = this
    model.title = Locales.formModelToLocalizedString(model, 'title')
    if (!model.title || this.t(model.title) === '') {
      message.error(t('Please Add a Title'))
      return
    }

    if (!model.group && this.state.user && this.state.user.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = this.state.user.groups[0].group_id
    }
    this.setState({saving: true})
    this.props.onSave(model, () => {
      _this.setState({saving: false})
    })
  }

  render () {
    const {t} = this
    const {title, editing, owned_by_group_id} = this.props
    const {canSave, saving, user} = this.state
    let groups = []
    if (user && user.groups) {
      groups = user.groups
    }

    if (user) {
      return (
        <Formsy onValidSubmit={this.onSave} onValid={this.enableSaveButton} onInvalid={this.disableSaveButton}>
          <Row style={{width: '100%'}}>
            <MultiTextInput
              name='title' id='title'
              value={title}
              label={{
                en: 'Map Title',
                fr: 'Titre de la carte',
                es: 'Título del mapa',
                it: 'Titolo della mappa',
                id: 'Judul Peta',
                pt: 'Título do mapa'
              }}
              className='col s12'
              validations='maxLength:100' validationErrors={{
                maxLength: t('Must be 100 characters or less.')
              }} length={100}
              required
            />
          </Row>
          <Row style={{width: '100%'}}>
            <SelectGroup groups={groups} group_id={owned_by_group_id} type='map' canChangeGroup={!editing} editing={editing} />
          </Row>
          <Row style={{width: '100%'}}>
            <div className='col s12 valign-wrapper'>
              <button
                type='submit' className='valign waves-effect waves-light btn' style={{margin: 'auto'}}
                disabled={(!canSave || saving)}
              >{t('Save Map')}
              </button>
            </div>
          </Row>

        </Formsy>
      )
    } else {
      return (
        <div>
          <Row style={{textAlign: 'center'}}>
            <p>{t('You must login or sign up before saving a map.')}</p>
          </Row>
          <Row style={{textAlign: 'center'}}>
            <a className='btn' href='/login' target='_blank' rel='noopener noreferrer'>{t('Login')}</a>
          </Row>
          <Row style={{textAlign: 'center'}}>
            <a className='btn' onClick={this.recheckLogin}>{t('Retry')}</a>
          </Row>
        </div>
      )
    }
  }
}
