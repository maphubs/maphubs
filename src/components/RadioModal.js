// @flow
import React from 'react'
import Formsy from 'formsy-react'
import Radio from './forms/radio'
import { Modal, Button } from 'antd'

type Props = {
  onCancel: Function,
  onSubmit: Function,
  options: Array<Object>,
  title: string,
  t: Function
}

type State = {
  show: boolean,
  canSubmit: boolean,
  selectedOption: string
}

export default class RadioModal extends React.Component<Props, State> {
  props: Props

  static defaultProps = {
    onCancel () {},
    onSubmit () {},
    options: [],
    title: ''
  }

  state = {
    show: false,
    canSubmit: false,
    selectedOption: ''
  }

  show = () => {
    this.setState({show: true})
  }

  hide = () => {
    this.setState({show: false})
  }

  onCancel = () => {
    if (this.props.onCancel) this.props.onCancel()
    this.hide()
  }

  onSubmit = () => {
    this.props.onSubmit(this.state.selectedOption)
    this.hide()
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

  optionChange = (value: string) => {
    this.setState({selectedOption: value})
  }

  render () {
    const { t } = this.props
    return (
      <Modal
        title={this.props.title}
        visible={this.state.show}
        onOk={this.onSubmit}
        centered
        footer={[
          <Button key='back' onClick={this.onCancel}>
            {t('Cancel')}
          </Button>,
          <Button key='submit' type='primary' disabled={!this.state.canSubmit} onClick={this.onSubmit}>
            {t('Submit')}
          </Button>
        ]}
        onCancel={this.onCancel}
      >
        <Formsy onValid={this.enableButton} onInvalid={this.disableButton}>
          <Radio name='type' label='' options={this.props.options} onChange={this.optionChange}
          />
        </Formsy>
      </Modal>
    )
  }
}
