import React, { useState } from 'react'
import { Button } from 'antd'
import mapboxgl from 'mapbox-gl'
import { FeatureCollection } from 'geojson'
import shortid from 'shortid'
import useMapT from '../../hooks/useMapT'
import { message, notification } from 'antd'
import IsochroneLegendHelper from '../IsochroneLegendHelper'
import { useSelector } from '../../redux/hooks'
import { selectMapboxMap } from '../../redux/reducers/mapSlice'
import DebugService from '../../lib/debug'
const debug = DebugService('Isochrone Panel')

const getIsochroneStyle = (
  data: FeatureCollection
): {
  id: string
  layers: mapboxgl.LineLayer[]
  source: {
    data: FeatureCollection
    type: string
  }
} => {
  const sourceId = `omh-isochrone-${shortid()}`
  return {
    id: sourceId,
    source: {
      type: 'geojson',
      data
    },
    layers: [
      {
        id: `${sourceId}-line-60`,
        type: 'line',
        source: sourceId,
        filter: ['==', 'value', 3600],
        paint: {
          'line-color': 'red',
          'line-opacity': 0.8,
          'line-width': 4
        }
      },
      {
        id: `${sourceId}-line-30`,
        type: 'line',
        source: sourceId,
        filter: ['==', 'value', 1800],
        paint: {
          'line-color': 'yellow',
          'line-opacity': 0.8,
          'line-width': 4
        }
      },
      {
        id: `${sourceId}-line-15`,
        type: 'line',
        source: sourceId,
        filter: ['==', 'value', 900],
        paint: {
          'line-color': 'green',
          'line-opacity': 0.8,
          'line-width': 4
        }
      }
    ]
  }
}

const IsochronePanel = (): JSX.Element => {
  const { t } = useMapT()
  const [selectingLocation, setSelectingLocation] = useState(false)
  const [isochroneResult, setIsochroneResult] = useState(null)
  const [isochroneClickHandler, setIsochroneClickHandler] = useState(null)
  const [isochroneLayerStyle, setIsochroneLayerStyle] = useState(null)

  const mapboxMap = useSelector(selectMapboxMap)

  const getIsochronePoint = () => {
    const disableClick = function () {
      mapboxMap.off('click', onIsochroneClick)
    }

    const onIsochroneClick = function (e) {
      e.originalEvent.stopPropagation()

      runIsochroneQuery(e.lngLat)

      disableClick()
    }

    mapboxMap.on('click', onIsochroneClick)
    setIsochroneClickHandler(onIsochroneClick)
  }

  const runIsochroneQuery = (point: { lng: number; lat: number }) => {
    message.loading(t('Running travel time query...'), 5)
    request
      .post('/api/isochrone')
      .send({
        point
      })
      .timeout(60_000)
      .type('json')
      .accept('json')
      .then((res) => {
        // get resulting geojson
        const geojson = res.body
        // get a layer with the data embedded
        const layerStyle = getIsochroneStyle(geojson)
        setIsochroneLayerStyle(layerStyle)
        // add it to the map
        mapboxMap.addSource(layerStyle.id, layerStyle.source)
        for (const layer of layerStyle.layers) {
          mapboxMap.addLayer(layer)
        }
        setIsochroneResult(geojson)

        onToggleIsochroneLayer(true)
      })
      .catch((err) => {
        debug.error(err)
        notification.error({
          message: 'Error',
          description: t('Travel time service failed at this location')
        })
      })
  }

  const onToggleIsochroneLayer = (enabled: boolean) => {
    let mapLayers = []

    if (mapState.layers) {
      mapLayers = mapState.layers
    }

    const layers = IsochroneLegendHelper.getLegendLayers()

    if (enabled) {
      // add layers to legend
      mapLayers = [...mapLayers, ...layers]
    } else {
      const updatedLayers = []
      // remove layers from legend
      for (const mapLayer of mapLayers) {
        let foundInLayers
        for (const layer of layers) {
          if (mapLayer.layer_id === layer.layer_id) {
            foundInLayers = true
          }
        }

        if (!foundInLayers) {
          updatedLayers.push(mapLayer)
        }
      }
      mapLayers = updatedLayers
    }
    //TODO:  update InteractiveMap or MapMaker state
    this.updateLayers(mapLayers, false)
  }

  const clearIsochroneLayers = () => {
    mapboxMap.off('click', isochroneClickHandler)
    for (const layer of isochroneLayerStyle.layers) {
      mapboxMap.removeLayer(layer.id)
    }
    mapboxMap.removeSource(isochroneLayerStyle.id)
    setIsochroneResult(null)
    onToggleIsochroneLayer(false)
  }

  return (
    <div
      style={{
        width: '100%',
        textAlign: 'center'
      }}
    >
      {!isochroneResult && (
        <>
          <Button
            type='primary'
            onClick={() => {
              setSelectingLocation(true)
              getIsochronePoint()
            }}
          >
            {t('Select Location')}
          </Button>
          {selectingLocation && <p>{t('Click a location on the map.')}</p>}
        </>
      )}
      {isochroneResult && <p>{t('Displaying Result')}</p>}
      {(isochroneResult || selectingLocation) && (
        <Button
          type='primary'
          onClick={() => {
            setSelectingLocation(false)
            clearIsochroneLayers()
          }}
        >
          {t('Reset')}
        </Button>
      )}
    </div>
  )
}
export default IsochronePanel
