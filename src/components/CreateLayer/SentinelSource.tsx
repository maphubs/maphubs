import React, { useState } from 'react'
import { message, notification, Row } from 'antd'
import useT from '../../hooks/useT'
import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  resetStyle,
  tileServiceInitialized
} from '../../redux/reducers/layerSlice'
import { Layer } from '../../types/layer'

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
  const dispatch = useDispatch()
  const layer_id = useSelector((state) => state.layer.layer_id)

  const submit = async (model: Record<string, any>): Promise<void> => {
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
    const dataSettings = {
      is_external: true,
      external_layer_type: 'sentinel',
      external_layer_config: {
        type: 'multiraster' as Layer['external_layer_config']['type'],
        layers
      }
    }
    try {
      await LayerAPI.saveDataSettings(layer_id, dataSettings)
      message.success(t('Layer Saved'), 1, () => {
        // save in store
        dispatch(saveDataSettings(dataSettings))
        // reset style to load correct source
        dispatch(resetStyle())
        // tell the map that the data is initialized
        dispatch(tileServiceInitialized())

        onSubmit()
      })
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    }
  }

  return (
    <Row>
      <p>Coming Soon!</p>
    </Row>
  )
}
export default SentinelSource
