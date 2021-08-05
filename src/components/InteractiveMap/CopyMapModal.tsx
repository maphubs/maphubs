import React from 'react'
import { useRouter } from 'next/router'
import { Modal, message, notification } from 'antd'
import superagent from 'superagent'
import SaveMapPanel from '../Maps/MapMaker/SaveMapPanel'
import { LocalizedString } from '../../types/LocalizedString'
import useT from '../../hooks/useT'
type Props = {
  title: LocalizedString
  map_id: number
  visible: boolean
  onClose: () => void
}

const CopyMapModal = ({
  title,
  map_id,
  visible,
  onClose
}: Props): JSX.Element => {
  const { t } = useT()
  const router = useRouter()

  const onCopyMap = async (formData: {
    title: LocalizedString
    group: string
  }) => {
    const data = {
      map_id,
      title: formData.title,
      group_id: formData.group
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
          router.push(`/map/edit/${mapId}`)
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

  return (
    <Modal
      title={t('Copy Map')}
      visible={visible}
      onOk={onClose}
      centered
      onCancel={onClose}
      footer={[]}
    >
      <SaveMapPanel title={title} onSave={onCopyMap} />
    </Modal>
  )
}
export default CopyMapModal
