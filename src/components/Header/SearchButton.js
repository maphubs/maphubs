// @flow
import type {Node} from "React";import React from 'react'
import {Tooltip} from 'antd'
import Search from '@material-ui/icons/Search'

type Props = {
  t: any,
  searchLink: string
}

export default ({t, searchLink}: Props): Node => (
  <Tooltip
    title={t('Search')}
    placement='bottom'
  >
    <a style={{paddingTop: '7px', height: '50px', textAlign: 'center'}} href={searchLink}>
      <Search
        style={{
          fill: 'currentColor',
          width: '1em',
          height: '1em',
          display: 'inline-block',
          fontSize: '24px'
        }}
      />
    </a>
  </Tooltip>
)
