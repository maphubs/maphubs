//@flow
import React from 'react';
import ReactDOM from 'react-dom';

var $ = require('jquery');
import Promise from 'bluebird';
import Formsy from 'formsy-react';
import Toggle from './forms/toggle';
import MessageActions from '../actions/MessageActions';
import Suggestions from './SearchBar/Suggestions';

const KEY_CODES = {
  UP: 38,
  DOWN: 40,
  ENTER: 13
};

import MapHubsComponent from './MapHubsComponent';
import LocaleStore from '../stores/LocaleStore';

export default class AddItem extends MapHubsComponent {

  props:{
    id: string,
    placeholder: string,
    suggestionUrl: string,
    onAdd: Function,
    autosuggestDelay: number,
    autoFocus: boolean,
    inputName: string,
    optionLabel: string,
    addButtonLabel: string
  }

  static defaultProps = {
    id: 'additem',
    autoFocus: false,
    autosuggestDelay: 250,
    inputName: 'query',
    placeholder: 'Add',
    addButtonLabel: 'Add',
    optionLabel: null
  }

  constructor(props: Object){
		super(props);
		this.stores = [LocaleStore];
    this.state = {
      value: '',
      suggestions: [],
      highlightedItem: -1,
      option: false
    };
	}

 componentDidMount() {
   /*eslint-disable react/no-find-dom-node */
   if (this.props.autoFocus) {  
     ReactDOM.findDOMNode(this.refs.value).focus();
   }
   
   $(ReactDOM.findDOMNode(this.refs.suggestions)).dropdown({
    inDuration: 300,
    outDuration: 225,
    constrainWidth: true, // Does not change width of dropdown to that of the activator
    hover: false, // Activate on hover
    gutter: 0, // Spacing from edge
    belowOrigin: true // Displays dropdown below the button
  });
  $(document.body).on("click", this.hideSuggestions);
  /*eslint-enable react/no-find-dom-node*/
 }

 componentWillUnmount () {
   document.body.removeEventListener('click', this.hideSuggestions);
 }

 updateSuggestions = (input: string, resolve: Function) => {
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
 }

 handleAddWithOptionChecked = (option: any) =>{
   this.setState({option});
 }

 handleClick = (e: any) => {
   e.nativeEvent.stopImmediatePropagation();
 }

 handleKeyDown = (e: any) => {
   if(e.which === KEY_CODES.ENTER ){
     e.preventDefault();
     this.submit(e);
   }
   if (e.which !== KEY_CODES.UP && e.which !== KEY_CODES.DOWN) return;
   e.preventDefault();
   let highlightedItem = this.state.highlightedItem;

   if (e.which === KEY_CODES.UP) {
     if (highlightedItem <= 0) return;
     --highlightedItem;
   }
   if (e.which === KEY_CODES.DOWN) {
     if (highlightedItem === this.state.suggestions.length - 1) return;
     ++highlightedItem;
   }

   this.setState({
     highlightedItem,
     value: this.state.suggestions[highlightedItem]
   });
 }

 displaySuggestions = (suggestions: any) => {
   this.setState({
     suggestions,
     highlightedItem: -1
   });
   //findDOMNode needed here, possible due to the way suggestions are added dynamicallly below
   /*eslint-disable react/no-find-dom-node */
   $(ReactDOM.findDOMNode(this.refs.suggestions)).show();
    /*eslint-enable react/no-find-dom-node  */
 }

 hideSuggestions = () => {
   /*eslint-disable react/no-find-dom-node */
     $(ReactDOM.findDOMNode(this.refs.suggestions)).hide();
      /*eslint-enable react/no-find-dom-node */
 }

 fillInSuggestion = (suggestion: string) => {
   this.setState({value: suggestion});
 }

 handleChange = (e: any) => {
   clearTimeout(this._timerId);
   let input = e.target.value;
   if (!input) return this.setState({ 
      value: '',
      suggestions: [],
      highlightedItem: -1,
      option: false});
   this.setState({value: {key: input, value:input}});

   this._timerId = setTimeout(() => {
     new Promise((resolve) => {
       this.updateSuggestions(input, resolve);
     }).then((suggestions) => {
       if (!this.state.value) return;
       this.displaySuggestions(suggestions);
     });
   }, this.props.autosuggestDelay);
 }

 submit = (e: any) => {
   e.preventDefault();
   if (!this.state.value) return;
   this.props.onAdd({value: this.state.value, option: this.state.option});
   //reset form
   this.setState({ value: '',
      suggestions: [],
      highlightedItem: -1,
      option: false
    });
 }

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
          </form>
            <Formsy.Form >
              <Toggle name="admin" onChange={this.handleAddWithOptionChecked} labelOff={this.__('Member')} labelOn={this.__('Administrator')} checked={this.state.option}
                dataPosition="top" dataTooltip={this.props.optionLabel}
                />
            </Formsy.Form>

            <a className="btn waves-effect waves-light right" onClick={this.submit}>{this.props.addButtonLabel}</a>



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
}
