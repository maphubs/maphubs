import React, { useState } from 'react'
import Formsy from 'formsy-react'
import Layout from '../../src/components/Layout'
import SelectGroup from '../../src/components/Groups/SelectGroup'
import FileUpload from '../../src/components/forms/FileUpload'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import { Steps, Row, Col, notification, message, Button } from 'antd'
import useT from '../../src/hooks/useT'
import useUnload from '../../src/hooks/useUnload'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'
import { Group } from '../../src/types/group'

const Step = Steps.Step

type Props = {
  groups: Array<Record<string, any>>
}
type ImportState = {
  layer_id?: number
  map_id?: number
}

const ImportLayer = (): JSX.Element => {
  const { t } = useT()
  const [groupId, setGroupId] = useState('')
  const [importState, setImportState] = useState<ImportState>({})

  const { data } = useSWR(`
  {
    userGroups {
      group_id
      name
    }
  }
  `)
  const stickyData: {
    userGroups: Group[]
  } = useStickyResult(data) || {}
  const { userGroups } = stickyData

  const { layer_id, map_id } = importState

  useUnload((e) => {
    e.preventDefault()
    if (groupId && !(layer_id || map_id)) {
      const exit = confirm(t('Any pending changes will be lost'))
      if (exit) window.close()
    }
    window.close()
  })

  const onUpload = (result: Record<string, any>): void => {
    message.destroy('loading')

    if (result.success) {
      message.success(t('Import Complete'))
      setImportState({
        layer_id: result.layer_id,
        map_id: result.map_id
      })
    } else {
      notification.error({
        message: t('Error'),
        description: result.error,
        duration: 0
      })
    }
  }
  const onProcessingStart = (): void => {
    message.loading({
      constent: t('Loading Data'),
      duration: 0,
      key: 'loading'
    })
  }

  if (!userGroups || userGroups.length === 0) {
    return (
      <ErrorBoundary t={t}>
        <Layout title={t('Import Layer')} hideFooter>
          <div style={{ height: '100%' }}>
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
                    {t(
                      'Please create or join a group before creating a layer.'
                    )}
                  </p>
                </div>
              </Row>
            </div>
          </div>
        </Layout>
      </ErrorBoundary>
    )
  }

  let step = 0

  if (layer_id || map_id) {
    step = 2
  } else if (groupId) {
    step = 1
  }

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Import Layer')} hideFooter>
        <div>
          <div
            className='container'
            style={{
              paddingTop: '20px'
            }}
          >
            <Row>
              <Steps size='small' current={step}>
                <Step title={t('Group')} />
                <Step title={t('Upload')} />
                <Step title={t('Finished')} />
              </Steps>
            </Row>
            <Row
              style={{
                padding: '40px'
              }}
            >
              {step === 0 && (
                <Row
                  justify='center'
                  style={{
                    marginBottom: '10px'
                  }}
                >
                  <Col>
                    <Formsy>
                      <SelectGroup
                        groups={userGroups}
                        onGroupChange={(id) => setGroupId(id)}
                      />
                    </Formsy>
                  </Col>
                </Row>
              )}
              {step === 1 && (
                <Row
                  justify='center'
                  align='middle'
                  style={{
                    height: '100%'
                  }}
                >
                  <Col span={8}>
                    <p>{t('Please upload a MapHubs (.maphubs) file')}</p>
                  </Col>
                  <Col span={16}>
                    <FileUpload
                      onUpload={onUpload}
                      beforeUpload={onProcessingStart}
                      action={`/api/import/${groupId || ''}/upload`}
                    />
                  </Col>
                </Row>
              )}
              {step === 2 && (
                <Row
                  justify='center'
                  align='middle'
                  style={{
                    height: '100%'
                  }}
                >
                  <Col span={8}>
                    <p>{t('Import Complete')}</p>
                  </Col>
                  <Col span={16}>
                    {layer_id && (
                      <Button type='primary' href={`/lyr/${layer_id}`}>
                        {t('Go to Layer')}
                      </Button>
                    )}
                    {map_id && (
                      <Button type='primary' href={`/map/view/${map_id}/`}>
                        {t('Go to Map')}
                      </Button>
                    )}
                  </Col>
                </Row>
              )}
            </Row>
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default ImportLayer
