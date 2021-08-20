import React, { useState } from 'react'
import Formsy, { addValidationRule } from 'formsy-react'
import TextInput from '../forms/textInput'
import LinkIcon from '@material-ui/icons/Link'
import HeightIcon from '@material-ui/icons/Height'
import AspectRatioIcon from '@material-ui/icons/AspectRatio'
import { Row, message, notification, Button } from 'antd'
import useT from '../../hooks/useT'

import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import {
  saveDataSettings,
  resetStyle,
  tileServiceInitialized
} from '../../redux/reducers/layerSlice'
import { Layer } from '../../types/layer'

type Props = {
  onSubmit: (...args: Array<any>) => any
}
type State = {
  canSubmit: boolean
  selectedSource?: string
}
const RasterTileSource = ({ onSubmit }: Props): JSX.Element => {
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
    const dataSettings = {
      is_external: true,
      external_layer_type: 'Raster Tile Service',
      external_layer_config: {
        type: 'raster' as Layer['external_layer_config']['type'],
        minzoom: Number.parseInt(model.minzoom, 10),
        maxzoom: Number.parseInt(model.maxzoom, 10),
        bounds: boundsArr,
        tiles: [model.rasterTileUrl]
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
        style={{
          width: '100%'
        }}
      >
        <div>
          <p>
            <b>{t('Raster Tile Source')}</b>
          </p>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <TextInput
              name='rasterTileUrl'
              label={t('Raster Tile URL')}
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
                t('Raster URL for example:') +
                'http://myserver/tiles/{z}/{x}/{y}.png'
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
export default RasterTileSource
