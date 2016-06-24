var React = require('react');
var ReactDOM = require('react-dom');
var Formsy = require('formsy-react');
var $ = require('jquery');
var find = require('lodash.find');
var result = require('lodash.result');
var classNames = require('classnames');
var _isequal = require('lodash.isequal');

var Select = React.createClass({

  mixins: [Formsy.Mixin],

  propTypes:  {
    startEmpty: React.PropTypes.bool,
    emptyText: React.PropTypes.string,
    defaultValue: React.PropTypes.string,
    name: React.PropTypes.string,
    className: React.PropTypes.string,
    options: React.PropTypes.array,
    dataTooltip: React.PropTypes.string,
    dataDelay: React.PropTypes.number,
    dataPosition: React.PropTypes.string,
    label: React.PropTypes.string,
    successText: React.PropTypes.string,
    id: React.PropTypes.string,
    note: React.PropTypes.string //optional note that displays below the select, will be updated on selection if option contains a note
  },

  getDefaultProps() {
    return {
      startEmpty: true,
      emptyText: 'Choose an Option',
      name: 'select-box',
      id: 'select-box',
      options: [],
      dataDelay: 100
    };
  },

  getInitialState(){
    return {
      note: this.props.note
    };
  },

  setNote(val){
    var note = result(find(this.props.options, {'value': val}), 'note');
    if(note){
      this.setState({note});
    }
  },

  handleSelectChange(event) {
     var val = event.target.value;
     this.setValue(val);
     this.setNote(val);

   },

   componentWillMount() {
    if(!this.props.startEmpty) {
      this.setValue(this.props.defaultValue);
      this.setNote(this.props.defaultValue);
    }
  },

  componentWillReceiveProps(nextProps){
    if(!nextProps.startEmpty && this.props.defaultValue != nextProps.defaultValue) {
      this.setValue(nextProps.defaultValue);
      this.setNote(nextProps.defaultValue);
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

   componentDidUpdate(prevProps) {
     //reload the select if remove the empty option
     if(prevProps.startEmpty !== this.props.startEmpty){
       $(ReactDOM.findDOMNode(this.refs.selectBox)).material_select();
     }

   },

   componentDidMount() {
     $(ReactDOM.findDOMNode(this.refs.selectBox)).material_select();
     $(ReactDOM.findDOMNode(this.refs.selectBox)).on('change',this.handleSelectChange);
   },

   validate() {
     if(this.isRequired()){
       if(this.getValue() && this.getValue() !== 'none'){
         return true;
       }else{
         return false;
       }
     }else{
       return true;
     }

  },

  render() {
     var className = classNames('input-field', this.props.className, {tooltipped: this.props.dataTooltip ? true : false});
     var value = this.getValue();

     var emptyOption = '';
     if(this.props.startEmpty){
      emptyOption = (<option key="empty" disabled="">{this.props.emptyText}</option>);
     }
     var note = '';
     if(this.state.note){
       /*eslint-disable react/no-danger*/
       note = (<div dangerouslySetInnerHTML={{__html: this.state.note}}></div>);
       /*eslint-enable react/no-danger*/
     }

    return (
      <div>
          <div  className={className} data-delay={this.props.dataDelay} data-position={this.props.dataPosition}
              data-tooltip={this.props.dataTooltip}>
                <select ref="selectBox" id={this.props.id} value={value} defaultValue={value} onChange={function(e){e.stopPropagation();}}>
                  {emptyOption}
                  {this.props.options.map(function(option){
                    return (<option key={option.value} value={option.value}>{option.label}</option>);
                  })}
                </select>
                <label htmlFor={this.props.name}  data-error={this.getErrorMessage()} data-success={this.props.successText}>{this.props.label}</label>
            </div>
            {note}
        </div>
    );

  }
});

module.exports = Select;
