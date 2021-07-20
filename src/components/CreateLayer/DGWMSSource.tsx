import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, message, notification, Button } from 'antd'
import TextInput from '../forms/textInput'
import LayerActions from '../../actions/LayerActions'
import useT from '../../hooks/useT'

const DGWMSSource = ({ onSubmit }: { onSubmit: () => void }): JSX.Element => {
  const { t } = useT()

  const [canSubmit, setCanSubmit] = useState(false)
  addValidationRule('isHttps', (values, value: string) => {
    return value ? value.startsWith('https://') : false
  })

  const submit = (model: Record<string, any>): void => {
    const layers = 'DigitalGlobe:Imagery'
    let url = `https://services.digitalglobe.com/mapservice/wmsaccess?bbox={bbox-epsg-3857}&format=image/png&transparent=true&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=512&height=512&layers=${layers}&connectid={DG_WMS_CONNECT_ID}&COVERAGE_CQL_FILTER=legacyId='${model.featureid.trim()}'`

    if (model.username) {
      url += `&username=${model.username}&password=${model.password}`
    }

    LayerActions.saveDataSettings(
      {
        is_external: true,
        external_layer_type: 'DGWMS',
        external_layer_config: {
          type: 'raster',
          minzoom: model.minzoom,
          maxzoom: model.maxzoom,
          bounds: undefined,
          tileSize: 512,
          tiles: [url] // authUrl: 'https://services.digitalglobe.com',
          // authToken: window.btoa(`${model.username}:${model.password}`)
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
