import React, { useState } from 'react'
import { Row, Button } from 'antd'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import slugify from 'slugify'
import UploadLayerReplacement from '../../../src/components/CreateLayer/UploadLayerReplacement'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import getConfig from 'next/config'
import useT from '../../../src/hooks/useT'
import useUnload from '../../../src/hooks/useUnload'
import useSWR from 'swr'
import useStickyResult from '../../../src/hooks/useStickyResult'
import { Layer } from '../../../src/types/layer'

const LayerReplace = (): JSX.Element => {
  const router = useRouter()
  const { t } = useT()
  const [downloaded, setDownloaded] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const slug = router.query.layerreplace || []
  const layer_id = slug[0]

  const { data } = useSWR([
    `
 {
   layer(id: "{id}") {
     layer_id
     name
     presets
   }
   allowedToModifyLayer(id: "{id}")
   mapConfig
 }
 `,
    layer_id
  ])
  const stickyData: {
    layer: Layer
    allowedToModifyLayer: boolean
    mapConfig: Record<string, unknown>
  } = useStickyResult(data) || {}
  const { layer, allowedToModifyLayer, mapConfig } = stickyData

  /*
  constructor(props: Props) {
    super(props)
    this.stores = [LayerStore]
    this.state = {
      downloaded: false,
      submitted: false,
      layer: props.layer
    }

    Reflux.rehydrate(LayerStore, props.layer)
    const baseMapContainerInit: {
      baseMap?: string
      bingKey: string
      tileHostingKey: string
      mapboxAccessToken: string
      baseMapOptions?: Record<string, any>
    } = {
      bingKey: MAPHUBS_CONFIG.BING_KEY,
      tileHostingKey: MAPHUBS_CONFIG.TILEHOSTING_MAPS_API_KEY,
      mapboxAccessToken: MAPHUBS_CONFIG.MAPBOX_ACCESS_TOKEN
    }

    if (props.mapConfig && props.mapConfig.baseMapOptions) {
      baseMapContainerInit.baseMapOptions = props.mapConfig.baseMapOptions
    }

    this.BaseMapState = new BaseMapContainer(baseMapContainerInit)
    LayerActions.loadLayer()
  }
  */

  useUnload((e) => {
    e.preventDefault()
    if (!submitted) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const onDownload = (): void => {
    setDownloaded(true)
  }
  const onDataSubmit = (): void => {
    setSubmitted(true)

    window.location.assign(
      '/layer/info/' + layer.layer_id + '/' + slugify(t(layer.name))
    )
  }

  const maphubsFileURL = `/api/layer/${layer.layer_id}/export/maphubs/${slugify(
    t(layer.name)
  )}.maphubs`
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Replace Layer')} hideFooter>
        <div
          style={{
            height: 'calc(100% - 50px)',
            marginTop: 0
          }}
        >
          <div className='container'>
            <Row
              style={{
                marginBottom: '20px',
                textAlign: 'center'
              }}
            >
              <h5>{t('Replace data in layer:') + ' ' + t(layer.name)}</h5>
              <p>
                {t(
                  'First you must download the backup file. This file can be used to restore the previous data if needed.'
                )}
              </p>
              <Button
                type='primary'
                href={maphubsFileURL}
                target='_blank'
                rel='noopener noreferrer'
                onClick={onDownload}
              >
                {t('Download Backup File')}
              </Button>
            </Row>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              {downloaded && (
                <UploadLayerReplacement
                  onSubmit={onDataSubmit}
                  mapConfig={mapConfig}
                />
              )}
            </Row>
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default LayerReplace
