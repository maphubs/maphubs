import type { Element } from 'React'
import React from 'react'
import { Button } from 'antd'
type Props = {
  getIsochronePoint: (...args: Array<any>) => any
  clearIsochroneLayers: (...args: Array<any>) => any
  isochroneResult?: Record<string, any>
  t: (...args: Array<any>) => any
}
type State = {
  selectingLocation: boolean
}
export default class IsochronePanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectingLocation: false
    }
  }

  selectLocation: () => void = () => {
    this.setState({
      selectingLocation: true
    })
    this.props.getIsochronePoint()
  }
  clear: () => void = () => {
    this.setState({
      selectingLocation: false
    })
    this.props.clearIsochroneLayers()
  }

  render(): Element<'div'> {
    const { t, isochroneResult } = this.props
    const { selectingLocation } = this.state
    let message

    if (isochroneResult) {
      message = <p>{t('Displaying Result')}</p>
    } else if (selectingLocation) {
      message = <p>{t('Click a location on the map.')}</p>
    }

    return (
      <div
        style={{
          width: '100%',
          textAlign: 'center'
        }}
      >
        {!isochroneResult && (
          <Button type='primary' onClick={this.selectLocation}>
            {t('Select Location')}
          </Button>
        )}
        {message}
        {(isochroneResult || selectingLocation) && (
          <Button type='primary' onClick={this.clear}>
            {t('Reset')}
          </Button>
        )}
      </div>
    )
  }
}