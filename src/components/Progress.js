// @flow
import React from 'react'
import {Modal, ModalContent} from './Modal/Modal'

type Props = {
  id: string,
  onClose?: Function,
  show: boolean,
  title: string,
  subTitle: string
}

type State = {
  show: boolean
}

export default class Progress extends React.Component<Props, State> {
  static defaultProps = {
    id: 'progress',
    show: false
  }

  constructor (props: Props) {
    super(props)
    this.state = {
      show: props.show
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    if (this.props.show !== nextProps.show) {
      this.setState({
        show: nextProps.show
      })
    }
  }

  onClose = () => {
    this.setState({show: false})
    if (this.props.onClose) this.props.onClose()
  }

  render () {
    let subTitle = ''
    if (this.props.subTitle) {
      subTitle = (
        <div className='row'>
          <p className='center'>{this.props.subTitle}</p>
        </div>
      )
    }
    return (
      <Modal id={this.props.id} show={this.state.show} dismissible={false} fixedFooter={false}>
        <ModalContent className='valign-wrapper'>
          <div className='container'>
            <div className='row'>
              <h4 className='center'>{this.props.title}</h4>
            </div>
            {subTitle}
            <div className='row'>
              <div className='progress'>
                <div className='indeterminate' />
              </div>
            </div>
          </div>
        </ModalContent>

      </Modal>
    )
  }
}
