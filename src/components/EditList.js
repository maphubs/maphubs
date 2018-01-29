// @flow
import React from 'react'

type Props = {
  title: string,
  items: Array<Object>, // Array of objects with key, label, optional type, optional icon or avatar, and optional action button [{key,label, icon, image, actionIcon, actionLabel}]
  onDelete: Function,
  onAction: Function,
  onError: Function
}

export default class EditList extends React.Component<Props> {
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
              <a className='tooltipped' data-delay='50' data-position='bottom' data-tooltip={item.actionLabel}>
                <i className='material-icons' onClick={function () {
                  _this.onAction(item)
                }} style={{cursor: 'pointer'}}>{item.actionIcon}</i>
              </a>
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
                <a className='tooltipped' data-delay='50' data-position='bottom' data-tooltip='Remove' >
                  <i className='material-icons'onClick={function () {
                    _this.onDelete(item)
                  }} style={{
                    cursor: 'pointer'
                  }}>delete</i>
                </a>
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
}
