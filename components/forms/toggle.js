var React = require('react');
var Formsy = require('formsy-react');
var classNames = require('classnames');

var Toggle= React.createClass({

  mixins: [Formsy.Mixin],


  propTypes:  {
    className: React.PropTypes.string,
    dataTooltip: React.PropTypes.string,
    dataDelay: React.PropTypes.number,
    dataPosition: React.PropTypes.string,
    defaultChecked: React.PropTypes.bool,
    labelOn: React.PropTypes.string.isRequired,
    labelOff: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    style: React.PropTypes.object
  },


  getDefaultProps() {
    return {
      style: {},
      dataDelay: 100
    };
  },


  changeValue(event) {
     this.setValue(event.currentTarget.checked);
   },

   componentWillMount() {
     this.setValue(this.props.defaultChecked ? this.props.defaultChecked : false);
   },

  render() {
     var className = classNames('switch', this.props.className, {tooltipped: this.props.dataTooltip ? true : false});

     var defaultChecked = this.props.defaultChecked ? this.props.defaultChecked : false;

    return (
          <div className={className} data-delay={this.props.dataDelay} data-position={this.props.dataPosition}
              style={this.props.style}
              data-tooltip={this.props.dataTooltip}>
            <label>
              {this.props.labelOff}
              <input type="checkbox" id={this.props.name} checked={this.getValue()} defaultChecked={defaultChecked} onChange={this.changeValue}/>
              <span className="lever"></span>
              {this.props.labelOn}
            </label>
          </div>
    );

  }
});

module.exports = Toggle;
