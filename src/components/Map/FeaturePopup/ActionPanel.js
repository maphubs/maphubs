// @flow
import React from 'react'
import {Row, Col, Tooltip} from 'antd'
import Info from '@material-ui/icons/Info'
import InsertPhoto from '@material-ui/icons/InsertPhoto'
import Launch from '@material-ui/icons/Launch'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'

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
        <Tooltip title={t('Back to Summary')} placement='bottom'>
          <a href='#' onClick={toggleData} style={{margin: 0}}>
            <InsertPhoto />
          </a>
        </Tooltip>
      )
    } else {
      dataToggle = (
        <Tooltip
          title={t('View Details')}
          placement='bottom'
        >
          <a href='#' onClick={toggleData} style={{margin: 0}}>
            <Info />
          </a>
        </Tooltip>
      )
    }
  }

  return (
    <Row>
      <Col span={16}>
        <div style={{textAlign: 'left'}}>
          <Tooltip
            title={t('Open Layer')}
            placement='bottom'
          >
            <b>
              <a
                className='truncate omh-accent-text' target='_blank' rel='noopener noreferrer'
                style={{
                  margin: 0,
                  fontSize: '8px'
                }}
                href={layerLink}
              >
                {t(layerName)}
              </a>
            </b>
          </Tooltip>
        </div>
      </Col>
      <Col span={8}>
        <Row>
          <Col span={12}>
            {dataToggle}
          </Col>
          <Col span={12} style={{textAlign: 'right'}}>
            <Tooltip
              title={t('Open Feature Page')}
              placement='bottom'
            >
              <a
                href={featureLink} target='_blank' rel='noopener noreferrer'
                style={{margin: 0}}
              >
                <Launch />
              </a>
            </Tooltip>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
