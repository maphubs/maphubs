//@flow
import React from 'react';

import NotificationActions from '../../actions/NotificationActions';
import LayerStore from '../../stores/layer-store';
import PresetActions from '../../actions/presetActions';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import MapHubsComponent from '../MapHubsComponent';

export default class EmptyLocalSource extends MapHubsComponent {

  props: {
    onSubmit: Function,
    showPrev: boolean,
    type: string,
    onPrev: Function
  }

  static defaultProps = {
    onSubmit: null
  }

  constructor(props: Object){
    super(props);
    this.stores.push(LayerStore);
  }

  onSubmit = () => {
    var _this = this;
    var data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {},
      is_empty: true,
      empty_data_type: this.props.type
    };
    
    LayerActions.saveDataSettings(data, _this.state._csrf, function(err){
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        PresetActions.setLayerId(_this.state.layer.layer_id);
        NotificationActions.showNotification({message: _this.__('Layer Saved'), dismissAfter: 1000, onDismiss: _this.props.onSubmit});
      }
    });
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

	render() {

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }

		return (
        <div className="row">
            <p>{this.__('Creating a new layer of type:') + ' ' + this.props.type}</p>
            {prevButton}
            <div className="right">
              <button className="waves-effect waves-light btn" onClick={this.onSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
      </div>
		);
	}
}