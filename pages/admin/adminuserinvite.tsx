import React, { useState } from 'react'
import { getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import Formsy from 'formsy-react'
import TextInput from '../../src/components/forms/textInput'
import Layout from '../../src/components/Layout'
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
import request from 'superagent'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import WarningIcon from '@material-ui/icons/Warning'
import DoneIcon from '@material-ui/icons/Done'
import EmailIcon from '@material-ui/icons/Email'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import LinkIcon from '@material-ui/icons/Link'
import DeleteIcon from '@material-ui/icons/Delete'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import { checkClientError } from '../../src/services/client-error-response'
import useT from '../../src/hooks/useT'

import AdminModel from '../../src/models/admin'

const { confirm } = Modal
const { Title } = Typography

type User = {
  email: string
  key: string
  used: boolean
  invite_email: string
  display_name?: string
  id?: number
  admin?: boolean
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (!session.user.admin) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {
      siteMembers: await AdminModel.getMembers()
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
  const copyInviteLink = (user: User) => {
    const baseUrl = urlUtil.getBaseUrl()
    const url = `${baseUrl}/signup/invite/${user.key}`
    navigator.clipboard.writeText(url)
    message.info(t('Copied'))
  }
  const submitInvite = (user: User) => {
    const email = user.email || user.invite_email
    const closeMessage = message.loading(t('Sending'), 0)
    request
      .post('/admin/invite/send')
      .type('json')
      .accept('json')
      .send({
        email
      })
      .end((err, res) => {
        checkClientError(
          res,
          err,
          (err) => {
            const key = res.body.key
            closeMessage()

            if (err) {
              notification.error({
                message: t('Failed to Send Invite'),
                description: err,
                duration: 0
              })
            } else {
              message.info(t('Invite Sent'), 3, () => {
                const membersUpdate = [...members]
                membersUpdate.push({
                  email: user.email,
                  invite_email: user.email,
                  key,
                  used: false
                })
                setMembers(membersUpdate)
              })
            }
          },
          (cb) => {
            cb()
          }
        )
      })
  }
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
        checkClientError(
          res,
          err,
          (err) => {
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
          },
          (cb) => {
            cb()
          }
        )
      })
  }
  const handleResendInvite = (user: User) => {
    confirm({
      title: t('Confirm Resend Email'),
      content: t(
        `Are you sure you want to resend the invite email for ${user.invite_email}?`
      ),
      okText: t('Send Invite'),
      okType: 'primary',

      onOk() {
        resendInvite(user)
      }
    })
  }
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
  const submitDeauthorize = (user: User) => {
    const closeMessage = message.loading(t('Sending'), 0)
    request
      .post('/admin/invite/deauthorize')
      .type('json')
      .accept('json')
      .send({
        email: user.email,
        key: user.key
      })
      .end((err, res) => {
        checkClientError(
          res,
          err,
          (err) => {
            closeMessage()

            if (err) {
              notification.error({
                message: t('Failed to Deauthorize'),
                description: err,
                duration: 0
              })
            } else {
              message.info(t('User Removed'), 3)
              const membersUpdate = []

              for (const member of members) {
                if (member.key !== user.key) {
                  members.push(member)
                }
              }
              setMembers(membersUpdate)
            }
          },
          (cb) => {
            cb()
          }
        )
      })
  }

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        let status = 'Disabled'
        let icon = (
          <WarningIcon
            style={{
              color: 'red'
            }}
          />
        )

        if (record.key) {
          if (record.used) {
            status = 'Active'
            icon = (
              <DoneIcon
                style={{
                  color: 'green'
                }}
              />
            )
          } else {
            status = 'Invite Sent'
            icon = (
              <EmailIcon
                style={{
                  color: 'orange'
                }}
              />
            )
          }
        }

        if (record.admin) {
          status = 'Admin'
          icon = (
            <SupervisorAccountIcon
              style={{
                color: 'purple'
              }}
            />
          )
        }

        return (
          <span>
            <Tooltip title={status} placement='bottom'>
              {icon}
            </Tooltip>
          </span>
        )
      }
    },
    {
      title: 'Username',
      dataIndex: 'display_name',
      key: 'username'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => (
        <span>{record.email || record.invite_email}</span>
      )
    },
    {
      title: 'Invite Key',
      key: 'key',
      dataIndex: 'key'
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        let status = 'Disabled'

        if (record.key) {
          status = record.used ? 'Active' : 'Invite Sent'
        }

        if (record.admin) {
          status = 'Admin'
        }

        return (
          <span>
            {status !== 'Disabled' && status !== 'Admin' && (
              <>
                <Tooltip title={t('Resend Invite')} placement='bottom'>
                  <a
                    onClick={() => {
                      handleResendInvite(record)
                    }}
                  >
                    <EmailIcon
                      style={{
                        cursor: 'pointer'
                      }}
                    />
                  </a>
                </Tooltip>
                <Tooltip title={t('Copy Invite Link')} placement='bottom'>
                  <a
                    onClick={() => {
                      copyInviteLink(record)
                    }}
                  >
                    <LinkIcon
                      style={{
                        cursor: 'pointer'
                      }}
                    />
                  </a>
                </Tooltip>
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
        <div className='container'>
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
          <Row>
            <Table columns={columns} dataSource={members} />
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
