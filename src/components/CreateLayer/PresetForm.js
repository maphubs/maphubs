// @flow
import React from 'react'
import Formsy from 'formsy-react'
import TextArea from '../forms/textArea'
import MultiTextInput from '../forms/MultiTextInput'
import Toggle from '../forms/toggle'
import Select from '../forms/select'
import Actions from '../../actions/LayerActions'
import _debounce from 'lodash.debounce'
import MapHubsComponent from '../MapHubsComponent'
import Locales from '../../services/locales'
import _isequal from 'lodash.isequal'
import { Modal, Row, Col, Button } from 'antd'
const { confirm } = Modal

type Props = {
  id: number,
  tag: string,
  label: LocalizedString,
  type: string,
  options: Array<Object>, // if type requires a list of options
  isRequired: boolean,
  showOnMap: boolean,
  isName: boolean,
  isDescription: boolean,
  onValid: Function,
  onInvalid: Function
}

type State = {
  valid: boolean
}

export default class PresetForm extends MapHubsComponent<Props, State> {
  static defaultProps = {
    showOnMap: true,
    isRequired: false,
    isName: false,
    isDescription: false
  }

  constructor (props: Props) {
    super(props)
    // if loading with values from the database, assume they are valid
    let valid = false
    if (props.tag) valid = true
    this.state = {
      valid
    }
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  onFormChange = (values: Object) => {
    const _this = this
    values.id = this.props.id
    values.label = Locales.formModelToLocalizedString(values, 'label')
    values.tag = this.props.tag
    Actions.updatePreset(_this.props.id, values)
  }

  onValid = () => {
    this.setState({valid: true})
    const debounced = _debounce(function () {
      if (this.props.onValid) this.props.onValid()
    }, 2500).bind(this)
    debounced()
  }

  onInvalid =() => {
    this.setState({valid: false})
    const debounced = _debounce(function () {
      if (this.props.onInvalid) this.props.onInvalid()
    }, 2500).bind(this)
    debounced()
  }

  isValid = () => {
    return this.state.valid
  }

  onRemove = () => {
    const {t} = this
    const {id} = this.props
    confirm({
      title: t('Confirm Removal'),
      content: t('Are you sure you want to remove this field?') + ' ' +
        t('Note: this will hide the field, but will not delete the raw data.') + ' ' +
        t('The field will still be included in data exports.'),
      okType: 'danger',
      onOk () {
        Actions.deletePreset(id)
      }
    })
  }

  onMoveUp = () => {
    Actions.movePresetUp(this.props.id)
  }

  onMoveDown = () => {
    Actions.movePresetDown(this.props.id)
  }

  render () {
    const {t} = this
    const presetOptions = [
      {value: 'text', label: t('Text')},
      {value: 'localized', label: t('Localized Text')},
      {value: 'number', label: t('Number')},
      {value: 'radio', label: t('Radio Buttons (Choose One)')},
      {value: 'combo', label: t('Combo Box (Dropdown)')},
      {value: 'check', label: t('Check Box (Yes/No)')}
    ]

    let typeOptions = ''

    if (this.props.type === 'combo' || this.props.type === 'radio') {
      typeOptions = (
        <Row>
          <TextArea
            name='options' label={t('Options(seperate with commas)')} icon='list'
            validations='maxLength:500' validationErrors={{
              maxLength: t('Description must be 500 characters or less.')
            }} length={500}
            value={this.props.options}
            tooltipPosition='top' tooltip={t('Comma seperated list of options to show for the Combo or Radio field. Ex: red, blue, green')}
          />
        </Row>
      )
    }

    let typeStartEmpty = true
    if (this.props.type) typeStartEmpty = false

    return (
      <div>
        <Row style={{marginBottom: '20px'}}>
          <Formsy
            ref='form' onChange={this.onFormChange}
            onValid={this.onValid} onInvalid={this.onInvalid}
          >
            <Row style={{marginBottom: '20px'}}>
              <Col sm={24} md={12}>
                <Row style={{marginBottom: '20px'}}>
                  <Select
                    name='type'
                    id='preset-type-select'
                    label={t('Field Type')}
                    options={presetOptions}
                    value={this.props.type}
                    startEmpty={typeStartEmpty}
                    required
                  />
                </Row>
                <Row style={{marginBottom: '20px'}}>
                  <MultiTextInput
                    name='label'
                    id={`preset-${this.props.id}-label`}
                    label={{
                      en: 'Label', fr: 'Étiquette', es: 'Etiqueta', it: 'Etichetta'
                    }}
                    validations='maxLength:50' validationErrors={{
                      maxLength: t('Must be 50 characters or less.')
                    }} length={50}
                    value={this.props.label}
                    required
                  />
                </Row>
              </Col>
              <Col sm={24} md={12} style={{textAlign: 'center'}}>
                <Toggle
                  name='isRequired'
                  labelOff={t('Optional')}
                  labelOn={t('Required')}
                  style={{paddingTop: '25px'}}
                  checked={this.props.isRequired}
                />
                <Toggle
                  name='showOnMap'
                  labelOff={t('Hide in Map')}
                  labelOn={t('Show in Map')}
                  style={{paddingTop: '25px'}}
                  checked={this.props.showOnMap}
                />
                <Toggle
                  name='isName'
                  labelOff={t('Regular Field')}
                  labelOn={t('Name Field')}
                  style={{paddingTop: '25px'}}
                  checked={this.props.isName}
                />
                <Toggle
                  name='isDescription'
                  labelOff={t('Regular Field')}
                  labelOn={t('Description Field')}
                  style={{paddingTop: '25px'}}
                  checked={this.props.isDescription}
                />
              </Col>
            </Row>
            {typeOptions}

          </Formsy>
        </Row>
        <Row style={{marginBottom: '20px'}}>
          <Col span={16}>
            <Button type='primary' onClick={this.onMoveUp}><i className='material-icons left'>arrow_upward</i>{t('Move Up')}</Button>
            <Button type='primary' style={{marginLeft: '5px'}} onClick={this.onMoveDown}><i className='material-icons left'>arrow_downward</i>{t('Move Down')}</Button>
          </Col>
          <Col span={8} style={{textAlign: 'right'}}>
            <Button type='primary' onClick={this.onRemove}><i className='material-icons left'>delete</i>{t('Remove')}</Button>
          </Col>
        </Row>
      </div>
    )
  }
}
