import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import Layout from '../../../src/components/Layout'
import { message, notification } from 'antd'
import request from 'superagent'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import dynamic from 'next/dynamic'
import { checkClientError } from '../../../src/services/client-error-response'
import useT from '../../../src/hooks/useT'

// ssr only
import PageModel from '../../../src/models/page'

const CodeEditor = dynamic(
  () => import('../../../src/components/LayerDesigner/CodeEditor'),
  {
    ssr: false
  }
)

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cid = context.query.cid as string
  const pageConfig = await PageModel.getPageConfigs([cid])[0]

  const session = await getSession(context)

  if (session.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  if (!pageConfig) {
    return {
      notFound: true
    }
  }
  return {
    props: {
      pageConfig
    }
  }
}
const ConfigEdit = ({ pageConfig }: { pageConfig: any }): JSX.Element => {
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
      .post('/api/admin/page/save')
      .type('json')
      .accept('json')
      .send({
        page_id: cid,
        pageConfig: configUpdate
      })
      .end((err, res) => {
        checkClientError({
          res,
          err,

          onSuccess: () => {
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
          }
        })
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
            initialCode={JSON.stringify(config, undefined, 2)}
            title={t('Editing Page Config: ') + cid}
            onSave={savePageConfig}
            modal={false}
            visible
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default ConfigEdit
