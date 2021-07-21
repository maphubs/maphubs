import React from 'react'
import { Tooltip } from 'antd'
import slugify from 'slugify'
import type { Layer } from '../../types/layer'
import LaunchIcon from '@material-ui/icons/Launch'
import useT from '../../hooks/useT'
type Props = {
  layer: Layer
}

export default function LayerInfoExternalLink({ layer }: Props): JSX.Element {
  const { t } = useT()
  const {
    is_external,
    external_layer_type,
    external_layer_config,
    remote,
    remote_layer_id,
    remote_host
  } = layer
  const elc = external_layer_config

  if (!is_external && !remote) {
    return <div />
  } else if (remote) {
    const remoteURL = `https://${remote_host || ''}/layer/info/${
      remote_layer_id || ''
    }/${slugify(t(layer.name))}`
    return (
      <p
        style={{
          fontSize: '16px',
          overflowWrap: 'break-word'
        }}
      >
        <b>{t('Remote Layer from: ')} </b>
        <a href={remoteURL} target='_blank' rel='noopener noreferrer'>
          {remoteURL}
        </a>
      </p>
    )
  }

  let externalUrl = ''
  let type

  if (elc) {
    externalUrl = elc.url ? elc.url : ''

    if (external_layer_type === 'openstreetmap') {
      type = 'OpenStreetMap'
      externalUrl = 'http://openstreetmap.org'
    } else if (external_layer_type === 'planet') {
      type = 'Planet'
      externalUrl = 'https://planet.com'
    } else if (elc.type === 'raster') {
      type = 'Raster'

      if (elc.tiles) {
        externalUrl = elc.tiles[0]
      } else if (elc.url) {
        externalUrl = elc.url
      }
    } else if (
      (!external_layer_type || external_layer_type === '') &&
      elc.type
    ) {
      type = elc.type
    } else if (elc.type === 'geojson') {
      type = 'GeoJSON'
      externalUrl = elc.data
    } else {
      type = external_layer_type
    }
  }

  return (
    <div>
      <p
        style={{
          fontSize: '16px',
          overflowWrap: 'break-word'
        }}
      >
        <b>{t('External Layer: ')}</b>
        {type}
        &nbsp;-&nbsp;
        <a href={externalUrl} target='_blank' rel='noopener noreferrer'>
          {externalUrl}
        </a>
        <Tooltip title={t('Copy to Clipboard')} placement='left'>
          <LaunchIcon
            style={{
              cursor: 'pointer'
            }}
            onClick={() => {
              navigator.clipboard.writeText(externalUrl)
            }}
          />
        </Tooltip>
      </p>
    </div>
  )
}
