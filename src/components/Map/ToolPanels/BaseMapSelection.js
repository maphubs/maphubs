// @flow
import React from 'react'
import { Subscribe } from 'unstated'
import BaseMapContainer from '../containers/BaseMapContainer'
import type {BaseMapOption} from '../containers/BaseMapContainer'

type Props = {
  onChange: Function,
  t: Function
}

export default class BaseMapSelection extends React.Component<Props, void> {
  onChange = (val: string) => {
    this.props.onChange(val)
  }

  render () {
    const {t} = this.props

    return (
      <Subscribe to={[BaseMapContainer]}>
        {BaseMap => {
          const {baseMapOptions} = BaseMap.state
          const radioOptions:Array<{value: string, label: string}> = []
          if (baseMapOptions && Array.isArray(BaseMap.state.baseMapOptions)) {
            baseMapOptions.forEach((baseMapOption: BaseMapOption) => {
              radioOptions.push({value: baseMapOption.value, label: t(baseMapOption.label)})
            })
          }
          return (
            <div style={{width: '100%', backgroundColor: 'white', textAlign: 'left'}}>
              {baseMapOptions.map((baseMapOption: BaseMapOption) => {
                let selected = (BaseMap.state.baseMap === baseMapOption.value)
                return (
                  <div style={{border: '1px solid #212121', marginBottom: '5px', padding: '5px'}}>
                    <span>{t(baseMapOption.label)}</span>
                    <style jsx>{`
                      input {
                        position: relative !important;
                        opacity: 100 !important;
                        pointer-events: auto !important;
                        float: left;
                        margin-right: 20px;
                      }
                    `}
                    </style>
                    {selected &&
                      <input type='checkbox' value={baseMapOption.value} checked />
                    }
                    {!selected &&
                      <input type='checkbox' value={baseMapOption.value} onClick={() => { this.onChange(baseMapOption.value) }} />
                    }
                  </div>
                )
              })}
            </div>
          )
        }}
      </Subscribe>
    )
  }
}
