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
        {value: 'default', label: this.__('Default')},
        {value: 'dark', label: this.__('Dark')},
        {value: 'streets', label: this.__('Streets')},
        {value: 'outdoors', label: this.__('Outdoors')},
        {value: 'bing-satellite', label: this.__('Bing Aerial')},
        {value: 'mapbox-satellite', label: this.__('Mapbox Satellite')}
      ];
      if(this.state.showBaseMaps){
        return (
          <div className="features z-depth-1" style={{width: '140px', marginRight: '10px', backgroundColor: 'white', textAlign: 'center'}}>
              <Formsy.Form>
              <h6>{this.__('Base Maps')}</h6>
              <Radio name="baseMap" label=""
                  defaultValue={this.state.baseMap}
                  options={baseMapOptions} onChange={this.onChange}
                />
              </Formsy.Form>
            </div>
        );
      }else{
        return null;
      }   
  }
});

module.exports = BaseMapSelection;