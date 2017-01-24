var React = require('react');


var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var BaseMapStore = require('../../stores/map/BaseMapStore');
var LegendItem = require('./LegendItem');

var MiniLegend = React.createClass({

  mixins:[StateMixin.connect(BaseMapStore)],

  propTypes:  {
    layers: React.PropTypes.array,
    hideInactive: React.PropTypes.bool,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      layers: [],
      hideInactive: true,
      style: {}
    };
  },

  render(){
    var _this = this;
    return (
      <div style={this.props.style}>
        <div style={{textAlign: 'left'}}>

            <ul className="collection with-header no-margin z-depth-2" style={{backgroundColor: '#FFF'}}>
            {
                this.props.layers.map(function (layer) {
                  var legendHtml = layer.map_legend_html ? layer.map_legend_html : layer.legend_html;
                  layer.legend_html = legendHtml;
                  return (<LegendItem key={layer.layer_id} layer={layer} style={{padding: '2px', width: '100%', margin: 'auto'}} mini/>);
                })
              }
 
            <li className="collection-item no-margin no-padding" style={{lineHeight: '0.75em'}}>
              <span style={{fontSize: '8px', paddingLeft: '2px', float: 'left', backgroundColor: '#FFF'}} 
              className="grey-text align-left">Base Map - <span className="no-margin no-padding" dangerouslySetInnerHTML={{__html: this.state.attribution}}></span></span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = MiniLegend;
