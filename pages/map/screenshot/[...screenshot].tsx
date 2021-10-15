import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import MiniLegend from '../../../src/components/Maps/Map/MiniLegend'
import { Row, Col, Switch, Modal, message } from 'antd'
import ErrorBoundary from '../../../src/components/ErrorBoundary'

import { Layer } from '../../../src/types/layer'
import useT from '../../../src/hooks/useT'
import { Map } from '../../../src/types/map'
import MapProvider from '../../../src/components/Maps/redux/MapProvider'
import dynamic from 'next/dynamic'
//SSR Only
import MapModel from '../../../src/models/map'
import PageModel from '../../../src/models/page'

const MapHubsMap = dynamic(() => import('../../../src/components/Maps/Map'), {
  ssr: false
})

const confirm = Modal.confirm

export const getServerSideProps: GetServerSideProps = async (context) => {
  const map_id = Number.parseInt(context.params.screenshot[0])
  const map = await MapModel.getMap(map_id)
  if (!map) {
    return {
      notFound: true
    }
  }

  const mapConfig = (await PageModel.getPageConfigs(['map'])[0]) || null
  return {
    props: {
      map,
      mapLayers: await MapModel.getMapLayers(map_id),
      mapConfig
    }
  }
}

const StaticMap = ({
  map,
  mapLayers,
  mapConfig
}: {
  map: Map
  mapLayers: Layer[]
  mapConfig: Record<string, unknown>
}): JSX.Element => {
  const showLogo = true

  const router = useRouter()
  const { t, locale } = useT()
  const [showLegend, setShowLegend] = useState(true)
  const [showScale, setShowScale] = useState(true)
  const [showInset, setShowInset] = useState(true)
  const [showSettings, setShowSettings] = useState(true)

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 's' || e.key === 'S') {
        setShowSettings(true)
      }
    }
    window.addEventListener('keydown', keyDownHandler)
    return () => {
      window.removeEventListener('keydown', keyDownHandler)
    }
  }, [])

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
              onChange={toggleLegend}
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
        <MapProvider>
          <div
            className='embed-map'
            style={{
              width: '100vw',
              height: showSettings ? 'calc(100vh - 25px)' : '100vh'
            }}
          >
            <MapHubsMap
              id='static-map'
              interactive={false}
              fitBounds={bounds}
              insetMap={showInset}
              insetConfig={insetConfig}
              showLogo={showLogo}
              showScale={showScale}
              initialGLStyle={map.style}
              mapConfig={mapConfig}
              preserveDrawingBuffer
              navPosition='top-right'
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
              DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
              earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
              locale={locale}
            >
              {showLegend && (
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
              )}
            </MapHubsMap>
          </div>
        </MapProvider>
      </Row>
    </ErrorBoundary>
  )
}
export default StaticMap
