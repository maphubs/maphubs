// @flow
import React from 'react'
import Formsy from 'formsy-react'
import { notification, Row, Col, Button } from 'antd'
import MultiTextArea from '../forms/MultiTextArea'
import MultiTextInput from '../forms/MultiTextInput'
import SelectGroup from '../Groups/SelectGroup'
import Select from '../forms/select'
import Licenses from './licenses'
import LayerStore from '../../stores/layer-store'
import LayerActions from '../../actions/LayerActions'
import MapHubsComponent from '../MapHubsComponent'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import type {LayerStoreState} from '../../stores/layer-store'
import type {Group} from '../../stores/GroupStore'
import Locales from '../../services/locales'

type Props = {|
  onSubmit: Function,
  onValid?: Function,
  onInValid?: Function,
  submitText: string,
  showGroup: boolean,
  showPrev?: boolean,
  onPrev?: Function,
  prevText?: string,
  warnIfUnsaved: boolean,
  groups: Array<Group>
|}

type DefaultProps = {
  showGroup: boolean,
  warnIfUnsaved: boolean,
  showPrev: boolean,
  groups: Array<Group>
}

type LayerSettingsState = {
  canSubmit: boolean,
  pendingChanges: boolean
}

type State = LocaleStoreState & LayerStoreState & LayerSettingsState

export default class LayerSettings extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: DefaultProps = {
    showGroup: true,
    warnIfUnsaved: false,
    showPrev: false,
    groups: []
  }

  state: State = {
    canSubmit: false,
    pendingChanges: false,
    layer: {}
  }

  constructor (props: Props) {
    super(props)
    this.stores.push(LayerStore)
  }

  componentDidMount () {
    const _this = this
    window.addEventListener('beforeunload', (e) => {
      if (_this.props.warnIfUnsaved && _this.state.pendingChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    })
  }

  onFormChange = () => {
    this.setState({pendingChanges: true})
  }

  onValid = () => {
    this.setState({
      canSubmit: true
    })
    if (this.props.onValid) {
      this.props.onValid()
    }
  }

  onInvalid = () => {
    this.setState({
      canSubmit: false
    })
    if (this.props.onInValid) {
      this.props.onInValid()
    }
  }

  onSubmit = (model: Object) => {
    const {t} = this
    const _this = this
    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')
    model.source = Locales.formModelToLocalizedString(model, 'source')

    let initLayer = false
    if (!this.state.owned_by_group_id) {
      initLayer = true
    }
    if (!model.group && this.state.owned_by_group_id) {
      // editing settings on an existing layer
      model.group = this.state.owned_by_group_id
    } else if (!model.group && this.props.groups.length === 1) {
      // creating a new layer when user is only the member of a single group (not showing the group dropdown)
      model.group = this.props.groups[0].group_id
    }
    if (!model.private) {
      model.private = false
    }

    LayerActions.saveSettings(model, _this.state._csrf, initLayer, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      } else {
        _this.setState({pendingChanges: false})
        _this.props.onSubmit()
      }
    })
  }

  onPrev = () => {
    if (this.props.onPrev) this.props.onPrev()
  }

  render () {
    const {t} = this
    const { showGroup } = this.props
    if (this.props.showGroup && (!this.props.groups || this.props.groups.length === 0)) {
      return (
        <div className='container'>
          <Row style={{marginBottom: '20px'}}>
            <h5>{t('Please Join a Group')}</h5>
            <p>{t('Please create or join a group before creating a layer.')}</p>
          </Row>
        </div>
      )
    }
    let canChangeGroup = true
    if (this.state.status === 'published') {
      canChangeGroup = false
    }

    const licenseOptions = Licenses.getLicenses(t)

    let prevButton = ''
    if (this.props.showPrev) {
      prevButton = (
        <div className='left'>
          <Button type='primary' onClick={this.onPrev}>{this.props.prevText}</Button>
        </div>
      )
    }

    const license = this.state.license ? this.state.license : 'none'

    return (
      <div style={{marginRight: '2%', marginLeft: '2%', marginTop: '10px'}}>
        <Formsy onValidSubmit={this.onSubmit} onChange={this.onFormChange} onValid={this.onValid} onInvalid={this.onInValid}>
          <Row style={{marginBottom: '20px'}}>
            <Col sm={24} md={12} style={{padding: '0px 20px'}}>
              <Row style={{marginBottom: '20px'}}>
                <MultiTextInput
                  name='name' id='layer-name'
                  label={{
                    en: 'Name', fr: 'Nom', es: 'Nombre', it: 'Nome', id: 'Nama', pt: 'Nome'
                  }}
                  value={this.state.name}
                  validations='maxLength:100' validationErrors={{
                    maxLength: t('Must be 100 characters or less.')
                  }} length={100}
                  tooltipPosition='top' tooltip={t('Short Descriptive Name for the Layer')}
                  required
                />
              </Row>
              <Row style={{marginBottom: '20px'}}>
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
                  value={this.state.description}
                  validations='maxLength:1000' validationErrors={{
                    maxLength: t('Description must be 1000 characters or less.')
                  }} length={1000}
                  tooltipPosition='top' tooltip={t('Brief Description of the Layer')}
                  required
                />
              </Row>
              {showGroup &&
                <Row style={{marginBottom: '20px'}}>
                  <SelectGroup groups={this.props.groups} type='layer' canChangeGroup={canChangeGroup} editing={!canChangeGroup} />
                </Row>}
            </Col>
            <Col sm={24} md={12} style={{padding: '0px 20px'}}>
              <Row style={{marginBottom: '20px'}}>
                <MultiTextInput
                  name='source' id='layer-source' label={{
                    en: 'Source',
                    fr: 'Source',
                    es: 'Fuente',
                    it: 'Sorgente',
                    pt: 'Fonte',
                    id: 'Sumber'
                  }}
                  value={this.state.source}
                  validations='maxLength:300' validationErrors={{
                    maxLength: t('Must be 300 characters or less.')
                  }} length={300}
                  tooltipPosition='top' tooltip={t('Short Description of the Layer Source')}
                  required
                />
              </Row>
              <Row style={{marginBottom: '20px'}}>
                <Select
                  name='license' id='layer-license-select' label={t('License')} startEmpty={false}
                  value={license} options={licenseOptions}
                  note={t('Select a license for more information')}
                  tooltipPosition='top' tooltip={t('Layer License')}
                  required
                />
              </Row>
            </Col>
          </Row>
          <div className='container'>
            {prevButton}
            <div style={{float: 'right'}}>
              <Button type='primary' htmlType='submit' disabled={!this.state.canSubmit}>{this.props.submitText}</Button>
            </div>
          </div>

        </Formsy>

      </div>
    )
  }
}
