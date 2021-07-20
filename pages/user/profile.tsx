import React from 'react'
import { useSession } from 'next-auth/client'
import Layout from '../../src/components/Layout'
import { Typography } from 'antd'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import useT from '../../src/hooks/useT'

const { Title } = Typography

const UserProfile = (): JSX.Element => {
  const [session] = useSession()
  const { t } = useT()

  const user = session.user

  return (
    <ErrorBoundary t={t}>
      <Layout title={t('User Profile')}>
        <div className='container'>
          <Title>{t('User Profile')}</Title>
          <div id='profile'>
            <p>
              <b>{t('User Name')}: </b>
              {user.name}
            </p>
            <p>
              <b>{t('Email')}: </b>
              {user.email}
            </p>
            <div>
              <img
                className='circle'
                style={{
                  width: '250px',
                  height: '250px'
                }}
                src={user.image}
              />
            </div>
            <p>{t('More user profile settings coming soon!')}</p>
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default UserProfile
