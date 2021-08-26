import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Formsy, { addValidationRule } from 'formsy-react'
import { Row, Button, Typography } from 'antd'
import slugify from 'slugify'
import Layout from '../../src/components/Layout'
import TextInput from '../../src/components/forms/textInput'
import SelectGroup from '../../src/components/Groups/SelectGroup'

import MiniLegend from '../../src/components/Maps/Map/MiniLegend'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import type { Layer } from '../../src/types/layer'
import request from 'superagent'
import $ from 'jquery'
import { checkClientError } from '../../src/services/client-error-response'
import LinkIcon from '@material-ui/icons/Link'
import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { Group } from '../../src/types/group'
import useUnload from '../../src/hooks/useUnload'
import dynamic from 'next/dynamic'
const MapHubsMap = dynamic(() => import('../../src/components/Maps/Map'), {
  ssr: false
})

const { Title } = Typography

type LayerState = {
  layer?: Layer
  remote_host?: string
  group_id?: string
}
const CreateRemoteLayer = (): JSX.Element => {
  const { t, locale } = useT()
  const router = useRouter()
  const [canSubmit, setCanSubmit] = useState(false)
  const [complete, setComplete] = useState(false)

  const { data } = useSWR(`
  {
    userGroups {
      group_id
      name
    }
    mapConfig
  }
  `)
  const stickyData: {
    userGroups: Group[]
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const { userGroups, mapConfig } = stickyData

  const [layerState, setLayerState] = useState<LayerState>({})

  const { layer, remote_host, group_id } = layerState

  addValidationRule('isHttps', (values: string[], value: string) => {
    return value ? value.startsWith('https://') : false
  })
  addValidationRule(
    'validMapHubsLayerPath',
    (values: string[], value: string) => {
      if (typeof window !== 'undefined' && value) {
        const pathParts = $('<a>')
          .prop('href', value)
          .prop('pathname')
          .split('/')

        if (
          pathParts[1] === 'layer' &&
          (pathParts[2] === 'info' || pathParts[2] === 'map') &&
          pathParts[3]
        ) {
          return true
        }
      }

      return false
    }
  )

  useUnload((e) => {
    e.preventDefault()
    if (layer && !complete) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const loadRemoteUrl = (model: Record<string, any>) => {
    const remoteLayerUrl = model.remoteLayerUrl
    const group_id = model.group
    const link = $('<a>').prop('href', remoteLayerUrl)
    const remote_host = link.prop('hostname')
    const pathParts = link.prop('pathname').split('/')

    if (
      pathParts[1] === 'layer' &&
      (pathParts[2] === 'info' || pathParts[2] === 'map') &&
      pathParts[3]
    ) {
      const remote_layer_id = pathParts[3]
      request
        .get(
          'https://' + remote_host + '/api/layer/metadata/' + remote_layer_id
        )
        .type('json')
        .accept('json')
        .timeout(1_200_000)
        .end((err, res) => {
          checkClientError({
            res,
            err,
            onSuccess: () => {
              setLayerState({
                remote_host,
                group_id,
                layer: res.body.layer
              })
            }
          })
        })
    }
  }
  const saveLayer = (): void => {
    if (layer) {
      const name = layer.name || {}
      request
        .post('/api/layer/remote/create')
        .type('json')
        .accept('json')
        .send({
          group_id,
          layer,
          host: remote_host
        })
        .end((err, res) => {
          checkClientError({
            res,
            err,
            onSuccess: () => {
              const layer_id = res.body.layer_id
              setComplete(true)

              router.push('/layer/info/' + layer_id + '/' + slugify(t(name)))
            }
          })
        })
    }
  }

  if (!userGroups || userGroups.length === 0) {
    return (
      <ErrorBoundary t={t}>
        <Layout title={t('Add Remote Layer')} hideFooter>
          <div className='container' style={{ height: '100%' }}>
            <Row
              align='middle'
              justify='center'
              style={{
                marginBottom: '20px',
                height: '100%'
              }}
            >
              <div style={{ width: '100%', textAlign: 'center' }}>
                <h2 style={{ width: '100%' }}>{t('Please Join a Group')}</h2>

                <p>
                  {t('Please create or join a group before creating a layer.')}
                </p>
              </div>
            </Row>
          </div>
        </Layout>
      </ErrorBoundary>
    )
  }

  let layerReview = <></>

  if (layer) {
    layerReview = (
      <Row
        style={{
          marginBottom: '20px'
        }}
      >
        <Row
          style={{
            marginBottom: '20px',
            height: '400px'
          }}
        >
          <MapHubsMap
            id='remote-layer-preview-map'
            showFeatureInfoEditButtons={false}
            mapConfig={mapConfig}
            initialGLStyle={layer.style}
            fitBounds={layer.preview_position?.bbox}
            locale={locale}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            DGWMSConnectID={process.env.NEXT_PUBLIC_DG_WMS_CONNECT_ID}
            earthEngineClientID={process.env.NEXT_PUBLIC_EARTHENGINE_CLIENTID}
          >
            <MiniLegend
              style={{
                position: 'absolute',
                top: '5px',
                left: '5px',
                minWidth: '275px',
                width: '25%',
                maxWidth: '325px',
                maxHeight: 'calc(100% - 200px)',
                display: 'flex',
                flexDirection: 'column'
              }}
              collapsible
              hideInactive={false}
              showLayersButton={false}
              title={layer.name}
              layers={[layer]}
            />
          </MapHubsMap>
        </Row>
        <Row
          justify='end'
          style={{
            textAlign: 'right'
          }}
        >
          <Button type='primary' onClick={saveLayer}>
            {t('Save Layer')}
          </Button>
        </Row>
      </Row>
    )
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Add Remote Layer')} hideFooter>
        <div className='container'>
          <Row justify='center'>
            <Title>{t('Link to a Remote Layer')}</Title>
          </Row>
          <Row justify='center'>
            <p>{t('Please copy and paste a link to a remote MapHubs layer')}</p>
          </Row>
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Formsy
              onValidSubmit={loadRemoteUrl}
              onValid={() => {
                setCanSubmit(true)
              }}
              onInvalid={() => {
                setCanSubmit(false)
              }}
              style={{
                width: '100%'
              }}
            >
              <TextInput
                name='remoteLayerUrl'
                label={t('Remote MapHubs URL')}
                icon={<LinkIcon />}
                validations='maxLength:250,isHttps,validMapHubsLayerPath'
                validationErrors={{
                  maxLength: t('Must be 250 characters or less.'),
                  isHttps: t(
                    'MapHubs requires encryption for external links, URLs must start with https://'
                  ),
                  validMapHubsLayerPath: t('Not a valid MapHubs Layer URL')
                }}
                length={250}
                tooltipPosition='top'
                tooltip={t(
                  'MapHubs Layer URL ex: https://maphubs.com/layer/info/123/my-layer'
                )}
                required
                t={t}
              />
              <SelectGroup groups={userGroups} />
              <div
                style={{
                  float: 'right'
                }}
              >
                <Button type='primary' htmlType='submit' disabled={!canSubmit}>
                  {t('Load Remote Layer')}
                </Button>
              </div>
            </Formsy>
          </Row>
          <Row>{layerReview}</Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default CreateRemoteLayer
