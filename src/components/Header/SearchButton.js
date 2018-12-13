// @flow
import React from 'react'
import {Tooltip} from 'react-tippy'
import Search from '@material-ui/icons/Search'

type Props = {
  t: any,
  searchLink: string
}

export default ({t, searchLink}: Props) => (
  <li className='nav-link-wrapper' style={{height: '50px', overflow: 'hidden', width: '30px'}}>
    <Tooltip
      title={t('Search')}
      position='bottom'
      inertia
      followCursor
    >
      <a className='nav-link-item' style={{padding: 0, marginTop: '6px', textAlign: 'center'}} href={searchLink}>
        <Search />
      </a>
    </Tooltip>
  </li>
)
