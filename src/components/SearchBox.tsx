import * as React from 'react'
import { notification } from 'antd'
import request from 'superagent'
import SearchBar from './SearchBar/SearchBar'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
const debug = DebugService('SearchBox')
type Props = {
  label: string
  suggestionUrl?: string
  onSearch: (...args: Array<any>) => any
  onReset: (...args: Array<any>) => any
}
const SearchBox = ({
  suggestionUrl,
  label,
  onSearch,
  onReset
}: Props): JSX.Element => {
  const onChange = async (
    input: string,
    resolve: (...args: Array<any>) => any
  ) => {
    if (suggestionUrl) {
      try {
        const res = await request
          .get(suggestionUrl + '?q=' + input)
          .type('json')
          .accept('json')

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

  return (
    <SearchBar
      placeholder={label}
      onChange={onChange}
      onSubmit={(input: string) => {
        if (!input) return
        onSearch(input)
      }}
      onReset={onReset}
    />
  )
}
SearchBox.defaultProps = {
  label: 'Search',
  style: {},
  id: 'search',

  onSearch() {
    return
  },

  onError() {
    return
  },

  onReset() {
    return
  }
}
export default SearchBox
