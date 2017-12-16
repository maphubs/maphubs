//@flow
import React from 'react';
import LayerListItemStatic from './LayerListItemStatic';
import _isEqual from 'lodash.isequal';
import MapHubsPureComponent from '../MapHubsPureComponent';

type Props = {|
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
|}

export default class LayerListStatic extends MapHubsPureComponent<Props, void> {

  props: Props

  constructor(props: Props){
    super(props);
    const layers = JSON.parse(JSON.stringify(props.layers));
    this.state = {
      layers
    };
  }

  componentWillReceiveProps(nextProps: Props){
     if(!_isEqual(nextProps.layers, this.state.layers)){
       const layers = JSON.parse(JSON.stringify(nextProps.layers));
     this.setState({layers});
    }
  }

  render(){
    const _this = this;
    return (
      <div style={{height: '100%', padding: 0, margin: 0}}>
          <ul ref="layers" style={{height: '100%', overflow: 'auto'}} className="collection no-margin custom-scroll-bar">{
            this.state.layers.map((layer) => {
              if(layer && layer.layer_id && layer.layer_id > 0){
                return (
                  <li key={layer.layer_id} >
                    <LayerListItemStatic id={layer.layer_id} item={layer}            
                      toggleVisibility={_this.props.toggleVisibility}
                      showVisibility={_this.props.showVisibility}
                      showRemove={_this.props.showRemove}
                      showDesign={_this.props.showDesign}
                      showEdit={_this.props.showEdit}
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