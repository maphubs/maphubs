var React = require('react');
var _isequal = require('lodash.isequal');

var HubEditButton = React.createClass({

  propTypes: {
    editing: React.PropTypes.bool.isRequired,
    startEditing: React.PropTypes.func.isRequired,
    stopEditing: React.PropTypes.func.isRequired,
    style: React.PropTypes.object
  },

  getDefaultProps(){
    return {
      style: {}
    };
  },

  shouldComponentUpdate(nextProps, nextState){
    //only update if something changes
    if(!_isequal(this.props, nextProps)){
      return true;
    }
    if(!_isequal(this.state, nextState)){
      return true;
    }
    return false;
  },

  render(){var button = '';
  if(this.props.editing){
    button = (
        <a onClick={this.props.stopEditing} className="btn-floating btn-large omh-accent-text">
          <i className="large material-icons">save</i>
        </a>
    );
  }else {
    button = (
        <a onClick={this.props.startEditing} className="btn-floating btn-large omh-accent-text">
          <i className="large material-icons">mode_edit</i>
        </a>
    );
  }
    return (
      <div style={this.props.style} className="fixed-action-btn action-button-bottom-right">
      {button}
      </div>
    );
  }
});

module.exports = HubEditButton;
