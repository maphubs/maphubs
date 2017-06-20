//@flow
import React from 'react';
import AnimationActions from '../../actions/map/AnimationActions';
import Reflux from 'reflux';

export default class AnimationOverlay extends React.Component {

  props:  {
    style: Object
  }

  state = {
    val: ''
  }

  componentDidMount(){
    Reflux.listenTo(AnimationActions.tick, 'tick');
  }

  

  tick = (val: any) => {
    this.setState({val});
  }

  render(){  
    return (
      <div style={this.props.style}>
        <p>{this.state.val}</p>
      </div>
    );
  }
}