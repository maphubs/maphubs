// @flow
import React from 'react'
import {Tooltip} from 'react-tippy'
import urlUtil from '../../../services/url-util'

type Props = {
  layer?: Object,
  selectedFeature: Object,
  enableToggle?: boolean,
  toggled?: boolean,
  toggleData?: Function,
  featureName: string,
  t: Function
}

const getFeatureLink = (feature: {properties: Object}, featureName: string) => {
  const host = feature.properties.maphubs_host
  const mhid = feature.properties.mhid
  const source_layer_id = feature.properties.layer_id
  let featureID
  if (typeof mhid === 'string' && mhid.includes(':')) {
    featureID = mhid.split(':')[1]
  } else {
    featureID = mhid
  }
  let featureLink
  if (host === window.location.hostname) {
    featureLink = `/feature/${source_layer_id}/${featureID}/${featureName}`
  } else {
    featureLink = `https://${host}/feature/${source_layer_id}/${featureID}/${featureName}`
  }
  return featureLink
}

const getLayerLink = (feature, layer) => {
  const host = feature.properties.maphubs_host
  let baseUrl
  if (host && host !== 'dev.docker' && host !== window.location.hostname) {
    baseUrl = 'https://' + host
  } else {
    baseUrl = urlUtil.getBaseUrl()
  }

  const local_layer_id: string = layer.layer_id.toString() || '0'

  let layerLink
  if (host === window.location.hostname || host === 'dev.docker') {
    layerLink = `${baseUrl}/lyr/${local_layer_id}`
  } else {
    layerLink = `https://${host}/lyr/${local_layer_id}`
  }
  return layerLink
}

export default function ActionPanel ({ layer, selectedFeature, featureName, enableToggle, toggled, toggleData, t }: Props) {
  let layerName
  let layerLink
  if (layer) {
    layerName = layer.name
    layerLink = getLayerLink(selectedFeature, layer)
  } else {
    // layerName = {en: t('Unknown Layer')}
    layerLink = '#'
  }

  const featureLink = getFeatureLink(selectedFeature, featureName)

  let dataToggle
  if (enableToggle) {
    if (toggled) {
      dataToggle = (
        <Tooltip
          title={t('Back to Summary')}
          position='bottom' inertia followCursor>
          <a href='#' onClick={toggleData} style={{margin: 0}}>
            <i className='material-icons omh-accent-text'>insert_photo</i>
          </a>
        </Tooltip>
      )
    } else {
      dataToggle = (
        <Tooltip
          title={t('View Details')}
          position='bottom' inertia followCursor>
          <a href='#' onClick={toggleData} style={{margin: 0}}>
            <i className='material-icons omh-accent-text'>info</i>
          </a>
        </Tooltip>
      )
    }
  }

  return (
    <div className='row no-margin'>
      <div className='col s8 no-padding'>
        <div style={{textAlign: 'left'}}>
          <Tooltip
            title={t('Open Layer')}
            position='bottom' inertia followCursor>
            <b>
              <a className='truncate omh-accent-text' target='_blank' rel='noopener noreferrer'
                style={{
                  margin: 0,
                  fontSize: '8px'
                }}
                href={layerLink}>
                {t(layerName)}
              </a>
            </b>
          </Tooltip>
        </div>
      </div>
      <div className='col s4 no-padding'>
        <div className='row no-margin'>
          <div className='col s6 no-padding'>
            {dataToggle}
          </div>
          <div className='col s6 no-padding' style={{textAlign: 'right'}}>
            <Tooltip
              title={t('Open Feature Page')}
              position='bottom' inertia followCursor>
              <a href={featureLink} target='_blank' rel='noopener noreferrer'
                style={{margin: 0}}>
                <i className='material-icons omh-accent-text'>launch</i>
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}
