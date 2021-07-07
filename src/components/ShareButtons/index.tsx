import React from 'react'
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon
} from 'react-share'
import { Row, Col } from 'antd'
import { LocalizedString } from '../../types/LocalizedString'
type Props = {
  style: Record<string, any>
  title: LocalizedString
  url?: string
  photoUrl?: string
  iconSize: number
  t: (...args: Array<any>) => any
}
type State = {
  url: string
}
export default class MapHubsShareButtons extends React.Component<Props, State> {
  props: Props
  static defaultProps = {
    iconSize: 24,
    style: {}
  }
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {
      url: props.url ? props.url : ''
    }
  }

  componentDidMount(): void {
    if (!this.props.url) {
      this.setState({
        url: window.location.href
      })
    }
  }

  render(): JSX.Element {
    const { title, style, iconSize, photoUrl, t } = this.props
    const { url } = this.state
    const localizedTitle = t(title)
    return (
      <div style={style}>
        <Row justify='center' align='middle'>
          <Col
            span={6}
            style={{
              width: iconSize + 3
            }}
          >
            <FacebookShareButton
              url={url}
              quote={localizedTitle}
              picture={photoUrl}
            >
              <FacebookIcon size={iconSize} round />
            </FacebookShareButton>
          </Col>
          <Col
            span={6}
            style={{
              width: iconSize + 3
            }}
          >
            <TwitterShareButton url={url} title={localizedTitle}>
              <TwitterIcon size={iconSize} round />
            </TwitterShareButton>
          </Col>
          <Col
            span={6}
            style={{
              width: iconSize + 3
            }}
          >
            <LinkedinShareButton url={url} title={localizedTitle}>
              <LinkedinIcon size={iconSize} round />
            </LinkedinShareButton>
          </Col>
          <Col
            span={6}
            style={{
              width: iconSize + 3
            }}
          >
            <WhatsappShareButton url={url} title={localizedTitle}>
              <WhatsappIcon size={iconSize} round />
            </WhatsappShareButton>
          </Col>
        </Row>
      </div>
    )
  }
}
