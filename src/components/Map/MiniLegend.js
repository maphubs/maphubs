var React = require('react');


var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var BaseMapStore = require('../../stores/map/BaseMapStore');


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

            <ul className="collection with-header no-margin z-depth-2">
            {
              this.props.layers.map(function (layer, i) {
                if(_this.props.hideInactive && !layer.active){
                  return (<div key={i}></div>);
                }
                var legendHtml = layer.map_legend_html ? layer.map_legend_html : layer.legend_html;
                /*eslint-disable react/no-danger*/
                return (
                  <li key={i} className="collection-item no-margin no-padding">
                    <div className="no-margin valign" style={{padding: '2px'}} dangerouslySetInnerHTML={{__html: legendHtml}}></div>
                  </li>
                );
                /*eslint-enable react/no-danger*/
              })

            }
            <li className="collection-item no-margin no-padding" style={{lineHeight: '0.75em'}}>
              <span style={{fontSize: '8px', paddingLeft: '2px'}} className="grey-text align-left">Base Map - {this.state.attribution}</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

});

module.exports = MiniLegend;
