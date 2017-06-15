//@flow
import React from 'react';
import LayerSettings from './LayerSettings';
import LayerActions from '../../actions/LayerActions';
import MessageActions from '../../actions/MessageActions';
import LayerStore from '../../stores/layer-store';
import Progress from '../Progress';
import MapHubsComponent from '../MapHubsComponent';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';
import type {Group} from '../../stores/GroupStore';

type Props = {
  groups: Array<Group>,
  onSubmit: Function
}

type DefaultProps = {
  groups: Array<Group>
}

type State = {
  saving: boolean
} & LocaleStoreState & LayerStoreState

export default class Step2 extends MapHubsComponent<DefaultProps, Props, State> {

  props: Props

  static defaultProps: DefaultProps = {
    groups: []
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
    LayerActions.loadDefaultPresets();
    LayerActions.submitPresets(true, this.state._csrf, (err) => {
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
    LayerActions.submitPresets(true, this.state._csrf, (err) => {
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