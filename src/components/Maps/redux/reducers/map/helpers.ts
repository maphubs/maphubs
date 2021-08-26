import LayerSources from '../../../Map/Sources'
import _find from 'lodash.find'
import _remove from 'lodash.remove'
import { SourceWithUrl } from '../../../Map/Sources/types/SourceWithUrl'
import Bluebird from 'bluebird'
import GenericSource from '../../../Map/Sources/GenericSource'
import { SourceState } from '../../../Map/Sources/types/SourceState'
import DebugService from '../../../lib/debug'
import mapboxgl from 'mapbox-gl'
const debug = DebugService('MapThunkHelpers')

export type SourceDriverType = {
  driver: GenericSource
  custom: boolean
  layer?: Record<string, any>
  source?: Record<string, any>
  position?: number
}

const addLayers = async (
  layers: Array<{
    id: string
    position: number
  }>,
  fromStyle: mapboxgl.Style,
  sourceState: SourceState
): Promise<Array<any | SourceDriverType>> => {
  const customSourceLayers = []
  // eslint-disable-next-line unicorn/no-array-method-this-argument
  await Bluebird.map(layers, (layerToAdd) => {
    debug.log(`adding layer: ${layerToAdd.id}`)

    try {
      const layer = _find(fromStyle.layers, {
        id: layerToAdd.id
      })

      const source = fromStyle.sources[layer.source] as SourceWithUrl
      const sourceDriver: SourceDriverType = LayerSources.getSource(
        layer.source,
        source
      )

      if (sourceDriver.custom) {
        debug.log(`custom source layer: ${layerToAdd.id}`)

        Object.assign(sourceDriver, {
          layer,
          source,
          position: layerToAdd.position
        })
        customSourceLayers.push(sourceDriver)
      } else {
        return sourceDriver.driver.addLayer(
          layer,
          source,
          layerToAdd.position,
          sourceState
        )
      }
    } catch (err) {
      debug.log('Failed to add layers')
      debug.log(err)
    }
  })
  return customSourceLayers
}

const removeLayers = (
  layersIDs: Array<string>,
  fromStyle: mapboxgl.Style,
  glStyle: mapboxgl.Style
): void => {
  for (const id of layersIDs) {
    debug.log(`removing layer: ${id}`)

    const layer = _find(fromStyle.layers, {
      id
    })

    try {
      const source = fromStyle.sources[layer.source] as SourceWithUrl
      LayerSources.getSource(layer.source, source).driver.removeLayer(
        layer,
        (id: string) => {
          _remove(glStyle.layers, {
            id
          })
        }
      )
    } catch (err) {
      debug.log('Failed to remove layer: ' + layer.id)
      debug.log(err)
    }
  }
}

const loadSources = async (
  sourceKeys: Array<string>,
  fromStyle: mapboxgl.Style,
  sourceState: SourceState
): Promise<
  Array<{
    custom: boolean
    driver: GenericSource
    key: string
    source: mapboxgl.AnySourceData
  }>
> => {
  const customSources = []
  // eslint-disable-next-line unicorn/no-array-method-this-argument
  await Bluebird.map(sourceKeys, async (key) => {
    debug.log(`loading source: ${key}`)

    const source = fromStyle.sources[key] as SourceWithUrl

    const sourceDriver = LayerSources.getSource(key, source)

    if (sourceDriver.custom) {
      debug.log(`found custom source: ${key}`)

      customSources.push(sourceDriver)
    } else {
      return sourceDriver.driver.load(key, source, sourceState)
    }
  })
  return customSources
}

const removeSources = (
  sourceKeys: Array<string>,
  fromStyle: mapboxgl.Style,
  glStyle: mapboxgl.Style
): void => {
  for (const key of sourceKeys) {
    debug.log(`removing source: ${key}`)
    const source = fromStyle.sources[key] as SourceWithUrl
    LayerSources.getSource(key, source).driver.remove(key, (key: string) => {
      delete glStyle.sources[key]
    })
  }
}

export { removeLayers, removeSources, addLayers, loadSources }
