//@flow
import React from 'react';
import LayerListItem from './LayerListItem';
import _isEqual from 'lodash.isequal';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';

class LayerList extends React.PureComponent {

  props:  {
    layers:  Array<Object>,
    showVisibility: boolean,
    showDesign: boolean,
    showRemove: boolean,
    showEdit: boolean,
    showChangeDesign: boolean,
    toggleVisibility: Function,
    removeFromMap: Function,
    showLayerDesigner: Function,
    updateLayers: Function,
    editLayer: Function
  }

  state = {
    layers: []
  }

  constructor(props){
    super(props);
    var layers = JSON.parse(JSON.stringify(props.layers));
    this.state = {
      layers
    };
  }

  componentWillReceiveProps(nextProps){
     if(!_isEqual(nextProps.layers, this.state.layers)){
       var layers = JSON.parse(JSON.stringify(nextProps.layers));
     this.setState({layers});
    }
  }

  moveLayer = (dragIndex, hoverIndex) => {
    const layers = this.state.layers;
    const dragLayer = layers[dragIndex];

    var updatedLayers = update(layers, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragLayer],
        ]
    });

    this.props.updateLayers(updatedLayers);

  }

  render(){
    var _this = this;
    return (
      <div style={{height: '100%', padding: 0, margin: 0}}>
          <ul ref="layers" style={{height: '100%', overflow: 'auto'}} className="collection no-margin custom-scroll-bar">{
            this.state.layers.map((layer, i) => {
              if(layer.layer_id && layer.layer_id > 0){
                return (
                  <li key={layer.layer_id} >
                    <LayerListItem id={layer.layer_id} item={layer} index={i}              
                      toggleVisibility={_this.props.toggleVisibility}
                      showVisibility={_this.props.showVisibility}
                      showRemove={_this.props.showRemove}
                      showDesign={_this.props.showDesign}
                      showEdit={_this.props.showEdit}
                      moveItem={_this.moveLayer}
                      removeFromMap={_this.props.removeFromMap}
                      showLayerDesigner={_this.props.showLayerDesigner}
                      editLayer={_this.props.editLayer}
                    />
                  </li>
                );
              }
            })
          }</ul>
        </div>
    );
  }
}
export default DragDropContext(HTML5Backend)(LayerList);
