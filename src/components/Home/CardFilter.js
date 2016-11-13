var React = require('react');

var Reflux = require('reflux');
var StateMixin = require('reflux-state-mixin')(Reflux);
var LocaleStore = require('../../stores/LocaleStore');
var Locales = require('../../services/locales');

var CardFilter = React.createClass({

  mixins:[StateMixin.connect(LocaleStore)],

  __(text){
    return Locales.getLocaleString(this.state.locale, text);
  },

  propTypes: {
    defaultValue: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  },

  getDefaultProps(){
    return {
      defaultValue:'featured'
    };
  },

  getInitialState(){
    return {
      value: this.props.defaultValue
    };
  },

  onFeatured(){
    this.setState({value: 'featured'});
    this.props.onChange('featured');
  },

  onPopular(){
    this.setState({value: 'popular'});
    this.props.onChange('popular');
  },

  onRecent(){
    this.setState({value: 'recent'});
    this.props.onChange('recent');
  },

  render(){
    var activeClass = 'omh-accent-text';
    var featuredClass = '', popularClass= '', recentClass = '';
    if(this.state.value === 'featured'){
      featuredClass = activeClass;
    }else if(this.state.value === 'popular'){
      popularClass = activeClass;
    }else if(this.state.value === 'recent'){
      recentClass = activeClass;
    }
    return (
      <div className="valign right-align" style={{width: '100%'}}>
        <span className={featuredClass} onClick={this.onFeatured} style={{cursor: 'pointer'}}>{this.__('Featured')}</span> |&nbsp;
        <span className={popularClass} onClick={this.onPopular} style={{cursor: 'pointer'}}>{this.__('Popular')}</span> |&nbsp;
        <span className={recentClass} onClick={this.onRecent} style={{cursor: 'pointer'}}>{this.__('Recent')}</span>
      </div>
    );
  }

});

module.exports = CardFilter;
