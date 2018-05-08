// @flow
import React from 'react'
import LayerListItem from './LayerListItem'
import _isEqual from 'lodash.isequal'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import update from 'react-addons-update'
import MapHubsComponent from '../MapHubsComponent'

type Props = {
  layers: Array<Object>,
  showVisibility: boolean,
  showDesign: boolean,
  showRemove: boolean,
  showEdit: boolean,
  showChangeDesign: boolean,
  toggleVisibility?: Function,
  removeFromMap?: Function,
  showLayerDesigner?: Function,
  updateLayers: Function,
  editLayer?: Function
}

type State = {
  layers: Array<Object>
}

class LayerList extends MapHubsComponent<Props, State> {
  props: Props

  static defaultProps = {
    showVisibility: false,
    showDesign: false,
    showRemove: false,
    showEdit: false,
    showChangeDesign: false
  }

  state: State = {
    layers: []
  }

  constructor (props) {
    super(props)
    const layers = JSON.parse(JSON.stringify(props.layers))
    this.state = {
      layers
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!_isEqual(nextProps.layers, this.state.layers)) {
      const layers = JSON.parse(JSON.stringify(nextProps.layers))
      this.setState({layers})
    }
  }

  moveLayer = (dragIndex, hoverIndex) => {
    const layers = this.state.layers
    const dragLayer = layers[dragIndex]

    const updatedLayers = update(layers, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragLayer]
      ]
    })

    this.props.updateLayers(updatedLayers)
  }

  render () {
    const _this = this
    const {layers} = this.state
    const {toggleVisibility, showVisibility, showRemove, showDesign, showEdit, removeFromMap, showLayerDesigner, editLayer} = this.props
    let empty = layers && layers.length === 0
    return (
      <div style={{height: '100%', padding: 0, margin: 0}}>
        {!empty &&
          <ul ref='layers' style={{height: '100%', overflowY: 'auto'}} className='collection no-margin custom-scroll-bar'>{
            layers.map((layer, i) => {
              if (layer.layer_id && layer.layer_id > 0) {
                return (
                  <li key={layer.layer_id} >
                    <LayerListItem id={layer.layer_id} item={layer} index={i}
                      toggleVisibility={toggleVisibility}
                      showVisibility={showVisibility}
                      showRemove={showRemove}
                      showDesign={showDesign}
                      showEdit={showEdit}
                      moveItem={_this.moveLayer}
                      removeFromMap={removeFromMap}
                      showLayerDesigner={showLayerDesigner}
                      editLayer={editLayer}
                    />
                  </li>
                )
              }
            })
          }</ul>
        }
        {empty &&
          <div style={{height: '100%', padding: 0, margin: 0}}>
            <p style={{margin: '20px 10px'}}>{this.__('No layers in map, use the tab to the right to add an overlay layer.')}</p>
          </div>
        }
      </div>
    )
  }
}
export default DragDropContext(HTML5Backend)(LayerList)
