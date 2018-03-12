// @flow
import React from 'react'
import _isequal from 'lodash.isequal'
import MapHubsComponent from '../MapHubsComponent'

type Props = {|
  attributes: Object,
  children: any
|}

export default class Attributes extends MapHubsComponent<Props, void> {
  props: Props

  shouldComponentUpdate (nextProps: Props) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    return false
  }

  render () {
    const _this = this

    const spacer = (<div style={{height: '50px'}} />)

    let display = ''

    if (_this.props.attributes && Object.keys(_this.props.attributes).length > 0) {
      let presets
      if (this.props.attributes['maphubs_metadata'] &&
          this.props.attributes['maphubs_metadata'].presets) {
        presets = this.props.attributes['maphubs_metadata'].presets
      }
      if (presets && Array.isArray(presets) && presets.length > 0) {
        // only display presets
        display = (
          <ul className='collection' style={{marginTop: 0}}>
            {
              presets.map((preset) => {
                if (typeof preset.showOnMap !== 'undefined' && preset.showOnMap === false) return ''
                let val = _this.props.attributes[preset.tag]
                if (!val || (typeof val === 'string' && val === 'null')) return ''
                if (typeof val === 'string' && val.startsWith('http')) {
                  val = (<a target='_blank' rel='noopener noreferrer' href={val}>{val}</a>)
                }

                return (
                  <li key={preset.tag} style={{paddingLeft: '5px', paddingRight: '5px', paddingTop: 0, paddingBottom: 0}} className='collection-item attribute-collection-item'>
                    <p style={{color: 'rgb(158, 158, 158)', fontSize: '11px'}}>{this._o_(preset.label)}</p>
                    <p className='word-wrap'>
                      {val}
                    </p>
                  </li>
                )
              })
            }
          </ul>

        )
      } else {
        display = (
          <ul className='collection' style={{marginTop: 0}}>
            {photo}
            {
              Object.keys(_this.props.attributes).map((key) => {
                if (key !== 'mhid' &&
                        key !== 'layer_id' &&
                        key !== 'maphubs_metadata' &&
                        key !== 'maphubs_host') {
                  let val = _this.props.attributes[key]

                  if (!val) {
                    return ''
                  }

                  if (typeof val !== 'string') {
                    val = val.toString()
                  }

                  if (typeof val === 'string' && val.startsWith('http')) {
                    val = (<a target='_blank' rel='noopener noreferrer' href={val}>{val}</a>)
                  }

                  return (
                    <li key={key} style={{padding: 5}} className='collection-item attribute-collection-item'>
                      <p style={{color: 'rgb(158, 158, 158)', fontSize: '11px'}}>{key}</p>
                      <p className='word-wrap'>
                        {val}
                      </p>
                    </li>
                  )
                }
              })
            }

          </ul>

        )
      }
    }

    return (
      <div style={{width: '100%', overflowY: 'auto', height: '100%', borderTop: '1px solid #DDD'}}>
        {display}
        {spacer}
        {this.props.children}
      </div>
    )
  }
}
