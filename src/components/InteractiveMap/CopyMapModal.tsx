import React from 'react'
import { Modal, message, notification } from 'antd'
import superagent from 'superagent'
import SaveMapPanel from '../MapMaker/SaveMapPanel'
type Props = {
  title: string
  map_id: string
  _csrf?: string
  t: (...args: Array<any>) => any
}
type State = {
  visible: boolean
}
export default class CopyMapModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super()
    this.state = {
      visible: false
    }
  }

  show: () => void = () => {
    this.setState({
      visible: true
    })
  }
  close: () => void = () => {
    this.setState({
      visible: false
    })
  }
  onCopyMap: (formData: any) => Promise<void> = async (
    formData: Record<string, any>
  ) => {
    const { map_id, _csrf, t } = this.props
    const data = {
      map_id,
      title: formData.title,
      group_id: formData.group,
      _csrf
    }

    try {
      const res = await superagent
        .post('/api/map/copy')
        .type('json')
        .accept('json')
        .send(data)
      const mapId = res.body.map_id

      if (mapId) {
        message.info(t('Map Copied'), 3, () => {
          window.location = `/map/edit/${mapId}`
        })
      } else {
        notification.error({
          message: t('Error'),
          description: res.body.error || 'Error saving map',
          duration: 0
        })
      }
    } catch (err) {
      notification.error({
        message: t('Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }

  render(): JSX.Element {
    const { title, t } = this.props
    const { visible } = this.state
    return (
      <Modal
        title={t('Copy Map')}
        visible={visible}
        onOk={this.close}
        centered
        onCancel={this.close}
        footer={[]}
      >
        <SaveMapPanel
          title={title}
          onSave={this.onCopyMap}
          _csrf={this.props._csrf}
        />
      </Modal>
    )
  }
}
