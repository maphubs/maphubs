import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import Layout from '../../../../src/components/Layout'
import { Row, Col, List, Button, Empty, message, notification } from 'antd'
import LocalizedCodeEditor from '../../../../src/components/forms/LocalizedCodeEditor'
import request from 'superagent'
import shortid from 'shortid'
import ErrorBoundary from '../../../../src/components/ErrorBoundary'
import dynamic from 'next/dynamic'
import { checkClientError } from '../../../../src/services/client-error-response'
import useT from '../../../../src/hooks/useT'

// ssr only
import PageModel from '../../../../src/models/page'

const CodeEditor = dynamic(
  () => import('../../../../src/components/LayerDesigner/CodeEditor'),
  {
    ssr: false
  }
)

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cid = context.query.cid as string
  const pageConfig = await PageModel.getPageConfigs([cid])[0]

  const session = await getSession(context)

  if (!session.user.admin) {
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

const PageEdit = ({ pageConfig }: { pageConfig: any }): JSX.Element => {
  const router = useRouter()
  const { pid } = router.query
  const { t } = useT()
  const [config, setConfig] = useState(null)
  const [editingComponent, setEditingComponent] = useState(null)

  useEffect(() => {
    if (!config && pageConfig) {
      if (!pageConfig.components) pageConfig.components = []
      pageConfig.components.map((c) => {
        if (!c.id) c.id = shortid()
      })
      setConfig(pageConfig)
    }
  }, [pageConfig, config])

  const savePageConfig = (configUpdate: string): void => {
    request
      .post('/api/page/save')
      .type('json')
      .accept('json')
      .send({
        page_id: pid,
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

  const updateComponent = (component: Record<string, any>): void => {
    const configClone = JSON.parse(JSON.stringify(config))
    configClone.components = configClone.components.map((c) => {
      return c.id === component.id ? component : c
    })
    setConfig(configClone)
    setEditingComponent(null)
  }

  const components = config.components
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Edit Page')} hideFooter>
        <div
          style={{
            height: 'calc(100% - 100px)',
            padding: '20px'
          }}
        >
          <Row
            style={{
              height: '100%'
            }}
          >
            <Col
              span={12}
              style={{
                height: '100%',
                padding: '20px'
              }}
            >
              <Row
                style={{
                  height: '50%',
                  overflow: 'auto'
                }}
              >
                <List
                  header={<b>Components</b>}
                  bordered
                  dataSource={components}
                  style={{
                    width: '100%'
                  }}
                  renderItem={(item: { id: string; type: string }) => (
                    <List.Item>
                      <Row
                        style={{
                          width: '100%'
                        }}
                      >
                        <Col span={8}>ID: {item.id}</Col>
                        <Col span={8}>Type: {item.type}</Col>
                        <Col span={8}>
                          <Button
                            type='primary'
                            size='small'
                            onClick={() => {
                              setEditingComponent(item)
                            }}
                          >
                            Edit
                          </Button>
                        </Col>
                      </Row>
                    </List.Item>
                  )}
                />
              </Row>
              <Row
                style={{
                  height: '50%'
                }}
              >
                <CodeEditor
                  id='layer-style-editor'
                  mode='json'
                  initialCode={JSON.stringify(config, undefined, 2)}
                  title={t('Editing Page Config: ') + pid}
                  onSave={savePageConfig}
                  modal={false}
                  visible
                />
              </Row>
            </Col>
            <Col
              span={12}
              style={{
                height: '100%',
                padding: '20px'
              }}
            >
              <ErrorBoundary t={t}>
                <Row
                  style={{
                    height: '100%'
                  }}
                >
                  {editingComponent && editingComponent.type === 'html' && (
                    <LocalizedCodeEditor
                      id='component-html-editor'
                      mode='html'
                      initialLocalizedCode={editingComponent.html}
                      title={`Editing ${editingComponent.id}`}
                      onSave={(html) => {
                        editingComponent.html = html
                        updateComponent(editingComponent)
                      }}
                    />
                  )}
                  {editingComponent && editingComponent.type !== 'html' && (
                    <CodeEditor
                      visible
                      id='component-config-editor'
                      mode='json'
                      initialCode={JSON.stringify(
                        editingComponent,
                        undefined,
                        2
                      )}
                      title={`Editing ${editingComponent.id}`}
                      onSave={(json) => {
                        updateComponent(editingComponent)
                      }}
                      modal={false}
                    />
                  )}
                  {!editingComponent && <Empty />}
                </Row>
              </ErrorBoundary>
            </Col>
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default PageEdit
