// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import find from 'lodash.find'
import result from 'lodash.result'
import ReactSelect from 'react-select'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'
import {Tooltip} from 'react-tippy'

type Props = {|
  emptyText: string,
  value: string,
  name: string,
  className: string,
  options: Array<Object>,
  dataTooltip: string,
  dataDelay: number,
  dataPosition: string,
  label: string,
  successText: string,
  id: string,
  onChange: Function,
  startEmpty: boolean,
  icon: string,
  note: string, // optional note that displays below the select, will be updated on selection if option contains a note
  setValue: Function,
  getValue: Function,
  isRequired: Function,
  getErrorMessage: Function
|}

type DefaultProps = {
  startEmpty: boolean,
  emptyText: string,
  name: string,
  id: string,
  options: Array<Object>,
  dataDelay: number
}

type State = {
  note: string
}

class Select extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps: DefaultProps = {
    startEmpty: true,
    emptyText: 'Choose an Option',
    name: 'select-box',
    id: 'select-box',
    options: [],
    dataDelay: 100
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      note: props.note
    }
  }

  componentWillMount () {
    super.componentWillMount()
    this.props.setValue(this.props.value)
    this.setNote(this.props.value)
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.startEmpty && this.props.value !== nextProps.value) {
      this.props.setValue(nextProps.value)
      this.setNote(nextProps.value)
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

  setNote = (val) => {
    const note = result(find(this.props.options, {'value': val}), 'note')
    if (note) {
      this.setState({note})
    }
  }

  handleSelectChange = (selected) => {
    let val
    if (selected) {
      val = selected.value
    }
    this.props.setValue(val)
    this.setNote(val)
    if (this.props.onChange) {
      this.props.onChange(val)
    }
  }

  validate = () => {
    if (this.props.isRequired()) {
      if (this.props.getValue() && this.props.getValue() !== '') {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  render () {
    const value = this.props.getValue()

    let note = ''
    if (this.state.note) {
      /* eslint-disable react/no-danger */
      note = (<div dangerouslySetInnerHTML={{__html: this.state.note}} />)
      /* eslint-enable react/no-danger */
    }

    let icon = ''
    if (this.props.icon) {
      icon = (<i className='material-icons prefix'>{this.props.icon}</i>)
    }

    return (
      <div className={this.props.className}>
        <Tooltip
          disabled={!this.props.dataTooltip}
          title={this.props.dataTooltip}
          position={this.props.dataPosition}
          inertia
          followCursor
        >
          <div ref='selectwrapper' className='input-field no-margin' id={this.props.id} >
            {icon}
            {this.props.label &&
              <div className='row' style={{height: '10px'}}>
                <label htmlFor={this.props.name} data-error={this.props.getErrorMessage()} data-success={this.props.successText}>{this.props.label}</label>
              </div>
            }
            <div className='row no-margin'>
              <ReactSelect
                name={this.props.name}
                value={value}
                placeholder={this.props.emptyText}
                options={this.props.options}
                onChange={this.handleSelectChange}
              />
            </div>
          </div>
          {note}
        </Tooltip>
      </div>
    )
  }
}
export default withFormsy(Select)
