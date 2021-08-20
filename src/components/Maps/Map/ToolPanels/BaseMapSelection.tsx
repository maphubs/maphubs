import React from 'react'
import type { BaseMapOption } from '../../redux/reducers/baseMapSlice'
import { GlobalOutlined } from '@ant-design/icons'
import { Row, Col, Avatar } from 'antd'
import useMapT from '../../hooks/useMapT'
import { useSelector } from '../../redux/hooks'

type Props = {
  onChange: (baseMap: string) => void
}
const BaseMapSelection = ({ onChange }: Props): JSX.Element => {
  const { t } = useMapT()

  const baseMap = useSelector((state) => state.baseMap.baseMap)
  const baseMapOptions = useSelector((state) => state.baseMap.baseMapOptions)

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100% - 50px)',
        overflow: 'auto',
        backgroundColor: 'white',
        textAlign: 'left',
        padding: '10px'
      }}
    >
      {baseMapOptions.map((baseMapOption: BaseMapOption) => {
        const selected = baseMap === baseMapOption.value
        return (
          <div
            key={baseMapOption.value}
            style={{
              border: selected ? '1px solid #323333' : '1px solid #d9d9d9',
              backgroundColor: selected ? '#fff' : '#eee',
              marginBottom: '5px',
              padding: '5px',
              cursor: !selected ? 'pointer' : 'inherit'
            }}
            onClick={() => {
              if (!selected) onChange(baseMapOption.value)
            }}
          >
            <Row>
              <Col span={6}>
                {baseMapOption.icon && (
                  <Avatar shape='square' size={64} src={baseMapOption.icon} />
                )}
                {!baseMapOption.icon && (
                  <Avatar shape='square' size={64} icon={<GlobalOutlined />} />
                )}
              </Col>
              <Col
                span={18}
                style={{
                  paddingLeft: '5px'
                }}
              >
                <p
                  style={{
                    marginBottom: '0.5em'
                  }}
                >
                  <b>{t(baseMapOption.label)}</b>
                </p>
                <p
                  style={{
                    fontSize: '12px'
                  }}
                >
                  <span
                    className='no-margin no-padding'
                    dangerouslySetInnerHTML={{
                      __html: baseMapOption.attribution
                    }}
                  />
                </p>
              </Col>
            </Row>
          </div>
        )
      })}
    </div>
  )
}
export default BaseMapSelection
