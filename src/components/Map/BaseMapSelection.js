var React = require('react');
var Radio = require('../forms/radio');
var Formsy = require('formsy-react');
//var Actions = require('../../actions/map/BaseMapActions');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var BaseMapStore = require('../../stores/map/BaseMapStore');
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');


var BaseMapSelection = React.createClass({

  mixins:[StateMixin.connect(BaseMapStore), StateMixin.connect(LocaleStore)],

  __(text: string){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

  onChange(val){
    this.props.onChange(val);
  },

  render(){
    var baseMapOptions = [
      {value: 'default', label: this.__('Default (Light)')},
      {value: 'dark', label: this.__('Dark')},
      {value: 'streets', label: this.__('Streets')},
      {value: 'outdoors', label: this.__('Outdoors')},
      {value: 'bing-satellite', label: this.__('Bing Aerial')},
      {value: 'mapbox-satellite', label: this.__('Mapbox Satellite')},
      {value: 'landsat-2014', label: this.__('Landsat - 2014')},
      {value: 'stamen-toner', label: this.__('Stamen - Toner')},
      {value: 'stamen-terrain', label: this.__('Stamen - Terrain')},
      {value: 'stamen-watercolor', label: this.__('Stamen - Watercolor')}
    ];
    return (
      <div style={{width: '100%', marginRight: '10px', backgroundColor: 'white', textAlign: 'left'}}>
          <Formsy.Form>
          <h6>{this.__('Choose a Base Map')}</h6>
          <Radio name="baseMap" label="" className="base-map-selection"
              defaultValue={this.state.baseMap}
              options={baseMapOptions} onChange={this.onChange}
            />
          </Formsy.Form>
        </div>
    ); 
  }
});

module.exports = BaseMapSelection;