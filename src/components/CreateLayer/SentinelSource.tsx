import React, { useState } from 'react'
import { message, notification, Row } from 'antd'
import LayerActions from '../../actions/LayerActions'
import useT from '../../hooks/useT'

const getAPIUrl = (selected: string): void => {
  // const selectedArr = selected.split(':')
  // const selectedType = selectedArr[0].trim()
  // const selectedScene = selectedArr[1].trim()
  // return url
}

const SentinelSource = ({
  onSubmit
}: {
  onSubmit: () => void
}): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const { t } = useT()

  const submit = (model: Record<string, any>): void => {
    const layers = []
    const selectedIDs = model.selectedIDs
    const selectedIDArr = selectedIDs.split(',')
    for (const selected of selectedIDArr) {
      const url = getAPIUrl(selected)

      layers.push({
        sentinel_secene: selected,
        tiles: [url]
      })
    }
    LayerActions.saveDataSettings(
      {
        is_external: true,
        external_layer_type: 'Sentinel',
        external_layer_config: {
          type: 'multiraster',
          layers
        }
      },
      (err) => {
        if (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString() || err,
            duration: 0
          })
        } else {
          message.success(t('Layer Saved'), 1, () => {
            // reset style to load correct source
            LayerActions.resetStyle()
            // tell the map that the data is initialized
            LayerActions.tileServiceInitialized()

            onSubmit()
          })
        }
      }
    )
  }

  return (
    <Row>
      <p>Coming Soon!</p>
    </Row>
  )
}
export default SentinelSource
