// @flow
import React from 'react';
var request = require('superagent');
import SearchBar from './SearchBar/SearchBar';
var debug = require('../services/debug')('SearchBox');

export default class SearchBox extends React.Component {

  props: {
    label: string,
    suggestionUrl: string,
    onSearch: Function,
    onError: Function,
    onReset: Function,
    style: Object,
    id: string
  }

  static defaultProps: {
    label: 'Search',
    style: {},
    id: 'search'
  }

  onChange(input: string, resolve: Function) {
    var _this = this;
    if (typeof window !== 'undefined' && this.props.suggestionUrl) {
      request.get(this.props.suggestionUrl + '?q=' + input)
      .type('json').accept('json')
      .end(function(err, res){
        if (err) {
          debug(err);
          if(_this.props.onError) _this.props.onError(JSON.stringify(err));
        }else{
          if(res.body.suggestions){
            resolve(res.body.suggestions);
          }else{
            debug(JSON.stringify(res.body));
            if(_this.props.onError) _this.props.onError(JSON.stringify(res.body));
          }
        }
      });
    }
 }

 onSubmit(input: string) {
   if (!input) return;
   this.props.onSearch(input);
 }


 render() {
   return (<div>
     <SearchBar
       ref="searchBox"
       id={this.props.id}
       style={this.props.style}
       placeholder={this.props.label}
       onChange={this.onChange.bind(this)}
       onSubmit={this.onSubmit.bind(this)}
       onReset={this.props.onReset.bind(this)} />
   </div>

   );
 }
}