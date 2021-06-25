import React from 'react'
import Formsy from 'formsy-react'
import Radio from './forms/radio'
import { Modal, Button } from 'antd'
type Props = {
  onCancel?: (...args: Array<any>) => any
  onSubmit?: (...args: Array<any>) => any
  options: Array<Record<string, any>>
  title: string
  t: any
}
type State = {
  show: boolean
  canSubmit: boolean
  selectedOption: string
}
export default class RadioModal extends React.Component<Props, State> {
  props: Props
  static defaultProps: {
    onCancel: () => void
    onSubmit: () => void
    options: Array<any>
    title: string
  } = {
    onCancel() {},
    onSubmit() {},
    options: [],
    title: ''
  }
  state: State = {
    show: false,
    canSubmit: false,
    selectedOption: ''
  }
  show: () => void = () => {
    this.setState({
      show: true
    })
  }
  hide: () => void = () => {
    this.setState({
      show: false
    })
  }
  onCancel: () => void = () => {
    if (this.props.onCancel) this.props.onCancel()
    this.hide()
  }
  onSubmit: () => void = () => {
    this.props.onSubmit(this.state.selectedOption)
    this.hide()
  }
  enableButton: () => void = () => {
    this.setState({
      canSubmit: true
    })
  }
  disableButton: () => void = () => {
    this.setState({
      canSubmit: false
    })
  }
  optionChange: (value: string) => void = (value: string) => {
    this.setState({
      selectedOption: value
    })
  }

  render(): JSX.Element {
    const { t, title, options } = this.props
    return (
      <Modal
        title={title}
        visible={this.state.show}
        onOk={this.onSubmit}
        centered
        footer={[
          <Button key='back' onClick={this.onCancel}>
            {t('Cancel')}
          </Button>,
          <Button
            key='submit'
            type='primary'
            disabled={!this.state.canSubmit}
            onClick={this.onSubmit}
          >
            {t('Submit')}
          </Button>
        ]}
        onCancel={this.onCancel}
      >
        <Formsy onValid={this.enableButton} onInvalid={this.disableButton}>
          <Radio
            name='type'
            label=''
            options={options}
            onChange={this.optionChange}
          />
        </Formsy>
      </Modal>
    )
  }
}
