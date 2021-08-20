import React, { useState } from 'react'
import Formsy from 'formsy-react'
import TextArea from '../forms/textArea'
import { message, notification, Row, Button } from 'antd'
import useT from '../../hooks/useT'

import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  resetStyle,
  tileServiceInitialized
} from '../../redux/reducers/layerSlice'
import { Layer } from '../../types/layer'

const getAPIUrl = (selected: string): string => {
  const selectedArr = selected.split(':')
  const selectedType = selectedArr[0].trim()
  const selectedScene = selectedArr[1].trim()
  // build planet labs API URL
  // v1 https://tiles.planet.com/data/v1/PSScene3Band/20161221_024131_0e19/14/12915/8124.png?api_key=your-api-key
  const url = `https://tiles.planet.com/data/v1/${selectedType}/${selectedScene}/{z}/{x}/{y}.png?api_key=${process.env.NEXT_PUBLIC_PLANET_LABS_API_KEY}`
  return url
}

const PlanetLabsSource = ({
  onSubmit
}: {
  onSubmit: () => void
}): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()
  const layer_id = useSelector((state) => state.layer.layer_id)

  const [canSubmit, setCanSubmit] = useState(false)

  const submit = async (model: Record<string, any>): Promise<void> => {
    const layers = []
    const selectedIDs = model.selectedIDs
    const selectedIDArr = selectedIDs.split(',')
    for (const selected of selectedIDArr) {
      const url = getAPIUrl(selected)

      layers.push({
        planet_labs_scene: selected,
        tiles: [url]
      })
    }
    const dataSettings = {
      is_external: true,
      external_layer_type: 'Planet',
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
    <Row
      style={{
        marginBottom: '20px'
      }}
    >
      <Formsy
        onValidSubmit={submit}
        onValid={() => {
          setCanSubmit(true)
        }}
        onInvalid={() => {
          setCanSubmit(false)
        }}
      >
        <div>
          <p>{t('Paste the selected IDs from the Planet Explorer API box')}</p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextArea
              name='selectedIDs'
              label={t('Planet Explorer Selected IDs')}
              length={2000}
              icon='info'
              required
              t={t}
            />
          </Row>
        </div>
        <div
          style={{
            float: 'right'
          }}
        >
          <Button type='primary' htmlType='submit' disabled={!canSubmit}>
            {t('Save and Continue')}
          </Button>
        </div>
      </Formsy>
    </Row>
  )
}
export default PlanetLabsSource
