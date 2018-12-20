// @flow
import React from 'react'
import {Tooltip} from 'react-tippy'
import slugify from 'slugify'
import type {Layer} from '../../types/layer'

type Props = {
  layer: Layer,
  t: Function
}

const copyToClipboard = (val: string) => {
  const clipboard = require('clipboard-polyfill').default
  clipboard.writeText(val)
}

export default function LayerInfoExternalLink ({layer, t}: Props) {
  const elc = layer.external_layer_config
  const {is_external, remote} = layer
  if (!is_external && !remote) {
    return (
      <div />
    )
  } else if (remote) {
    const remoteURL = `https://${layer.remote_host || ''}/layer/info/${layer.remote_layer_id || ''}/${slugify(t(layer.name))}`
    return (
      <p style={{fontSize: '16px', overflowWrap: 'break-word'}}><b>{t('Remote Layer from: ')} </b>
        <a href={remoteURL} target='_blank' rel='noopener noreferrer'>{remoteURL}</a>
      </p>
    )
  }
  let externalUrl: string = ''
  let type
  if (elc) {
    externalUrl = elc.url ? elc.url : ''
    if (layer.external_layer_type === 'openstreetmap') {
      type = 'OpenStreetMap'
      externalUrl = 'http://openstreetmap.org'
    } else if (layer.external_layer_type === 'planet') {
      type = 'Planet'
      externalUrl = 'https://planet.com'
    } else if (elc.type === 'raster') {
      type = 'Raster'
      if (elc.tiles) {
        externalUrl = elc.tiles[0]
      } else if (elc.url) {
        externalUrl = elc.url
      }
    } else if ((!layer.external_layer_type || layer.external_layer_type === '') &&
            elc.type) {
      type = elc.type
    } else if (elc.type === 'geojson') {
      type = 'GeoJSON'
      externalUrl = elc.data
    } else {
      type = layer.external_layer_type
    }
  }

  return (
    <div>
      <p style={{fontSize: '16px', overflowWrap: 'break-word'}}><b>{t('External Layer: ')}</b>{type}
        &nbsp;-&nbsp;
        <a href={externalUrl} target='_blank' rel='noopener noreferrer'>{externalUrl}</a>
        <Tooltip
          title={t('Copy to Clipboard')}
          position='left' inertia followCursor>
          <i className='material-icons omh-accent-text'
            style={{cursor: 'pointer'}}
            onClick={() => { copyToClipboard(externalUrl) }}>launch</i>
        </Tooltip>
      </p>
    </div>
  )
}
