// @flow
import React from 'react'
import { Button } from 'antd'

type Props = {|
  getIsochronePoint: Function,
  clearIsochroneLayers: Function,
  isochroneResult?: Object,
  t: Function
|}

type State = {
  selectingLocation: boolean
}

export default class IsochronePanel extends React.Component<Props, State> {
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
    const {t, isochroneResult} = this.props
    let message, clearButton, selectButton
    if (isochroneResult) {
      message = (
        <p>
          {t('Displaying Result')}
        </p>
      )

      clearButton = (
        <Button type='primary' onClick={this.clear}>{t('Clear Results')}</Button>
      )
    } else if (this.state.selectingLocation) {
      message = (
        <p>
          {t('Click a location on the map.')}
        </p>
      )
    } else {
      selectButton = (
        <Button type='primary' onClick={this.selectLocation}>{t('Select Location')}</Button>
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
