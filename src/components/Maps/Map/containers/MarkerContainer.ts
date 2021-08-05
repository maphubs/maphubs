import { Container } from 'unstated'
type State = {
  markers: Record<string, any>
}
export default class MarkerContainer extends Container<State> {
  constructor() {
    super()
    this.state = {
      markers: {}
    }
  }

  reset() {
    this.setState({
      markers: {}
    })
  }

  addMarker(layer_id: string, mhid: string, marker: Record<string, any>) {
    const featureId = mhid.split(':')[1]

    if (!this.state.markers[layer_id]) {
      this.state.markers[layer_id] = {}
    }

    this.state.markers[layer_id][featureId] = marker
  }

  removeMarker(layer_id: string, mhid: string) {
    const featureId = mhid.split(':')[1]

    if (this.state.markers[layer_id]) {
      delete this.state.markers[layer_id][featureId]
    }
  }

  removeLayer(layer_id: string) {
    if (this.state.markers[layer_id]) {
      delete this.state.markers[layer_id]
    }
  }
}