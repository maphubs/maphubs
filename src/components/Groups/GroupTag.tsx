import React from 'react'
import { Avatar, Tooltip } from 'antd'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
type Props = {
  group: string
  size: number
}
type State = {
  failed?: boolean
}
export default class GroupTag extends React.Component<Props, State> {
  static defaultProps = {
    size: 24
  }

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    if (nextState.failed !== this.state.failed) return true
    return false
  }

  render(): JSX.Element {
    const { group, size } = this.props
    const { failed } = this.state
    const baseUrl = urlUtil.getBaseUrl()

    if (!group) {
      return <></>
    }

    return (
      <div>
        <Tooltip title={group} placement='top'>
          <a
            target='_blank'
            className='no-padding'
            rel='noopener noreferrer'
            href={`${baseUrl}/group/${group}`}
            style={{
              height: 'initial'
            }}
          >
            {!failed && (
              <Avatar
                alt={group}
                size={size}
                src={`/group/${group}/image.png`}
                onError={() => {
                  this.setState({
                    failed: true
                  })
                }}
              />
            )}
            {failed && (
              <Avatar
                size={size}
                style={{
                  color: '#FFF'
                }}
              >
                {group.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </a>
        </Tooltip>
      </div>
    )
  }
}
