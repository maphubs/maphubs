//@flow
import React from 'react';
import LayerSettings from './LayerSettings';
import LayerActions from '../../actions/LayerActions';
import PresetActions from '../../actions/presetActions';
import MessageActions from '../../actions/MessageActions';
import LayerStore from '../../stores/layer-store';
import PresetStore from '../../stores/preset-store';
import Progress from '../Progress';
import MapHubsComponent from '../MapHubsComponent';

export default class Step2 extends MapHubsComponent {

  props: {
		groups: Array<Object>,
    onSubmit: Function
  }

  static defaultProps = {
    groups: [],
    onSubmit: null
  }

  state = {
    saving: false
  }

  constructor(props: Object){
    super(props);
    this.stores.push(LayerStore, PresetStore);
  }

  onSubmit = () => {
    if(!this.state.layer.is_external && !this.state.layer.is_empty){
      return this.saveDataLoad();
    }else if(this.state.layer.is_empty){
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
    PresetActions.setLayerId(this.state.layer.layer_id);
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
    LayerActions.tileServiceInitialized();
    if(this.props.onSubmit){
      this.props.onSubmit();
    }
  }

	render() {
		return (
        <div className="row">
        <Progress id="load-data-progess" title={this.__('Loading Data')} subTitle={this.__('Data Loading: This may take a few minutes for larger datasets.')} dismissible={false} show={this.state.saving}/>
        
            <p>{this.__('Provide Information About the Data Layer')}</p>
            <LayerSettings groups={this.props.groups}               
                submitText={this.__('Save and Continue')} onSubmit={this.onSubmit}
                warnIfUnsaved={false}
                />
      </div>
		);
	}
}