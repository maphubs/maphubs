import React, { useState } from 'react'
import { Modal, Row, Col, Button, Switch, notification, message } from 'antd'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import superagent from 'superagent'
import LinkIcon from '@material-ui/icons/Link'
import useT from '../../hooks/useT'
const { confirm } = Modal
type Props = {
  share_id?: string
  map_id: number
  visible?: boolean
  onClose: () => void
}

const PublicShareModal = ({
  map_id,
  visible,
  onClose,
  share_id
}: Props): JSX.Element => {
  const { t } = useT()
  const [sharing, setSharing] = useState(!!share_id)
  const [shareID, setShareID] = useState(share_id)

  const setPublic = async (isPublic: boolean): Promise<void> => {
    try {
      const res = await superagent
        .post('/api/map/public')
        .type('json')
        .accept('json')
        .send({
          map_id,
          isPublic
        })

      if (!res.body.success) {
        notification.error({
          message: t('Error'),
          description: res.body.error || 'Error saving map',
          duration: 0
        })
      } else {
        setShareID(res.body.share_id)
      }
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }
  const onChange = (checked: boolean): void => {
    if (checked) {
      confirm({
        title: t('Share Map'),
        content: t(
          'Please confirm that you wish to publicly share this map and the data in the associated map layers publicly with anyone who has the link.'
        ),
        okText: t('Create Public Share Link'),
        okType: 'danger',
        cancelText: t('Cancel'),

        onOk() {
          setPublic(checked)
        }
      })
    } else {
      confirm({
        title: t('Deactivate Map Sharing'),
        okText: t('Stop Sharing'),
        okType: 'danger',
        cancelText: t('Cancel'),
        content: t(
          'Warning! The shared link will be destroyed and all shared/embedded maps will no longer work. For security reasons, sharing this map again will generate a new link and will not reactivate the current link.'
        ),

        onOk() {
          setPublic(checked)
        }
      })
    }
  }
  const writeToClipboard = (): void => {
    if (shareID)
      navigator.clipboard.writeText(
        `${urlUtil.getBaseUrl()}/map/share/${shareID}`
      )
    message.info(t('Copied to Clipboard'))
  }

  let shareUrl = ''

  if (shareID) {
    shareUrl = `${urlUtil.getBaseUrl()}/map/share/${shareID}`
  }

  return (
    <Modal
      title={t('Share Map')}
      visible={visible}
      onOk={onClose}
      centered
      onCancel={onClose}
      footer={[
        <Button key='back' onClick={onClose}>
          {t('Close')}
        </Button>,
        <Button
          key='submit'
          type='primary'
          disabled={!shareID}
          onClick={() => {
            writeToClipboard()
            onClose()
          }}
        >
          {t('Copy Link')}
        </Button>
      ]}
    >
      <Row>
        <Row
          style={{
            marginBottom: '10px'
          }}
        >
          <Col span={4}>
            <Switch
              defaultChecked={shareID ? true : false}
              onChange={onChange}
            />
          </Col>
          <Col span={20}>
            {shareID && (
              <p
                style={{
                  fontSize: '16px'
                }}
              >
                <b>{t('Sharing')}</b>&nbsp;-&nbsp;
                <span>{t('Anyone can use this link to view the map.')}</span>
              </p>
            )}
            {!shareID && (
              <p
                style={{
                  fontSize: '16px'
                }}
              >
                <b>{t('Protected')}</b>&nbsp;-&nbsp;
                <span>{t('Only authorized users can see this map.')}</span>
              </p>
            )}
          </Col>
        </Row>
        <Row>
          {shareID && (
            <div>
              <p
                style={{
                  fontSize: '16px'
                }}
              >
                <b>{t('Share Link: ')}</b>
                &nbsp;-&nbsp;
                <a href={shareUrl} target='_blank' rel='noopener noreferrer'>
                  {shareUrl}
                </a>
                <LinkIcon
                  className='omh-accent-text'
                  style={{
                    cursor: 'pointer'
                  }}
                  onClick={writeToClipboard}
                />
              </p>
              <p className='no-margin'>
                {t(
                  'Warning: disabling sharing will invalidate the current link. Sharing again will generate a new unique link.'
                )}
              </p>
            </div>
          )}
          {!shareID && (
            <p>
              {t(
                'Create a public link to this map and associated map layers that can be viewed by anyone with the link without needing a MapHubs account or permissions on this site.'
              )}
            </p>
          )}
        </Row>
      </Row>
    </Modal>
  )
}
export default PublicShareModal
