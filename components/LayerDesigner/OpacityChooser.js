var React = require('react');


var OpacityChooser = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.number
  },

  getDefaultProps(){
    return {
      value: 100
    }
  },

  getInitialState(){
    return {
      opacity: this.props.value
    }
  },

  onChange(e){
    var opacity = e.target.valueAsNumber;
    this.setState({opacity});
    this.props.onChange(opacity);
  },


  render(){
    return (
      <div>
        <div className="row">
          <form action="#">
           <p className="range-field">
             <input type="range" id="opacity" min="0" max="100" value={this.state.opacity} onChange={this.onChange}/>
           </p>
         </form>
        </div>
        <div className="row valign-wrapper">
         <h5 className="valign" style={{margin: 'auto'}}>
           {this.state.opacity}%
         </h5>
       </div>
      </div>
    );
  }
});

module.exports = OpacityChooser;
