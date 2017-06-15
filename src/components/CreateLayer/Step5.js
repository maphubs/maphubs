//@flow
import React from 'react';
import LayerStyle from './LayerStyle';
import LayerActions from '../../actions/LayerActions';
import MapHubsComponent from '../MapHubsComponent';

type Props = {|
  onSubmit: Function,
  onPrev: Function,
  mapConfig: Object
|}

import type {LocaleStoreState} from '../../stores/LocaleStore';

type State = LocaleStoreState

export default class Step5 extends MapHubsComponent<void, Props, State> {

  props: Props

  onSubmit = (layer_id: number, name: string) => {
    var _this = this;
    LayerActions.setComplete(this.state._csrf, () => {
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
              mapConfig={this.props.mapConfig}
              showPrev prevText={this.__('Previous')} onPrev={this.onPrev}
              onSubmit={this.onSubmit} />
      </div>
		);
	}
}