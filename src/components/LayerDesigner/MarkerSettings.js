var React = require('react');
var Formsy = require('formsy-react');
var Toggle = require('../forms/toggle');
var Select = require('../forms/select');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var $ = require('jquery');
var _assignIn = require('lodash.assignin');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var styles = require('../Map/styles');

var MarkerSettings = React.createClass({

  mixins:[PureRenderMixin, StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    layer: React.PropTypes.object.isRequired,
    style: React.PropTypes.object.isRequired
  },

  getInitialState(){
    var options = {
      shape: 'MAP_PIN',
      size: 48,
      width: 48,
      height: 48,
      shapeFill: 'red',
      shapeFillOpacity: 1,
      shapeStroke: 'black',
      shapeStrokeWidth: 2,
      icon:  null,
      iconFill: 'white',
      iconFillOpacity: 1,
      iconStroke: '#212121',
      iconStrokeWidth: 1
    };

    //get state from style
    if(this.props.style.layers && Array.isArray(this.props.style.layers) && this.props.style.layers.length > 0){
      this.props.style.layers.forEach(function(layer){
        if(layer.id.startsWith('omh-data-point')){
          if(layer.metadata && layer.metadata['maphubs:markers']){
            _assignIn(options, layer.metadata['maphubs:markers']);
          }
        }
      });
    }

    return {
      style: this.props.style,
      options
    };
  },

  componentDidMount(){
    $('.tooltip-marker-settings').tooltip();
  },

  componentWillReceiveProps(nextProps){
    this.setState({style: nextProps.style});
  },

   onFormChange(model){
     if(model.size){
       model.width = parseInt(model.size);
       model.height = parseInt(model.size);
     }
     if(model.icon === 'none'){
       model.icon = null;
     }
    var options = this.state.options;
    _assignIn(options, model);
    var style;
    if(options.enabled){
      style = styles.enableMarkers(this.state.style, options, this.props.layer.layer_id);    
    }else{
      style = styles.disableMarkers(this.state.style);
    }
    this.setState({style, options});
    this.props.onChange(style, options);
    $('.tooltip-marker-settings').tooltip('remove');
    $('.tooltip-marker-settings').tooltip();
  },

  render(){
    var shapeOptions = [
      {value: 'MAP_PIN', label: this.__('Map Pin')},
      {value: 'SQUARE_PIN', label: this.__('Square Pin')},
      {value: 'SQUARE_ROUNDED', label: this.__('Rounded Square')},
      {value: 'SQUARE', label: this.__('Square')},
    ];
    var sizeOptions = [
      {value: '16', label: '16'},
      {value: '24', label: '24'},
      {value: '32', label: '32'},
      {value: '40', label: '40'},
      {value: '48', label: '48'},
      {value: '56', label: '56'},
      {value: '64', label: '64'},
      {value: '96', label: '96'}
    ];
     var iconOptions = [
      {value: 'maphubs-icon-palm-oil', label: this.__('Palm Oil')},
      {value: 'none', label: this.__('None')}
    ];

    return (
      <div>
        <div className="row">
          <Formsy.Form ref="form" onChange={this.onFormChange}>
           <div className="row" style={{marginTop: '10px', marginBottom: '0px'}}>
             <Toggle name="enabled" labelOff={this.__('Off')} labelOn={this.__('On')} className="col s12 tooltip-label-settings"
                       defaultChecked={this.state.options.enabled}
                        dataPosition="top" dataTooltip={this.__('Enable Markers for this Layer')}
                        />
            </div>
            <div className="row no-margin">
              <Select name="shape" id="markers-shape-select" label={this.__('Marker Shape')} options={shapeOptions} className="col s12 tooltip-marker-settings no-margin"
                      value={this.state.options.shape} defaultValue={this.state.options.shape} startEmpty={this.state.options.shape ? false : true}
                    dataPosition="top" dataTooltip={this.__('Shape of the map marker')}
                    required/> 
            </div>
            <div className="row no-margin">
              <Select name="size" id="markers-size-select" label={this.__('Marker Size')} options={sizeOptions} className="col s12 tooltip-marker-settings no-margin"
                    value={this.state.options.size} defaultValue={this.state.options.size} startEmpty={this.state.options.size ? false : true}
                   dataPosition="top" dataTooltip={this.__('Size of the map marker')}
                   required/> 
             
            </div>
            <div className="row no-margin">
              <Select name="icon" id="markers-icon-select" label={this.__('Marker Icon')} options={iconOptions} className="col s12 tooltip-marker-settings no-margin"
                    value={this.state.options.icon} defaultValue={this.state.options.icon} startEmpty={this.state.options.icon ? false : true}
                    dataPosition="top" dataTooltip={this.__('Maker icon overlay')}
                    required/> 
            </div>
          </Formsy.Form>
        </div>
      </div>
    );
  }
});

module.exports = MarkerSettings;
