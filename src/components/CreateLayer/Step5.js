//@flow
import React from 'react';
import LayerStyle from './LayerStyle';
import LayerActions from '../../actions/LayerActions';
import MapHubsComponent from '../MapHubsComponent';

export default class Step5 extends MapHubsComponent {

  props: {
    onSubmit: Function,
    onPrev: Function
  }

  onSubmit = (layer_id: number, name: string) => {
    var _this = this;
    LayerActions.setComplete(this.state._csrf, function(){
      if(_this.props.onSubmit) _this.props.onSubmit(layer_id, name);
    });
  }

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

	render() {
		return (
        <div className="row">
          <LayerStyle waitForTileInit
              showPrev prevText={this.__('Previous')} onPrev={this.onPrev}
              onSubmit={this.onSubmit} />
      </div>
		);
	}
}