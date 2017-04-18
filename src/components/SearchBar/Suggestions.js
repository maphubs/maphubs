/*
From https://github.com/vakhtang/react-search-bar/
License: MIT

Modified to support MaterializeCSS and other customizations

*/

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default React.createClass({
  displayName: 'Suggestions',
  getDefaultProps() {
    return {
      suggestions: [],
      highlightedItem: -1
    }
  },
  propTypes: {
    suggestions: PropTypes.array,
    highlightedItem: PropTypes.number
  },
  render() {
    let suggestions = this.props.suggestions.map((match, index) =>
      <li
        className={classNames({
          highlighted: this.props.highlightedItem == index
        })}
        key={match.key}
        onClick={this.props.onSelection.bind(null, match)}>
        <a href="#!">{match.value}</a>
      </li>
    );
    return <ul className="search-bar-suggestions omh-search-bar-suggestions dropdown-content">{suggestions}</ul>;
  }
});
