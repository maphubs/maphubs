import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../src/components/Layout'
import { message, notification } from 'antd'
import request from 'superagent'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import dynamic from 'next/dynamic'
import { checkClientError } from '../../../src/services/client-error-response'
import useT from '../../../src/hooks/useT'

const CodeEditor = dynamic(
  () => import('../../../src/components/LayerDesigner/CodeEditor'),
  {
    ssr: false
  }
)

const ConfigEdit = (): JSX.Element => {
  const router = useRouter()
  const { cid } = router.query
  const { t } = useT()
  const [config, setConfig] = useState(null)

  // set the local copy of the config using the inital data from graphql
  // TOOD: possibly this can use the SWR mutate function instead?
  useEffect(() => {
    if (!config && pageConfig) {
      setConfig(pageConfig)
    }
  }, [pageConfig, config])

  const savePageConfig = (configUpdate: string): void => {
    request
      .post('/api/page/save')
      .type('json')
      .accept('json')
      .send({
        page_id: cid,
        pageConfig: configUpdate
      })
      .end((err, res) => {
        checkClientError(
          res,
          err,
          () => {},
          (cb) => {
            setConfig(configUpdate)

            if (err) {
              notification.error({
                message: t('Server Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            } else {
              message.success(t('Page Saved'), 3)
            }

            cb()
          }
        )
      })
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Edit Page Configuration')} hideFooter>
        <div
          className='container'
          style={{
            height: 'calc(100% - 100px)'
          }}
        >
          <CodeEditor
            id='layer-style-editor'
            mode='json'
            code={JSON.stringify(config, undefined, 2)}
            title={t('Editing Page Config: ') + cid}
            onSave={savePageConfig}
            modal={false}
            visible
            t={t}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default ConfigEdit
