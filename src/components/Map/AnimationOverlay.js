//@flow
import React from 'react';
import AnimationActions from '../../actions/map/AnimationActions';
import Reflux from 'reflux';

type Props = {
  style: Object
}

type State = {
  val: string
}

export default class AnimationOverlay extends React.Component<Props, State> {

  props: Props

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