// @flow
import { Container } from 'unstated'

type State = {
  map?: Object,
  insetMap? :Object
}

export default class MapContainer extends Container<State> {
  state = {}
  setMap (map: Object) {
    return this.setState({map})
  }
  setInsetMap (insetMap: Object) {
    return this.setState({insetMap})
  }

  initInset (mapboxGL: Object, baseMap: Object) {
    const {insetMap} = this.state
    insetMap.createInsetMap(mapboxGL.getCenter(), mapboxGL.getBounds(), baseMap)
    mapboxGL.on('move', () => { insetMap.sync(mapboxGL) })
    mapboxGL.on('load', () => { insetMap.sync(mapboxGL) })
  }
}
