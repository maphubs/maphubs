// @flow
import React from 'react'
import {Tooltip} from 'react-tippy'

type Props = {
  t: any,
  searchLink: string
}

export default ({t, searchLink}: Props) => (
  <li className='nav-link-wrapper' style={{width: '30px'}}>
    <Tooltip
      title={t('Search')}
      position='bottom'
      inertia
      followCursor
    >
      <a className='nav-link-item' style={{padding: 0, margin: 'auto', textAlign: 'center'}} href={searchLink}>
        <i className='material-icons'>search</i>
      </a>
    </Tooltip>
  </li>
)
