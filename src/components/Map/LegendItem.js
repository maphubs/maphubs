var React = require('react');
var urlUtil = require('../../services/url-util');
var GroupTag = require('../Groups/GroupTag');
var Marker = require('./Marker');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var LegendItem = React.createClass({
  mixins: [PureRenderMixin],

  propTypes:  {
    layer: React.PropTypes.object.isRequired,
    mini:  React.PropTypes.bool,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      style: {},
      mini: false
    };
  },

  render(){
    var _this = this;
    if(this.props.layer == undefined) return (<div></div>);
    var baseUrl = urlUtil.getBaseUrl();
    var infoURL = baseUrl + '/lyr/' + this.props.layer.layer_id;
    //var icon = 'visibility_off';
    //if(this.props.layer.visibility === false) icon = 'visibility';

    //check if this layer contains a map legend style (included if this legend is showing as part of a composite map)
    var legendHtml = this.props.layer.map_legend_html ? this.props.layer.map_legend_html : this.props.layer.legend_html;

    if(!this.props.layer || ! this.props.layer.layer_id){
      return (
        <div></div>
      );
    }
    var legendItem = (
        <li style={{position: 'relative'}}>
          <span className="no-margin no-padding valign" dangerouslySetInnerHTML={{__html: legendHtml}} />
          <span className="grey-text right right-align truncate no-padding" style={{margin: 0, fontSize: '6px', position: 'absolute', bottom: 0, right: 0}}>{this.props.layer.source}</span>             
        </li>      
        );
    var style;
    if(this.props.layer.map_style){
      style = this.props.layer.map_style;
    }else{
      style = this.props.layer.style;
    }
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
                <span className="grey-text left left-align truncate no-padding" style={{margin: 0, fontSize: '6px', lineHeight: '0.75em', width: '50%'}}>({this.props.layer.source})</span>
              </div>
             
            );
          }
        }
      });
    }
    if(this.props.mini){
      return legendItem;
    }

    /*eslint-disable react/no-danger*/
    return (
          <li key={this.props.layer.layer_id} style={this.props.style} className="collection-item row">
            <div className="row no-margin valign-wrapper" style={{padding: '2px'}}>
              <div className="col s6 no-margin no-padding valign">
                {legendItem}
              </div>
              <div className="col s6 no-margin no-padding">
                <div className="row no-margin no-padding center">
                  <div className="col s12 no-margin no-padding">
                    <GroupTag className={'right'} group={this.props.layer.owned_by_group_id} size={15} fontSize={8} />
                  </div>
                </div>
              </div>
            </div>
            <div className="row no-margin no-padding right-align" style={{lineHeight: '0.75em'}}>
              <p className="grey-text left left-align truncate no-padding" style={{margin: 0, fontSize: '8px', lineHeight: '0.75em', width: '50%'}}>{this.props.layer.source}</p>
              <a target="_blank" className="grey-text right no-padding" style={{height: '10px', fontSize: '8px',lineHeight: '0.75em'}} href={infoURL}>{infoURL}</a>
            </div>
          </li>

    );
      /*eslint-enable react/no-danger*/
      /*

      <div className="col s4 no-margin no-padding">
        <a href={infoURL} target="_blank" className="tooltipped omh-accent-text"  data-position="left" data-delay="50" data-tooltip="Layer Info"><i className="material-icons" style={{fontSize: '13px'}}>info</i></a>
        <a href="#!" className="tooltipped omh-accent-text" data-position="left" data-delay="50" data-tooltip="Show/Hide Layer"><i className="material-icons" style={{fontSize: '13px'}}>{icon}</i></a>
      </div>
      */
  }

});

module.exports = LegendItem;
