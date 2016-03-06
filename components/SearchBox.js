var React = require('react');
var request = require('superagent');
var SearchBar = require('./SearchBar/SearchBar');
var debug = require('../services/debug')('SearchBox');



var SearchBox = React.createClass({

  propTypes: {
    label: React.PropTypes.string,
    suggestionUrl: React.PropTypes.string,
    onSearch: React.PropTypes.func.isRequired,
    onError: React.PropTypes.func,
    onReset: React.PropTypes.func,
    style: React.PropTypes.object,
    id: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      label: 'Search',
      style: {},
      id: 'search'
    }
  },

  onChange(input, resolve) {
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
 onSubmit(input) {
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
