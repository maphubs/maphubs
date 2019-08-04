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
import { Modal } from 'antd'
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
        <TextArea name='options' label={t('Options(seperate with commas)')} icon='list'
          className='row no-margin' validations='maxLength:500' validationErrors={{
            maxLength: t('Description must be 500 characters or less.')
          }} length={500}
          value={this.props.options}
          dataPosition='top' dataTooltip={t('Comma seperated list of options to show for the Combo or Radio field. Ex: red, blue, green')}
        />
      )
    }

    let typeStartEmpty = true
    if (this.props.type) typeStartEmpty = false

    return (
      <div>
        <div className='row'>
          <Formsy ref='form' onChange={this.onFormChange}
            onValid={this.onValid} onInvalid={this.onInvalid}>
            <div className='row'>
              <div className='col s12 m6'>
                <Select
                  name='type'
                  id='preset-type-select'
                  label={t('Field Type')}
                  options={presetOptions}
                  value={this.props.type}
                  startEmpty={typeStartEmpty}
                  required
                />
                <MultiTextInput
                  name='label'
                  id={`preset-${this.props.id}-label`}
                  label={{
                    en: 'Label', fr: 'Étiquette', es: 'Etiqueta', it: 'Etichetta'
                  }}
                  validations='maxLength:50' validationErrors={{
                    maxLength: t('Name must be 50 characters or less.')
                  }} length={50}
                  value={this.props.label}
                  required
                />

              </div>
              <div className='col s12 m6' style={{textAlign: 'center'}}>
                <Toggle
                  name='isRequired'
                  labelOff={t('Optional')}
                  labelOn={t('Required')}
                  className='row no-margin'
                  style={{paddingTop: '25px'}}
                  checked={this.props.isRequired}
                />
                <Toggle
                  name='showOnMap'
                  labelOff={t('Hide in Map')}
                  labelOn={t('Show in Map')}
                  className='row no-margin'
                  style={{paddingTop: '25px'}}
                  checked={this.props.showOnMap}
                />
                <Toggle
                  name='isName'
                  labelOff={t('Regular Field')}
                  labelOn={t('Name Field')}
                  className='row no-margin'
                  style={{paddingTop: '25px'}}
                  checked={this.props.isName}
                />
                <Toggle
                  name='isDescription'
                  labelOff={t('Regular Field')}
                  labelOn={t('Description Field')}
                  className='row no-margin'
                  style={{paddingTop: '25px'}}
                  checked={this.props.isDescription}
                />
              </div>
            </div>
            {typeOptions}

          </Formsy>
        </div>
        <div className='row'>
          <div className='col s8'>
            <a className='waves-effect waves-light btn' onClick={this.onMoveUp}><i className='material-icons left'>arrow_upward</i>{t('Move Up')}</a>
            <a className='waves-effect waves-light btn' style={{marginLeft: '5px'}} onClick={this.onMoveDown}><i className='material-icons left'>arrow_downward</i>{t('Move Down')}</a>
          </div>
          <div className='col s4'>
            <a className='waves-effect waves-light btn right' onClick={this.onRemove}><i className='material-icons left'>delete</i>{t('Remove')}</a>
          </div>
        </div>
      </div>
    )
  }
}
