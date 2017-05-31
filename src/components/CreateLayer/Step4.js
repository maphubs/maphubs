//@flow
import React from 'react';
var $ = require('jquery');
import classNames from 'classnames';
import PresetEditor from './PresetEditor';
import MessageActions from '../../actions/MessageActions';
import Progress from '../Progress';
import LayerStore from '../../stores/layer-store';
import LayerActions from '../../actions/LayerActions';
import PresetActions from '../../actions/presetActions';
import MapHubsComponent from '../MapHubsComponent';
import type {LocaleStoreState} from '../../stores/LocaleStore';
import type {LayerStoreState} from '../../stores/layer-store';

type Props = {
  onSubmit: Function,
  active: boolean,
  showPrev: boolean,
  onPrev: Function
}

type Step4State = {
  canSubmit: boolean,
  saving: boolean
}

type State = LocaleStoreState & LayerStoreState & Step4State

export default class Step4 extends MapHubsComponent<void, Props, State> {

  props: Props

  static defaultProps = {
    layer_id: null,
    onSubmit: null,
    active: false
  }

  state: State = {
    canSubmit: false,
    saving: false,
    layer: {}
  }

  constructor(props: Object){
    super(props);
    this.stores.push(LayerStore);
  }

  save = () => {
    $('body').scrollTop(0);
    if(!this.state.is_external){
      return this.saveDataLoad();
    }else{
      return this.saveExternal();
    }
  }

  saveExternal = () => {
    this.props.onSubmit();
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

  onPrev = () => {
    if(this.props.onPrev) this.props.onPrev();
  }

  enableButton = () => {
    this.setState({
      canSubmit: true
    });
  }

  disableButton = () => {
    this.setState({
      canSubmit: false
    });
  }

	render() {

    //hide if not active
    var className = classNames('container');
    if(!this.props.active) {
      className = classNames('container', 'hidden');
    }

    var prevButton = '';
    if(this.props.showPrev){
      prevButton = (
        <div className="left">
          <a className="waves-effect waves-light btn" onClick={this.onPrev}><i className="material-icons left">arrow_back</i>{this.__('Previous Step')}</a>
        </div>
      );
    }
    var presetEditor = '';
    if(!this.state.is_external){
      presetEditor = (
        <div>
          <h5>Data Fields</h5>
            <div className="right">
              <button onClick={this.save} className="waves-effect waves-light btn" disabled={!this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
          <PresetEditor onValid={this.enableButton} onInvalid={this.disableButton}/>
        </div>
      );
    }else {
      presetEditor = (
        <h5 style={{margin: '20px'}}>{this.__('Unable to modify fields from external data sources, please continue to next step.')}</h5>
      );
    }
		return (
        <div className={className}>
          <Progress id="load-data-progess" title={this.__('Loading Data')} subTitle={this.__('Data Loading: This may take a few minutes for larger datasets.')} dismissible={false} show={this.state.saving}/>
            {presetEditor}
            {prevButton}
            <div className="right">
              <button onClick={this.save} className="waves-effect waves-light btn" disabled={!this.state.is_external && !this.state.canSubmit}><i className="material-icons right">arrow_forward</i>{this.__('Save and Continue')}</button>
            </div>
      </div>
		);
	}
}