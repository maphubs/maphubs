import React, { useState } from 'react'
import { getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import Formsy from 'formsy-react'
import TextInput from '../../src/components/forms/textInput'
import Layout from '../../src/components/Layout'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  Modal,
  Tooltip,
  message,
  notification,
  Row,
  Col,
  Button,
  Typography,
  Table
} from 'antd'
import { MailFilled } from '@ant-design/icons'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import AccountIcon from '@material-ui/icons/AccountCircle'
import DeleteIcon from '@material-ui/icons/Delete'
import BlockIcon from '@material-ui/icons/Block'
import useT from '../../src/hooks/useT'

import UserModel from '../../src/models/user'
import { User } from '../../src/types/user'

const { confirm } = Modal
const { Title } = Typography

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (session.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {
      siteMembers: await UserModel.all()
    }
  }
}

const AdminUserInvite = ({
  siteMembers
}: {
  siteMembers: User[]
}): JSX.Element => {
  const { t } = useT()
  const [canSubmit, setCanSubmit] = useState(false)
  const [members, setMembers] = useState<User[]>(siteMembers)

  const onSubmit = (user: User) => {
    confirm({
      title: t('Confirm Invite'),
      content: t(`Are you sure you want to invite ${user.email}?`),
      okText: t('Send Invite'),
      okType: 'primary',

      onOk() {
        submitInvite(user)
      }
    })
  }

  const submitInvite = async (user: User) => {
    const email = user.email
    const closeMessage = message.loading(t('Sending'), 0)
    try {
      const response = await fetch('/api/admin/invite/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      })
      const result = await response.json()
      message.info(t('Invite Sent'), 3, () => {
        const membersUpdate = [...members]
        membersUpdate.push({
          id: result.user.id,
          email: user.email,
          role: 'member'
        })
        setMembers(membersUpdate)
      })
    } catch (err) {
      notification.error({
        message: t('Failed to Send Invite'),
        description: err.message,
        duration: 0
      })
    } finally {
      closeMessage()
    }
  }

  /*
  ! not currently supported
  ? not sure if this possible in Next Auth without a hack
  const resendInvite = (user: User) => {
    const key = user.key
    const closeMessage = message.loading(t('Sending'), 0)
    request
      .post('/admin/invite/resend')
      .type('json')
      .accept('json')
      .send({
        key
      })
      .end((err, res) => {
        checkClientError({
          res,
          err,
          onError: (err) => {
            closeMessage()

            if (err) {
              notification.error({
                message: t('Failed to Resend Invite'),
                description: err,
                duration: 0
              })
            } else {
              message.info(t('Resent Invite'), 3)
            }
          }
        })
      })
  }
 
  const handleResendInvite = (user: User) => {
    confirm({
      title: t('Confirm Resend Email'),
      content: t(
        `Are you sure you want to resend the invite email for ${user.email}?`
      ),
      okText: t('Send Invite'),
      okType: 'primary',

      onOk() {
        resendInvite(user)
      }
    })
  }
  */
  const handleDeauthorize = (user: User) => {
    confirm({
      title: t('Confirm Deauthorize'),
      content: t(
        `Are you sure you want to deauthorize access for ${user.email}?`
      ),
      okText: t('Deauthorize'),
      okType: 'danger',

      onOk() {
        submitDeauthorize(user)
      }
    })
  }
  const submitDeauthorize = async (user: User) => {
    const closeMessage = message.loading(t('Sending'), 0)
    try {
      const response = await fetch('/api/admin/invite/deauthorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user.id
        })
      })
      const result = await response.json()
      message.info(t('User Removed'), 3)
      setMembers(
        members.map((member) => {
          if (member.id === user.id) {
            member.role = 'disabled'
          }
          return member
        })
      )
    } catch (err) {
      notification.error({
        message: t('Failed to Deauthorize'),
        description: err,
        duration: 0
      })
    } finally {
      closeMessage()
    }
  }

  const columns = [
    {
      title: 'ID',
      width: 50,
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Role',
      width: 50,
      dataIndex: 'role',
      key: 'role',
      render: (text) => {
        return (
          <span>
            {text === 'admin' && (
              <SupervisorAccountIcon
                style={{
                  color: 'purple'
                }}
              />
            )}
            {text === 'member' && (
              <AccountIcon
                style={{
                  color: 'green'
                }}
              />
            )}
            {(!text || text === 'disabled') && (
              <BlockIcon
                style={{
                  color: 'red'
                }}
              />
            )}
          </span>
        )
      }
    },
    {
      title: 'Email',
      width: 250,
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => (
        <span>{record.email || record.invite_email}</span>
      )
    },
    {
      title: 'Action',
      width: 100,
      key: 'action',
      render: (text, record) => {
        return (
          <span>
            {record.role !== 'disabled' && record.role !== 'admin' && (
              <>
                <Tooltip title={t('Remove User')} placement='bottom'>
                  <a
                    onClick={() => {
                      handleDeauthorize(record)
                    }}
                  >
                    <DeleteIcon
                      style={{
                        cursor: 'pointer'
                      }}
                    />
                  </a>
                </Tooltip>
              </>
            )}
          </span>
        )
      }
    }
  ]
  return (
    <ErrorBoundary t={t}>
      <Layout title={t('Manage Users')} hideFooter>
        <div className='container' style={{ height: '100%' }}>
          <Title>{t('Manage Users')}</Title>
          <Row
            style={{
              marginBottom: '20px'
            }}
            justify='center'
            align='middle'
          >
            <Formsy
              onValidSubmit={onSubmit}
              onValid={() => {
                setCanSubmit(true)
              }}
              onInvalid={() => {
                setCanSubmit(false)
              }}
              style={{
                width: '100%',
                maxWidth: '800px'
              }}
            >
              <Row
                justify='center'
                align='top'
                style={{
                  height: '80px'
                }}
              >
                <Col sm={24} md={16}>
                  <TextInput
                    name='email'
                    label={t('Email to Invite')}
                    icon={<MailFilled />}
                    validations={{
                      isEmail: true
                    }}
                    validationErrors={{
                      isEmail: t('Not a valid email address.')
                    }}
                    length={50}
                    required
                    t={t}
                  />
                </Col>
                <Col
                  sm={24}
                  md={8}
                  style={{
                    padding: '0px 20px'
                  }}
                >
                  <Button
                    style={{
                      marginTop: '20px'
                    }}
                    type='primary'
                    htmlType='submit'
                    disabled={!canSubmit}
                  >
                    {t('Send Invite')}
                  </Button>
                </Col>
              </Row>
            </Formsy>
          </Row>
          <Row style={{ height: 'calc(100% - 100px)' }}>
            <AutoSizer>
              {({ height, width }) => (
                <div
                  style={{
                    height: `${height}px`,
                    width: `${width}px`
                  }}
                >
                  <Table
                    columns={columns}
                    dataSource={members}
                    bordered
                    size='small'
                    scroll={{
                      y: height - 100,
                      x: width
                    }}
                  />
                </div>
              )}
            </AutoSizer>
          </Row>
          <Row>
            <p>
              {t(
                'To delete a user please contact support@maphubs.com. Completely deleting a user may require deleting their content or reassigning their content to another user.'
              )}
            </p>
          </Row>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default AdminUserInvite
