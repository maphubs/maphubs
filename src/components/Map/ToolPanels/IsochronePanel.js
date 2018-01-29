// @flow
import React from 'react'
import MapHubsComponent from '../../MapHubsComponent'

type Props = {|
  getIsochronePoint: Function,
  clearIsochroneLayers: Function,
  isochroneResult?: Object
|}

type State = {
  selectingLocation: boolean
}

export default class IsochronePanel extends MapHubsComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      selectingLocation: false
    }
  }

  selectLocation = () => {
    this.setState({selectingLocation: true})
    this.props.getIsochronePoint()
  }

  clear = () => {
    this.setState({selectingLocation: false})
    this.props.clearIsochroneLayers()
  }

  render () {
    let message, clearButton, selectButton
    if (this.props.isochroneResult) {
      message = (
        <p>
          {this.__('Displaying Result')}
        </p>
      )

      clearButton = (
        <a className='btn' onClick={this.clear}>{this.__('Clear Results')}</a>
      )
    } else if (this.state.selectingLocation) {
      message = (
        <p>
          {this.__('Click a location on the map.')}
        </p>
      )
    } else {
      selectButton = (
        <a className='btn' onClick={this.selectLocation}>{this.__('Select Location')}</a>
      )
    }

    return (
      <div style={{width: '100%', textAlign: 'center'}}>
        {selectButton}
        {message}
        {clearButton}
      </div>
    )
  }
}
