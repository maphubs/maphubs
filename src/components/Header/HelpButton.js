// @flow
import React from 'react'
import {Tooltip} from 'react-tippy'

type Props = {
  t: any,
  helpLink: string
}

export default ({t, helpLink}: Props) => (
  <li className='nav-link-wrapper' style={{width: '30px'}}>
    <Tooltip
      title={t('Help/Support')}
      position='bottom'
      inertia
      followCursor
    >
      <a className='nav-link-item' style={{padding: 0, margin: 'auto', textAlign: 'center'}} target='_blank' rel='noopener noreferrer' href={helpLink}>
        <i className='material-icons'>help_outline</i>
      </a>
    </Tooltip>
  </li>
)
