// @flow
import React from 'react'

type Props = {
  views: number,
  stats: {
    maps: number,
    stories: number,
    hubs: number
  },
  t: Function
}

export default function LayerInfoStats ({views, stats, t}: Props) {
  return (
    <div className='row no-margin' style={{position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFF'}}>
      <div className='col s6 m3 l3 center-align'>
        <b className='center-align'>{t('Views')}</b>
        <p className='center-align'>{views}</p>
      </div>
      <div className='col s6 m3 l3 center-align'>
        <b className='center-align'>{t('Maps')}</b>
        <p className='center-align'>{stats && stats.maps}</p>
      </div>
      <div className='col s6 m3 l3 center-align'>
        <b className='center-align'>{t('Stories')}</b>
        <p className='center-align'>{stats && stats.stories}</p>
      </div>
      <div className='col s6 m3 l3 center-align'>
        <b className='center-align'>{t('Hubs')}</b>
        <p className='center-align'>{stats && stats.hubs}</p>
      </div>
    </div>
  )
}
