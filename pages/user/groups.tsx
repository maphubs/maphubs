import React from 'react'
import { Row, Result, Button, Typography } from 'antd'
import GroupIcon from '@material-ui/icons/Group'
import Layout from '../../src/components/Layout'
import CardCarousel from '../../src/components/CardCarousel/CardCarousel'
// var debug = require('@bit/kriscarle.maphubs-utils.maphubs-utils.debug')('usermaps');
import cardUtil from '../../src/services/card-util'
import type { Group } from '../../src/types/group'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import FloatingButton from '../../src/components/FloatingButton'
import getConfig from 'next/config'
import useT from '../../src/hooks/useT'
import useSWR from 'swr'
import useStickyResult from '../../src/hooks/useStickyResult'

const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Title } = Typography
type Props = {
  groups: Array<Group>
  canEdit: boolean
}

const MyGroups = (): JSX.Element => {
  const { t } = useT()

  const { data } = useSWR(
    `
 {
  userGroups {
    group_id
    name
    description
    hasimage
  }
 }
 `
  )
  const stickyData: {
    userGroups: Group[]
  } = useStickyResult(data) || {}
  const { userGroups } = stickyData

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('')}>
        <div
          style={{
            marginLeft: '10px',
            marginRight: '10px'
          }}
        >
          <Title level={2}>{t('My Groups')}</Title>
          {userGroups?.length > 0 && (
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <CardCarousel
                cards={userGroups.map((group) => cardUtil.getGroupCard(group))}
              />
            </Row>
          )}
          {(!userGroups || userGroups.length === 0) && (
            <Row
              style={{
                height: 'calc(100% - 100px)',
                marginBottom: '20px'
              }}
            >
              <Result
                style={{
                  margin: 'auto'
                }}
                icon={
                  <GroupIcon
                    style={{
                      color: MAPHUBS_CONFIG.primaryColor,
                      fontSize: '72px'
                    }}
                  />
                }
                title={t('Click the button below to create your first group')}
                extra={
                  <Button type='primary' href='/creategroup'>
                    {t('Create New Group')}
                  </Button>
                }
              />
            </Row>
          )}

          <FloatingButton
            onClick={() => {
              window.location.assign('/create/group')
            }}
            tooltip={t('Create New Group')}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default MyGroups
