// @flow
import * as React from 'react'
import { Row, Col } from 'antd'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {|
  onSelect: Function,
  name: string,
  value: string,
  icon: any,
  selected: boolean
|}

export default class SourceSelectionBox extends React.Component<Props, void> {
  static defaultProps = {
    selected: false
  }

  shouldComponentUpdate (nextProps: Props) {
    if (nextProps.selected !== this.props.selected) return true
    return false
  }

  onSelect = () => {
    this.props.onSelect(this.props.value)
  }

  render () {
    const { selected, icon, name } = this.props

    let border = `2px solid ${MAPHUBS_CONFIG.primaryColor}`
    if (selected) border = `5px solid ${MAPHUBS_CONFIG.primaryColor}`
    return (
      <div
        className=''
        style={{
          textAlign: 'center',
          width: '100px',
          height: '90px',
          margin: 'auto',
          border,
          boxShadow: '5px 5px 10px -5px rgba(0,0,0,0.75)',
          position: 'relative'
        }}
        onClick={this.onSelect}
      >
        <Row justify='center' align='middle' style={{height: '100%'}}>
          <Col>
            {icon}
          </Col>
        </Row>
        <div style={{position: 'absolute', bottom: 0, width: '100px'}}>
          <label>
            <span className='omh-accent-text' style={{fontSize: '12px'}}>{name}</span>
          </label>
        </div>
      </div>
    )
  }
}
