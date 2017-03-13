var React = require('react');

var AnimationActions = require('../../actions/map/AnimationActions');
var Reflux = require('reflux');

var AnimationOverlay = React.createClass({

  mixins:[Reflux.listenTo(AnimationActions.tick, 'tick')],

  propTypes:  {
    style: React.PropTypes.object.isRequired
  },

  getDefaultProps() {
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
