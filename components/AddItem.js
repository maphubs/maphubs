var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

var MessageActions = require('../actions/MessageActions');
import Suggestions from './SearchBar/Suggestions';

const KEY_CODES = {
  UP: 38,
  DOWN: 40,
  ENTER: 13
};



var AddItem = React.createClass({


  getDefaultProps() {
    return {
      id: 'additem',
      autoFocus: false,
      autosuggestDelay: 250,
      inputName: 'query',
      placeholder: 'Add',
      addButtonLabel: 'Add',
      optionLabel: null
    }
  },

  propTypes: {
    id: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    suggestionUrl: React.PropTypes.string,
    onAdd: React.PropTypes.func.isRequired,
    autosuggestDelay: React.PropTypes.number,
    autoFocus: React.PropTypes.bool,
    inputName: React.PropTypes.string,
    optionLabel: React.PropTypes.string,
    addButtonLabel: React.PropTypes.string
  },

  getInitialState() {
    return {
      value: '',
      suggestions: [],
      highlightedItem: -1,
      option: false
    }
  },



  updateSuggestions(input, resolve) {
    if (typeof window !== 'undefined' && this.props.suggestionUrl) {
        $.ajax({
         url: this.props.suggestionUrl + '?q=' + input,
         contentType : 'application/json;charset=UTF-8',
         dataType: 'json',
          async: true,
          success(msg){
            if(msg.suggestions){
              resolve(msg.suggestions);
            }
          },
          error(msg){
            MessageActions.showMessage({title: 'Error', message: msg});
          },
          complete(){
          }
      });
    }

 },


 handleAddWithOptionChecked(e){
   this.setState({option: e.target.checked});
 },


 componentDidMount() {
   if (this.props.autoFocus) {
     ReactDOM.findDOMNode(this.refs.value).focus();
   }
   $(ReactDOM.findDOMNode(this.refs.suggestions)).dropdown({
    inDuration: 300,
    outDuration: 225,
    constrain_width: true, // Does not change width of dropdown to that of the activator
    hover: false, // Activate on hover
    gutter: 0, // Spacing from edge
    belowOrigin: true // Displays dropdown below the button
  });
  $(document.body).on("click", this.hideSuggestions);

 },
 componentWillUnmount () {
   document.body.removeEventListener('click', this.hideSuggestions);
 },
 handleClick(e){
   e.nativeEvent.stopImmediatePropagation();
 },
 handleKeyDown(e) {
   if(e.which == KEY_CODES.ENTER ){
     e.preventDefault();
     this.submit(e);
   }
   if (e.which != KEY_CODES.UP && e.which != KEY_CODES.DOWN) return;
   e.preventDefault();
   let highlightedItem = this.state.highlightedItem;

   if (e.which == KEY_CODES.UP) {
     if (highlightedItem <= 0) return;
     --highlightedItem;
   }
   if (e.which == KEY_CODES.DOWN) {
     if (highlightedItem == this.state.suggestions.length - 1) return;
     ++highlightedItem;
   }

   this.setState({
     highlightedItem,
     value: this.state.suggestions[highlightedItem]
   });
 },
 displaySuggestions(suggestions) {
   this.setState({
     suggestions,
     highlightedItem: -1
   });
   $(ReactDOM.findDOMNode(this.refs.suggestions)).show();
 },
 hideSuggestions(){
     $(ReactDOM.findDOMNode(this.refs.suggestions)).hide();
 },

 fillInSuggestion(suggestion) {
   this.setState({value: suggestion});
 },

 handleChange(e) {
   clearTimeout(this._timerId);
   let input = e.target.value;
   if (!input) return this.setState(this.getInitialState());
   this.setState({value: {key: input, value:input}});

   this._timerId = setTimeout(() => {
     new Promise((resolve) => {
       this.updateSuggestions(input, resolve);
     }).then((suggestions) => {
       if (!this.state.value) return;
       this.displaySuggestions(suggestions);
     });
   }, this.props.autosuggestDelay);
 },
 submit(e) {
   e.preventDefault();
   if (!this.state.value) return;
   this.props.onAdd({value: this.state.value, option: this.state.option});
   //reset form
   this.setState(this.getInitialState());
 },

 render() {

   return (
     <div>
       <nav className="omh-search-bar white">
      <div className="nav-wrapper omh-search-bar-wrapper no-margin row">

          <form>
            <div className="input-field">
              <input id={this.props.id} className="omh-search"
                type="search"
                  style = {{margin: 0}}
                  name={this.props.inputName}
                  maxLength="100"
                  autoComplete="off"
                  ref="value"
                  value={this.state.value.value}
                  placeholder={this.props.placeholder}
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  onClick={this.handleClick}
                  data-beloworigin="true"
                  data-activates={this.refs.suggestions}
                required />

              <label htmlFor={this.props.id}><i className="material-icons omh-search-icon">search</i></label>
            </div>


            <div className="input-field">
              <input type="checkbox" id={this.props.id + '-add-option'} value={this.state.option} onChange={this.handleAddWithOptionChecked}/>
              <label htmlFor={this.props.id + '-add-option'}>{this.props.optionLabel}</label>
            </div>
            <a className="btn waves-effect waves-light right" onClick={this.submit}>{this.props.addButtonLabel}</a>
          </form>


      </div>
      </nav>
      <div className="row no-margin">
        {!!this.state.suggestions.length &&
          <Suggestions
            ref="suggestions"
            suggestions={this.state.suggestions}
            highlightedItem={this.state.highlightedItem}
            onSelection={this.fillInSuggestion} />}
      </div>

      </div>
   );
 }

});

module.exports = AddItem;
