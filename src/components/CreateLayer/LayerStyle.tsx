import React, { useState } from 'react'
import {
  notification,
  Modal,
  message,
  Row,
  Col,
  Button,
  Typography
} from 'antd'
import MapStyles from '../Maps/Map/Styles'
import MiniLegend from '../Maps/Map/MiniLegend'
import OpacityChooser from '../LayerDesigner/OpacityChooser'
import LayerDesigner from '../LayerDesigner/LayerDesigner'

import mapboxgl from 'mapbox-gl'
import useT from '../../hooks/useT'
import { useDispatch, useSelector } from '../../redux/hooks'
import LayerAPI from '../../redux/reducers/layer-api'
import { setStyle, resetStyle } from '../../redux/reducers/layerSlice'

import dynamic from 'next/dynamic'
const MapHubsMap = dynamic(() => import('../Maps/Map'), {
  ssr: false
})

const { confirm } = Modal
const { Title } = Typography
type Props = {
  onSubmit: (...args: Array<any>) => void
  mapConfig: Record<string, any>
  waitForTileInit?: boolean
}
type State = {
  rasterOpacity: number
}

const LayerStyle = ({
  waitForTileInit,
  mapConfig,
  onSubmit
}: Props): JSX.Element => {
  const { t, locale } = useT()
  const dispatch = useDispatch()
  const [rasterOpacity, setRasterOpacity] = useState(100) // FIXME: opacity slider always starts at 100
  const layerState = useSelector((state) => state.layer)

  const submit = async (): Promise<void> => {
    const { layer_id, name, style, labels, legend_html } = layerState

    const closeSavingMessage = message.loading(t('Saving'), 0)
    const center = mapboxMap.getCenter()
    const zoom = mapboxMap.getZoom()
    const preview_position = {
      zoom,
      lng: center.lng,
      lat: center.lat,
      bbox: mapboxMap.getBounds().toArray()
    }

    const data = {
      style,
      labels,
      legend_html,
      preview_position
    }
    try {
      await LayerAPI.saveStyle(layer_id, data)
      onSubmit(layer_id, name)
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString() || err,
        duration: 0
      })
    } finally {
      closeSavingMessage()
    }
  }

  const changeOpacity = (opacity: number): void => {
    const { is_external, external_layer_config, layer_id, shortid } = layerState
    const elc = external_layer_config || {}

    const style =
      is_external && elc.type === 'multiraster' && elc.layers
        ? MapStyles.raster.multiRasterStyleWithOpacity(
            layer_id || 0,
            shortid,
            elc.layers,
            opacity,
            'raster'
          )
        : MapStyles.raster.rasterStyleWithOpacity(
            layer_id || 0,
            shortid,
            elc,
            opacity
          )

    const legend_html = MapStyles.legend.rasterLegend()
    dispatch(setStyle({ style, legend_html }))
    setRasterOpacity(opacity)
  }
  const onColorChange = (style: mapboxgl.Style, legend_html: string): void => {
    dispatch(setStyle({ style, legend_html }))
  }

  const setLabels = (
    style: mapboxgl.Style,
    labels: Record<string, any>
  ): void => {
    dispatch(setStyle({ style, labels }))
  }
  const setLegend = (legend_html: string): void => {
    dispatch(setStyle({ legend_html }))
  }

  const {
    layer_id,
    style,
    preview_position,
    tileServiceInitialized,
    external_layer_config,
    legend_html,
    is_external,
    labels
  } = layerState
  const showMap = waitForTileInit ? tileServiceInitialized : true

  let mapExtent

  if (preview_position && preview_position.bbox) {
    const bbox = preview_position.bbox
    mapExtent = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
  }

  const externalLayerConfig: Record<string, any> = external_layer_config || {}

  const legendCode: string = legend_html || ''

  let colorChooserMode = 'default'

  if (
    is_external &&
    (externalLayerConfig.type === 'raster' ||
      externalLayerConfig.type === 'multiraster' ||
      externalLayerConfig.type === 'ags-mapserver-tiles')
  ) {
    colorChooserMode = 'external'
  } else if (is_external && externalLayerConfig.type === 'mapbox-style') {
    colorChooserMode = 'mapbox'
  }

  return (
    <Row
      style={{
        height: '100%'
      }}
    >
      <Row
        style={{
          height: '100%',
          textAlign: 'center'
        }}
      >
        <Col sm={24} md={12}>
          <Title level={3}>{t('Choose Preview')}</Title>
          {layer_id !== undefined && layer_id !== -1 && showMap && (
            <Row
              style={{
                height: 'calc(100% - 30px)',
                padding: '20px'
              }}
            >
              <MapHubsMap
                id='layer-style-map'
                className='z-depth-2'
                initialGLStyle={style}
                showLogo
                mapConfig={mapConfig}
                fitBounds={mapExtent}
                locale={locale}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
                earthEngineClientID={
                  process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID
                }
              >
                <MiniLegend
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    minWidth: '200px',
                    width: '20%',
                    zIndex: 2
                  }}
                  collapsible
                  hideInactive={false}
                  showLayersButton={false}
                  layers={[layerState]}
                />
              </MapHubsMap>
            </Row>
          )}
        </Col>
        <Col sm={24} md={12}>
          <Title level={3}>{t('Choose Style')}</Title>
          {colorChooserMode === 'default' && (
            <Row
              style={{
                height: 'calc(100% - 130px)',
                padding: '20px'
              }}
            >
              <LayerDesigner
                onColorChange={onColorChange}
                initialStyle={style}
                onStyleChange={setStyle}
                labels={labels}
                onLabelsChange={setLabels}
                onMarkersChange={setStyle}
                layer={layerState}
                legend={legendCode}
                onLegendChange={setLegend}
              />
            </Row>
          )}
          {colorChooserMode === 'external' && (
            <Row
              style={{
                height: 'calc(100% - 100px)',
                padding: '20px'
              }}
            >
              <OpacityChooser
                value={rasterOpacity}
                onChange={changeOpacity}
                style={style}
                onStyleChange={setStyle}
                onColorChange={onColorChange}
                layer={layerState}
                legendCode={legendCode}
                onLegendChange={setLegend}
                showAdvanced
              />
            </Row>
          )}
          {colorChooserMode === 'mapbox' && (
            <Row
              style={{
                height: 'calc(100% - 100px)',
                padding: '20px'
              }}
            >
              <div
                style={{
                  marginTop: '20px',
                  marginBottom: '20px',
                  padding: '20px',
                  border: '1px solid #b1b1b1'
                }}
              >
                <b>{t('Mapbox Studio Style Layer')}</b>
                <p>
                  {t(
                    'If you are the owner of this layer, click here to edit in Mapbox Studio on mapbox.com'
                  )}
                </p>
                <Button
                  type='primary'
                  target='_blank'
                  rel='noopener noreferrer'
                  href={
                    'https://www.mapbox.com/studio/styles/' +
                    externalLayerConfig.mapboxid +
                    '/edit'
                  }
                >
                  {t('Edit in Mapbox Studio')}
                </Button>
                <p>
                  {t(
                    'Once you have published your style on Mapbox,click refresh the preview map.'
                  )}
                  <b>
                    {t(
                      'It may take a few minutes for the changes to appear, your layer will update automatically.'
                    )}
                  </b>
                </p>
                <Button
                  type='primary'
                  onClick={() => {
                    //TODO: fix mapbox studio style reload
                    // reloadStyleThunk()
                  }}
                >
                  {' '}
                  {t('Reload')}
                </Button>
              </div>
            </Row>
          )}
          <Row justify='end' align='middle'>
            <Col span={6}>
              <Button
                type='primary'
                onClick={(): void => {
                  confirm({
                    title: t('Confirm Reset'),
                    content: t(
                      'Warning! This will permanently delete all custom style settings from this layer.'
                    ),
                    okText: t('Reset'),
                    okType: 'danger',
                    cancelText: t('Cancel'),

                    onOk() {
                      dispatch(resetStyle())
                    }
                  })
                }}
                style={{
                  marginRight: '10px'
                }}
              >
                {t('Reset')}
              </Button>
            </Col>
            <Col span={6} offset={12}>
              <Button
                type='primary'
                onClick={() => {
                  submit(MapState)
                }}
              >
                {t('Save')}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Row>
  )
}
export default LayerStyle
