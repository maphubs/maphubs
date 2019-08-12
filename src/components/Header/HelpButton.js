// @flow
import React from 'react'
import {Tooltip} from 'antd'
import HelpOutline from '@material-ui/icons/HelpOutline'

type Props = {
  t: any,
  helpLink: string
}

export default ({t, helpLink}: Props) => (
  <Tooltip
    title={t('Help/Support')}
    placement='bottom'
  >
    <a style={{paddingTop: '6px', height: '50px', textAlign: 'center'}} target='_blank' rel='noopener noreferrer' href={helpLink}>
      <HelpOutline style={{
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
