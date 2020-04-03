// @flow
import * as React from 'react'
import { notification } from 'antd'
import request from 'superagent'
import SearchBar from './SearchBar/SearchBar'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('SearchBox')

type Props = {
  label: string,
  suggestionUrl: ?string,
  onSearch: Function,
  onReset: Function
}

export default class SearchBox extends React.Component<Props, void> {
  static defaultProps = {
    label: 'Search',
    style: {},
    id: 'search',
    onSearch () {},
    onError () {},
    onReset () {},
    suggestionUrl: null
  }

  searchBar: any

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

 reset = () => {
   this.searchBar.reset()
 }

 render () {
   return (
     <SearchBar
       ref={el => { this.searchBar = el }}
       placeholder={this.props.label}
       onChange={this.onChange}
       onSubmit={this.onSubmit}
       onReset={this.props.onReset}
     />
   )
 }
}
