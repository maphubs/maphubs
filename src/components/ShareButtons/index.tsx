import React, { useState } from 'react'
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
import { useEffect } from 'react'
import useT from '../../hooks/useT'
type Props = {
  style: Record<string, any>
  title: LocalizedString
  url?: string
  photoUrl?: string
  iconSize: number
}
type State = {
  url: string
}
const MapHubsShareButtons = ({
  url,
  title,
  style,
  iconSize,
  photoUrl
}: Props): JSX.Element => {
  const { t } = useT()
  const [local, setLocalUrl] = useState(url)

  useEffect(() => {
    //TODO: not sure if this is still needed, was just a work around for SSR rendering
    if (!url && typeof window !== 'undefined') {
      setLocalUrl(window.location.href)
    }
  }, [url])

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
MapHubsShareButtons.defaultProps = {
  iconSize: 24,
  style: {}
}
export default MapHubsShareButtons
