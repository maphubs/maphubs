var React = require('react');
var $ = require('jquery');
var slug = require('slug');

var Header = require('../components/header');
var LayerSettings = require('../components/CreateLayer/LayerSettings');
var LayerSource = require('../components/CreateLayer/LayerSource');
var PresetEditor = require('../components/CreateLayer/PresetEditor');
var LayerStyle = require('../components/CreateLayer/LayerStyle');
var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');
var ConfirmationActions = require('../actions/ConfirmationActions');

var request = require('superagent');
var checkClientError = require('../services/client-error-response').checkClientError;



var LayerActions = require('../actions/LayerActions');
var PresetActions = require('../actions/presetActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LayerStore = require('../stores/layer-store');
var LocaleStore = require('../stores/LocaleStore');
var Locales = require('../services/locales');

var LayerAdmin = React.createClass({

  mixins:[StateMixin.connect(LayerStore, {initWithProps: ['layer', 'groups']}), StateMixin.connect(LocaleStore, {initWithProps: ['locale']})],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
		layer: React.PropTypes.object.isRequired,
    groups: React.PropTypes.array.isRequired,
    onSubmit: React.PropTypes.func,
    locale: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      onSubmit() {}
    };
  },

  getInitialState() {
    PresetActions.setLayerId(this.props.layer.layer_id);
    PresetActions.loadPresets(this.props.layer.presets);
    return {

    };
  },

  componentDidMount(){
    $('ul.tabs').tabs();
  },

  componentWillMount(){
      LayerActions.loadLayer(this.props.layer);
  },

  save(){
    NotificationActions.showNotification({message: this.__('Layer Saved'), dismissAfter: 2000, onDismiss: this.props.onSubmit});
  },

  savePresets(){
    var _this = this;
    //save presets
    PresetActions.submitPresets(false, function(err){
      if(err){
        MessageActions.showMessage({title: _this.__('Server Error'), message: err});
      }else{
        _this.save();
      }
    });
  },

  presetsValid(){
    this.setState({canSavePresets: true});
  },

  presetsInvalid(){
    this.setState({canSavePresets: false});
  },

  deleteLayer(){
    var _this = this;
    ConfirmationActions.showConfirmation({
      title: _this.__('Confirm Delete'),
      message: _this.__('Please confirm removal of') + ' '
      + this.props.layer.name + '. '
      + _this.__('All additions, modifications, and feature notes will be deleted. This layer will also be removed from all maps, stories, and hubs.'),
      onPositiveResponse(){
        LayerActions.deleteLayer(function(err){
          if(err){
            MessageActions.showMessage({title: _this.__('Server Error'), message: err});
          } else {
            window.location = '/layers';
          }

        });
      }
    });

  },

  refreshRemoteLayer(){
    var _this = this;
    request.post('/api/layer/refresh/remote')
    .type('json').accept('json')
    .send({
      layer_id: this.props.layer.layer_id
    })
    .end(function(err, res){
      checkClientError(res, err, function(){}, function(cb){
        if(err){
          MessageActions.showMessage({title: _this.__('Server Error'), message: err});
        } else {
          NotificationActions.showNotification({message: _this.__('Layer Updated'), dismissAfter: 2000});
        }
        cb();
      });
    });
  },

	render() {

    var tabContentDisplay = 'none';
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit';
    }

    var layerInfoUrl = '/layer/info/' + this.props.layer.layer_id + '/' + slug(this.props.layer.name);

    if(this.props.layer.remote){
      return (
        <div>
          <Header />
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

		return (
      <div>
        <Header />
        <main>
        <div>

          <div className="row">
           <div className="col s12">
             <p>&larr; <a href={layerInfoUrl}>{this.__('Back to Layer')}</a></p>
             <ul className="tabs" style={{overflowX: 'hidden'}}>
               <li className="tab"><a className="active" href="#info">{this.__('Info/Settings')}</a></li>
               <li className="tab"><a href="#source">{this.__('Source/License')}</a></li>
               <li className="tab"><a href="#fields">{this.__('Fields')}</a></li>
               <li className="tab"><a href="#style">{this.__('Style/Display')}</a></li>
             </ul>
           </div>
           <div id="info" className="col s12">
             <LayerSettings
                 showCancel={false}
                 showGroup={false}
                 warnIfUnsaved
                 submitText={this.__('Save')} onSubmit={this.save}
             />
           </div>
           <div id="source" className="col s12" style={{display: tabContentDisplay}}>
             <LayerSource
                 showPrev={false}
                 submitText={this.__('Save')} onSubmit={this.save}
              />
           </div>
           <div id="fields" className="col s12" style={{display: tabContentDisplay}}>
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
           </div>
           <div id="style" className="col s12" style={{display: tabContentDisplay}}>
             <LayerStyle
                 showPrev={false}
                 submitText="Save" onSubmit={this.save}
              />
           </div>
        </div>
      </div>
      <div className="fixed-action-btn action-button-bottom-right">
        <a className="btn-floating btn-large red red-text">
          <i className="large material-icons">settings</i>
        </a>
        <ul>
          <li>
            <a className="btn-floating tooltipped red" data-delay="50" data-position="left" data-tooltip={this.__('Delete Layer')}
                onClick={this.deleteLayer}>
              <i className="material-icons">delete</i>
            </a>
          </li>
        </ul>
      </div>
    </main>
		</div>
		);
	}
}
});

module.exports = LayerAdmin;
