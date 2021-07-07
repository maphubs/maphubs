import mapboxgl from 'mapbox-gl'
import { Container } from 'unstated'
import InsetMap from '../InsetMap/index'
import MapComponent from '../Map'
type State = {
  map?: typeof MapComponent
  insetMap?: typeof InsetMap
}
export default class MapContainer extends Container<State> {
  state: State = {}

  setMap(map: State['map']): Promise<void> {
    return this.setState({
      map
    })
  }

  setInsetMap(insetMap: State['insetMap']): Promise<void> {
    return this.setState({
      insetMap
    })
  }

  initInset(mapboxGL: mapboxgl.Map, baseMap: mapboxgl.Style): void {
    const { insetMap } = this.state
    insetMap.createInsetMap(mapboxGL.getCenter(), mapboxGL.getBounds(), baseMap)
    mapboxGL.on('move', () => {
      insetMap.sync(mapboxGL)
    })
    mapboxGL.on('load', () => {
      insetMap.sync(mapboxGL)
    })
  }
}
