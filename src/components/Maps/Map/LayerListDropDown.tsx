import React from 'react'
import LayerListStatic from './LayerListStatic'
import { DownOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
import { Layer } from '../../../types/layer'
import useMapT from '../hooks/useMapT'
type Props = {
  name: string
  layers: Array<Layer>
  toggleVisibility: (layer_id: number) => void
}

const LayerListDropDown = ({
  name,
  layers,
  toggleVisibility
}: Props): JSX.Element => {
  const { t } = useMapT()
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
export default LayerListDropDown
