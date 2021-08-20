import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, message, notification, Button } from 'antd'
import TextInput from '../forms/textInput'
import useT from '../../hooks/useT'

import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  resetStyle,
  tileServiceInitialized
} from '../../redux/reducers/layerSlice'
import { Layer } from '../../types/layer'

const DGWMSSource = ({ onSubmit }: { onSubmit: () => void }): JSX.Element => {
  const { t } = useT()
  const dispatch = useDispatch()

  const [canSubmit, setCanSubmit] = useState(false)

  const layer_id = useSelector((state) => state.layer.layer_id)

  addValidationRule('isHttps', (values, value: string) => {
    return value ? value.startsWith('https://') : false
  })

  const submit = async (model: Record<string, any>): Promise<void> => {
    const layers = 'DigitalGlobe:Imagery'
    let url = `https://services.digitalglobe.com/mapservice/wmsaccess?bbox={bbox-epsg-3857}&format=image/png&transparent=true&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=512&height=512&layers=${layers}&connectid={DG_WMS_CONNECT_ID}&COVERAGE_CQL_FILTER=legacyId='${model.featureid.trim()}'`

    if (model.username) {
      url += `&username=${model.username}&password=${model.password}`
    }

    try {
      const dataSettings = {
        is_external: true,
        external_layer_type: 'DGWMS',
        external_layer_config: {
          type: 'raster' as Layer['external_layer_config']['type'],
          minzoom: model.minzoom,
          maxzoom: model.maxzoom,
          bounds: undefined,
          tileSize: 512,
          tiles: [url] // authUrl: 'https://services.digitalglobe.com',
          // authToken: window.btoa(`${model.username}:${model.password}`)
        }
      }
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
          <p>
            DigitalGlobe{' '}
            <a
              href='https://discover.digitalglobe.com/'
              target='_blank'
              rel='noopener noreferrer'
            >
              https://discover.digitalglobe.com/
            </a>
          </p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='featureid'
              label={t('DG Image ID')}
              icon='info'
              tooltipPosition='top'
              tooltip={t('DigitalGlobe Image ID / Legacy ID')}
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
export default DGWMSSource
