import React from 'react'
import { Row, Col, Tooltip } from 'antd'
import Info from '@material-ui/icons/Info'
import InsertPhoto from '@material-ui/icons/InsertPhoto'
import Launch from '@material-ui/icons/Launch'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { LocalizedString } from '../../../../types/LocalizedString'
type Props = {
  layer?: Record<string, any>
  selectedFeature: Record<string, any>
  enableToggle?: boolean
  toggled?: boolean
  toggleData?: (...args: Array<any>) => any
  featureName: string
  t: (v: string | LocalizedString) => string
}

const getFeatureLink = (
  feature: {
    properties: Record<string, any>
  },
  featureName: string
) => {
  const host = feature.properties.maphubs_host
  const mhid = feature.properties.mhid
  const source_layer_id = feature.properties.layer_id

  const featureID =
    typeof mhid === 'string' && mhid.includes(':') ? mhid.split(':')[1] : mhid

  const featureLink =
    host === window.location.hostname
      ? `/feature/${source_layer_id}/${featureID}/${featureName}`
      : `https://${host}/feature/${source_layer_id}/${featureID}/${featureName}`

  return featureLink
}

const getLayerLink = (feature, layer) => {
  const host = feature.properties.maphubs_host

  const baseUrl =
    host && host !== 'dev.docker' && host !== window.location.hostname
      ? 'https://' + host
      : urlUtil.getBaseUrl()

  const local_layer_id: string = layer.layer_id.toString() || '0'

  const layerLink =
    host === window.location.hostname || host === 'dev.docker'
      ? `${baseUrl}/lyr/${local_layer_id}`
      : `https://${host}/lyr/${local_layer_id}`

  return layerLink
}

export default function ActionPanel({
  layer,
  selectedFeature,
  featureName,
  enableToggle,
  toggled,
  toggleData,
  t
}: Props): JSX.Element {
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
    dataToggle = toggled ? (
      <Tooltip title={t('Back to Summary')} placement='bottom'>
        <a
          href='#'
          onClick={toggleData}
          style={{
            margin: 0
          }}
        >
          <InsertPhoto />
        </a>
      </Tooltip>
    ) : (
      <Tooltip title={t('View Details')} placement='bottom'>
        <a
          href='#'
          onClick={toggleData}
          style={{
            margin: 0
          }}
        >
          <Info />
        </a>
      </Tooltip>
    )
  }

  return (
    <Row>
      <Col span={16}>
        <div
          style={{
            textAlign: 'left'
          }}
        >
          <Tooltip title={t('Open Layer')} placement='bottom'>
            <b>
              <a
                className='truncate omh-accent-text'
                target='_blank'
                rel='noopener noreferrer'
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
          <Col span={12}>{dataToggle}</Col>
          <Col
            span={12}
            style={{
              textAlign: 'right'
            }}
          >
            <Tooltip title={t('Open Feature Page')} placement='bottom'>
              <a
                href={featureLink}
                target='_blank'
                rel='noopener noreferrer'
                style={{
                  margin: 0
                }}
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
