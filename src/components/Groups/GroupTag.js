// @flow
import React from 'react'
import { Avatar, Tooltip } from 'antd'
import MapHubsComponent from '../../components/MapHubsComponent'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import _isequal from 'lodash.isequal'

type Props = {|
  group: string,
  size: number,
  chipWidth: number,
  fontSize: number,
  showTooltip: boolean,
  className: string
|}

type State = {
  failed?: boolean
}

export default class GroupTag extends MapHubsComponent<Props, State> {
  static defaultProps = {
    size: 20,
    chipWidth: 100,
    fontSize: 10,
    showTooltip: false,
    className: ''
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (nextState.failed) {
      return true
    }
    return false
  }

  render () {
    const { group } = this.props
    const { failed } = this.state
    const baseUrl = urlUtil.getBaseUrl()
    if (!group) {
      return ''
    }
    return (
      <div>
        <Tooltip title={group} placement='top' >
          <a target='_blank' className='no-padding' rel='noopener noreferrer' href={`${baseUrl}/group/${group}`} style={{height: 'initial'}}>
            {!failed &&
              <Avatar alt={group} size={24} src={`/img/resize/40?url=/group/${group}/thumbnail`} onError={() => {
                this.setState({failed: true})
              }} />
            }
            {failed &&
              <Avatar size={24} style={{ color: '#FFF' }}>
                {group.charAt(0).toUpperCase()}
              </Avatar>
            }
          </a>
        </Tooltip>
      </div>
    )
  }
}
