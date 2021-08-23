import { FeatureCollection } from 'geojson'
import TerraformerGL from '../../../../services/terraformerGL'
import { SourceWithUrl } from './types/SourceWithUrl'
import GenericSource from './GenericSource'
import DebugService from '../../lib/debug'
import { SourceState } from './types/SourceState'

const debug = DebugService('AGSFeatureServerQuery')

class AGSFeatureServerQuery extends GenericSource {
  load(key: string, source: SourceWithUrl, state: SourceState): any {
    if (source.url) {
      return TerraformerGL.getArcGISFeatureServiceGeoJSON(source.url).then(
        (geoJSON: FeatureCollection) => {
          if (
            geoJSON.bbox &&
            Array.isArray(geoJSON.bbox) &&
            geoJSON.bbox.length > 0 &&
            state.allowLayersToMoveMap
          ) {
            // TODO: fix AGS MapServerQuery zoom to data
            // zoomToData(geoJSON)
          }

          return state.addSource(key, {
            type: 'geojson',
            data: geoJSON
          })
        },
        (err) => {
          debug.log(err)
        }
      )
    }
  }
}
export default AGSFeatureServerQuery
