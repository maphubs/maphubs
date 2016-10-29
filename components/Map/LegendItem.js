var React = require('react');
var urlUtil = require('../../services/url-util');
var GroupTag = require('../Groups/GroupTag');

var LegendItem = React.createClass({
  propTypes:  {
    layer: React.PropTypes.object.isRequired,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      style: {}
    };
  },

  render(){

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

    /*eslint-disable react/no-danger*/
    return (
          <li key={this.props.layer.layer_id} style={this.props.style} className="collection-item row">
            <div className="row no-margin valign-wrapper" style={{padding: '2px'}}>
              <div className="col s6 no-margin no-padding valign">
                <div className="no-margin no-padding valign" dangerouslySetInnerHTML={{__html: legendHtml}}></div>
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
