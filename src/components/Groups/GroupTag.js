//@flow
import React from 'react';
var urlUtil = require('../../services/url-util');
var $ = require('jquery');
var _isequal = require('lodash.isequal');
var classNames = require('classnames');
import MapHubsComponent from '../../components/MapHubsComponent';

export default class GroupTag extends MapHubsComponent {

  props: {
    group: string,
    size: number,
    chipWidth: number,
    fontSize: number,
    showTooltip: boolean,
    className: string
  }

  static defaultProps = {
    size: 20,
    chipWidth: 100,
    fontSize: 10,
    showTooltip: false
  }

  componentDidMount(){
    if(this.props.showTooltip){
      $('.group-tag-tooltip').tooltip();
    }

     $(this.refs.groupimg).error(function(){
        $(this).attr('src', '/assets/missing_group.png');
     });
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  }

  render(){
    var baseUrl = urlUtil.getBaseUrl();
    var sizeStr = this.props.size + 'px';
    var fontSizeStr = this.props.fontSize + 'px';
    var imgWidth = this.props.size.toString() + 'px';
    var chipWidth = this.props.chipWidth.toString()  + 'px';
    var className = classNames(['chip', 'truncate', this.props.className]);

    /*

    */
    return (
      <div className={className}
        style={{height: sizeStr, width: chipWidth,
          minWidth: '75px',
          marginBottom: '2px',
          border: '0.25pt solid #E4E4E4',
          lineHeight: sizeStr, fontSize: fontSizeStr}}>
        <a target="_blank" className="no-padding" rel="noopener noreferrer"  href={baseUrl + '/group/' + this.props.group} style={{height: 'initial'}}>
          <div className="valign-wrapper"
            style={{
              height: sizeStr,
              width: imgWidth,
              backgroundColor: 'white',
              marginRight: '0px',
              marginLeft: '-12px',
              float: 'left'
            }}>
            <img ref="groupimg" className="valign" src={baseUrl + '/group/' + this.props.group + '/thumbnail'}
              style={{
                height: sizeStr,
                width: 'auto',
                marginRight: 0,
                marginLeft: 0,
                borderRadius: 0
              }}
              alt={'Group Photo'} />
          </div>

        </a>
        <a target="_blank" rel="noopener noreferrer" className="omh-accent-text group-tag-tooltip no-padding"
          style={{height: sizeStr, width: 'auto', display: 'inherit', lineHeight: sizeStr, fontSize: fontSizeStr}}
          data-position="top" data-delay="50" data-tooltip={this.props.group}
          href={baseUrl + '/group/' + this.props.group}>{this.props.group}</a>
      </div>
    );
  }
}