import React from 'react';
import PropTypes from 'prop-types';

var AnimationActions = require('../../actions/map/AnimationActions');
import Reflux from 'reflux';

var AnimationOverlay = React.createClass({

  mixins:[Reflux.listenTo(AnimationActions.tick, 'tick')],

  propTypes:  {
    style: PropTypes.object.isRequired
  },

  static defaultProps: {
    return {
     
    };
  },

  getInitialState(){
    return {
      val: ''
    };
  },

  tick(val){
    this.setState({val});
  },

  render(){
    
    return (
      <div style={this.props.style}>
        <p>{this.state.val}</p>
      </div>
    );
  }

});

module.exports = AnimationOverlay;
