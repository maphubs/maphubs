import React, { useState, useEffect } from 'react'
import { Modal, Switch, Row, message, Alert, Tooltip } from 'antd'
import { htmlEncode } from 'js-htmlencode'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import useT from '../../hooks/useT'

type Props = {
  show?: boolean
  onClose: (...args: Array<any>) => any
  share_id?: string
  map_id: number
}
type State = {
  interactive?: boolean
  visible?: boolean
}
const EmbedCodeModal = ({
  show,
  share_id,
  map_id,
  onClose
}: Props): JSX.Element => {
  const { t } = useT()
  const [visible, setVisible] = useState(show)
  const [interactive, setInteractive] = useState(false)
  useEffect(() => {
    if (visible !== show) setVisible(show)
  }, [show, visible])

  const close = (): void => {
    setVisible(false)
    onClose()
  }

  const baseUrl = urlUtil.getBaseUrl()
  const mode = interactive ? 'interactive' : 'static'

  const url = share_id
    ? `${baseUrl}/map/public-embed/${share_id}/${mode}`
    : `${baseUrl}/map/embed/${map_id}/${mode}`

  const code = `
  <iframe src="${url}"
    style="width: 100%; height: 350px;" frameborder="0" 
    allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"
  >
  </iframe>
  `
  return (
    <Modal
      visible={show}
      title={t('Embed Code')}
      width='75%'
      afterClose={close}
      onOk={() => {
        navigator.clipboard.writeText(code)
        message.info('Copied')
        close()
      }}
      okText={t('Copy to Clipboard')}
      onCancel={close}
      cancelText={t('Cancel')}
    >
      <Row>
        <p>{t('Paste the following code into your website to embed a map:')}</p>
      </Row>
      <Row
        style={{
          overflow: 'auto'
        }}
      >
        <pre
          style={{
            width: '100%'
          }}
        >
          <code
            style={{
              width: '100%'
            }}
            dangerouslySetInnerHTML={{
              __html: htmlEncode(code)
            }}
          />
        </pre>
      </Row>
      {!share_id && process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true' && (
        <Row
          style={{
            marginBottom: '20px'
          }}
        >
          <Alert
            message={t(
              'Login required to view this embed, enable sharing for public embeds.'
            )}
            type='warning'
          />
        </Row>
      )}
      <Row>
        <Tooltip
          title={t('Map image with play button (best performance)')}
          placement='left'
        >
          <span
            style={{
              marginRight: '10px'
            }}
          >
            {t('Normal')}
          </span>
        </Tooltip>
        <Switch
          checked={interactive}
          onChange={(checked) => {
            setInteractive(checked)
          }}
        />
        <Tooltip
          title={t('Interactive map (no play button)')}
          placement='right'
        >
          <span
            style={{
              marginLeft: '10px'
            }}
          >
            {t('Interactive')}
          </span>
        </Tooltip>
      </Row>
    </Modal>
  )
}
export default EmbedCodeModal
