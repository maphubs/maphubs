import React from 'react'
import MapHubsComponent from './MapHubsComponent'
import {
  ShareButtons,
  generateShareIcon
} from 'react-share'

const {
  FacebookShareButton,
  TwitterShareButton
} = ShareButtons

const FacebookIcon = generateShareIcon('facebook')
const TwitterIcon = generateShareIcon('twitter')

type Props = {
  style: Object,
  title: LocalizedString,
  url: string,
  photoUrl: string,
  iconSize: number
}

type State = {
  url: string
}

export default class MapHubsShareButtons extends MapHubsComponent<Props, State> {
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
    const title = this._o_(this.props.title)
    return (
      <div style={this.props.style}>
        <div style={{float: 'left'}}>
          <FacebookShareButton
            url={this.state.url}
            quote={title}
            picture={this.props.photoUrl}
          >
            <FacebookIcon
              size={this.props.iconSize}
              round />
          </FacebookShareButton>
        </div>
        <div style={{float: 'right', marginLeft: '3px'}}>
          <TwitterShareButton
            url={this.state.url}
            title={title}
          >
            <TwitterIcon
              size={this.props.iconSize}
              round />
          </TwitterShareButton>
        </div>

      </div>
    )
  }
}
