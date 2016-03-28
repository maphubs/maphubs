var React = require('react');
var config = require('../../clientconfig');
var urlUtil = require('../../services/url-util');
var $ = require('jquery');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');
var classNames = require('classnames');


var GroupTag = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    group: React.PropTypes.string.isRequired,
    size: React.PropTypes.number,
    fontSize: React.PropTypes.number,
    className: React.PropTypes.string
  },

  getDefaultProps(){
    return  {
      size: 20,
      fontSize: 10
    };
  },

  componentDidMount(){
     $('.group-tag-tooltip').tooltip();
  },

  render(){
    var baseUrl = urlUtil.getBaseUrl(config.host, config.port);
    var sizeStr = this.props.size + 'px';
    var fontSizeStr = this.props.fontSize + 'px';
    var imgWidth = Math.floor(this.props.size * 1.25).toString() + 'px'; //preserve 4:3 ratio of logo image
    var chipWidth = Math.floor(this.props.size * 5).toString() + 'px';
    var className = classNames(['chip', 'truncate', this.props.className]);
    return (
      <div className={className}
        style={{height: sizeStr, width: chipWidth,
          minWidth: '75px',
          border: '0.25pt solid #E4E4E4',
          lineHeight: sizeStr, fontSize: fontSizeStr}}>
        <a target="_blank" className="no-padding"  href={baseUrl + '/group/' + this.props.group} style={{height: 'initial'}}>
          <div className="valign-wrapper"
            style={{
              height: sizeStr,
              width: imgWidth,
              backgroundColor: 'white',
              marginRight: '5px',
              marginLeft: '-12px',
              float: 'left'
            }}>
            <img  className="valign" src={baseUrl + '/group/' + this.props.group + '/image'}
              style={{
                height: sizeStr,
                width: 'auto',
                marginRight: 0,
                marginLeft: 0,
                borderRadius: 0
              }}
              alt={this.__('Group Photo')} />
          </div>

        </a>
        <a target="_blank" className="omh-accent-text group-tag-tooltip no-padding"
          style={{height: sizeStr, width: 'auto', display: 'inherit', lineHeight: sizeStr, fontSize: fontSizeStr}}
          data-position="top" data-delay="50" data-tooltip={this.__('Group') + ' - ' +this.props.group}
          href={baseUrl + '/group/' + this.props.group}>{this.props.group}</a>
      </div>
    );
  }

});

module.exports = GroupTag;
