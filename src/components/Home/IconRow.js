import React from 'react';
import PropTypes from 'prop-types';

var IconRow = React.createClass({

propTypes: {
  icon: PropTypes.string,
  iconFontSize: PropTypes.string,
  children: PropTypes.any
},

getDefaultProps() {
  return {
    icon: 'info',
    iconFontSize: '80px'
  };
},

render(){


  return (
    <div>
      <div className="row valign-wrapper hide-on-small-only">
        <div className="col s12 m2 center-align valign">
          <i className="material-icons omh-accent-text center-align" style={{fontSize: this.props.iconFontSize, margin: 'auto'}}>{this.props.icon}</i>
        </div>
        <div className="col s12 m10 valign">
          {this.props.children}
        </div>
      </div>
      <div className="row hide-on-med-and-up">
        <div className="col s12 center-align">
          <i className="material-icons omh-accent-text center-align" style={{fontSize: this.props.iconFontSize, margin: 'auto'}}>{this.props.icon}</i>
        </div>
        <div className="col s12">
          {this.props.children}
        </div>
      </div>
    </div>
  );
}

});

module.exports = IconRow;
