import React from 'react'
import { Row, Input } from 'antd'
import Suggestions from './Suggestions'
import Promise from 'bluebird'
const { Search } = Input
type Suggestion = {
  key: string
  value: string
}
type Props = {
  autosuggestDelay: number
  placeholder: string
  onReset: (...args: Array<any>) => any
  onSubmit: (...args: Array<any>) => any
  onChange: (...args: Array<any>) => any
}
type State = {
  value: string
  suggestions: Array<Suggestion>
}
export default class SearchBar extends React.Component<Props, State> {
  static defaultProps: {
    autosuggestDelay: number
  } = {
    autosuggestDelay: 250
  }
  state: State = {
    value: '',
    suggestions: []
  }
  suggestions: any
  _timerId: any

  componentDidMount() {
    document.body.addEventListener('click', this.hideSuggestions)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.hideSuggestions)
  }

  displaySuggestions: (suggestions: Array<Suggestion>) => void = (
    suggestions: Array<Suggestion>
  ) => {
    this.setState({
      suggestions
    })
  }
  hideSuggestions: (e: any) => void = (e: any) => {
    console.log(e)
    if (e?.target?.parentElement?.classList.contains('dropdown-content-item'))
      return
    this.setState({
      suggestions: []
    })
  }
  fillInSuggestion: (suggestion: Suggestion) => void = (
    suggestion: Suggestion
  ) => {
    this.search(suggestion.value)
  }
  handleChange: (e: any) => void = (e: any) => {
    clearTimeout(this._timerId)
    const input = e.target.value
    this.setState({
      value: input
    })

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
  search: (value: string) => void = (value: string) => {
    if (this.state.value && typeof this.state.value === 'string') {
      clearTimeout(this._timerId)
      this.props.onSubmit(value)
      this.setState({
        suggestions: [],
        value
      })
    } else {
      this.reset()
    }
  }
  reset: () => void = () => {
    clearTimeout(this._timerId)
    this.setState({
      value: '',
      suggestions: []
    })
    if (this.props.onReset) this.props.onReset()
  }

  render(): JSX.Element {
    const { placeholder } = this.props
    const { suggestions, value } = this.state
    return (
      <>
        <Row>
          <Search
            placeholder={placeholder}
            onSearch={this.search}
            enterButton
            size='large'
            onPressEnter={(e) => {
              this.search(e.target.value)
            }}
            onChange={this.handleChange}
            allowClear
            value={value}
          />
        </Row>
        <Row
          style={{
            position: 'relative'
          }}
        >
          {suggestions?.length > 0 && (
            <Suggestions
              suggestions={suggestions}
              onSelection={this.fillInSuggestion}
            />
          )}
        </Row>
      </>
    )
  }
}
