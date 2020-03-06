// @flow
import React from 'react'
import { Row } from 'antd'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig

type Props = {|
  onSelect: Function,
  name: string,
  value: string,
  icon: string,
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
          width: '105px',
          height: '90px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '20px',
          border,
          boxShadow: '5px 5px 10px -5px rgba(0,0,0,0.75)'
        }}
        onClick={this.onSelect}
      >
        <Row>
          {icon &&
            <i className='material-icons omh-accent-text' style={{fontSize: '48px'}}>{icon}</i>}
        </Row>
        <Row>
          <p className='no-margin'>
            <label>
              <span className='omh-accent-text' style={{fontSize: '13px'}}>{name}</span>
            </label>
          </p>
        </Row>
      </div>
    )
  }
}
