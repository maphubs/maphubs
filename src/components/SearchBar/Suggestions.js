/*
From https://github.com/vakhtang/react-search-bar/
License: MIT

Modified to support MaterializeCSS and other customizations

*/

import React from 'react';
import classNames from 'classnames';

export default class Suggestions extends React.Component {
  displayName: 'Suggestions'

  props: {
    suggestions: Array<string>,
    highlightedItem: number,
    onSelection: Function
  }

  static defaultProps = {
      suggestions: [],
      highlightedItem: -1
    }
  
  render() {
    const suggestions = this.props.suggestions.map((match, index) =>
      <li
        className={classNames({
          highlighted: this.props.highlightedItem === index
        })}
        key={match.key}
        onClick={this.props.onSelection.bind(null, match)}>
        <a href="#!">{match.value}</a>
      </li>
    );
    return <ul className="search-bar-suggestions dropdown-content" style={{opacity: 1}}>{suggestions}</ul>;
  }
}