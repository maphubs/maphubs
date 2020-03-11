// @flow
import React from 'react'
import {withFormsy} from 'formsy-react'
import { Select, Row, Tooltip } from 'antd'
import find from 'lodash.find'
import result from 'lodash.result'

const { Option } = Select

type Props = {|
  emptyText: string,
  value: string,
  name: string,
  options: Array<Object>,
  dataTooltip: string,
  dataPosition: string,
  label: string,
  successText: string,
  id: string,
  onChange: Function,
  startEmpty: boolean,
  icon: string,
  note: string, // optional note that displays below the select, will be updated on selection if option contains a note
  setValue: Function,
  value: string,
  isRequired: boolean,
  errorMessage: string,
  showSearch: boolean
|}

type State = {
  note: string
}

class SelectFormItem extends React.Component<Props, State> {
  static defaultProps = {
    startEmpty: true,
    emptyText: 'Choose an Option',
    name: 'select-box',
    id: 'select-box',
    options: [],
    dataDelay: 100,
    showSearch: true
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      note: props.note
    }
  }

  componentDidMount () {
    this.props.setValue(this.props.value)
    this.setNote(this.props.value)
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!nextProps.startEmpty && this.props.value !== nextProps.value) {
      this.props.setValue(nextProps.value)
      this.setNote(nextProps.value)
    }
  }

  setNote = (val: string) => {
    const note = result(find(this.props.options, {value: val}), 'note')
    if (note) {
      this.setState({note})
    }
  }

  handleSelectChange = (val: string) => {
    this.props.setValue(val)
    this.setNote(val)
    if (this.props.onChange) {
      this.props.onChange(val)
    }
  }

  validate = () => {
    if (this.props.isRequired) {
      if (this.props.value && this.props.value !== '') {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  render () {
    const { id, name, options, icon, label, dataTooltip, dataPosition, errorMessage, successText, emptyText, showSearch, value } = this.props
    const { note } = this.state

    /* eslint-disable react/no-danger */

    return (
      <Tooltip
        title={dataTooltip}
        placement={dataPosition}
      >
        <div ref='selectwrapper' className='input-field no-margin' id={id}>
          {icon &&
            <i className='material-icons prefix'>{icon}</i>}
          {label &&
            <div className='row' style={{height: '10px'}}>
              <label htmlFor={name} data-error={errorMessage} data-success={successText}>{label}</label>
            </div>}
          <Row>
            <Select
              showSearch={showSearch}
              defaultValue={value}
              onChange={this.handleSelectChange}
              allowClear
              placeholder={emptyText}
              style={{ width: '100%' }}
              filterOption={(input, option) => {
                // eslint-disable-next-line unicorn/prefer-includes
                return option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }}
            >
              {options.map((option) =>
                <Option key={option.value} value={option.value}>{option.label}</Option>
              )}
            </Select>
            <style jsx global>{`
              .ant-select-dropdown-menu-item-active:not(.ant-select-dropdown-menu-item-disabled) {
                color: #FFF;
              }
            `}
            </style>
          </Row>
        </div>
        {note &&
          <div dangerouslySetInnerHTML={{__html: note}} />}
      </Tooltip>
    )
  }
}
export default withFormsy(SelectFormItem)
