// @flow
import React from 'react'
import { Tooltip, List, Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import DeleteIcon from '@material-ui/icons/Delete'
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount'

type Props = {
  title: string,
  items: Array<Object>, // Array of objects with key, label, optional type, optional icon or avatar, and optional action button [{key,label, icon, image, actionIcon, actionLabel}]
  onDelete: Function,
  onAction: Function,
  t: Function
}

export default class EditList extends React.Component<Props, void> {
  static defaultProps = {
    items: []
  }

  onDelete = (key: any) => {
    this.props.onDelete(key)
  }

  onAction = (key: any) => {
    this.props.onAction(key)
  }

  render () {
    const {t, title, items} = this.props
    const _this = this

    return (
      <List
        header={<b>{title}</b>}
        dataSource={items}
        bordered
        renderItem={item => {
          const adminAction = (
            <Tooltip title={t('Add/Remove Administrator Access')} placement='bottom'>
              <a>
                <SupervisorAccountIcon
                  onClick={() => {
                    _this.onAction(item)
                  }} style={{cursor: 'pointer'}}
                />
              </a>
            </Tooltip>
          )

          return (
            <List.Item
              actions={[
                adminAction,
                <Tooltip key='remove' title={t('Remove')} placement='bottom'><a><DeleteIcon onClick={() => { _this.onDelete(item) }} /></a></Tooltip>
              ]}

            >
              <List.Item.Meta
                avatar={
                  item.image ? <Avatar src={item.image} /> : <Avatar size={32} icon={<UserOutlined />} />
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
}
