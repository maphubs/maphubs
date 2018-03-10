// @flow
import React from 'react'
import MapHubsComponent from './MapHubsComponent'
import {Tooltip} from 'react-tippy'

type Props = {
  title: string,
  items: Array<Object>, // Array of objects with key, label, optional type, optional icon or avatar, and optional action button [{key,label, icon, image, actionIcon, actionLabel}]
  onDelete: Function,
  onAction: Function
}

export default class EditList extends MapHubsComponent<Props, void> {
  props: Props

  static defaultProps = {
    items: []
  }

  onDelete = (key: any) => {
    this.props
      .onDelete(key)
  }

  onAction = (key: any) => {
    this.props
      .onAction(key)
  }

  render () {
    const _this = this

    return (
      <ul className='collection with-header'>
        <li className='collection-header'>
          <h5>{this.props.title}</h5>
        </li>
        {this.props.items.map((item) => {
          let icon = ''
          let className = 'collection-item'
          if (item.image) {
            icon = (
              <img alt='' className='circle' src={item.image} />
            )
            className = 'collection-item avatar'
          } else if (item.icon) {
            icon = (
              <i className='material-icons circle'>{item.icon}</i>
            )
            className = 'collection-item avatar'
          }

          let action = ''
          if (item.actionIcon && item.actionLabel) {
            action = (
              <Tooltip title={item.actionLabel} position='bottom' inertia followCursor>
                <a>
                  <i className='material-icons' onClick={function () {
                    _this.onAction(item)
                  }} style={{cursor: 'pointer'}}>{item.actionIcon}</i>
                </a>
              </Tooltip>
            )
          }

          let type = ''
          if (item.type) {
            type = (
              <p>{item.type}</p>
            )
          }

          return (
            <li className={className} key={item.key}>
              {icon}
              <span className='title'>
                <b>{item.label}</b>
              </span>
              {type}
              <div className='secondary-content'>
                {action}
                <Tooltip title={_this._('Remove')} position='bottom' inertia followCursor>
                  <a>
                    <i className='material-icons'onClick={function () {
                      _this.onDelete(item)
                    }} style={{
                      cursor: 'pointer'
                    }}>delete</i>
                  </a>
                </Tooltip>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
}
