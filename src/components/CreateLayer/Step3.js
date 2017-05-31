//@flow
import React from 'react';
import classNames from 'classnames';
import LayerSource from './LayerSource';
import MessageActions from '../../actions/MessageActions';
import Progress from '../Progress';
import LayerStore from '../../stores/layer-store';
import PresetActions from '../../actions/presetActions';
import LayerActions from '../../actions/LayerActions';
import MapHubsComponent from '../MapHubsComponent';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';

type Props = {
  onSubmit: Function,
  active: boolean,
  showPrev: boolean,
  onPrev: Function
}

type State = {
  saving: boolean
} & LocaleStoreState & LayerStoreState

export default class Step3 extends MapHubsComponent<void, Props, State> {

  props: Props

  static defaultProps = {
    onSubmit: null,
    active: false
  }

  state: State = {
    saving: false
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
  }

  onSubmit = () => {
    if(!this.state.is_external && !this.state.is_empty){
      return this.saveDataLoad();
    }else if(this.state.is_empty){
      return this.initEmptyLayer();
    }
    else{
      return this.saveExternal();
    }
  }

  initEmptyLayer = () => {
    var _this = this;

    //save presets
    PresetActions.loadDefaultPresets();
    PresetActions.submitPresets(true, this.state._csrf, (err) => {
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
      }else{
        LayerActions.initEmptyLayer(_this.state._csrf, (err) => {
          if(err){
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            LayerActions.tileServiceInitialized();
            if(_this.props.onSubmit){
              _this.props.onSubmit();
            }
          }
        });
      }
    });
  }

  saveDataLoad = () => {
    var _this = this;

    _this.setState({saving: true});
    //save presets
    PresetActions.submitPresets(true, this.state._csrf, (err) => {
      if(err){
        MessageActions.showMessage({title: _this.__('Error'), message: err});
          _this.setState({saving: false});
      }else{
        LayerActions.loadData(_this.state._csrf, (err) => {
          _this.setState({saving: false});
          if(err){
            MessageActions.showMessage({title: _this.__('Error'), message: err});
          }else{
            LayerActions.tileServiceInitialized();
            if(_this.props.onSubmit){
              _this.props.onSubmit();
            }
          }
        });
      }
    });
  }

  saveExternal = () => {
    this.props.onSubmit();
  }

  onCancel = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

	render() {
    //hide if not active
    var className = classNames('row');
    if(!this.props.active) {
      className = classNames('row', 'hidden');
    }

		return (
      <div className={className}>
        <Progress id="load-data-progess" title={this.__('Loading Data')} subTitle={this.__('Data Loading: This may take a few minutes for larger datasets.')} dismissible={false} show={this.state.saving}/>
        <LayerSource
            showCancel={true} cancelText={this.__('Previous')} onCancel={this.onCancel}
            submitText={this.__('Save and Continue')} onSubmit={this.onSubmit}
          />
      </div>
		);
	}
}