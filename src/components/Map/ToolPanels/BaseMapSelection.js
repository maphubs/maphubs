// @flow
import React from 'react'
import Radio from '../../forms/radio'
import Formsy from 'formsy-react'
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
            <div style={{width: '100%', marginRight: '10px', backgroundColor: 'white', textAlign: 'left'}}>
              <Formsy>
                <h6>{t('Choose a Base Map')}</h6>
                <Radio name='baseMap' label='' className='base-map-selection'
                  defaultValue={BaseMap.state.baseMap}
                  options={radioOptions} onChange={this.onChange}
                />
              </Formsy>
            </div>
          )
        }}
      </Subscribe>
    )
  }
}
