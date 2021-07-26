import React, { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
import { Row, Button } from 'antd'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import slugify from 'slugify'
import UploadLayerReplacement from '../../../src/components/CreateLayer/UploadLayerReplacement'
import ErrorBoundary from '../../../src/components/ErrorBoundary'

import useT from '../../../src/hooks/useT'
import useUnload from '../../../src/hooks/useUnload'

import { useDispatch } from '../../../src/redux/hooks'
import { loadLayer } from '../../../src/redux/reducers/layerSlice'
import type { Layer } from '../../../src/types/layer'
import type { Group } from '../../../src/types/group'

//SSR Only
import LayerModel from '../../../src/models/layer'
import PageModel from '../../../src/models/page'
import GroupModel from '../../../src/models/group'

type Props = {
  layer: Layer
  userGroups: Group[]
  mapConfig: Record<string, any>
  allowedToModifyLayer?: boolean
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const layer_id = Number.parseInt(context.params.layerreplace[0])
  const layer = await LayerModel.getLayerByID(layer_id)

  if (!layer) {
    return {
      notFound: true
    }
  }

  layer.last_updated = layer.last_updated.toISOString()
  layer.creation_time = layer.creation_time.toISOString()

  const session = await getSession(context)
  let allowedToModifyLayer = null
  if (session?.user) {
    allowedToModifyLayer = await LayerModel.allowedToModify(
      layer_id,
      session.user.id || session.user.sub
    )
  }

  const mapConfig = (await PageModel.getPageConfigs(['map'])[0]) || null
  return {
    props: {
      layer,
      userGroups: await GroupModel.getGroupsForUser(
        session?.user.id || session?.user.sub
      ),
      mapConfig,
      allowedToModifyLayer
    }
  }
}

const LayerReplace = ({
  layer,
  userGroups,
  mapConfig,
  allowedToModifyLayer
}: Props): JSX.Element => {
  const router = useRouter()
  const { t } = useT()
  const dispatch = useDispatch()
  const [downloaded, setDownloaded] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    dispatch(loadLayer(layer))
  }, [layer, dispatch])

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

    router.push('/layer/info/' + layer.layer_id + '/' + slugify(t(layer.name)))
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
