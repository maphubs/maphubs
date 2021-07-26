import React, { useState } from 'react'
import { useRouter } from 'next/router'
import MiniLegend from '../../src/components/Map/MiniLegend'
import { Row, Col, Switch, Modal, message } from 'antd'
import ErrorBoundary from '../../src/components/ErrorBoundary'

import { LocalizedString } from '../../src/types/LocalizedString'
import { Layer } from '../../src/types/layer'
import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { Map as MapType } from '../../src/types/map'
import dynamic from 'next/dynamic'
const MapHubsMap = dynamic(() => import('../../src/components/Map'), {
  ssr: false
})



const confirm = Modal.confirm
type Props = {
  name: LocalizedString
  layers: Layer[]
  style: Record<string, any>
  position: Record<string, any>
  basemap: string
  showLegend: boolean
  showLogo: boolean
  showScale: boolean
  insetMap: boolean
  locale: string
  showToolbar?: boolean
  settings: Record<string, any>
}

const StaticMap = (): JSX.Element => {
  const showLogo = true

  const router = useRouter()
  const { t } = useT()
  const [showLegend, setShowLegend] = useState(false)
  const [showScale, setShowScale] = useState(false)
  const [showInset, setShowInset] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // TODO: use AutoSizer
  const [size, setSize] = useState({
    width: 1024,
    height: 600
  })

  const slug = router.query.static || []
  const map_id = slug[0]

  const { data } = useSWR([
    `
  {
    map(id: "{id}") {
      map_id
      title
      position
      style
      settings
      basemap
      created_at
      updated_at
      owned_by_group_id
      share_id
    }
    mapLayers(id: "{id}") {
      layer_id
      shortid
      name
      description
      source
      data_type
      style
      legend_html
    }
    allowedToModifyMap(id: "{id}")
    mapConfig
  }
  `,
    map_id
  ])
  const stickyData: {
    map: MapType
    mapLayers: Layer[]
    allowedToModifyMap: boolean
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const { map, mapLayers, allowedToModifyMap, mapConfig } = stickyData

  /*
  constructor(props: Props) {
    super(props)

    this.state = {
      userShowInset: props.insetMap,
      userShowLegend: props.showLegend,
      userShowScale: props.showScale,
      showSettings: !!props.showToolbar,
      width: 1024,
      height: 600
    }
  }
  */

  /*
  componentDidMount(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'S') {
        showSettings()
      }
    })
  }
  */

  const toggleLegend = (): void => {
    if (showLegend) {
      confirm({
        title: t('Attribution Required'),
        content: t(
          'If you remove the legend you must include the attribution "OpenStreetMap contributors" for the base map, as well as attributions for any data layers in your map. I agree to attribute the data when I share or publish this map.'
        ),
        okText: t('I agree'),

        onOk() {
          setShowLegend(false)
        },

        onCancel() {}
      })
    } else {
      setShowLegend(true)
    }
  }
  const hideSettings = (): void => {
    setShowSettings(false)
    message.info(t('press the "s" key to reopen settings'), 3)
  }

  let legend, bottomLegend

  if (showLegend) {
    if (size.width < 600) {
      bottomLegend = (
        <MiniLegend
          style={{
            width: '100%'
          }}
          collapsible={false}
          title={map.title}
          hideInactive={false}
          showLayersButton={false}
          layers={mapLayers}
        />
      )
    } else {
      legend = (
        <MiniLegend
          style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            minWidth: '275px',
            width: '25%'
          }}
          collapsible={false}
          title={map.title}
          hideInactive
          showLayersButton={false}
          layers={mapLayers}
        />
      )
    }
  }

  let bounds

  if (
    (typeof window === 'undefined' || !window.location.hash) && // only update position if there isn't absolute hash in the URL
    map.position &&
    map.position.bbox
  ) {
    const bbox = map.position.bbox
    bounds = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
  }

  let insetConfig = {}

  if (map.settings && map.settings.insetConfig) {
    insetConfig = map.settings.insetConfig
  }

  insetConfig.collapsible = false
  return (
    <ErrorBoundary t={t}>
      <style jsx global>
        {`
          .map-position {
            display: none;
          }
          .maphubs-ctrl-scale {
            display: ${showScale ? 'inherit' : 'none'};
          }
          .maphubs-inset {
            display: ${showInset ? 'inherit' : 'none'};
          }
          .mapboxgl-ctrl-logo {
            display: ${!showLogo ? 'none !important' : 'block'};
          }
        `}
      </style>
      {showSettings && (
        <Row
          style={{
            height: '25px',
            paddingLeft: '20px',
            paddingRight: '20px'
          }}
        >
          <Col span={4}>
            <span
              style={{
                marginRight: '10px'
              }}
            >
              {t('Legend')}
            </span>
            <Switch
              defaultChecked={showLegend}
              onChange={setShowLegend}
              size='small'
            />
          </Col>
          <Col span={4}>
            <span
              style={{
                marginRight: '10px'
              }}
            >
              {t('Scale Bar')}
            </span>
            <Switch
              defaultChecked={showScale}
              onChange={setShowScale}
              size='small'
            />
          </Col>
          <Col span={4}>
            <span
              style={{
                marginRight: '10px'
              }}
            >
              {t('Inset')}
            </span>
            <Switch
              defaultChecked={showInset}
              onChange={setShowInset}
              size='small'
            />
          </Col>
          <a
            onClick={hideSettings}
            style={{
              color: '#323333',
              textDecoration: 'underline',
              position: 'absolute',
              right: '10px'
            }}
          >
            {t('hide')}
          </a>
        </Row>
      )}
      <Row>
        <div className='embed-map'>
          <MapHubsMap
            id='static-map'
            interactive={false}
            showPlayButton={false}
            fitBounds={bounds}
            insetMap={insetMap}
            insetConfig={insetConfig}
            showLogo={showLogo}
            showScale={showScale}
            style={{
              width: '100vw',
              height: showSettings ? 'calc(100vh - 25px)' : '100vh'
            }}
            glStyle={map.style}
            mapConfig={mapConfig}
            preserveDrawingBuffer
            navPosition='top-right'
            primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
            earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
            t={t}
          >
            {legend}
          </Map>
          {bottomLegend}
        </div>
      </Row>
    </ErrorBoundary>
  )
}
export default StaticMap
