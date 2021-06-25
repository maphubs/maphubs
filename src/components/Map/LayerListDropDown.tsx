import type { Element } from 'React'
import React from 'react'
import LayerListStatic from './LayerListStatic'
import { DownOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
type Props = {
  name: string
  layers: Array<Record<string, any>>
  toggleVisibility: (...args: Array<any>) => any
  t: (...args: Array<any>) => any
}
export default class LayerListDropDown extends React.Component<Props, void> {
  shouldComponentUpdate(): boolean {
    return false
  }

  render(): Element<'div'> {
    const { name, layers, toggleVisibility, t } = this.props
    return (
      <div
        style={{
          height: '35px'
        }}
      >
        <Dropdown
          style={{
            padding: 0
          }}
          overlay={
            <LayerListStatic
              layers={layers}
              toggleVisibility={toggleVisibility}
              t={t}
            />
          }
          trigger={['click']}
          getPopupContainer={(trigger) => trigger.parentNode}
        >
          <span
            className='ant-dropdown-link'
            style={{
              cursor: 'pointer',
              height: '35px',
              lineHeight: '35px'
            }}
          >
            {t(name)} <DownOutlined />
          </span>
        </Dropdown>
      </div>
    )
  }
}