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
      size: "32",
      width: 32,
      height: 32,
      shapeFill: 'red',
      shapeFillOpacity: 1,
      shapeStroke: '#212121',
      shapeStrokeWidth: 1,
      icon:  'none',
      iconFill: 'white',
      iconFillOpacity: 1,
      iconStroke: '#212121',
      iconStrokeWidth: 0,
      inverted: false
    };

    //get state from style
    if(this.props.style.layers && Array.isArray(this.props.style.layers) && this.props.style.layers.length > 0){
      this.props.style.layers.forEach(function(layer){
        if(layer.id.startsWith('omh-data-point')){
          if(layer.metadata && layer.metadata['maphubs:markers']){
            _assignIn(options, layer.metadata['maphubs:markers']);
          }else{
            //get color from circle
            options.shapeFill = layer.paint['circle-color'];
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

    var options = JSON.parse(JSON.stringify(this.state.options));
    _assignIn(options, model);

    //invert colors
    if(model.inverted && !this.state.options.inverted){   
      options.shapeStroke = options.shapeFill;
      options.iconFill = options.shapeFill;
      options.shapeFill = 'white';
      options.shapeFillOpacity = 0.75;
      options.shapeStrokeWidth = 2;
    }

    //switch colors back
    if(!model.inverted && this.state.options.inverted){   
       options.shapeFill = options.shapeStroke;
       options.iconFill = 'white';
       options.shapeStroke ='#212121';
       options.shapeFillOpacity = 1;
       options.shapeStrokeWidth = 1;
    }

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
      {value: 'CIRCLE', label: this.__('Circle')},
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
      {value: 'none', label: this.__('None')},
      {value: 'maphubs-icon-boat', label: this.__('Boat')},
      {value: 'maphubs-icon-campfire', label: this.__('Campfire')},
      {value: 'maphubs-icon-cargo-ship', label: this.__('Cargo Ship')},
      {value: 'maphubs-icon-chainsaw', label: this.__('Chainsaw')}, 
      {value: 'maphubs-icon-chipmunk', label: this.__('Chipmunk')}, 
      {value: 'maphubs-icon-clearcutting', label: this.__('Clearcutting')}, 
      {value: 'maphubs-icon-clipboard', label: this.__('Clipboard')},
      {value: 'maphubs-icon-clinic', label: this.__('Clinic')},
      {value: 'maphubs-icon-dam', label: this.__('Dam')}, 
      {value: 'maphubs-icon-dolphin', label: this.__('Dolphin')},
      {value: 'maphubs-icon-elephant', label: this.__('Elephant')},
      {value: 'maphubs-icon-eye', label: this.__('Eye')},
      {value: 'maphubs-icon-farmer', label: this.__('Farmer')},
      {value: 'maphubs-icon-farmer-family', label: this.__('Farmer Family')},
      {value: 'maphubs-icon-farmer-wife', label: this.__('Farmer Wife')},
      {value: 'maphubs-icon-fox', label: this.__('Fox')},
      {value: 'maphubs-icon-gorilla', label: this.__('Gorilla')},
      {value: 'maphubs-icon-hand-one', label: this.__('Hand')},
      {value: 'maphubs-icon-hummingbird', label: this.__('HummingBird')},
      {value: 'maphubs-icon-log-pile', label: this.__('Log Pile')},
      {value: 'maphubs-icon-magnifier', label: this.__('Magnifier')},
      {value: 'maphubs-icon-money', label: this.__('Money')},
      {value: 'maphubs-icon-oil', label: this.__('Oil')},
      {value: 'maphubs-icon-palm-oil', label: this.__('Palm Oil')},
      {value: 'maphubs-icon-play', label: this.__('Play')},
      {value: 'maphubs-icon-sawblade', label: this.__('Sawblade')},
      {value: 'maphubs-icon-star', label: this.__('Star')},
      {value: 'maphubs-icon-tractor', label: this.__('Tractor')},
      {value: 'maphubs-icon-truck', label: this.__('Truck')},
      {value: 'maphubs-icon-tug-boat', label: this.__('Tug Boat')},
      {value: 'maphubs-icon-turtle', label: this.__('Turtle')},
      {value: 'maphubs-icon-turtle2', label: this.__('Turtle 2')},
      {value: 'maphubs-icon-video', label: this.__('Video')},
      {value: 'maphubs-icon-village', label: this.__('Village')},
      {value: 'maphubs-icon-whale', label: this.__('Whale')},
      {value: 'maphubs-icon-wifi', label: this.__('WiFi')},
      {value: 'maphubs-icon-wolf', label: this.__('Wolf')}
    ];

    return (
      <div>
        <div className="row">
          <Formsy.Form ref="form" onChange={this.onFormChange}>
           <div className="row" style={{marginTop: '10px', marginBottom: '0px', padding: '0 .75rem'}}>
           <b>{this.__('Enable Markers')}</b>
             <Toggle name="enabled" labelOff={this.__('Off')} labelOn={this.__('On')} className="tooltip-label-settings"
                       checked={this.state.options.enabled}
                        dataPosition="right" dataTooltip={this.__('Enable markers for this Layer')}
                        />
            </div>
            <div className="row no-margin">
              <Select name="shape" id="markers-shape-select" label={this.__('Marker Shape')} options={shapeOptions} className="col s12 tooltip-marker-settings no-margin"
                      value={this.state.options.shape} defaultValue={this.state.options.shape} startEmpty={this.state.options.shape ? false : true}
                    dataPosition="right" dataTooltip={this.__('Shape of the map marker')}
                    required/> 
            </div>
            <div className="row no-margin">
              <Select name="size" id="markers-size-select" label={this.__('Marker Size')} options={sizeOptions} className="col s12 tooltip-marker-settings no-margin"
                    value={this.state.options.size} defaultValue={this.state.options.size} startEmpty={this.state.options.size ? false : true}
                   dataPosition="right" dataTooltip={this.__('Size of the map marker')}
                   required/> 
             
            </div>
            <div className="row no-margin">
              <Select name="icon" id="markers-icon-select" label={this.__('Marker Icon')} options={iconOptions} className="col s12 tooltip-marker-settings no-margin"
                    value={this.state.options.icon} defaultValue={this.state.options.icon} startEmpty={this.state.options.icon ? false : true}
                    dataPosition="right" dataTooltip={this.__('Maker icon overlay')}
                    required/> 
            </div>
             <div className="row no-margin" style={{padding: '0 .75rem'}}>
             <b>{this.__('Invert Colors')}</b>
             <Toggle name="inverted" labelOff={this.__('Off')} labelOn={this.__('On')} className="tooltip-label-settings"
                       checked={this.state.options.inverted}
                        dataPosition="right" dataTooltip={this.__('Invert colors')}
                        />
            </div>
          </Formsy.Form>
        </div>
      </div>
    );
  }
});

module.exports = MarkerSettings;
