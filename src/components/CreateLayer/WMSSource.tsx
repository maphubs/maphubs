import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import TextInput from '../forms/textInput'
import { message, notification, Row, Button } from 'antd'
import LinkIcon from '@material-ui/icons/Link'
import HeightIcon from '@material-ui/icons/Height'
import AspectRatioIcon from '@material-ui/icons/AspectRatio'
import useT from '../../hooks/useT'
import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  resetStyle,
  tileServiceInitialized
} from '../../redux/reducers/layerSlice'
import { Layer } from '../../types/layer'

const WMSSource = ({ onSubmit }: { onSubmit: () => void }): JSX.Element => {
  const [canSubmit, setCanSubmit] = useState(false)
  const { t } = useT()
  const dispatch = useDispatch()
  const layer_id = useSelector((state) => state.layer.layer_id)

  addValidationRule('isHttps', (values, value: string) => {
    return value ? value.startsWith('https://') : false
  })

  const submit = async (model: Record<string, any>): Promise<void> => {
    let boundsArr

    if (model.bounds) {
      boundsArr = model.bounds.split(',')
      boundsArr = boundsArr.map((item) => {
        return item.trim()
      })
    }

    // Example WMS URL
    // 'https://geodata.state.nj.us/imagerywms/Natural2015?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=Natural2015'
    const urlParts = model.rasterTileUrl.split('?')
    let baseUrl
    let layers = ''
    let url

    if (urlParts && urlParts.length > 0) {
      baseUrl = urlParts[0]

      if (!model.layers && urlParts.length === 2) {
        const queryParts = urlParts[1].split('&')
        for (const part of queryParts) {
          const keyVal = part.split('=')

          if (keyVal[0] === 'layers') {
            layers = keyVal[1]
          }
        }
      }

      url = `${baseUrl}?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=${layers}`

      if (model.other) {
        url += `${model.other}`
      }

      const dataSettings = {
        is_external: true,
        external_layer_type: 'WMS',
        external_layer_config: {
          type: 'raster' as Layer['external_layer_config']['type'],
          minzoom: model.minzoom,
          maxzoom: model.maxzoom,
          bounds: boundsArr,
          tiles: [url]
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
          message: t('Error'),
          description: err.message || err.toString() || err,
          duration: 0
        })
      }
    } else {
      notification.error({
        message: t('Error'),
        description: 'WMS missing required "layers" value',
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
        style={{
          width: '100%'
        }}
      >
        <div>
          <p>
            <b>{t('WMS Source')}</b>
          </p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='rasterTileUrl'
              label={t('WMS URL')}
              icon={<LinkIcon />}
              validations='maxLength:500,isHttps'
              validationErrors={{
                maxLength: t('Must be 500 characters or less.'),
                isHttps: t(
                  'SSL required for external links, URLs must start with https://'
                )
              }}
              length={500}
              tooltipPosition='top'
              tooltip={
                t(
                  'Only layers paramater is required, others will be ignored unless pasted in Other Parameters below. Example:'
                ) +
                'https://geodata.state.nj.us/imagerywms/Natural2015?layers=Natural2015'
              }
              required
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='other'
              label={t('Other Parameters (Optional)')}
              icon={<LinkIcon />}
              tooltipPosition='top'
              tooltip={t(
                'Additional needed URL parmeters, for example: apikey=1234&query=value>0'
              )}
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='minzoom'
              label={t('MinZoom (Optional)')}
              icon={<HeightIcon />}
              tooltipPosition='top'
              tooltip={t('Lowest tile zoom level available in data')}
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='maxzoom'
              label={t('MaxZoom (Optional)')}
              icon={<HeightIcon />}
              tooltipPosition='top'
              tooltip={t('Highest tile zoom level available in data')}
              t={t}
            />
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='bounds'
              label={t('Bounds (Optional)')}
              icon={<AspectRatioIcon />}
              tooltipPosition='top'
              tooltip={t(
                'Comma delimited WGS84 coordinates for extent of the data: minx, miny, maxx, maxy'
              )}
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
export default WMSSource
