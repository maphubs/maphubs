//@flow
import React from 'react';
import Header from '../components/header';
import LayerSettings from '../components/CreateLayer/LayerSettings';
import PresetEditor from '../components/CreateLayer/PresetEditor';
import LayerStyle from '../components/CreateLayer/LayerStyle';
import MessageActions from '../actions/MessageActions';
import NotificationActions from '../actions/NotificationActions';
import ConfirmationActions from '../actions/ConfirmationActions';
import request from 'superagent';
import _uniq from 'lodash.uniq';
import _mapvalues from 'lodash.mapvalues';
import LayerActions from '../actions/LayerActions';
import LayerStore from '../stores/layer-store';
import BaseMapStore from '../stores/map/BaseMapStore';
var $ = require('jquery');
var slug = require('slug');
var checkClientError = require('../services/client-error-response').checkClientError;
import MapHubsComponent from '../components/MapHubsComponent';
import Reflux from '../components/Rehydrate';
import LocaleStore from '../stores/LocaleStore';
import type {LocaleStoreState} from '../stores/LocaleStore';
import type {Layer, LayerStoreState} from '../stores/layer-store';
import type {Group} from '../stores/GroupStore';

//import Perf from 'react-addons-perf';

type Props = {
  layer: Layer,
  groups: Array<Group>,
  onSubmit: Function,
  locale: string,
  _csrf: string,
  headerConfig: Object,
  mapConfig: Object
}

type State = {
  tab: string,
  canSavePresets: boolean
} & LocaleStoreState & LayerStoreState

export default class LayerAdmin extends MapHubsComponent<void, Props, State> {

  props: Props

  state: State = {
    tab: 'settings',
    canSavePresets: false
  }

  constructor(props: Props){
    super(props);
    this.stores.push(LayerStore);
    this.stores.push(BaseMapStore);
    Reflux.rehydrate(LocaleStore, {locale: this.props.locale, _csrf: this.props._csrf});
    Reflux.rehydrate(LayerStore, this.props.layer);
    if(props.mapConfig && props.mapConfig.baseMapOptions){
       Reflux.rehydrate(BaseMapStore, {baseMapOptions: props.mapConfig.baseMapOptions});
    }
  
    LayerActions.loadLayer();
  }

  componentDidMount(){
    //Perf.start();
    $(this.refs.tabs).tabs();
    $('.layeradmin-tooltips').tooltip();
  }
/*
  componentDidUpdate(){
    Perf.stop();
    Perf.printInclusive();
    Perf.printWasted();
  }
  */

  saveStyle = () => {
    var _this = this;
    LayerActions.saveStyle(this.state, this.state._csrf,  (err) => {
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        NotificationActions.showNotification({message: this.__('Layer Saved'), dismissAfter: 2000, onDismiss: this.props.onSubmit});
      }
    });
  }

  savePresets = () => {
    var _this = this;
    //check for duplicate presets
    let presets = this.state.presets.toArray();
    let tags = _mapvalues(presets, 'tag');
    let uniqTags = _uniq(tags);
    if(tags.length > uniqTags.length){
      MessageActions.showMessage({title: _this.__('Data Error'), message: this.__('Duplicate tag, please choose a unique tag for each field')});
    }else{
      //save presets
      LayerActions.submitPresets(false, this.state._csrf, (err) => {
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        }else{
          _this.saveStyle();
        }
      });
    }
  }

  presetsValid = () => {
    this.setState({canSavePresets: true});
  }

  presetsInvalid = () => {
    this.setState({canSavePresets: false});
  }

  deleteLayer = () => {
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Delete'),
      message: _this.__('Please confirm removal of') + ' '
      + _this._o_(this.props.layer.name) + '. '
      + _this.__('All additions, modifications, and feature notes will be deleted. This layer will also be removed from all maps, stories, and hubs.'),
      onPositiveResponse(){
        LayerActions.deleteLayer(_this.state._csrf, (err) => {
          if(err){
            MessageActions.showMessage({title: _this.__('Server Error'), message: err});
          } else {
            NotificationActions.showNotification({
                message: _this.__('Layer Deleted'),
                onDismiss(){
                  window.location = '/';
                }
              });
          }
        });
      }
    });
  }

  refreshRemoteLayer = () => {
    var _this = this;
    request.post('/api/layer/refresh/remote')
    .type('json').accept('json')
    .send({
      layer_id: this.props.layer.layer_id
    })
    .end((err, res) => {
      checkClientError(res, err, () => {}, (cb) => {
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        } else {
          NotificationActions.showNotification({message: _this.__('Layer Updated'), dismissAfter: 2000});
        }
        cb();
      });
    });
  }

  selectTab = (tab: string) => {
    this.setState({tab});
  }

	render() {
    var _this = this;
    var tabContentDisplay = 'none';
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit';
    }

    var layerInfoUrl = '/layer/info/' + this.props.layer.layer_id + '/' + slug(this._o_(this.props.layer.name));

    if(this.props.layer.remote){
      return (
        <div>
          <Header {...this.props.headerConfig}/>
          <main>
            <div className="container">
              <div className="row">
                 <div className="col s12">
                   <p>&larr; <a href={layerInfoUrl}>{this.__('Back to Layer')}</a></p>
                 </div>
               </div>
               <div className="row center-align">
                 <h5>{this.__('Unable to modify remote layers.')}</h5>
                  <div className="center-align center">
                    <button className="btn" style={{marginTop: '20px'}}
                      onClick={this.refreshRemoteLayer}>{this.__('Refresh Remote Layer')}</button>
                  </div>
                  <p>{this.__('You can remove this layer using the button in the bottom right.')}</p>
              </div>
              <div className="fixed-action-btn action-button-bottom-right">
                <a className="btn-floating btn-large tooltipped red" data-delay="50" data-position="left" data-tooltip={this.__('Delete Layer')}
                    onClick={this.deleteLayer}>
                  <i className="material-icons">delete</i>
                </a>
              </div>
            </div>
          </main>
        </div>
      );

    }else{

      let settingsTabContent = '', fieldsTabContent = '', styleTabContent = '';
      if(this.state.tab === 'settings'){
        settingsTabContent = (
          <LayerSettings
                groups={this.props.groups} 
                 showGroup={false}
                 warnIfUnsaved
                 submitText={this.__('Save')}
             />
        );

      }else if(this.state.tab === 'fields'){
        fieldsTabContent = (
          <div className="container" >
            <h5>{this.__('Data Fields')}</h5>
              <div className="right">
                <button onClick={this.savePresets} className="waves-effect waves-light btn" disabled={!this.state.canSavePresets}>{this.__('Save')}</button>
              </div>
              <PresetEditor onValid={this.presetsValid} onInvalid={this.presetsInvalid}/>
              <div className="right">
                <button onClick={this.savePresets} className="waves-effect waves-light btn" disabled={!this.state.canSavePresets}>{this.__('Save')}</button>
              </div>
          </div>
          
        );

      }else if(this.state.tab === 'style'){
        styleTabContent = (
          <LayerStyle
            showPrev={false}
            mapConfig={this.props.mapConfig}
          />
        );
      }


		return (
      <div>
        <Header {...this.props.headerConfig}/>
        <main>
        <div>

          <div className="row">
           <div className="col s12">
             <p>&larr; <a href={layerInfoUrl}>{this.__('Back to Layer')}</a></p>
             <ul ref="tabs" className="tabs" style={{overflowX: 'hidden'}}>
               <li className="tab">
                 <a className="active" onClick={function(){_this.selectTab('settings');}} href="#info">{this.__('Info/Settings')}</a>
                </li>
               <li className="tab">
                 <a onClick={function(){_this.selectTab('fields');}} href="#fields">{this.__('Fields')}</a>
               </li>
               <li className="tab">
                 <a onClick={function(){_this.selectTab('style');}} href="#style">{this.__('Style/Display')}</a>
              </li>
             </ul>
           </div>
           <div id="info" className="col s12" style={{borderTop: '1px solid #ddd'}}>
             {settingsTabContent}
           </div>
           <div id="fields" className="col s12" style={{display: tabContentDisplay, borderTop: '1px solid #ddd'}}>
             {fieldsTabContent}
           </div>
           <div id="style" className="col s12" style={{display: tabContentDisplay, borderTop: '1px solid #ddd'}}>
             {styleTabContent}
           </div>
        </div>
      </div>
      <div className="fixed-action-btn action-button-bottom-right">
          <a className="btn-floating btn-large layeradmin-tooltips red" data-delay="50" data-position="left" data-tooltip={this.__('Delete Layer')}
              onClick={this.deleteLayer}>
            <i className="material-icons">delete</i>
          </a>
      </div>
    </main>
		</div>
		);
	}
}
}