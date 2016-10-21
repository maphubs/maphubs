var React = require('react');
var Formsy = require('formsy-react');
var classNames = require('classnames');
var _isequal = require('lodash.isequal');

var TextInput= React.createClass({

  mixins: [Formsy.Mixin],

  propTypes: {
    value: React.PropTypes.string,
    length: React.PropTypes.number,
    successText: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    icon: React.PropTypes.string,
    className: React.PropTypes.string,
    dataTooltip: React.PropTypes.string,
    dataDelay: React.PropTypes.number,
    dataPosition: React.PropTypes.string,
    name: React.PropTypes.string,
    label: React.PropTypes.string,
    id: React.PropTypes.string,
    type: React.PropTypes.string,
    style: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      length: 100,
      successText: '',
      defaultValue: '',
      disabled: false,
      value: '',
      dataDelay: 100,
      type: 'text',
      style: {}
    };
  },

  getInitialState() {
    return {
      value: this.props.value,
      charCount: this.props.value ? this.props.value.length: 0
    };
  },

  componentWillReceiveProps(nextProps) {
    if(this.props.value != nextProps.value){
      var charCount = 0;
      if(nextProps.value) charCount = nextProps.value.length;
      this.setState({
        value: nextProps.value,
        charCount
      });
    }
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

  changeValue(event){
     event.stopPropagation();
     this.setValue(event.currentTarget.value);
     this.setState({
       value: event.currentTarget.value,
       charCount: event.currentTarget.value.length
     });
   },

  render() {
     var className = classNames('input-field', this.props.className, {tooltipped: this.props.dataTooltip ? true : false});
     var inputClassName = classNames(
       {
       required: this.showRequired(),
       valid: this.isValid(),
       invalid:  this.showError()
      }
   );

   var icon = '';
   if(this.props.icon){
      icon = (<i className="material-icons prefix">{this.props.icon}</i>);
   }
   var countColor = 'black';
   if(this.state.charCount > this.props.length) countColor = 'red';

   var labelClassName = '';
   if(this.state.value && this.state.value != ''){
     labelClassName = 'active';
   }

   var id = '';
   if(this.props.id){
     id = this.props.id;
   }else {
     id = this.props.name;
   }

    return (
      <div className={className} style={this.props.style} data-delay={this.props.dataDelay} data-position={this.props.dataPosition} data-tooltip={this.props.dataTooltip}>
          {icon}
          <input ref="input" id={id} type={this.props.type} className={inputClassName} length={this.props.length} value={this.state.value} disabled={this.props.disabled} onChange={this.changeValue}/>
          <label htmlFor={id} className={labelClassName} data-error={this.getErrorMessage()} data-success={this.props.successText}>{this.props.label}</label>
            <span className="character-counter"
                style={{float: 'right', fontSize: '12px', height: '1px', color: countColor}}>
              {this.state.charCount} / {this.props.length}
            </span>
      </div>
    );

  }
});

module.exports = TextInput;
