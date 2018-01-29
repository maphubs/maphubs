// @flow
import React from 'react'
import request from 'superagent'
import SearchBar from './SearchBar/SearchBar'
const debug = require('../services/debug')('SearchBox')

type Props = {
  label: string,
  suggestionUrl: ?string,
  onSearch: Function,
  onError: Function,
  onReset: Function,
  style: Object,
  id: string
}

export default class SearchBox extends React.Component<Props, void> {
  props: Props

  static defaultProps = {
    label: 'Search',
    style: {},
    id: 'search',
    onSearch () {},
    onError () {},
    onReset () {},
    suggestionUrl: null
  }

  onChange = (input: string, resolve: Function) => {
    const _this = this
    if (typeof window !== 'undefined' && this.props.suggestionUrl) {
      request.get(this.props.suggestionUrl + '?q=' + input)
        .type('json').accept('json')
        .end((err, res) => {
          if (err) {
            debug.error(err)
            if (_this.props.onError) _this.props.onError(JSON.stringify(err))
          } else {
            if (res.body.suggestions) {
              resolve(res.body.suggestions)
            } else {
              debug.log(JSON.stringify(res.body))
              if (_this.props.onError) _this.props.onError(JSON.stringify(res.body))
            }
          }
        })
    }
  }

 onSubmit = (input: string) => {
   if (!input) return
   this.props.onSearch(input)
 }

 render () {
   return (
     <SearchBar
       id={this.props.id}
       placeholder={this.props.label}
       onChange={this.onChange}
       onSubmit={this.onSubmit}
       onReset={this.props.onReset} />
   )
 }
}
