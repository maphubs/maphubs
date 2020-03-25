// @flow
import React from 'react'
import { Row } from 'antd'
import Formsy from 'formsy-react'
import Toggle from '../forms/toggle'
import Select from '../forms/select'
import MapStyles from '../Map/Styles'
import MapHubsComponent from '../MapHubsComponent'
import _isequal from 'lodash.isequal'

type Labels = {
  enabled: boolean,
  field: string
}

type Props = {|
  onChange: Function,
  layer: Object,
  style: Object,
  labels: Labels
|}

type State = {
  style: Object,
  enabled: boolean,
  field: string
}

export default class LabelSettings extends MapHubsComponent<Props, State> {
  static defaultProps = {
    labels: {
      enabled: false,
      field: ''
    }
  }

  constructor (props: Props) {
    super(props)
    let enabled = false
    let field: string = ''
    if (props.labels) {
      enabled = !!props.labels.enabled
      field = props.labels.field
    }

    this.state = {
      style: props.style,
      enabled,
      field
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({style: nextProps.style})
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }
    if (!_isequal(this.state, nextState)) {
      return true
    }
    return false
  }

   onFormChange = (values: Object) => {
     let style
     if (values.enabled && values.field) {
       // add labels to style
       style = MapStyles.labels.addStyleLabels(this.state.style, values.field, this.props.layer.layer_id, this.props.layer.shortid, this.props.layer.data_type)
       this.setState({style, enabled: true, field: values.field})
       this.props.onChange(style, values)
     } else if (values.enabled && !values.field) {
       this.setState({enabled: true})
     } else {
       // remove labels from style
       style = MapStyles.labels.removeStyleLabels(this.state.style)
       this.setState({style, enabled: false})
       this.props.onChange(style, values)
     }
   }

   render () {
     const {t} = this
     const {layer} = this.props
     const {enabled, field} = this.state
     const fieldOptions = []

     let presets
     if (layer.style && layer.style.sources) {
       const sourceKeys = Object.keys(layer.style.sources)
       if (sourceKeys && sourceKeys.length > 0) {
         const firstSource = Object.keys(layer.style.sources)[0]
         presets = MapStyles.settings.getSourceSetting(this.props.style, firstSource, 'presets')
       }
     }

     if (presets) {
       presets.forEach((preset) => {
         fieldOptions.push({
           value: preset.tag,
           label: t(preset.label)
         })
       })
     } else {
       return (
         <Row style={{marginBottom: '20px'}}>
           <p>{t('Not available for this layer')}</p>
         </Row>
       )
     }

     return (
       <Row style={{marginBottom: '20px'}}>
         <Formsy ref='form' onChange={this.onFormChange}>
           <Row style={{marginTop: '10px', marginBottom: '20px', padding: '0 .75rem'}}>
             <Row>
               <b>{t('Enable Labels')}</b>
             </Row>
             <Row>
               <Toggle
                 name='enabled' labelOff={t('Off')} labelOn={t('On')}
                 checked={this.state.enabled}
               />
             </Row>
           </Row>
           <Row style={{marginBottom: '20px', padding: '0 .75rem'}}>
             <Select
               name='field' id='label-field-select' label={t('Label Field')} options={fieldOptions}
               value={this.state.field} startEmpty={!this.state.field}
               tooltipPosition='right' tooltip={t('Data field to use in map labels.')}
               required
             />
           </Row>
         </Formsy>
         {(enabled && !field) &&
           <p style={{color: 'red'}}>{t('Please Select a Label Field')}</p>}
       </Row>
     )
   }
}
