import TerraformerGL from '../../../../services/terraformerGL'
import DebugService from '../../lib/debug'
import GenericSource from './GenericSource'
import { SourceWithUrl } from './types/SourceWithUrl'
import { SourceState } from './types/SourceState'
const debug = DebugService('AGSMapServerQuery')

class AGSMapServerQuery extends GenericSource {
  load(key: string, source: SourceWithUrl, state: SourceState): any {
    if (source.url) {
      return TerraformerGL.getArcGISGeoJSON(source.url).then(
        (geoJSON) => {
          if (
            geoJSON.bbox &&
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
    } else {
      throw new Error('source missing url parameter')
    }
  }
}
export default AGSMapServerQuery
