// @flow
import React from 'react'
import MapHubsComponent from '../../components/MapHubsComponent'
import {Tooltip} from 'react-tippy'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import $ from 'jquery'
import _isequal from 'lodash.isequal'
import classNames from 'classnames'

type Props = {|
  group: string,
  size: number,
  chipWidth: number,
  fontSize: number,
  showTooltip: boolean,
  className: string
|}

type State = {

}

export default class GroupTag extends MapHubsComponent<Props, State> {
  static defaultProps = {
    size: 20,
    chipWidth: 100,
    fontSize: 10,
    showTooltip: false,
    className: ''
  }

  componentDidMount () {
    $(this.refs.groupimg).on('error', function () {
      $(this).attr('src', 'https://hpvhe47439ygwrt.belugacdn.link/maphubs/assets/missing_group.png')
    })
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

  render () {
    const {group, size, fontSize, chipWidth} = this.props
    const baseUrl = urlUtil.getBaseUrl()
    const sizeStr = size + 'px'
    const fontSizeStr = fontSize + 'px'
    const imgWidth = size.toString() + 'px'
    const chipWidthStr = chipWidth.toString() + 'px'
    const className = classNames(['chip', 'truncate', this.props.className])

    return (
      <div className={className}
        style={{height: sizeStr,
          width: chipWidthStr,
          minWidth: '75px',
          marginBottom: '2px',
          border: '0.25pt solid #E4E4E4',
          lineHeight: sizeStr,
          fontSize: fontSizeStr}}>
        <a target='_blank' className='no-padding' rel='noopener noreferrer' href={`${baseUrl}/group/${group}`} style={{height: 'initial'}}>
          <div className='valign-wrapper'
            style={{
              height: sizeStr,
              width: imgWidth,
              backgroundColor: 'white',
              marginRight: '0px',
              marginLeft: '-12px',
              float: 'left'
            }}>
            <img ref='groupimg' className='valign' src={`/img/resize/40?url=/group/${group}/thumbnail`}
              style={{
                height: sizeStr,
                width: 'auto',
                marginRight: 0,
                marginLeft: 0,
                borderRadius: 0
              }}
              alt={'Group Photo'} />
          </div>

        </a>
        <Tooltip
          title={group}
          position='top'
          inertia
          followCursor
        >
          <a target='_blank' rel='noopener noreferrer' className='omh-accent-text no-padding'
            style={{height: sizeStr, width: 'auto', display: 'inherit', lineHeight: sizeStr, fontSize: fontSizeStr}}
            href={`${baseUrl}/group/${group}`}>{group}</a>
        </Tooltip>
      </div>
    )
  }
}
