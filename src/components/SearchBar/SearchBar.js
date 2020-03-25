// @flow

import React from 'react'
import { Row, Input } from 'antd'
import Suggestions from './Suggestions'
import Promise from 'bluebird'

const { Search } = Input

type Suggestion = {key: string, value: string}

type Props = {
  autosuggestDelay: number,
  placeholder: string,
  onReset: Function,
  onSubmit: Function,
  onChange: Function
}

type State = {
  value: string,
  suggestions: Array<Suggestion>
}

export default class SearchBar extends React.Component<Props, State> {
  static defaultProps = {
    autosuggestDelay: 250
  }

  state = {
    value: '',
    suggestions: []
  }

  suggestions: any
  _timerId: any

  componentDidMount () {
    document.body.addEventListener('click', this.hideSuggestions)
  }

  componentWillUnmount () {
    document.body.removeEventListener('click', this.hideSuggestions)
  }

  displaySuggestions = (suggestions: Array<Suggestion>) => {
    this.setState({
      suggestions
    })
  }

  hideSuggestions = (e: any) => {
    console.log(e)
    if (e?.target?.parentElement?.classList.contains('dropdown-content-item')) return
    this.setState({suggestions: []})
  }

  fillInSuggestion = (suggestion: Suggestion) => {
    this.search(suggestion.value)
  }

  handleChange = (e: any) => {
    clearTimeout(this._timerId)
    const input = e.target.value

    this.setState({value: input})

    if (input) {
      this._timerId = setTimeout(() => {
        new Promise((resolve) => {
          this.props.onChange(input, resolve)
        }).then((suggestions) => {
          if (!this.state.value) return
          this.displaySuggestions(suggestions)
        })
      }, this.props.autosuggestDelay)
    } else {
      this.reset()
    }
  }

  search = (value: string) => {
    if (this.state.value && typeof this.state.value === 'string') {
      clearTimeout(this._timerId)
      this.props.onSubmit(value)
      this.setState({suggestions: []})
    } else {
      this.reset()
    }
  }

  reset = () => {
    clearTimeout(this._timerId)
    this.setState({
      value: '',
      suggestions: []
    })
    if (this.props.onReset) this.props.onReset()
  }

  render () {
    const { placeholder } = this.props
    const { suggestions, value } = this.state
    return (
      <>
        <Row>
          <Search
            placeholder={placeholder}
            onSearch={this.search}
            enterButton size='large'
            onPressEnter={(e) => {
              this.search(e.target.value)
            }}
            onChange={this.handleChange}
            allowClear
            value={value}
          />
        </Row>
        <Row>
          {suggestions?.length > 0 &&
            <Suggestions
              suggestions={suggestions}
              onSelection={this.fillInSuggestion}
            />}
        </Row>
      </>
    )
  }
}
