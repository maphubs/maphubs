// @flow
import * as React from 'react'
import { notification } from 'antd'
import request from 'superagent'
import SearchBar from './SearchBar/SearchBar'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('SearchBox')

type Props = {
  label: string,
  suggestionUrl?: string,
  onSearch: Function,
  onReset: Function
}

export default class SearchBox extends React.Component<Props, void> {
  static defaultProps: {|
  id: string,
  label: string,
  onError: () => void,
  onReset: () => void,
  onSearch: () => void,
  style: {...},
|} = {
    label: 'Search',
    style: {},
    id: 'search',
    onSearch () {},
    onError () {},
    onReset () {}
  }

  searchBar: any

  onChange: ((input: string, resolve: any) => Promise<void>) = async (input: string, resolve: Function) => {
    const { suggestionUrl } = this.props
    if (suggestionUrl) {
      try {
        const res = await request.get(suggestionUrl + '?q=' + input)
          .type('json').accept('json')
        if (res.body.suggestions) {
          resolve(res.body.suggestions)
        }
      } catch (err) {
        debug.error(err)
        notification.error({
          message: 'Error',
          description: err.message || err.toString() || err,
          duration: 0
        })
      }
    }
  }

 onSubmit: ((input: string) => void) = (input: string) => {
   if (!input) return
   this.props.onSearch(input)
 }

 reset: (() => void) = () => {
   this.searchBar.reset()
 }

 render (): React.Node {
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
