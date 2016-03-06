var React = require('react');
var $ = require('jquery');


var Header = require('../components/header');
var LayerSettings = require('../components/CreateLayer/LayerSettings');
var LayerSource = require('../components/CreateLayer/LayerSource');
var PresetEditor = require('../components/CreateLayer/PresetEditor');
var LayerStyle = require('../components/CreateLayer/LayerStyle');
var MessageActions = require('../actions/MessageActions');
var NotificationActions = require('../actions/NotificationActions');
var ConfirmationActions = require('../actions/ConfirmationActions');


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
    NotificationActions.showNotification({message: this.__('Layer Saved'),onDismiss: this.props.onSubmit});
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
      message: _this.__('Please confirm removal of ') + this.props.layer.name,
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

	render() {

    var tabContentDisplay = 'none';
    if (typeof window !== 'undefined') {
      tabContentDisplay = 'inherit';
    }

		return (
      <div>
        <Header />
        <main>
        <div>

          <div className="row">
           <div className="col s12">
             <ul className="tabs">
               <li className="tab col s3"><a className="active" href="#info">{this.__('Info/Settings')}</a></li>
               <li className="tab col s3"><a href="#source">{this.__('Source/License')}</a></li>
               <li className="tab col s3"><a href="#fields">{this.__('Fields')}</a></li>
               <li className="tab col s3"><a href="#style">{this.__('Style/Display')}</a></li>
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
        <a className="btn-floating btn-large red">
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
});

module.exports = LayerAdmin;
