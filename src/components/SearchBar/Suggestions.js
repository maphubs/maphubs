// @flow
/*
From https://github.com/vakhtang/react-search-bar/
License: MIT

Modified to support MaterializeCSS and other customizations

*/

import React from 'react'
import classNames from 'classnames'

type Props = {
  suggestions: Array<string>,
  highlightedItem: number,
  onSelection: Function
}

type State = {
  show: boolean
}

export default class Suggestions extends React.Component<Props, State> {
  displayName: 'Suggestions'

  static defaultProps = {
    suggestions: [],
    highlightedItem: -1
  }

  constructor (props:Props) {
    super(props)
    this.state = {
      show: false
    }
  }

  show = () => {
    this.setState({show: true})
  }

  hide = () => {
    this.setState({show: false})
  }

  render () {
    const {show} = this.state
    const suggestions = this.props.suggestions.map((match, index) =>
      <li
        className={classNames({
          highlighted: this.props.highlightedItem === index
        })}
        key={match.key}
        onClick={this.props.onSelection.bind(null, match)}
      >
        <a href='#!'>{match.value}</a>
      </li>
    )
    return <ul
      className='dropdown-content'
      style={{
        opacity: 1,
        display: show ? 'inherit' : 'none',
        position: 'relative',
        maxHeight: 'calc(100vh - 200px)'
      }}
    >
      {suggestions}
    </ul>
  }
}
