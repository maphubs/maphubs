import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'
import request from 'superagent'
import _bbox from '@turf/bbox'
import type { Layer } from '../../../src/types/layer'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import { Tooltip } from 'antd'
import StyleHelper from '../../../src/components/Maps/Map/Styles/style'

import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite'
import { LocalizedString } from '../../../src/types/LocalizedString'
import mapboxgl from 'mapbox-gl'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { checkClientError } from '../../../src/services/client-error-response'
import { BBox } from 'geojson'
import useT from '../../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import { Map as MapType } from '../../../src/types/map'
import { useQueryParam, StringParam, BooleanParam } from 'use-query-params'
import { signin } from 'next-auth/client'

import dynamic from 'next/dynamic'
const InteractiveMap = dynamic(
  () => import('../../../src/components/Maps/Map/InteractiveMap'),
  {
    ssr: false
  }
)

type GeoJSONOverlayState = {
  loaded?: boolean
  bounds?: BBox
  glStyle?: mapboxgl.Style
  layers?: Layer[]
}

const EmbedMap = (): JSX.Element => {
  const publicShare = false /// this page is not the public shared version
  const router = useRouter()
  const [session, loading] = useSession()
  const { t, locale } = useT()

  // get URL query params
  // for the geoJSON marker overlay
  const [geoJSONUrl] = useQueryParam('geoJSON', StringParam)
  const [colorParam] = useQueryParam('color', StringParam)
  const [overlayNameParam] = useQueryParam('overlayName', StringParam)
  // toggles for map components
  const [hideLogo] = useQueryParam('hideLogo', BooleanParam)
  const [hideScale] = useQueryParam('hideScale', BooleanParam)
  const [hideInsetMap] = useQueryParam('hideInsetMap', BooleanParam)

  const slug = router.query.embedmap || []
  const map_id = slug[0]

  let embedType
  if (slug.length > 1) {
    embedType = slug[1]
  }

  const isStatic = !!embedType

  const [interactive, setInteractive] = useState(embedType === 'interactive')
  const [geoJSONOverlayState, setGeoJSONOverlayState] =
    useState<GeoJSONOverlayState>({})

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
      mapConfig
    }
    `,
    map_id
  ])
  const stickyData: {
    map: MapType
    mapLayers: Layer[]
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const { map, mapLayers, mapConfig } = stickyData

  const markerColor = colorParam ? '#' + colorParam : '#FF0000'
  const overlayName = overlayNameParam || t('Locations')

  const baseUrl = urlUtil.getBaseUrl()
  const imageUrl =
    publicShare && map.share_id
      ? `${baseUrl}/api/map/share/screenshot/${map.share_id}.png`
      : `${baseUrl}/api/screenshot/map/${map.map_id}.png`

  useEffect(() => {
    const getStyleLayers = (): mapboxgl.AnyLayer[] => {
      return [
        {
          id: 'omh-data-point-geojson-overlay-markers',
          type: 'symbol',
          metadata: {
            'maphubs:interactive': true
          },
          source: 'geojson-overlay',
          layout: {
            'icon-image': 'marker-icon-geojson-overlay',
            'icon-size': 0.5,
            'icon-allow-overlap': true,
            'icon-offset': [0, -16],
            visibility: 'visible'
          }
        },
        {
          id: 'omh-data-point-geojson-overlay',
          type: 'circle',
          metadata: {
            'maphubs:layer_id': 0,
            'maphubs:interactive': true,
            'maphubs:showBehindBaseMapLabels': false,
            'maphubs:markers': {
              shape: 'MAP_PIN',
              size: '32',
              width: 32,
              height: 32,
              shapeFill: markerColor,
              shapeFillOpacity: 0.75,
              shapeStroke: '#FFFFFF',
              shapeStrokeWidth: 2,
              inverted: false,
              enabled: true,
              interactive: true,
              version: 2,
              imageName: 'marker-icon-geojson-overlay'
            }
          },
          source: 'geojson-overlay',
          filter: ['in', '$type', 'Point'],
          paint: {
            'circle-color': 'rgba(255,255,255,0)',
            'circle-radius': 0
          },
          layout: {
            visibility: 'none'
          }
        }
      ]
    }

    const getLayerConfig = (): Layer => {
      const emptyLocalizedString: LocalizedString = {
        en: '',
        fr: '',
        es: '',
        it: '',
        id: '',
        pt: ''
      }

      /*
      geoJSON.metadata = {
        'maphubs:presets': []
      }
      */
      const style: mapboxgl.Style = {
        version: 8,
        sources: {
          'geojson-overlay': {
            type: 'geojson',
            data: geoJSONUrl
          }
        },
        layers: getStyleLayers()
      }
      return {
        active: true,
        layer_id: -2,
        shortid: 'geojson-overlay',
        creation_time: '',
        last_updated: '',
        name: { en: overlayName }, // other locales will fall back to en
        source: emptyLocalizedString,
        description: emptyLocalizedString,
        owned_by_group_id: '',
        remote: true,
        is_external: true,
        external_layer_config: {},
        style,
        legend_html: `
          
          `
      }
    }

    const loadGeoJSON = (url: string): void => {
      request
        .get(url)
        .type('json')
        .accept('json')
        .end((err, res) => {
          checkClientError({
            res,
            err,
            onSuccess: () => {
              const geoJSON = res.body

              const bounds = _bbox(geoJSON)

              const layer = getLayerConfig()
              const newLayers = [layer, ...mapLayers]
              const glStyle = StyleHelper.buildMapStyle(mapLayers)

              setGeoJSONOverlayState({
                loaded: true,
                bounds,
                glStyle,
                layers: newLayers
              })
            }
          })
        })
    }
    if (geoJSONUrl) {
      loadGeoJSON(geoJSONUrl)
    }
  }, [mapLayers, geoJSONUrl, markerColor, overlayName])

  // wait if user session is not ready
  if (loading) return <></>

  // redirect to login if not signed in, prevents displaying an error when data fails to load
  // for public shared maps we need to by-pass this check
  if (
    !session?.user &&
    !publicShare &&
    process.env.NEXT_PUBLIC_REQUIRE_LOGIN === 'true'
  ) {
    signin()
    return (
      <div>
        <Head>
          <title>{`${map.title} - ${process.env.NEXT_PUBLIC_PRODUCT_NAME}`}</title>
        </Head>
      </div>
    )
  }

  let mapComponent
  let boundsCleaned

  if (isStatic && !interactive) {
    let imgSrc = imageUrl
    const baseUrl = urlUtil.getBaseUrl()

    if (imgSrc.startsWith(baseUrl)) {
      imgSrc = imgSrc.replace(baseUrl, '')
    }

    mapComponent = (
      <div
        style={{
          position: 'relative'
        }}
      >
        <img
          src={imgSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          alt={process.env.NEXT_PUBLIC_PRODUCT_NAME + ' Map'}
        />
        <Tooltip title={t('Start Interactive Map')} placement='right'>
          <a
            onClick={() => {
              setInteractive(true)
            }}
            className='embed-map-btn'
            style={{
              position: 'absolute',
              left: 'calc(50% - 30px)',
              bottom: 'calc(50% - 30px)',
              zIndex: 999
            }}
          >
            <PlayCircleFilledWhiteIcon
              style={{
                lineHeight: '60px',
                fontSize: '60px',
                color: 'rgba(25,25,25,0.35)'
              }}
            />
          </a>
        </Tooltip>
      </div>
    )
  } else {
    if (!geoJSONOverlayState.bounds) {
      if (
        (typeof window === 'undefined' || !window.location.hash) && // only update position if there isn't absolute hash in the URL
        map.position &&
        map.position.bbox
      ) {
        const bbox = map.position.bbox
        boundsCleaned = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]]
      }
    } else {
      boundsCleaned = geoJSONOverlayState.bounds
    }

    let insetConfig: { collapsible?: boolean } = {}

    if (map.settings && map.settings.insetConfig) {
      insetConfig = map.settings.insetConfig
    }

    insetConfig.collapsible = false
    mapComponent = (
      <InteractiveMap
        height='100vh'
        interactive={interactive}
        fitBounds={boundsCleaned}
        fitBoundsOptions={{
          animate: false,
          padding: 50,
          maxZoom: geoJSONOverlayState.bounds ? 12 : 20 // don't let single point markers zoom in too much
        }}
        style={geoJSONOverlayState.glStyle || map.style}
        layers={geoJSONOverlayState.layers || mapLayers}
        map_id={map.map_id}
        disableScrollZoom
        mapConfig={mapConfig}
        title={map.title}
        insetConfig={insetConfig}
        insetMap={!hideInsetMap}
        showLogo={!hideLogo}
        showScale={!hideScale}
        preserveDrawingBuffer
        primaryColor={process.env.NEXT_PUBLIC_PRIMARY_COLOR}
        locale={locale}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
        earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
        onLoad={() => {
          // TODO: test if we need to wait for the map before loading the geoJSON?
        }}
        {...map.settings}
      />
    )
  }

  return (
    <ErrorBoundary t={t}>
      <div
        className='embed-map'
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {mapComponent}
      </div>
    </ErrorBoundary>
  )
}
export default EmbedMap
