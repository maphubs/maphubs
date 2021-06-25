import { Container } from 'unstated'
type State = {
  map?: Record<string, any>
  insetMap?: Record<string, any>
}
export default class MapContainer extends Container<State> {
  state = {}

  setMap(map: Record<string, any>): any {
    return this.setState({
      map
    })
  }

  setInsetMap(insetMap: Record<string, any>): any {
    return this.setState({
      insetMap
    })
  }

  initInset(mapboxGL: Record<string, any>, baseMap: Record<string, any>) {
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