// @flow
import React from 'react'
import { notification } from 'antd'
import request from 'superagent'
import SearchBar from './SearchBar/SearchBar'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('SearchBox')

type Props = {
  label: string,
  suggestionUrl: ?string,
  onSearch: Function,
  onReset: Function,
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
    const { suggestionUrl } = this.props
    if (suggestionUrl) {
      request.get(suggestionUrl + '?q=' + input)
        .type('json').accept('json')
        .end((err, res) => {
          if (err) {
            debug.error(err)
            notification.error({
              message: 'Error',
              description: err.message || err.toString() || err,
              duration: 0
            })
          } else {
            if (res.body.suggestions) {
              resolve(res.body.suggestions)
            } else {
              debug.log(JSON.stringify(res.body))
              notification.error({
                message: 'Error',
                description: err.message || err.toString() || err,
                duration: 0
              })
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
       onReset={this.props.onReset}
     />
   )
 }
}
