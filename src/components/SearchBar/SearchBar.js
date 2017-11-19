/*
From https://github.com/vakhtang/react-search-bar/
License: MIT

Modified to support MaterializeCSS and other customizations

*/

import React from 'react';
import ReactDOM from 'react-dom';
import Suggestions from './Suggestions';
import Promise from 'bluebird';

var $ = require('jquery');

const KEY_CODES = {
  UP: 38,
  DOWN: 40,
  ENTER: 13
};

export default class SearchBar extends React.Component {
  displayName: 'SearchBar'

  props: {
    autoFocus: boolean,
    autosuggestDelay: number,
    inputName: string,
    placeholder: string,
    onReset: Function,
    onSubmit: Function,
    onChange: Function,
    id: string
  }

  static defaultProps = {
    autoFocus: false,
    autosuggestDelay: 250,
    inputName: 'query',
    style: {},
    id: 'search'
  }

  state = {
    value: '',
    suggestions: [],
    highlightedItem: -1
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
   /*eslint-enable react/no-find-dom-node */
  }

  componentWillUnmount () {
    document.body.removeEventListener('click', this.hideSuggestions);
  }

  handleClick = (e) => {
    e.nativeEvent.stopImmediatePropagation();
  }

  handleKeyDown = (e) => {
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

  displaySuggestions = (suggestions) => {
    this.setState({
      suggestions,
      highlightedItem: -1
    });
    /*eslint-disable react/no-find-dom-node */
    $(ReactDOM.findDOMNode(this.refs.suggestions)).show();
    /*eslint-enable react/no-find-dom-node */
  }

  hideSuggestions = () => {
    /*eslint-disable react/no-find-dom-node */
      $(ReactDOM.findDOMNode(this.refs.suggestions)).hide();
    /*eslint-enable react/no-find-dom-node */
  }

  fillInSuggestion = (suggestion) => {
    this.setState({value: suggestion.value});
    this.search(suggestion.value);
  }

  handleChange = (e) => {
    clearTimeout(this._timerId);
    let input = e.target.value;
    if (!input) return this.setState({
      value: '',
      suggestions: [],
      highlightedItem: -1
    });
    this.setState({value: input});

    this._timerId = setTimeout(() => {
      new Promise((resolve) => {
        this.props.onChange(input, resolve);
      }).then((suggestions) => {
        if (!this.state.value) return;
        this.displaySuggestions(suggestions);
      });
    }, this.props.autosuggestDelay);
  }

  submit = (e) => {
    e.preventDefault();
    if (!this.state.value) return;
    this.search(this.state.value.trim());
  }

  search = (value) => {
    clearTimeout(this._timerId);
    this.setState({
      suggestions: [],
      highlightedItem: -1
    });
    this.props.onSubmit(value);
  }

  reset = () => {
    clearTimeout(this._timerId);
    this.setState({
      value: {key: '', value: ''},
      suggestions: [],
      highlightedItem: -1
    });
    if(this.props.onReset) this.props.onReset();
  }

  render() {
    return (
      <div className="white no-margin"
      style={{
        borderRadius: '25px',
        border: '1px solid #212121',
        boxSizing: 'content-box',
        height: '2.2pc',
        lineHeight: '2.2pc' 
      }}
      >
     
      <form style={{boxSizing: 'content-box'}}>

        <div className="input-field no-margin" style={{position: 'relative'}}>
          <input id={this.props.id}
            className="truncate"
            type="search"
              style = {{
                margin: 0, 
                border: 'none',
                color: '#212121',                   
                height: '2.2pc',
                lineHeight: '2.2pc',
                fontSize: '1rem',
                background: 'transparent'
                }}
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

          <label htmlFor={this.props.id} 
            style={{
              height: 'inherit', 
              lineHeight: 'inherit',
              position: 'absolute', 
              top: '0px', left: '0px', 
              marginLeft: '5px',
              marginRight: '5px',
              transform: 'inherit'}}>
            <i className="material-icons" style={{height: 'inherit', lineHeight: 'inherit'}}>search</i>
          </label>
          <i className="material-icons" style={{height: 'inherit', lineHeight: 'inherit'}} onClick={this.reset}>close</i>
        </div>
      </form>

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