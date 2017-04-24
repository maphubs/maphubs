//@flow
import React from 'react';
import NotificationActions from '../../actions/NotificationActions';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import CreateLayer from './CreateLayer';
import MapHubsComponent from '../MapHubsComponent';

export default class Step1 extends MapHubsComponent {

   props: {
    onSubmit: Function,
    showPrev: boolean,
    onPrev: Function
  }

  state = {
    created: false,
    canSubmit: false,
    selectedSource: 'local'
  }

  sourceChange = (value: string) => {
    this.setState({selectedSource: value});
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

  onSubmit = () => {
    this.props.onSubmit();
  }

  cancelCallback = () => {
    this.setState({warnIfUnsaved: false});
    NotificationActions.showNotification({
      message: this.__('Layer Cancelled'),
      onDismiss(){
        window.location="/layers";
      }
    });
  }

   onCancel = () =>{
    var _this = this;
    if(_this.state.created){
      //delete the layer
      LayerActions.cancelLayer(this.state._csrf, (err) => {
        if(err){
          MessageActions.showMessage({title: _this.__('Error'), message: err});
        }else{
          _this.cancelCallback();
        }
      });
    }else{
      _this.cancelCallback();
    }
  }

	render() {  
    return (
        <div className="row">
          <CreateLayer onPrev={this.onPrev} onSubmit={this.onSubmit} 
          showCancel={true} cancelText={this.__('Cancel')} onCancel={this.onCancel}
         />      
      </div>
		);
	}
}