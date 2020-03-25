// @flow
import React from 'react'
import { Modal, Row, Col, Button, Switch, notification } from 'antd'
import type {LocaleStoreState} from '../../stores/LocaleStore'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import superagent from 'superagent'
import LaunchIcon from '@material-ui/icons/Launch'

const { confirm } = Modal

type Props = {|
  share_id?: string,
  map_id: string,
  _csrf?: string,
  t: Function
|}

type State = {
  share_id?: string,
  visible?: boolean
} & LocaleStoreState

export default class PublicShareModal extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)

    this.state = {
      sharing: !!props.share_id,
      share_id: props.share_id
    }
  }

  clipboard: any

  componentDidMount () {
    this.clipboard = require('clipboard-polyfill').default
  }

  show = () => {
    this.setState({visible: true})
  }

  close = () => {
    this.setState({visible: false})
  }

  setPublic = async (isPublic: boolean) => {
    const {map_id, _csrf, t} = this.props
    try {
      const res = await superagent.post('/api/map/public')
        .type('json').accept('json')
        .send({
          map_id,
          isPublic,
          _csrf
        })
      const share_id = res.body.share_id
      if (!res.body.success) {
        notification.error({
          message: t('Error'),
          description: res.body.error || 'Error saving map',
          duration: 0
        })
      } else {
        this.setState({share_id})
      }
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }

  onChange = (checked: boolean) => {
    const { t } = this.props
    const _this = this
    if (checked) {
      confirm({
        title: t('Share Map'),
        content: t('Please confirm that you wish to publicly share this map and the data in the associated map layers publicly with anyone who has the link.'),
        okText: t('Create Public Share Link'),
        okType: 'danger',
        cancelText: t('Cancel'),
        onOk () {
          _this.setPublic(checked)
        }
      })
    } else {
      confirm({
        title: t('Deactivate Map Sharing'),
        okText: t('Stop Sharing'),
        okType: 'danger',
        cancelText: t('Cancel'),
        content: t('Warning! The shared link will be destroyed and all shared/embedded maps will no longer work. For security reasons, sharing this map again will generate a new link and will not reactivate the current link.'),
        onOk () {
          _this.setPublic(checked)
        }
      })
    }
  }

  writeToClipboard = () => {
    const share_id = this.state.share_id
    if (share_id) this.clipboard.writeText(`${urlUtil.getBaseUrl()}/map/share/${share_id}`)
  }

  render () {
    const { t } = this.props
    const { share_id, visible } = this.state
    let shareUrl = ''

    if (share_id) {
      shareUrl = `${urlUtil.getBaseUrl()}/map/share/${share_id}`
    }

    return (
      <Modal
        title={t('Share Map')}
        visible={visible}
        onOk={this.close}
        centered
        onCancel={this.close}
        footer={[
          <Button key='back' onClick={this.close}>
            {t('Close')}
          </Button>,
          <Button
            key='submit' type='primary' disabled={!share_id} onClick={() => {
              this.writeToClipboard()
              this.close()
            }}
          >
            {t('Copy Link')}
          </Button>
        ]}
      >
        <Row>
          <Row style={{marginBottom: '10px'}}>
            <Col span={4}>
              <Switch defaultChecked={share_id} onChange={this.onChange} />
            </Col>
            <Col span={20}>
              {share_id &&
                <p style={{fontSize: '16px'}}><b>{t('Sharing')}</b>&nbsp;-&nbsp;<span>{t('Anyone can use this link to view the map.')}</span></p>}
              {!share_id &&
                <p style={{fontSize: '16px'}}><b>{t('Protected')}</b>&nbsp;-&nbsp;<span>{t('Only authorized users can see this map.')}</span></p>}
            </Col>
          </Row>
          <Row>
            {share_id &&
              <div>
                <p style={{fontSize: '16px'}}><b>{t('Share Link: ')}</b>
                &nbsp;-&nbsp;
                  <a href={shareUrl} target='_blank' rel='noopener noreferrer'>{shareUrl}</a>
                  <LaunchIcon className='omh-accent-text' style={{cursor: 'pointer'}} onClick={this.writeToClipboard} />
                </p>
                <p className='no-margin'>{t('Warning: disabling sharing will invalidate the current link. Sharing again will generate a new unique link.')}</p>
              </div>}
            {!share_id &&
              <p>{t('Create a public link to this map and associated map layers that can be viewed by anyone with the link without needing a MapHubs account or permissions on this site.')}</p>}
          </Row>
        </Row>
      </Modal>
    )
  }
}
