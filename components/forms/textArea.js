var React = require('react');
var Formsy = require('formsy-react');
var classNames = require('classnames');
var $ = require('jquery');

var TextArea = React.createClass({

  mixins: [Formsy.Mixin],

  propTypes: {
    length: React.PropTypes.number,
    value: React.PropTypes.string,
    icon: React.PropTypes.string,
    className: React.PropTypes.string,
    dataTooltip: React.PropTypes.string,
    dataDelay: React.PropTypes.number,
    dataPosition: React.PropTypes.string,
    name: React.PropTypes.string,
    label: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      length: 0,
      value: '',
      dataDelay: 100
    };
  },

  getInitialState() {
    return {
      value: this.props.value,
      charCount: this.props.value ? this.props.value.length: 0
    };
  },

  componentDidMount(){
    if(this.props.dataTooltip){
      $(this.refs.inputWrapper).tooltip();
    }
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

  changeValue(event) {
    event.stopPropagation();
     this.setValue(event.currentTarget.value);
     this.setState({
       value: event.currentTarget.value,
       charCount: event.currentTarget.value.length
     });
   },

  render() {
     var className = classNames('input-field', this.props.className);
     var textAreaClassName = classNames(
       'materialize-textarea',
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

    return (
      <div ref="inputWrapper" className={className} data-delay={this.props.dataDelay} data-position={this.props.dataPosition} data-tooltip={this.props.dataTooltip}>
        {icon}
        <textarea ref="textarea" id={this.props.name} className={textAreaClassName} value={this.state.value} onChange={this.changeValue}/>
        <label htmlFor={this.props.name}  className={labelClassName} data-error={this.getErrorMessage()} data-success="">{this.props.label}</label>
        <span className="character-counter"
            style={{float: 'right', fontSize: '12px', height: '1px', color: countColor}}>
          {this.state.charCount} / {this.props.length}
        </span>
      </div>
    );

  }
});

module.exports = TextArea;
