var React = require('react');
var Formsy = require('formsy-react');
var Toggle = require('../forms/toggle');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var $ = require('jquery');
var _isequal = require('lodash.isequal');

var styles = require('../Map/styles');

var AdvancedLayerSettings = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    layer: React.PropTypes.object.isRequired,
    style: React.PropTypes.object,
    settings: React.PropTypes.object
  },

  getDefaultProps(){
    return {
      style: null,
      layer: null,
      settings: null
    };
  },

  getInitialState(){
    return {
      style: this.props.style,
      settings: this.props.settings ? this.props.settings : styles.defaultSettings()
    };
  },

  componentDidMount(){
    $('.tooltip-advanced-layer-settings').tooltip();
  },

  componentWillReceiveProps(nextProps){
    if(nextProps.settings){
      this.setState({style: nextProps.style, settings: nextProps.settings});
    }else{
      this.setState({style: nextProps.style});
    }

  },

  shouldComponentUpdate(nextProps, nextState){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  },

   onFormChange(values){

     var style = this.state.style;
     if(values.interactive !== this.state.settings.interactive){
        style = styles.toggleInteractive(values.interactive, this.state.style, this.props.layer.layer_id, this.props.layer.data_type);
     }else if(values.showBehindBaseMapLabels !== this.state.settings.showBehindBaseMapLabels){
        style = styles.toggleShowBehindBaseMapLabels(values.showBehindBaseMapLabels, this.state.style);
     }else{
       //nochange
       return;
     }

     var settings = this.state.settings;
     Object.keys(values).map(function(key){
       settings[key] = values[key];
     });

     this.setState({style, settings});
     this.props.onChange(style, settings);
  },

  render(){
    return (
        <div className="row" style={{marginLeft: '10px'}}>
          <Formsy.Form ref="form" onChange={this.onFormChange}>
            <div className="row">
              <b>{this.__('Interactive')}</b>
               <Toggle name="interactive" labelOff={this.__('Off')} labelOn={this.__('On')} className="tooltip-advanced-layer-settings"
                         defaultChecked={this.state.settings.interactive}
                          dataPosition="right" dataTooltip={this.__('Allow users to interact with this layer by clicking the map')}
                          />
            </div>
            <div className="row">
              <b>{this.__('Show Below Base Map Labels')}</b>
                <Toggle name="showBehindBaseMapLabels" className="tooltip-advanced-layer-settings" labelOff={this.__('Off')} labelOn={this.__('On')}
                          defaultChecked={this.state.settings.showBehindBaseMapLabels}
                           dataPosition="right" dataTooltip={this.__('Allow base map labels to display on top of this layer')}
                           />
            </div>

          </Formsy.Form>
        </div>
    );
  }
});

module.exports = AdvancedLayerSettings;
