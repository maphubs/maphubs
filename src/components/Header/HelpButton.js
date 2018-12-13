// @flow
import React from 'react'
import {Tooltip} from 'react-tippy'
import HelpOutline from '@material-ui/icons/HelpOutline'

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
      <a className='nav-link-item' style={{padding: 0, marginTop: '6px', textAlign: 'center'}} target='_blank' rel='noopener noreferrer' href={helpLink}>
        <HelpOutline />
      </a>
    </Tooltip>
  </li>
)
