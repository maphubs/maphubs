import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/client'
import Formsy from 'formsy-react'
import {
  message,
  notification,
  Modal,
  Row,
  Col,
  Button,
  PageHeader,
  Card,
  Divider
} from 'antd'
import EditList from '../../../src/components/EditList'
import Layout from '../../../src/components/Layout'
import MultiTextArea from '../../../src/components/forms/MultiTextArea'
import MultiTextInput from '../../../src/components/forms/MultiTextInput'
import ImageCrop from '../../../src/components/ImageCrop'
import Locales from '../../../src/services/locales'
import LayerList from '../../../src/components/Lists/LayerList'
import MapList from '../../../src/components/Lists/MapList'
import ErrorBoundary from '../../../src/components/ErrorBoundary'
import FloatingButton from '../../../src/components/FloatingButton'
import Delete from '@material-ui/icons/Delete'
import InfoIcon from '@material-ui/icons/Info'
import DescriptionIcon from '@material-ui/icons/Description'
import DebugService from '@bit/kriscarle.maphubs-utils.maphubs-utils.debug'
import { Group } from '../../../src/types/group'
import useT from '../../../src/hooks/useT'
import mutation from '../../../src/graphql/graphql-mutation'

// SSR only
import GroupModel from '../../../src/models/group'
import LayerModel from '../../../src/models/layer'
import MapModel from '../../../src/models/map'
import StoryModel from '../../../src/models/story'
import { Map } from '../../../src/types/map'
import { Layer } from '../../../src/types/layer'
import urlUtil from '../../../src/services/url-util'
import { rotate } from 'easyimage'

const { confirm } = Modal
const debug = DebugService('views/GroupAdmin')

type Props = {
  group: Group
  initialJoinCode: string
  layers: Layer[]
  maps: Map[]
  members: Array<Record<string, any>>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const group_id = context.params.group_id as string
  const group = await GroupModel.getGroupByID(group_id)
  const session = await getSession(context)
  let allowedToModifyGroup
  const user_id = Number.parseInt(session.sub)
  if (session?.user) {
    allowedToModifyGroup = await GroupModel.allowedToModify(
      group.group_id,
      user_id
    )
  }
  if (!group || !allowedToModifyGroup) {
    return {
      notFound: true
    }
  }

  // confirm that this user is allowed to administer this group
  const role = await GroupModel.getGroupRole(user_id, group_id)
  return role === 'Administrator'
    ? {
        props: {
          group,
          initialJoinCode: await GroupModel.getJoinCode(group_id),
          maps: await MapModel.getGroupMaps(group_id),
          layers: await LayerModel.getGroupLayers(
            group_id,
            allowedToModifyGroup
          ),
          stories: await StoryModel.getGroupStories(
            group_id,
            allowedToModifyGroup
          ),
          members: await GroupModel.getGroupMembers(group_id),
          allowedToModifyGroup
        }
      }
    : {
        notFound: true
      }
}
const GroupAdmin = ({
  group,
  members,
  layers,
  maps,
  initialJoinCode
}: Props): JSX.Element => {
  const { t } = useT()
  const router = useRouter()
  const [canSubmit, setCanSubmit] = useState(false)
  const [showImageCrop, setShowImageCrop] = useState(false)
  const [joinCode, setJoinCode] = useState(initialJoinCode)

  const submit = async (model: Record<string, any>) => {
    const group_id = group.group_id
    model.name = Locales.formModelToLocalizedString(model, 'name')
    model.description = Locales.formModelToLocalizedString(model, 'description')
    try {
      await mutation(`
          saveGroup(group_id: "${model.group_id}", name: "${JSON.stringify(
        JSON.stringify(model.name)
      )}", description: "${JSON.stringify(JSON.stringify(model.description))}")
        `)
      message.info(t('Group Saved'), 3, () => {
        router.push(`/group/${group_id || ''}`)
      })
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }

  const handleMemberDelete = (user: Record<string, any>) => {
    confirm({
      title: t('Confirm Removal'),
      content: `${t('Please confirm removal of')} ${user.label}`,
      okText: t('Remove'),
      okType: 'danger',
      cancelText: t('Cancel'),

      async onOk() {
        try {
          await mutation(`
        removeGroupMember(group_id: "${group.group_id}", user_id: ${user.key})
        `)
          message.info(t('Member Removed'), 7)
        } catch (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString(),
            duration: 0
          })
        }
      }
    })
  }

  const handleGroupDelete = () => {
    confirm({
      title: t('Confirm Deletion'),
      content: `${t('Please confirm removal of')} ${t(group.name)}`,
      okText: t('Delete'),
      okType: 'danger',
      cancelText: t('Cancel'),

      async onOk() {
        try {
          await mutation(`
            deleteGroup(group_id: "${group.group_id}")
          `)
          message.info(t('Group Deleted'), 3, () => {
            router.push('/groups')
          })
        } catch (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString(),
            duration: 0
          })
        }
      }
    })
  }
  const handleMemberMakeAdmin = (user: Record<string, any>) => {
    if (user.type === 'Administrator') {
      handleRemoveMemberAdmin(user)
    } else {
      confirm({
        title: t('Confirm Administrator'),
        content:
          t(
            'Please confirm that you want to make this user an Administrator: '
          ) + user.label,
        okType: 'danger',

        async onOk() {
          try {
            await mutation(`
            setGroupMemberRole(group_id: "${group.group_id}", user_id: ${user.key}, admin: true)
            `)
            message.info(t('Member is now an Administrator'), 7)
          } catch (err) {
            notification.error({
              message: t('Server Error'),
              description: err.message || err.toString(),
              duration: 0
            })
          }
        }
      })
    }
  }
  const handleRemoveMemberAdmin = (user: Record<string, any>) => {
    confirm({
      title: t('Confirm Remove Administrator'),
      content:
        t(
          'Please confirm that you want to remove Administrator permissions for '
        ) +
        user.label +
        '.',
      okType: 'danger',

      async onOk() {
        try {
          await mutation(`
          setGroupMemberRole(group_id: "${group.group_id}", user_id: ${user.key}, admin: false)
          `)
          message.info(t('Member is no longer an Administrator'), 7)
        } catch (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString(),
            duration: 0
          })
        }
      }
    })
  }
  const rotateJoinLink = async () => {
    confirm({
      title: t('Confirm Link Change'),
      content: t(`This will create a new link and disabled the current link.`),
      okText: t('New Link'),
      okType: 'danger',
      cancelText: t('Cancel'),

      async onOk() {
        try {
          const result = await mutation(`
          rotateJoinCode(group_id: "${group.group_id}")
          `)
          setJoinCode(result.rotateJoinCode)
          message.info(t('Join Link Updated'), 7)
        } catch (err) {
          notification.error({
            message: t('Server Error'),
            description: err.message || err.toString(),
            duration: 0
          })
        }
      }
    })
  }

  const onCrop = async (data: string) => {
    // send data to server
    setShowImageCrop(false)
    try {
      await mutation(`
      setGroupImage(group_id: "${group.group_id}", image: "${data}")
      `)
      message.success(t('Image Saved'), 3)
    } catch (err) {
      notification.error({
        message: t('Server Error'),
        description: err.message || err.toString(),
        duration: 0
      })
    }
  }

  const groupId = group.group_id || ''
  const membersList = members.map((user) => {
    return {
      key: user.id,
      label: user.email,
      type: user.role,
      image: user.image
    }
  })

  const writeToClipboard = (): void => {
    if (joinCode)
      navigator.clipboard.writeText(
        `${urlUtil.getBaseUrl()}/group/${group.group_id}/join/${joinCode}`
      )
    message.info(t('Copied to Clipboard'))
  }

  const groupUrl = `/group/${groupId}`
  return (
    <ErrorBoundary t={t}>
      <Layout title={t(group.name)} hideFooter>
        <div>
          <div className='container'>
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <PageHeader
                onBack={() => {
                  router.push(groupUrl)
                }}
                style={{
                  padding: '5px'
                }}
                title={t('Back to Group')}
              />
            </Row>
            <Row
              style={{
                marginTop: '20px',
                marginBottom: '20px'
              }}
            >
              <Col sm={24} md={12}>
                <img
                  alt={t('Group Photo')}
                  width='300'
                  src={'/api/group/' + groupId + '/image.png?' + Date.now()}
                />
              </Col>
              <Col sm={24} md={12}>
                <Button
                  type='primary'
                  onClick={() => {
                    setShowImageCrop(true)
                  }}
                >
                  {t('Change Image')}
                </Button>
              </Col>
            </Row>
            <Divider />
            <Row
              justify='center'
              style={{
                marginBottom: '20px'
              }}
            >
              <Formsy
                onValidSubmit={submit}
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
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <MultiTextInput
                    inputName='name'
                    id='name'
                    label={{
                      en: 'Name',
                      fr: 'Nom',
                      es: 'Nombre',
                      it: 'Nome',
                      id: 'Nama',
                      pt: 'Nome'
                    }}
                    icon={<InfoIcon />}
                    validations='maxLength:100'
                    validationErrors={{
                      maxLength: t('Must be 100 characters or less.')
                    }}
                    length={100}
                    tooltipPosition='top'
                    tooltip={t('Short Descriptive Name for the Group')}
                    initialValue={group.name}
                    required
                  />
                </Row>
                <Row
                  style={{
                    marginBottom: '20px'
                  }}
                >
                  <MultiTextArea
                    name='description'
                    label={{
                      en: 'Description',
                      fr: 'Description',
                      es: 'Descripción',
                      it: 'Descrizione',
                      id: 'Deskripsi',
                      pt: 'Descrição'
                    }}
                    icon={<DescriptionIcon />}
                    validations='maxLength:500'
                    validationErrors={{
                      maxLength: t(
                        'Description must be 500 characters or less.'
                      )
                    }}
                    length={500}
                    tooltipPosition='top'
                    tooltip={t('Brief Description of the Group')}
                    value={group.description}
                    required
                  />
                </Row>
                <div
                  style={{
                    float: 'right'
                  }}
                >
                  <Button htmlType='submit' name='action' disabled={!canSubmit}>
                    {t('Update')}
                  </Button>
                </div>
              </Formsy>
            </Row>
            <Divider />
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Col
                sm={24}
                md={12}
                style={{
                  padding: '2px'
                }}
              >
                <EditList
                  title='Members'
                  items={membersList}
                  onDelete={handleMemberDelete}
                  onAction={handleMemberMakeAdmin}
                />
              </Col>
              <Col
                sm={24}
                md={12}
                style={{
                  padding: '2px'
                }}
              >
                <Card
                  title={<b>{t('Group Member Invite Link')}</b>}
                  size='small'
                >
                  <p>
                    {t(
                      'Share this link with people you want to join this group.'
                    )}
                  </p>
                  <pre>{`${urlUtil.getBaseUrl()}/group/${
                    group.group_id
                  }/join/${joinCode}`}</pre>

                  <p>
                    {t(
                      'On password-protected sites, they will first need an account on the site, contact your site administrator for help inviting new users.'
                    )}
                  </p>
                  <Row justify='space-between'>
                    <Button type='primary' onClick={writeToClipboard}>
                      {t('Copy Link')}
                    </Button>
                    <Button type='primary' danger onClick={rotateJoinLink}>
                      {t('New Link')}
                    </Button>
                  </Row>
                </Card>
              </Col>
            </Row>
            <Divider />
            <Row
              style={{
                marginBottom: '20px'
              }}
            >
              <Col
                sm={24}
                md={12}
                style={{
                  padding: '2px'
                }}
              >
                <LayerList layers={layers} groups={[group]} />
              </Col>
              <Col
                sm={24}
                md={12}
                style={{
                  padding: '2px'
                }}
              >
                <MapList maps={maps} groups={[group]} />
              </Col>
            </Row>
            <FloatingButton
              onClick={handleGroupDelete}
              tooltip={t('Delete Group')}
              style={{
                color: '#fff',
                backgroundColor: 'red'
              }}
              icon={<Delete />}
            />
          </div>
          <ImageCrop
            visible={showImageCrop}
            onCancel={() => {
              setShowImageCrop(false)
            }}
            aspectRatio={1}
            lockAspect
            resize_width={600}
            resize_height={600}
            onCrop={onCrop}
          />
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
export default GroupAdmin
