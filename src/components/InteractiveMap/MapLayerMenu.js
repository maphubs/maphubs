var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
//var _isEqual = require('lodash.isequal');
var _find = require('lodash.find');
var LayerListDropDown = require('./LayerListDropDown');
var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');


var MapLayerMenu = React.createClass({

  mixins:[PureRenderMixin, StateMixin.connect(LocaleStore)],

  propTypes:  {
    categories:  React.PropTypes.array,
    layers:  React.PropTypes.array,
    toggleVisibility: React.PropTypes.func
  },

  getDefaultProps() {
    return {

    };
  },


  findLayer(layer_id){
    return _find(this.props.layers, {layer_id});
  },

  render(){
    var _this = this;

    return (
       <nav style={{boxShadow: '0 0 1px rgba(0,0,0,0.7)', borderTop: '1px #444 solid'}}>
          <div className="nav-wrapper z-depth-0">
          <ul className="left">
      {this.props.categories.map((category, i) => {
        var name = category.name[_this.state.locale];
        if(!name) name = category.name.en;
        var categoriesLayers = [];
        category.layers.forEach(layer_id =>{
          categoriesLayers.push(_this.findLayer(layer_id));
        });
        return (       
          <LayerListDropDown id={`category-dropdown-${i}`} name={name} layers={categoriesLayers} toggleVisibility={_this.props.toggleVisibility} />
        );
           
      })
       }
       </ul>
        </div>
      </nav>
    );

  }

});

module.exports = MapLayerMenu;