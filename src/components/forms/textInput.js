var React = require('react');
var Formsy = require('formsy-react');
var classNames = require('classnames');
var $ = require('jquery');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var TextInput= React.createClass({

  mixins: [PureRenderMixin, Formsy.Mixin],

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
    placeholder: React.PropTypes.string,
    id: React.PropTypes.string,
    type: React.PropTypes.string,
    style: React.PropTypes.object,
    showCharCount: React.PropTypes.bool,
    useMaterialize: React.PropTypes.bool,
    onClick: React.PropTypes.func
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
      style: {},
      showCharCount: true,
      useMaterialize: true,
      onClick(){}
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

  componentDidMount(){
    if(this.props.dataTooltip){
      $(this.refs.inputWrapper).tooltip();
    }
  },

  componentDidUpdate(prevProps){
    if(!prevProps.dataTooltip && this.props.dataTooltip){
      $(this.refs.inputWrapper).tooltip();
    }
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
    var className, inputClassName = '';
    if(this.props.useMaterialize){
      className = classNames('input-field', this.props.className);
      inputClassName = classNames(
        {
        required: this.showRequired(),
        valid: this.isValid(),
        invalid:  this.showError()
       }
    );
    }else{
      className = classNames(this.props.className);
    }



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
   var charCount = '';
   if(this.props.showCharCount){
     charCount = (
       <span className="character-counter"
           style={{float: 'right', fontSize: '12px', height: '1px', color: countColor}}>
         {this.state.charCount} / {this.props.length}
       </span>
     );
   }

    return (
      <div ref="inputWrapper" className={className} style={this.props.style} data-delay={this.props.dataDelay} data-position={this.props.dataPosition} data-tooltip={this.props.dataTooltip}>
          {icon}
          <input ref="input" id={id} type={this.props.type} className={inputClassName} placeholder={this.props.placeholder} value={this.state.value}
            disabled={this.props.disabled}
            onClick={this.props.onClick}
            onChange={this.changeValue}/>
          <label htmlFor={id} className={labelClassName} data-error={this.getErrorMessage()} data-success={this.props.successText}>{this.props.label}</label>
            {charCount}
      </div>
    );

  }
});

module.exports = TextInput;
