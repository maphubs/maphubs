// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import { Select, Row, Tooltip } from 'antd'
import find from 'lodash.find'
import result from 'lodash.result'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'

const { Option } = Select

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

type State = {
  note: string
}

class SelectFormItem extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
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

  setNote = (val) => {
    const note = result(find(this.props.options, {value: val}), 'note')
    if (note) {
      this.setState({note})
    }
  }

  handleSelectChange = (val) => {
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
    const { id, name, options, icon, label, className, dataTooltip, dataPosition, getErrorMessage, successText, emptyText } = this.props
    const { note } = this.state
    const value = this.props.getValue()

    /* eslint-disable react/no-danger */

    return (
      <div className={className}>
        <Tooltip
          title={dataTooltip}
          placement={dataPosition}
        >
          <div ref='selectwrapper' className='input-field no-margin' id={id} >
            {icon &&
              <i className='material-icons prefix'>{icon}</i>
            }
            {label &&
              <div className='row' style={{height: '10px'}}>
                <label htmlFor={name} data-error={getErrorMessage()} data-success={successText}>{label}</label>
              </div>
            }
            <Row>
              <Select
                defaultValue={value}
                onChange={this.handleSelectChange}
                allowClear
                placeholder={emptyText}
                style={{ width: '100%' }}
              >
                {options.map((option) =>
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                )}
              </Select>
              <style jsx global>{`
                .ant-select-dropdown-menu-item-active:not(.ant-select-dropdown-menu-item-disabled) {
                  color: #FFF;
                }
              `}</style>
            </Row>
          </div>
          {note &&
            <div dangerouslySetInnerHTML={{__html: note}} />
          }
        </Tooltip>
      </div>
    )
  }
}
export default withFormsy(SelectFormItem)
