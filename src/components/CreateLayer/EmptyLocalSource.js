//@flow
import React from 'react';

import NotificationActions from '../../actions/NotificationActions';
import LayerStore from '../../stores/layer-store';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import MapHubsComponent from '../MapHubsComponent';

import type {LocaleStoreState} from '../../stores/LocaleStore';

type Props = {|
  onSubmit: Function,
  type: string
|}

export default class EmptyLocalSource extends MapHubsComponent<Props, LocaleStoreState> {

  props: Props

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
  }

  onSubmit = () => {
    const _this = this;
    const data = {
      is_external: false,
      external_layer_type: '',
      external_layer_config: {},
      is_empty: true,
      empty_data_type: this.props.type
    };
    
    LayerActions.saveDataSettings(data, _this.state._csrf, (err) => {
      if (err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        NotificationActions.showNotification({message: _this.__('Layer Saved'), dismissAfter: 1000, onDismiss: _this.props.onSubmit});
      }
    });
  }

	render() {
		return (
      <div className="row">
        <p>{this.__('Creating a new layer of type:') + ' ' + this.props.type}</p>
        <div className="right">
          <button className="waves-effect waves-light btn" onClick={this.onSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
        </div>
      </div>
		);
	}
}