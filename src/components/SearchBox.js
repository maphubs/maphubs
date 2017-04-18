// @flow
import React from 'react';
import PropTypes from 'prop-types';
var request = require('superagent');
var SearchBar = require('./SearchBar/SearchBar');
var debug = require('../services/debug')('SearchBox');



var SearchBox = React.createClass({

  propTypes: {
    label: PropTypes.string,
    suggestionUrl: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    onError: PropTypes.func,
    onReset: PropTypes.func,
    style: PropTypes.object,
    id: PropTypes.string
  },

  getDefaultProps() {
    return {
      label: 'Search',
      style: {},
      id: 'search'
    };
  },

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

 },
 onSubmit(input: string) {
   if (!input) return;
   this.props.onSearch(input);
 },


 render() {
   return (<div>
     <SearchBar
       ref="searchBox"
       id={this.props.id}
       style={this.props.style}
       placeholder={this.props.label}
       onChange={this.onChange}
       onSubmit={this.onSubmit}
       onReset={this.props.onReset} />
   </div>

   );
 }

});

module.exports = SearchBox;
