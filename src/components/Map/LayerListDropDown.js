// @flow
import React from 'react'
import LayerListStatic from './LayerListStatic'
import { Dropdown, Icon } from 'antd'

type Props = {
  name: string,
  layers: Array<Object>,
  toggleVisibility: Function,
  t: Function
}

export default class LayerListDropDown extends React.PureComponent<Props, void> {
  render () {
    const {name, layers, toggleVisibility, t} = this.props
    return (
      <div style={{height: '35px'}}>
        <Dropdown
          style={{padding: 0}}
          overlay={
            <LayerListStatic layers={layers} toggleVisibility={toggleVisibility} t={t} />
          }
          trigger={['click']}
        >
          <span className='ant-dropdown-link' style={{cursor: 'pointer', height: '35px', lineHeight: '35px'}}>
            {t(name)} <Icon type='down' />
          </span>
        </Dropdown>
      </div>
    )
  }
}
