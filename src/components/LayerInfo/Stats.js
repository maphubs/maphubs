// @flow
import React from 'react'

type Props = {
  views: number,
  stats: {
    maps: number,
    stories: number
  },
  t: Function
}

export default function LayerInfoStats ({views, stats, t}: Props) {
  return (
    <div className='row no-margin' style={{position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF'}}>
      <div className='col s8 m4 l4 center-align'>
        <b className='center-align'>{t('Views')}</b>
        <p className='center-align'>{views}</p>
      </div>
      <div className='col s8 m4 l4 center-align'>
        <b className='center-align'>{t('Maps')}</b>
        <p className='center-align'>{stats && stats.maps}</p>
      </div>
      <div className='col s8 m4 l4 center-align'>
        <b className='center-align'>{t('Stories')}</b>
        <p className='center-align'>{stats && stats.stories}</p>
      </div>
    </div>
  )
}
