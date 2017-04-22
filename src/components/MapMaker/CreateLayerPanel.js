//@flow
import React from 'react';
import LayerActions from '../../actions/LayerActions';
import LayerStore from '../../stores/layer-store';
import MessageActions from '../../actions/MessageActions';
import MapHubsComponent from '../MapHubsComponent';

export default class CreateLayerPanel extends MapHubsComponent {

  constructor(props: Object){
    super(props);
    this.stores.push(LayerStore);
  }

  createEmptyLayer = () => {
    var _this = this;
    LayerActions.createLayer(this.state._csrf, err =>{
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        _this.setState({pendingChanges: false});
        if(_this.props.onSubmit){
          _this.props.onSubmit();
        }
      }
    });
  }

  render(){
    return (
      <div></div>
    );
  }
}