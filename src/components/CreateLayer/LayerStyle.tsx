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
import MapStyles from '../Map/Styles'
import Map from '../Map'
import MiniLegend from '../Map/MiniLegend'
import LayerActions from '../../actions/LayerActions'
import OpacityChooser from '../LayerDesigner/OpacityChooser'
import LayerDesigner from '../LayerDesigner/LayerDesigner'

import { Subscribe } from 'unstated'
import MapContainer from '../Map/containers/MapContainer'
import type { LayerStoreState } from '../../stores/layer-store'
import getConfig from 'next/config'
import mapboxgl from 'mapbox-gl'
import useT from '../../hooks/useT'
import { useSelector } from 'react-redux'
import { LocaleState } from '../../redux/reducers/locale'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { confirm } = Modal
const { Title } = Typography
type Props = {
  onSubmit: (...args: Array<any>) => void
  mapConfig: Record<string, any>
  waitForTileInit?: boolean
}
type State = {
  rasterOpacity: number
} & LayerStoreState

const LayerStyle = ({
  waitForTileInit,
  mapConfig,
  onSubmit
}: Props): JSX.Element => {
  const { t } = useT()
  const [rasterOpacity, setRasterOpacity] = useState(100) // FIXME: opacity slider always starts at 100
  const layerState = useSelector((state: { layer: any }) => state.layer)
  const _csrf = useSelector(
    (state: { locale: LocaleState }) => state.locale._csrf
  )

  const submit = (MapState: Record<string, any>): void => {
    const { layer_id, name, style, labels, legend_html } = layerState

    const closeSavingMessage = message.loading(t('Saving'), 0)
    const preview_position = MapState.state.map.getPosition()
    preview_position.bbox = MapState.state.map.getBounds()
    LayerActions.saveStyle(
      {
        layer_id,
        style,
        labels,
        legend_html,
        preview_position
      },
      _csrf,
      (err) => {
        closeSavingMessage()

        if (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString() || err,
            duration: 0
          })
        } else {
          onSubmit(layer_id, name)
        }
      }
    )
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
    LayerActions.setStyle({
      style,
      legend_html
    })
    setRasterOpacity(opacity)
  }
  const onColorChange = (style: mapboxgl.Style, legend_html: string): void => {
    LayerActions.setStyle({
      style,
      legend_html
    })
  }
  const setStyle = (style: mapboxgl.Style): void => {
    LayerActions.setStyle({
      style
    })
  }
  const setLabels = (
    style: mapboxgl.Style,
    labels: Record<string, any>
  ): void => {
    LayerActions.setStyle({
      style,
      labels
    })
  }
  const setLegend = (legend_html: string): void => {
    LayerActions.setStyle({
      legend_html
    })
  }
  const reloadMap = (MapState: Record<string, any>): void => {
    MapState.state.map.reloadStyle()
  }
  const resetStyle = (): void => {
    confirm({
      title: t('Confirm Reset'),
      content: t(
        'Warning! This will permanently delete all custom style settings from this layer.'
      ),
      okText: t('Reset'),
      okType: 'danger',
      cancelText: t('Cancel'),

      onOk() {
        LayerActions.resetStyle()
      }
    })
  }

  const {
    layer_id,
    style,
    preview_position,
    tileServiceInitialized,
    external_layer_config,
    legend_html,
    is_external,
    locale,
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
              <Map
                id='layer-style-map'
                className='z-depth-2'
                style={{
                  height: '100%',
                  width: '100%',
                  margin: 'auto'
                }}
                glStyle={style}
                showLogo
                mapConfig={mapConfig}
                fitBounds={mapExtent}
                primaryColor={MAPHUBS_CONFIG.primaryColor}
                logoSmall={MAPHUBS_CONFIG.logoSmall}
                logoSmallHeight={MAPHUBS_CONFIG.logoSmallHeight}
                logoSmallWidth={MAPHUBS_CONFIG.logoSmallWidth}
                t={t}
                locale={locale}
                mapboxAccessToken={MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN}
                DGWMSConnectID={MAPHUBS_CONFIG.DG_WMS_CONNECT_ID}
                earthEngineClientID={MAPHUBS_CONFIG.EARTHENGINE_CLIENTID}
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
              </Map>
            </Row>
          )}
        </Col>
        <Subscribe to={[MapContainer]}>
          {(MapState) => (
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
                    style={style}
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
                        reloadMap(MapState)
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
                    onClick={resetStyle}
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
          )}
        </Subscribe>
      </Row>
    </Row>
  )
}
export default LayerStyle
