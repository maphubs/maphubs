import React from 'react'
import {
  FacebookShareButton,
  TwitterShareButton,
  FacebookIcon,
  TwitterIcon
} from 'react-share'

type Props = {
  style: Object,
  title: LocalizedString,
  url: string,
  photoUrl: string,
  iconSize: number,
  t: Function
}

type State = {
  url: string
}

export default class MapHubsShareButtons extends React.Component<Props, State> {
  props: Props

  static defaultProps = {
    iconSize: 32,
    style: {}
  }

  state: State

  constructor (props: Props) {
    super(props)
    this.state = {
      url: props.url ? props.url : ''
    }
  }

  componentDidMount () {
    if (!this.props.url) {
      this.setState({url: window.location.href})
    }
  }

  render () {
    const {title, style, iconSize, photoUrl, t} = this.props
    const {url} = this.state
    const localizedTitle = t(title)
    return (
      <div style={style}>
        <div style={{float: 'left'}}>
          <FacebookShareButton
            url={url}
            quote={localizedTitle}
            picture={photoUrl}
          >
            <FacebookIcon size={iconSize} round />
          </FacebookShareButton>
        </div>
        <div style={{float: 'right', marginLeft: '3px'}}>
          <TwitterShareButton
            url={this.state.url}
            title={localizedTitle}
          >
            <TwitterIcon size={iconSize} round />
          </TwitterShareButton>
        </div>
      </div>
    )
  }
}
