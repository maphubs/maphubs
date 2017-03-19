var React = require('react');
var Marker = require('./Marker');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var LegendItem = React.createClass({
  mixins: [PureRenderMixin],

  propTypes:  {
    layer: React.PropTypes.object.isRequired,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      style: {},
    };
  },

  render(){
    var _this = this;
    if(this.props.layer == undefined) return (<div></div>);

    if(!this.props.layer || ! this.props.layer.layer_id){
      return (
        <div></div>
      );
    }
    var legendItem = (
        <li style={{position: 'relative', minHeight: '25px', borderBottom: '1px solid #F1F1F1', padding: '2px'}}>
          <span className="no-margin no-padding valign" dangerouslySetInnerHTML={{__html: this.props.layer.legend_html}} />
          <span className="grey-text right right-align truncate no-padding" style={{margin: 0, fontSize: '6px', lineHeight: '6px', position: 'absolute', bottom: 0, right: 0}}>{this.props.layer.source}</span>             
        </li>      
        );
    var style = this.props.layer.style;  
    if(style.layers && Array.isArray(style.layers) && style.layers.length > 0){
      style.layers.forEach(function(layer){
        if(layer.id.startsWith('omh-data-point')){
          if(layer.metadata && layer.metadata['maphubs:markers'] && layer.metadata['maphubs:markers'].enabled){
            //clone object to avoid changing size of real markers
            var markerConfig = JSON.parse(JSON.stringify(layer.metadata['maphubs:markers']));
            markerConfig.width = 18;
            markerConfig.height = 18;
            legendItem = (
              <div className="omh-legend valign-wrapper">
                <div className="valign" style={{float: 'left'}}>
                  <Marker  {...markerConfig}/>
                </div>              
                <h3 className="valign" style={{paddingLeft: '5px', paddingTop: '0px', paddingBottom: '5px'}}>{_this.props.layer.name}</h3>
                <span className="grey-text left left-align truncate no-padding" style={{margin: 0, fontSize: '6px', lineHeight: '6px', position: 'absolute', bottom: 0, right: 0}}>({_this.props.layer.source})</span>
              </div>
             
            );
          }
        }
      });
    }
    return legendItem;
  }
});
module.exports = LegendItem;