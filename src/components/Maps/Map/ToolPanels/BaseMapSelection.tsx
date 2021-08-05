import React from 'react'
import { Subscribe } from 'unstated'
import BaseMapContainer from '../containers/BaseMapContainer'
import type { BaseMapOption } from '../containers/BaseMapContainer'
import { GlobalOutlined } from '@ant-design/icons'
import { Row, Col, Avatar } from 'antd'
import { LocalizedString } from '../../../types/LocalizedString'
type Props = {
  onChange: (baseMap: string) => void
  t: (v: string | LocalizedString) => string
}
const BaseMapSelection = ({ t, onChange }: Props): JSX.Element => {
  return (
    <Subscribe to={[BaseMapContainer]}>
      {(BaseMap) => {
        const { baseMapOptions, baseMap } = BaseMap.state
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
                    border: selected
                      ? '1px solid #323333'
                      : '1px solid #d9d9d9',
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
                        <Avatar
                          shape='square'
                          size={64}
                          src={baseMapOption.icon}
                        />
                      )}
                      {!baseMapOption.icon && (
                        <Avatar
                          shape='square'
                          size={64}
                          icon={<GlobalOutlined />}
                        />
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
      }}
    </Subscribe>
  )
}
export default BaseMapSelection
