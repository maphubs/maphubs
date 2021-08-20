import React from 'react'
import { Tooltip, List, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import DeleteIcon from '@material-ui/icons/Delete'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'
import useT from '../hooks/useT'
type Item = {
  image?: string
  type: string
  label: string
}
type Props = {
  title: string
  items: Array<Item>
  // Array of objects with key, label, optional type, optional icon or avatar, and optional action button [{key,label, icon, image, actionIcon, actionLabel}]
  onDelete: (item: Item) => void
  onAction: (item: Item) => void
}

const EditList = ({ title, items, onDelete, onAction }: Props): JSX.Element => {
  const { t } = useT()
  return (
    <List
      header={<b>{title}</b>}
      dataSource={items}
      bordered
      renderItem={(item) => {
        const adminAction = (
          <Tooltip
            title={t('Add/Remove Administrator Access')}
            placement='bottom'
          >
            <a>
              <SupervisorAccountIcon
                onClick={() => {
                  onAction(item)
                }}
                style={{
                  cursor: 'pointer'
                }}
              />
            </a>
          </Tooltip>
        )
        return (
          <List.Item
            actions={[
              adminAction,
              <Tooltip key='remove' title={t('Remove')} placement='bottom'>
                <a>
                  <DeleteIcon
                    onClick={() => {
                      onDelete(item)
                    }}
                  />
                </a>
              </Tooltip>
            ]}
          >
            <List.Item.Meta
              avatar={
                item.image ? (
                  <Avatar src={item.image} />
                ) : (
                  <Avatar size={32} icon={<UserOutlined />} />
                )
              }
              title={item.label}
              description={item.type}
            />
          </List.Item>
        )
      }}
    />
  )
}
EditList.defaultProps = {
  items: []
}
export default EditList
