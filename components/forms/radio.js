var React = require('react');
var Formsy = require('formsy-react');
var classNames = require('classnames');

var Radio= React.createClass({

  mixins: [Formsy.Mixin],

  propTypes: {
    className: React.PropTypes.string,
    dataTooltip: React.PropTypes.string,
    dataDelay: React.PropTypes.number,
    dataPosition: React.PropTypes.string,
    defaultValue: React.PropTypes.string,
    label: React.PropTypes.string,
    name: React.PropTypes.string,
    onChange: React.PropTypes.func,
    options: React.PropTypes.array
  },

  getDefaultProps() {
    return {
      options: {},
      defaultValue: undefined,
      dataDelay: 100
    };
  },

  changeValue(event) {
     this.setValue(event.target.id);
     if(this.props.onChange){
       this.props.onChange(event.target.id);
     }
   },

   componentWillMount() {
     this.setValue(this.props.defaultValue);
   },

  render() {
     var className = classNames(this.props.className, {tooltipped: this.props.dataTooltip ? true : false});
     var value = this.getValue();
     var name = this.props.name;
     var _this = this;

    return (
          <div className={className} data-delay={this.props.dataDelay} data-position={this.props.dataPosition}
              data-tooltip={this.props.dataTooltip}>

            <label>{this.props.label}</label>
              {this.props.options.map(function(option){
                var checked = false;
                if(option.value == value){
                  checked = true;
                }
                return (<p key={option.value}>
                  <input  name={name} type="radio" id={option.value} onChange={_this.changeValue} checked={checked}/>
                  <label htmlFor={option.value}>{option.label}</label>
                </p>);
              })}
            </div>
    );

  }
});



module.exports = Radio;
